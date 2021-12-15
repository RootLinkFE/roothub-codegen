import { useRequest } from 'ahooks';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';

const requestToBody = require('../../../scripts/tool/generate-api/requestToBody.js');

// export const useRequestResourcesDetail = (url: string) => {
//   const { selectedResourceKey, setSelectedResourceKey } = useModel(
//     'useApiSwitchModel'
//   )

//   /* const { data: resourceDetail } = useRequest(
//     async () => {
//       if (selectedResourceKey) {
//         const res = await requestToBody(url + selectedResourceKey)
//         classifyPathsToTags(res.tags, res.paths)
//         return res
//       }
//       return null
//     },
//     {
//       refreshDeps: [selectedResourceKey, url],
//     }
//   ) */

//   useEffect(() => {
//     setSelectedResourceKey(null)
//   }, [url])

//   return { setSelectedResourceKey, resourceDetail, selectedResourceKey }
// }
