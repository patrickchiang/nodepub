import pug from 'pug';
import containerTemplate from './templates/container.js';
import contentsTemplate from './templates/contents.js';
import coverTemplate from './templates/cover.js';
import opfTemplate from './templates/opf.js';
import sectionTemplate from './templates/section.js';

import type { Data, Section } from './types.js';

const options = {
  doctype: 'xml',
  pretty: true,
};

const pugContainer = pug.compile(containerTemplate, options);
const pugContents = pug.compile(contentsTemplate, options);
const pugCover = pug.compile(coverTemplate, options);
const pugOpf = pug.compile(opfTemplate, options);
const pugSection = pug.compile(sectionTemplate, options);

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
