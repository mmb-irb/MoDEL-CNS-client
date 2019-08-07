## style-embedder

This script assumes that you've used create-react-app's build command first.
It will have generated an `index.html` file in the build folder.

This script reads the content of `index.html`, extract the stylesheet information, and replaces the link to the stylesheet files by a `<style>` tag with the actual content of the file.

Note that it replaces `url(<...>)` calls inside the CSS to fix the change of relative path.
