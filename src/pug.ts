import pug from 'pug';

import type { Data, Section } from './types.js';

const { url } = import.meta;
const getPath = (path: string) => new URL(path, url).pathname;

const pugContainer = pug.compileFile(getPath('../templates/container.pug'));
const pugContents = pug.compileFile(getPath('../templates/contents.pug'));
const pugCover = pug.compileFile(getPath('../templates/cover.pug'));
const pugOpf = pug.compileFile(getPath('../templates/opf.pug'));
const pugSection = pug.compileFile(getPath('../templates/section.pug'));

// Provide the contents of the container XML file.
const getContainer = () => pugContainer();

// Provide the contents page.
const getContents = (data: Data) => pugContents({ data });

const processTextContent = (content: string) =>
  content
    .split('\n')
    .filter((line) => line.length > 0)
    .join('\n')
    .replace(/&nbsp;/g, '&#xa0;')
    .replace(/&copy;/g, '&#xa9;');

// Provide the contents of the cover HTML enclosure.
const getCover = (data: Data) => {
  const { coverType } = data.metadata;

  let coverText = data.metadata.cover;
  if (coverType === 'text') {
    coverText = processTextContent(data.coverText);
  }

  return pugCover({ coverText, data });
};

// Provide the contents of the OPF (spine) file.
const getOPF = (data: Data) => pugOpf({ data });

// Provide the contents of a single section's HTML.
const getSection = (data: Data, section: Section) => {
  const content = processTextContent(section.content);
  return pugSection({ content, data, section });
};

export {
  getContainer,
  getContents,
  getCover,
  getOPF,
  getSection,
};
