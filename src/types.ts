type CoverType = 'image' | 'text';

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
    description: string;
    fileAs: string;
    genre: string;
    language: string;
    modified: string;
    published: string;
    publisher: string;
    sequence: number;
    series: string;
    source: string;
    tags: string[];
  }>;

type Image = {
  base: string;
  originalFilename: string;
  type: string;
};

type Options = Partial<{
  coverType: CoverType;
  showContents: boolean;
}>;

type Data = {
  cover: {
    image: Image;
    text: string;
  };
  css: string;
  images: Image[];
  metadata: Required<Metadata>;
  options: Required<Options>;
  sections: Required<Section>[];
};

type Document = {
  metadata: Metadata;
  sections: Section[];
} & Partial<{
  css: string;
  images: string[];
  options: Options;
}>;

export type { Data, Document, Metadata, Options, Section };
