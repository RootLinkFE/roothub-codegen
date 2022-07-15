import GenCode from './swagger-codegen';
import { isInVSCode, setupBackgroundManagement, postVSCodeMessage } from '@/shared/vscode';
import './index.less';
import utilsFn from './swagger-codegen/code-generate/generate-assemblies-utils-fn';
// vscode
isInVSCode && setupBackgroundManagement();

export default function IndexPage() {
  if (window) {
    (window as any).utilsFn = utilsFn;
  }
  isInVSCode && postVSCodeMessage('pageReady');
  return <GenCode />;
}
