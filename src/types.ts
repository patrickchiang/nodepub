type CoverType = 'image' | 'text';

type Section = {
  content: string;
  title: string;
} & Partial<{
  excludeFromContents: boolean;
  filename: string;
  index: number;
  isFrontMatter: boolean;
  isBackMatter: boolean;
}>;

type Resource = {
  name: string;
  data: Buffer;
} & Partial<{
  // This is base of file, do not override
  base: string;
  // Any properties to apply to this resource, i.e. cover-image
  properties: string;
  // This is the mime type
  type: string;
}>;

type BaseMetadata = {
  author: string;
  cover: string | Resource;
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

type Options = Partial<{
  coverType: CoverType;
  overrideFrontmatterTitle: string;
  overrideBackmatterTitle: string;
  showContents: boolean;
  startReading: boolean;
}>;

type Data = {
  cover: string | Required<Resource>;
  css: string;
  metadata: Required<Metadata>;
  options: Required<Options>;
  resources: Required<Resource>[];
  sections: Required<Section>[];
};

type Document = {
  metadata: Metadata;
  sections: Section[];
} & Partial<{
  css: string;
  options: Options;
  resources: Resource[];
}>;

export type { CoverType, Data, Document, Metadata, Options, Resource, Section };
