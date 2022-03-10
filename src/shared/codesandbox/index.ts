import { getParameters } from 'codesandbox/lib/api/define';
import { message } from 'antd';
import { isInVSCode } from '../vscode';
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

  const actionUrl =
    'https://codesandbox.io/api/v1/sandboxes/define?file=/App.tsx';

  if (isInVSCode) {
    /*   fetchInVSCode(
      { url: actionUrl, data: { parameters } },
      'openInCodeSandBox',
    ); */
    message.warning(
      'VSCode环境下暂不支持CodeSandbox跳转预览，如需使用，请使用网页版 http://codegen.leekhub.com',
    );
    return;
  }
  const form = document.createElement('form');
  const parametersInput = document.createElement('input');
  form.method = 'POST';
  form.action = actionUrl;
  form.target = '_blank';
  parametersInput.name = 'parameters';
  parametersInput.value = parameters;
  form.appendChild(parametersInput);
  document.body.append(form);
  form.submit();
  document.body.removeChild(form);
}
