import { mkdir } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

import type { Options, Metadata, Section } from './types.js';

// Create a folder, throwing an error only if the error is not that
// the folder already exists. Effectively creates if not found.
const makeFolder = async (topPath: string) => {
  await mkdir(topPath).catch((err) => {
    if (err && err.code !== 'EEXIST') {
      throw err;
    }
    resolve();
  });
};

// Get the image mimetype based on the file name.
const getImageType = (filename: string) => {
  const imageExt = extname(filename).toLowerCase();
  switch (imageExt) {
    case '.svg':
      return 'image/svg+xml';

    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';

    case '.gif':
      return 'image/gif';

    case '.tif':
    case '.tiff':
      return 'image/tiff';

    case '.png':
      return 'image/png';

    // This will cause epub validation error
    default:
      return '';
  }
};

const isRequiredOptions = (options: Options): options is Required<Options> => {
  const fields = ['coverType', 'showContents'] as const;
  return fields.every((field) => typeof options[field] !== 'undefined');
};

const isRequiredMetadata = (
  metadata: Metadata,
): metadata is Required<Metadata> => {
  const fields = [
    'author',
    'contents',
    'copyright',
    'cover',
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

export {
  isRequiredMetadata,
  isRequiredOptions,
  isRequiredSection,
  getImageType,
  makeFolder,
};
