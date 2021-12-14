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
      'index.html': {
        content: indexHtml,
        isBinary: false,
      },
      'index.tsx': {
        content: MainJs,
        isBinary: false,
      },
      'App.tsx': {
        content: componentCode,
        isBinary: false,
      },
      'sandbox.config.json': {
        content: `{
          "template": "create-react-app-typescript"
        }`,
        isBinary: false,
      },
    },
  });
  const form = document.createElement('form');
  const parametersInput = document.createElement('input');
  form.method = 'POST';
  form.action =
    'https://codesandbox.io/api/v1/sandboxes/define?module=/App.tsx';
  form.target = '_blank';
  parametersInput.name = 'parameters';
  parametersInput.value = parameters;
  form.appendChild(parametersInput);
  document.body.append(form);
  form.submit();
  document.body.removeChild(form);
}
