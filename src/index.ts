import defaults from 'defaults';
import fs from 'node:fs';
import zip from 'archiver';
import { basename } from 'node:path';
import { readFile } from 'node:fs/promises';

import {
  getContainer,
  getContents,
  getCover,
  getOPF,
  getSection,
} from './pug.js';
import { getImageType, makeFolder } from './utils.js';
import type {
  CoverType,
  CreateEpubOptions,
  Data,
  Metadata,
  Section,
} from './types.js';

const date = new Date();
const now = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

const defaultMetadata: Required<Metadata> = {
  author: '',
  contents: 'Contents',
  copyright: '',
  cover: '',
  coverType: 'image',
  css: '',
  description: '',
  fileAs: '',
  genre: '',
  id: '',
  language: 'en',
  modified: date.toISOString().replace(/\.[0-9]{3}Z/, 'Z'),
  published: now,
  publisher: '',
  sequence: 0,
  series: '',
  showContents: true,
  source: '',
  tags: [],
  title: '',
};

const defaultSection: Required<Section> = {
  content: '',
  excludeFromContents: false,
  filename: '',
  index: 0,
  isFrontMatter: false,
  title: '',
};

const defaultCss = `
#toc ol {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
`;

const isRequiredMetadata = (
  metadata: Metadata,
): metadata is Required<Metadata> => {
  const fields = [
    'author',
    'contents',
    'copyright',
    'cover',
    'coverType',
    'css',
    'description',
    'fileAs',
    'genre',
    'id',
    'language',
    'modified',
    'published',
    'publisher',
    'sequence',
    'series',
    'showContents',
    'source',
    'tags',
    'title',
  ] as const;
  return fields.every((field) => typeof metadata[field] !== 'undefined');
};

const isRequiredSection = (section: Section): section is Required<Section> => {
  const fields = [
    'content',
    'excludeFromContents',
    'filename',
    'index',
    'isFrontMatter',
    'title',
  ] as const;
  return fields.every((field) => typeof section[field] !== 'undefined');
};

// Construct a new document.
const createEpub = ({
  images = [],
  css: overrideCss = '',
  metadata: partialMetadata,
  sections,
}: CreateEpubOptions) => {
  if (partialMetadata === null) {
    throw new Error('Missing metadata');
  }

  const metadata = defaults(partialMetadata, defaultMetadata);

  if (!isRequiredMetadata(metadata)) {
    throw new Error('Unable to form required metadata');
  }

  const requiredSections: Required<Section>[] = [];

  sections.forEach((section, index) => {
    const sectionIndex = index + 1;
    const filename = `${section.filename || `s${sectionIndex}`}.xhtml`;

    section.index = sectionIndex;
    section.filename = filename;

    const requiredSection = defaults(section, defaultSection);
    if (isRequiredSection(requiredSection)) {
      requiredSections.push(requiredSection);
    }
  });

  const css = [defaultCss, overrideCss].join('\n');

  const { cover, showContents } = metadata;

  const mappedImages = images.map((image) => ({
    base: basename(image),
    originalFilename: image,
    type: getImageType(image),
  }));

  const coverImage = {
    base: basename(cover),
    originalFilename: cover,
    type: getImageType(cover),
  };

  const data: Data = {
    coverImage,
    coverText: cover,
    images: mappedImages,
    metadata,
    sections: requiredSections,
  };

  // Gets the files needed for the EPUB, as an array of objects.
  // Note that 'compress:false' MUST be respected for valid EPUB files.
  const getFilesForEPUB = async () => {
    const syncFiles = [];
    const asyncFiles = [];

    // Required files.
    syncFiles.push({
      compress: false,
      content: 'application/epub+zip',
      folder: '',
      name: 'mimetype',
    });

    syncFiles.push({
      compress: true,
      content: getContainer(),
      folder: 'META-INF',
      name: 'container.xml',
    });

    syncFiles.push({
      compress: true,
      content: getOPF(data),
      folder: 'OPS',
      name: 'ebook.opf',
    });

    syncFiles.push({
      compress: true,
      content: getCover(data),
      folder: 'OPS',
      name: 'cover.xhtml',
    });

    // Optional files.
    syncFiles.push({
      compress: true,
      content: css,
      folder: 'OPS/css',
      name: 'ebook.css',
    });

    for (let i = 0, len = requiredSections.length; i < len; i += 1) {
      const section = requiredSections[i];
      syncFiles.push({
        compress: true,
        content: getSection(data, section),
        folder: 'OPS/content',
        name: section.filename,
      });
    }

    // Table of contents markup.
    if (showContents) {
      syncFiles.push({
        compress: true,
        content: getContents(data),
        folder: 'OPS/content',
        name: 'toc.xhtml',
      });
    }

    // Extra images - add filename into content property and prepare for async handling.
    const coverFilename = basename(cover);
    asyncFiles.push({
      compress: true,
      content: cover,
      folder: 'OPS/images',
      name: coverFilename,
    });

    mappedImages.forEach((image) => {
      asyncFiles.push({
        compress: true,
        content: image.originalFilename,
        folder: 'OPS/images',
        name: image.base,
      });
    });

    // Now async map to get the file contents.
    await Promise.all(
      asyncFiles.map(async (file) => {
        const read = await readFile(file.content);
        const loaded = {
          compress: file.compress,
          content: read,
          folder: file.folder,
          name: file.name,
        };
        syncFiles.push(loaded);
      }),
    );

    // Return with the files.
    return syncFiles;
  };

  // Writes the EPUB. The filename should not have an extention.
  const write = async (folder: string, filename: string) => {
    const files = await getFilesForEPUB();

    // Start creating the zip.
    await makeFolder(folder);
    const output = fs.createWriteStream(`${folder}/${filename}.epub`);
    const archive = zip('zip', { store: false });
    archive.on('error', (archiveErr) => {
      throw archiveErr;
    });

    await new Promise<void>((resolveWrite) => {
      // Wait for file descriptor to be written.
      archive.pipe(output);
      output.on('close', () => resolveWrite());

      // Write the file contents.
      files.forEach((file) => {
        if (file.folder.length > 0) {
          archive.append(file.content, {
            name: `${file.folder}/${file.name}`,
            store: !file.compress,
          });
        } else {
          archive.append(file.content, {
            name: file.name,
            store: !file.compress,
          });
        }
      });

      // Done.
      archive.finalize();
    });
  };

  return {
    write,
  };
};

/* eslint-disable import/no-unused-modules */
export { createEpub };
export type { CoverType, CreateEpubOptions, Metadata, Section };
