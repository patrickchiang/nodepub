import Epub from '../lib/index.js';

const css = `body { font-family:Verdana,Arial,Sans-Serif; font-size:11pt; }
#title,#title h1,#title h2,#title h3 { text-align:center; }
h1,h3,p { margin-bottom:1em; }
h2 { margin-bottom:2em; }
p { text-indent: 0; }
p+p { text-indent: 0.75em; }`;

const copyright = `<h1>[[TITLE]]</h1>
<h2>[[AUTHOR]]</h2>
<h3>&copy; [[COPYRIGHT]]</h3>
<p>
  All rights reserved.
</p>
<p>
  No part of this book may be reproduced in any form or by any electronic or
  mechanical means, including information storage and retrieval systems, without
  written permission from the author, except where covered by fair usage or
  equivalent.
</p>
<p>
  This book is a work of fiction.
  Any resemblance to actual persons  (living or dead) is entirely coincidental.
</p>
`;

const more = `<h1>More Books to Read</h1>
<h2>Thanks for reading <em>[[TITLE]]</em>.</h2>
<p>
  I hope you enjoyed the book, but however you felt please consider leaving a
  review where you purchased it and help other readers discover it.
</p>
<p>
  You can find links to more books (and often special offers/discounts) by
  visiting my site at <a href="http://kcartlidge.com/books">KCartlidge.com/books</a>.
</p>
`;

const about = `<h1>About the Author</h1>
<p>
  This is just some random blurb about the author.
</p>
<p>
  You can find more at the author's site.
</p>
<p>
  Oh, and here's a picture of a hat:
</p>
<p>
  <img src="../images/hat.png" alt="A hat." />
</p>
`;

// Dummy text (lorem ipsum).
let lipsum =
  '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse mattis iaculis pharetra. Proin malesuada tortor ut nibh viverra eleifend.</p><p>Duis efficitur, arcu vitae viverra consectetur, nisi mi pharetra metus, vel egestas ex velit id leo. Curabitur non tortor nisi. Mauris ornare, tellus vel fermentum suscipit, ligula est eleifend dui, in elementum nunc risus in ipsum. Pellentesque finibus aliquet turpis sed scelerisque. Pellentesque gravida semper elit, ut consequat est mollis sit amet. Nulla facilisi.</p>';
for (let i = 0; i < 3; i += 1) {
  lipsum += lipsum;
}

const sections = [
  {
    content:
      "<div id='title'><h1>[[TITLE]]</h1><h2>Book <strong>[[SEQUENCE]]</strong> of <em>[[SERIES]]</em></h2><h3>[[AUTHOR]]</h3><p> &nbsp;</p><p>&copy; [[COPYRIGHT]]</p></div>",
    excludeFromContents: true,
    isFrontMatter: true,
    title: 'Title Page',
  },
  {
    content: copyright,
    filename: 'copyright-page',
    isFrontMatter: true,
    title: 'Copyright',
  },
  {
    content: `<h1>One</h1>${lipsum}<p><a href='s3.xhtml'>A test internal link</a>.</p>`,
    title: 'Chapter 1',
  },
  {
    content: `<h1>Two</h1>${lipsum}`,
    title: 'Chapter 2',
  },
  {
    content: `<h1>Two (A)</h1><p><strong>This chapter does not appear in the contents.</strong></p>${lipsum}`,
    excludeFromContents: true,
    title: 'Chapter 2a',
  },
  {
    content: `<h1>Three</h1><p>Here is a sample list.</p><ul><li>Sample list item one.</li><li>Sample list item two.</li><li>Sample list item three.</li></ul>${lipsum}`,
    title: 'Chapter 3',
  },
  {
    content: more,
    title: 'More Books to Read',
  },
  {
    content: about,
    title: 'About the Author',
  },
];

// Metadata example.
const metadata = {
  author: 'Anonymous',
  contents: 'Chapters',
  copyright: 'Anonymous, 1980',
  cover: 'example/cover.png',
  description: 'A test book.',
  fileAs: 'Anonymous',
  genre: 'Non-Fiction',
  id: '278-123456789',
  language: 'en',
  published: '2000-12-31',
  publisher: 'My Fake Publisher',
  sections,
  sequence: 1,
  series: 'My Series',
  source: 'http://www.kcartlidge.com',
  tags: ['Sample', 'Example', 'Test'],
  title: 'Unnamed Document',
};

const options = {
  coverType: 'image',
  showContents: true,
};

const images = ['example/hat.png'];

// Set up the EPUB basics.
const epub = new Epub({
  css,
  images,
  metadata,
  options,
  sections,
});

// Generate the result.
(async () => {
  try {
    // eslint-disable-next-line no-console
    console.log('Generating a stand-alone EPUB.');
    await epub.write('example', 'example.epub');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
})();
