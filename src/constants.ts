import type { Options, Metadata, Section } from './types.js';

const defaultOptions: Required<Options> = {
  coverType: 'image',
  showContents: true,
};

const date = new Date();
const published = `${date.getFullYear()}-${
  date.getMonth() + 1
}-${date.getDate()}`;
const modified = date.toISOString().replace(/\.[0-9]{3}Z/, 'Z');

const defaultMetadata: Required<Metadata> = {
  author: '',
  contents: 'Contents',
  copyright: '',
  cover: '',
  description: '',
  fileAs: '',
  genre: '',
  id: '',
  language: 'en',
  modified,
  published,
  publisher: '',
  sequence: 0,
  series: '',
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

export { defaultCss, defaultMetadata, defaultOptions, defaultSection };
