const template = `doctype xml
html(
  xmlns:epub='http://www.idpf.org/2007/ops',
  xmlns='http://www.w3.org/1999/xhtml'
)
  head
    title= data.metadata.contents
    link(
      href='../css/ebook.css',
      rel='stylesheet',
      type='text/css'
    )
    meta(
      charset='utf-8'
    )

  body
    section(
      class='frontmatter'
      epub:type='frontmatter toc'
    )
      header
        h1= data.metadata.contents

      nav(
        epub:type='toc',
        id='toc',
        xmlns:epub='http://www.idpf.org/2007/ops'
      )
        ol
          li(class='frontmatter')
            span(class='frontmatter')=data.options.overrideFrontmatterTitle
            ol(class='frontmatter')
              each section in data.sections
                  if section.isFrontMatter
                    unless section.excludeFromContents
                      li(
                        id=\`toc-\${section.filename}\`
                      )
                        a(
                          href=section.filename
                        )= section.title
          each section in data.sections
              unless section.excludeFromContents || section.isFrontMatter || section.isBackMatter
                li(
                  id=\`toc-\${section.filename}\`
                )
                  a(
                    href=section.filename
                  )= section.title
          li(class='backmatter')
            span(class='backmatter')=data.options.overrideBackmatterTitle
            ol(class='backmatter')
              each section in data.sections
                  if section.isBackMatter
                    unless section.excludeFromContents
                      li(
                        id=\`toc-\${section.filename}\`
                      )
                        a(
                          href=section.filename
                        )= section.title

      unless !data.options.startReading
        nav(
          epub:type='landmarks',
          id='landmarks',
          hidden=''
        )
          ol
            li
              a(
                epub:type='toc',
                href='toc.xhtml'
              ) Table of Contents
            li
              a(
                epub:type='bodymatter',
                href=data.sections.find(section => !section.isFrontMatter).filename
              ) Start of Content
`;
export default template;
