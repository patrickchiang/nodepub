import defaults from 'defaults';
import zip from 'archiver';
import { basename } from 'node:path';
import { createWriteStream } from 'node:fs';
import { readFile } from 'node:fs/promises';

import type { Data, Document, Section } from './types.js';
import {
  defaultCss,
  defaultMetadata,
  defaultOptions,
  defaultSection,
} from './constants.js';
import {
  getContainer,
  getContents,
  getCover,
  getOPF,
  getSection,
} from './pug.js';
import {
  isRequiredMetadata,
  isRequiredOptions,
  isRequiredSection,
  getImageType,
  makeFolder,
} from './utils.js';

class Epub {
  data: Data;

  constructor({
    css: overrideCss = '',
    images = [],
    metadata: partialMetadata,
    options: partialOptions = {},
    sections: partialSections,
  }: Document) {
    const metadata = defaults(partialMetadata, defaultMetadata);
    const options = defaults(partialOptions, defaultOptions);

    if (!isRequiredMetadata(metadata) || !isRequiredOptions(options)) {
      // This shouldn't be able to be reached, it's just here to force typescript to handle
      // Defaults like they're Required<T> now.
      throw new Error(
        'Internal error with forming required metadata and options, unable to proceed.',
      );
    }

    const sections: Required<Section>[] = [];
    partialSections.forEach((section, index) => {
      const requiredSection = defaults(section, defaultSection);

      const sectionIndex = index + 1;
      const filename = `${section.filename || `s${sectionIndex}`}.xhtml`;

      requiredSection.index = sectionIndex;
      requiredSection.filename = filename;

      if (isRequiredSection(requiredSection)) {
        sections.push(requiredSection);
      }
    });

    const css = [defaultCss, overrideCss].join('\n');

    const { cover } = metadata;

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

    this.data = {
      cover: {
        image: coverImage,
        text: cover,
      },
      css,
      images: mappedImages,
      metadata,
      options,
      sections,
    };
  }

  // Gets the files needed for the EPUB, as an array of objects.
  // Note that 'compress:false' MUST be respected for valid EPUB files.
  async getFiles() {
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
      content: getOPF(this.data),
      folder: 'OPS',
      name: 'ebook.opf',
    });

    syncFiles.push({
      compress: true,
      content: getCover(this.data),
      folder: 'OPS',
      name: 'cover.xhtml',
    });

    // Optional files.
    syncFiles.push({
      compress: true,
      content: this.data.css,
      folder: 'OPS/css',
      name: 'ebook.css',
    });

    const { sections } = this.data;
    for (let i = 0, len = sections.length; i < len; i += 1) {
      const section = sections[i];
      syncFiles.push({
        compress: true,
        content: getSection(this.data, section),
        folder: 'OPS/content',
        name: section.filename,
      });
    }

    // Table of contents markup.
    if (this.data.options.showContents) {
      syncFiles.push({
        compress: true,
        content: getContents(this.data),
        folder: 'OPS/content',
        name: 'toc.xhtml',
      });
    }

    if (this.data.options.coverType === 'image') {
      const { cover } = this.data.metadata;
      // Extra images - add filename into content property and prepare for async handling.
      const coverFilename = basename(cover);
      asyncFiles.push({
        compress: true,
        content: cover,
        folder: 'OPS/images',
        name: coverFilename,
      });
    }

    this.data.images.forEach((image) => {
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
  }

  async write(folder: string, filename: string) {
    const files = await this.getFiles();

    const fullFilename = filename.endsWith('.epub')
      ? filename
      : `${filename}.epub`;

    // Start creating the zip.
    await makeFolder(folder);
    const output = createWriteStream(`${folder}/${fullFilename}`);
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
  }
}

export default Epub;
