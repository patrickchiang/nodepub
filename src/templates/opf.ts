const template = `mixin resources(resources)
  each resource, i in resources
    if resource.properties
      item(
        href=\`resources/\${resource.base}\`,
        id=\`img\${i}\`,
        media-type=resource.type
        properties=resource.properties
      )
    else
      item(
        href=\`resources/\${resource.base}\`,
        id=\`img\${i}\`,
        media-type=resource.type
      )

-
  let showContents =data.options.showContents;
  let sections =data.sections;

doctype xml
package(
  prefix='cc: http://creativecommons.org/ns#'
  unique-identifier='pub-id',
  version='3.0',
  xml:lang=data.metadata.language,
  xmlns='http://www.idpf.org/2007/opf',
)
  metadata(
    xmlns:dc='http://purl.org/dc/elements/1.1/'
  )
    if data.metadata.series && data.metadata.sequence
      dc:title(
        id='title'
      ) #{data.metadata.title} (#{data.metadata.series} ##{data.metadata.sequence})

    else if data.metadata.series
      dc:title(
        id='title'
      ) #{data.metadata.title} (#{data.metadata.series})

    else if data.metadata.sequence
      dc:title(
        id='title'
      ) #{data.metadata.title} (##{data.metadata.sequence})

    else
      dc:title(
        id='title'
      ) #{data.metadata.title}

    meta(
      property='title-type',
      refines='#title'
    )='main'

    dc:language=data.metadata.language
    dc:identifier(
      id='pub-id'
    )=data.metadata.id

    if data.metadata.author
      dc:creator(
        id='creator'
      )=data.metadata.author
      meta(
        property='role',
        refines='#creator'
      )='aut'

    if data.metadata.author && data.metadata.fileAs
      meta(
        property='file-as',
        refines='#creator'
      )=data.metadata.fileAs

    dc:date=data.metadata.published

    if data.metadata.description
      dc:description=data.metadata.description

    if data.metadata.publisher
      dc:publisher=data.metadata.publisher

    if data.metadata.copyright
      dc:rights=data.metadata.copyright

    if data.metadata.source
      dc:source=data.metadata.source

    if data.metadata.genre
      dc:subject=data.metadata.genre

    meta(
      property='dcterms:modified'
    )=data.metadata.modified

    each tag in data.metadata.tags
      dc:subject=tag

    if data.metadata.series && data.metadata.sequence
      meta(
        content=data.metadata.series,
        name='calibre:series'
      )
      meta(
        content=data.metadata.sequence,
        name='calibre:series_index'
      )

    meta(
      content='cover-image',
      name='cover'
    )

  manifest
    item(
      href='cover.xhtml',
      id='cover',
      media-type='application/xhtml+xml'
    )

    item(
      href='css/ebook.css',
      id='style',
      media-type='text/css'
    )

    each section in sections
      item(
        href=\`content/\${section.filename}\`,
        id=\`s\${section.index}\`,
        media-type='application/xhtml+xml'
      )

    if showContents
      item(
        href='content/toc.xhtml',
        id='toc',
        media-type='application/xhtml+xml',
        properties='nav'
      )

    +resources(data.resources)

  spine
    itemref(
      idref='cover',
      linear='yes'
    )

    each section in sections
      if section.isFrontMatter
        itemref(
          idref=\`s\${section.index}\`
        )

    if showContents
      itemref(
        idref='toc'
      )

    each section in sections
      unless section.isFrontMatter
        itemref(
          idref=\`s\${section.index}\`
        )

  if showContents
    guide
      reference(
        href='content/toc.xhtml',
        title='Contents',
        type='toc'
      )
`;
export default template;
