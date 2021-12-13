import { getParameters } from 'codesandbox/lib/api/define';
import indexHtml from './indexHtml';
import MainJs from './mainJs';
import genJson from './packageJson';

export default function openOnCodeSandbox({
  componentCode = '',
  boxDependencies = {},
}) {
  const parameters = getParameters({
    files: {
      'package.json': {
        content: genJson(boxDependencies),
        isBinary: false,
      },
      'public/index.html': {
        content: indexHtml,
        isBinary: false,
      },
      'src/index.tsx': {
        content: MainJs,
        isBinary: false,
      },
      'src/App.tsx': {
        content: componentCode,
        isBinary: false,
      },
      'src/styles.css': {
        content: '/* Add application styles & imports to this file! */;',
        isBinary: false,
      },
    },
  });
  const form = document.createElement('form');
  const parametersInput = document.createElement('input');
  form.method = 'POST';
  form.action =
    'https://codesandbox.io/api/v1/sandboxes/define?module=/src/App.vue';
  form.target = '_blank';
  parametersInput.name = 'parameters';
  parametersInput.value = parameters;
  form.appendChild(parametersInput);
  document.body.append(form);
  form.submit();
  document.body.removeChild(form);
}
