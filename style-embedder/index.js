const { readFile, writeFile } = require('fs');
const { promisify } = require('util');

const asyncReadFile = promisify(readFile);
const asyncWriteFile = promisify(writeFile);

const styleLinkRE = /<link[^>]+\.css[^>]+>/gim;
const hrefRE = /href="\.(?<href>[^"]+)"/i;
const relativeURLInCSS = /url\(\.\.\/\.\.\//g; // matches: url(../../

const main = async () => {
  // read index.html file content
  let indexFile = await asyncReadFile('./build/index.html', {
    encoding: 'utf8',
  });
  // loop over all the style links in the index.html file
  for (const link of indexFile.match(styleLinkRE) || []) {
    // extract href of the stylesheet
    const { href } = (link.match(hrefRE) || []).groups || {};
    // read stylesheet file content
    let style = await asyncReadFile(`./build/${href}`, { encoding: 'utf8' });
    // fix relative urls
    style = style.replace(relativeURLInCSS, 'url(./');
    // but then, we have to add the path to the sourcemaps
    style = style.replace(
      /sourceMappingURL=/g,
      'sourceMappingURL=./static/css/',
    );
    // inline content of stylesheet inside html
    indexFile = indexFile.replace(link, `<style>${style}</style>`);
  }
  // output resulting index.html file (overwrite)
  await asyncWriteFile('./build/index.html', indexFile, { encoding: 'utf8' });

  return '⚡ Injected embeddable stylesheets inside "build/index.html" file ⚡';
};

main().then(console.log, console.error);
