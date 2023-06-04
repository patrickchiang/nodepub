import mime from 'mime';
import { mkdir } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

import type { Options, Metadata, Resource, Section } from './types.js';

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

const uniqueResources = (acc: Resource[], cur: Resource) => {
  if (!acc.some(({ name }) => name === cur.name)) {
    acc.push(cur);
  }
  return acc;
};

// Checks if a type already has been added manually by user
const hasType = <T>(o: T): o is T & { type: string } =>
  Object.hasOwnProperty.call(o, 'type') &&
  typeof (o as { type: unknown }).type === 'string';

const addResourceDetails = (resource: Resource): Required<Resource> => {
  const type = hasType(resource)
    ? resource.type
    : mime.getType(resource.name) || '';

  return {
    ...resource,
    base: basename(resource.name),
    properties: resource.properties || '',
    type,
  };
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
  addResourceDetails,
  isRequiredMetadata,
  isRequiredOptions,
  isRequiredSection,
  makeFolder,
  uniqueResources,
};
