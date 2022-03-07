import GenCode from './swagger-codegen';
import './index.less';
import { isInVSCode, setupBackgroundManagement } from '@/shared/vscode';
// vscode
isInVSCode && setupBackgroundManagement();

export default function IndexPage() {
  return <GenCode />;
}
