import pug from 'pug';

import { readFileSync } from 'fs';
import type { Data, Section } from './types.js';

const options = {
  doctype: 'xml',
  pretty: true,
};

const pugContainer = pug.compile(
  readFileSync(
    new URL('../templates/container.pug', import.meta.url),
  ).toString(),
  options,
);
const pugContents = pug.compileFile(
  new URL('../templates/contents.pug', import.meta.url).pathname,
  options,
);
const pugCover = pug.compile(
  readFileSync(new URL('../templates/cover.pug', import.meta.url)).toString(),
  options,
);
const pugOpf = pug.compile(
  readFileSync(new URL('../templates/opf.pug', import.meta.url)).toString(),
  options,
);
const pugSection = pug.compile(
  readFileSync(new URL('../templates/section.pug', import.meta.url)).toString(),
  options,
);

// Provide the contents of the container XML file.
const getContainer = () => pugContainer();

// Provide the contents page.
const getContents = (data: Data) => pugContents({ data });

const processTextContent = (content: string) =>
  content.replace(/&nbsp;/g, '&#xa0;').replace(/&copy;/g, '&#xa9;');

// Provide the contents of the cover HTML enclosure.
const getCover = (data: Data) => {
  const { coverType } = data.options;
  const { cover } = data;

  if (coverType === 'text' && typeof cover === 'string') {
    const coverText = processTextContent(cover);
    return pugCover({ coverText, data });
  }

  return pugCover({ data });
};

// Provide the contents of the OPF (spine) file.
const getOPF = (data: Data) => pugOpf({ data });

// Provide the contents of a single section's HTML.
const getSection = (data: Data, section: Section) => {
  const content = processTextContent(section.content);
  return pugSection({ content, data, section });
};

export { getContainer, getContents, getCover, getOPF, getSection };
