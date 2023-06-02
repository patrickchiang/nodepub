import { coverTypes } from './constants.js';

type CoverType = (typeof coverTypes)[number];

type Section = {
  content: string;
  title: string;
} & Partial<{
  excludeFromContents: boolean;
  filename: string;
  index: number;
  isFrontMatter: boolean;
}>;

type BaseMetadata = {
  author: string;
  cover: string;
  id: number | string;
  title: string;
};

type Metadata = BaseMetadata &
  Partial<{
    contents: string;
    copyright: string;
    coverType: CoverType;
    css: string;
    description: string;
    fileAs: string;
    genre: string;
    images: string[];
    language: string;
    modified: string;
    published: string;
    publisher: string;
    sections: Section[];
    sequence: number;
    series: string;
    showContents: boolean;
    source: string;
    tags: string[];
  }>;

type Image = {
  base: string;
  originalFilename: string;
  type: string;
};

type Data = {
  coverImage: Image;
  coverText: string;
  images: Image[];
  metadata: Required<Metadata>;
};

export type { CoverType, Data, Metadata, Section };
