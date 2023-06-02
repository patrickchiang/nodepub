![IDPF](https://img.shields.io/badge/idpf-valid-success)

# Nodepub

Create valid EPUB 3.3 ebooks with metadata, contents, cover, and images.

*This is a utility module, not a user-facing one. In other words it is assumed that the caller has already validated the inputs. Only basic sanity checks are performed.*

## Contents

- [About Nodepub](#about-nodepub)
- [Installation](#installation)
- [Creating an EPUB](#creating-an-epub)
  - [Setting the Metadata](#setting-the-metadata)
    - [Example Metadata](#example-metadata)
  - [Adding Contents](#adding-contents)
  - [Including Images](#including-images)
  - [Changing the Styling](#changing-the-styling)
  - [Custom Table of Contents](#custom-table-of-contents)
  - [Generating Output](#generating-output)
- [A Full Example](#a-full-example)
- [Changelog](#changelog)
- [Previous Work](#previous-work)

## About Nodepub

Nodepub is a **Node** module which can be used to create **EPUB 3** documents.

- Files pass validation via [epubcheck](https://github.com/w3c/epubcheck)
- Files open fine in iBooks and Calibre
- PNG/JPEG cover images (or text)
- Inline images within the EPUB
  - See [Including Images](#including-images) for supported formats
- Custom CSS can be provided
- Front matter before the contents page
- Exclude sections from auto contents page and metadata-based navigation
- OPS and other 'expected' subfolders within the EPUB

Development is done against Node v16.20.0 since v1.0.0 (June 2023).
*Node v10.3 or later* should work fine.

## About @dylanarmstrong/nodepub

This is a continuation of the work by [kartlidge](https://github.com/kcartlidge/nodepub)
and is a nearly complete rewrite targeting EPUB v3.3.

## Installation

It's an [npm package](https://www.npmjs.com/package/@dylanarmstrong/nodepub).
To install it:

``` sh
npm install @dylanarmstrong/nodepub
# or
pnpm add @dylanarmstrong/nodepub
```

Then import it for use:

``` javascript
import { createEpub } from '@dylanarmstrong/nodepub';
```

## Creating an EPUB

- Documents consist of *metadata*, *sections*, and *images*
  - Metadata is provided in the form of an object with various properties detailing the book
  - Sections are chunks of HTML where each represent a chapter, front/back matter, or similar
  - Images are inlined image files that can appear within the body of the EPUB
    - The cover is a special image which is declared within the metadata

``` javascript
const metadata = {
  author: 'KA Cartlidge',
  contents: 'Table of Contents',
  copyright: 'Anonymous, 1980',
  cover: '../test/cover.jpg',
  coverType: 'image',
  description: 'A test book.',
  fileAs: 'Cartlidge, KA',
  genre: 'Non-Fiction',
  id: '278-123456789',
  language: 'en',
  published: '2000-12-31',
  publisher: 'My Fake Publisher',
  sequence: 1,
  series: 'My Series',
  showContents: false,
  source: 'https://dylan.is',
  tags: ['Sample', 'Example', 'Test'],
  title: 'Unnamed Document',
};

const images = ['../test/hat.png'];

const sections = [
  {
    content: 'This is a copyrighted booked',
    excludeFromContents: true,
    isFrontMatter: true,
    title: 'Copyright',
  },
  {
    content: 'Chapter 1',
    title: '<h1>Chapter One</h1><p>...</p>',
  },
  {
    content: 'Chapter 2',
    title: '<h1>Chapter Two</h1><p>...</p>',
  },
];

const css = `
  table {
    border: 3px double #ccc;
    margin-left: auto;
    margin-right: auto;
    padding: 0.5em;
  }
`;

const epub = createEpub({
  metadata,
  sections,
  // Optional
  css,
  images,
});
```

### Regarding Metadata

- `cover` should be the filename of an image - recommendation is 600x800, 600x900, or similar
- `fileAs` is the sortable version of the `author`, which is usually by last name
- `genre` becomes the main subject in the final EPUB
- `language` is the short *ISO* language name (`en`, `fr`, `de` etc)
- `published` is the data published - note the *year-month-day* format
- `series` and `sequence` are not recognised by many readers (it sets the properties used by *Calibre*)
- `showContents` (default is `true`) lets you suppress the contents page
- `tags` also become subjects in the final EPUB

### Regarding Sections

| PARAMETER           | PURPOSE                          | DEFAULT |
| ------------------- | -------------------------------- | ------- |
| title (required)    | Table of contents entry text     |         |
| content (required)  | HTML body text                   |         |
| excludeFromContents | Hide from contents/navigation    | `false` |
| isFrontMatter       | Place before the contents page   | `false` |
| overrideFilename    | Section filename inside the EPUB |         |

### Including Images

In the example above:

``` javascript
const images = ['../test/hat.png'];
```

This part of the metadata is an array of filenames which locate the source images on your system.
(I strongly recommend you use relative paths in order to allow for documents being produced on different systems having different folder layouts.)

These images are automatically added into the EPUB when it is generated. They always go in an `images` folder internally. As they all go into the same folder they *should have unique filenames*.

To include the images in your content the HTML should refer to this internal folder rather than the original source folder, so for example `<img src="../images/hat.png" />` in the above example.

- Accepted image types are `.svg`, `.png`, `.jpg`/`.jpeg`, `.gif`, and `.tif`/`.tiff`.

### Changing the Styling

You can inject basic CSS into your book. This allows you to override the basic styling to change how it looks.
You should use this sparingly - there is inconsistent CSS support across ereader devices/software.

Modify the `css` parameter of `createEpub`.

```javascript
const css = `p { text-indent: 0; } p+p { text-indent: 0.75em; }`);
const epub = createEpub({
  css,
  images,
  metadata,
  sections,
});
```

### Generating Output

Having defined your document generating an EPUB from it can be as simple or complex as you like.

``` javascript
await epub.write(folder, filenameWithoutExtention);
```

## A Full Example

In the top folder (the one containing the `package.json` file) run the following:

``` javascript
npm run example
```

This runs in [the `example` folder](./example) using the code in [`example/example.js`](./example/example.js) to generate a final EPUB. It will also create a subfolder containing the raw files used to produce that EPUB (omitted from source control).

## Changelog

- [You can view the change log here.](./CHANGELOG.md)
- [Developers of Nodepub itself can see some helpful information here.](./DEVELOPERS.md)

## Previous Work

This repo was forked and modified from it's [original location](https://github.com/kcartlidge/nodepub)
and combined with `pug` templating taken from this [fork](https://github.com/fholzer/nodepub).
