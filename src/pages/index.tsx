import GenCode from './swagger-codegen';
import './index.less';
import {
  isInVSCode,
  setupBackgroundManagement,
  postVSCodeMessage,
} from '@/shared/vscode';
// vscode
isInVSCode && setupBackgroundManagement();

export default function IndexPage() {
  isInVSCode && postVSCodeMessage('pageReady');
  return <GenCode />;
}
