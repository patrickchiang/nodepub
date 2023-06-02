import { mkdir } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

import type { CoverType } from './types.js';
import { coverTypes } from './constants.js';

const isCoverType = (s: string): s is CoverType =>
  coverTypes.includes(s as CoverType);

// Asynchronous forEach variant.
const forEachAsync = async <T>(
  arr: T[],
  cb: (item: T, index?: number, arg2?: T[]) => Promise<void>,
) => {
  for (let index = 0; index < arr.length; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    await cb(arr[index], index, arr);
  }
};

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

export { forEachAsync, getImageType, isCoverType, makeFolder };
