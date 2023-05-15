/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-04-23 09:17:07
 * @Description: avueColumnTranscoding
 */
import { transcoding } from '../generate-rhtable-page-transcoding';

const avueColumnTranscoding = (...argetment: [body: any, record?: any, api?: any, selectedData?: any]) => {
  return transcoding(
    {
      labelField: 'label',
      propField: 'prop',
    },
    ...argetment,
  );
};

export default avueColumnTranscoding;
