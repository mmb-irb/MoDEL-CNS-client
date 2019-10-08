const workboxBuild = require('workbox-build');
const prettyBytes = require('pretty-bytes');

const build = async () => {
  const { count, size, warnings } = await workboxBuild.injectManifest({
    swSrc: 'sw-build/template.js',
    swDest: 'build/sw.js',
    globDirectory: 'build',
    globPatterns: ['**/*.{js,css,html,png}'],
  });
  warnings.forEach(console.warn);
  console.log(
    `⚡ Precached ${count} files will be precached, for ${prettyBytes(
      size,
    )} ⚡`,
  );
};

build().catch(console.error);
