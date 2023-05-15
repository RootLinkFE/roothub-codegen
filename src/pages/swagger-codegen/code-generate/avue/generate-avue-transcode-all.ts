/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-05-15 09:17:07
 * @Description: generate-avue-transcode-all
 */
import { transcodingAll } from '../generate-react-transcoding-all';

const generatAvueTranscodeAll = (...argetment: [body: any, record?: any, api?: any, selectedData?: any]) => {
  return transcodingAll(
    {
      labelField: 'label',
      propField: 'prop',
    },
    ...argetment,
  );
};

export default generatAvueTranscodeAll;
