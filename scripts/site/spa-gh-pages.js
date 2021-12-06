// https://github.com/rafgraph/spa-github-pages

const fs = require('fs-extra');
const path = require('path');

fs.copySync(
  path.join(__dirname, './CNAME'),
  path.join(__dirname, '../../dist/CNAME'),
);

fs.copySync(
  path.join(__dirname, './404.html'),
  path.join(__dirname, '../../dist/404.html'),
);

const scriptCode = `
  <body><div id="root"></div>
  <!-- Start Single Page Apps for GitHub Pages -->
    <script type="text/javascript">
      // https://github.com/rafgraph/spa-github-pages
      (function(l) {
        if (l.search[1] === '/') {
          var decoded = l.search
            .slice(1)
            .split('&')
            .map(function(s) {
              return s.replace(/~and~/g, '&');
            })
            .join('?');
          window.history.replaceState(
            null,
            null,
            l.pathname.slice(0, -1) + decoded + l.hash
          );
        }
      })(window.location);
    </script>
  <!-- End Single Page Apps for GitHub Pages -->
`;

const filePath = path.join(__dirname, '../../dist/index.html');

const htmlCode = fs.readFileSync(filePath).toString();
let newHtmlCode = htmlCode.replace(`<div id="root"></div>`, scriptCode);
fs.writeFileSync(filePath, newHtmlCode);
console.log(`spa-gh-pages修改文件：`, filePath);
