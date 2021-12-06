const request = require('request');

module.exports = function getAllResources(baseUrl) {
  const url = new URL('/swagger-resources', baseUrl);
  console.log(url, baseUrl);
  return new Promise((resolve, reject) => {
    request.get(url.toString(), function (err, res, body) {
      if (err) {
        reject(err);
        return;
      } else {
        resolve(JSON.parse(body));
      }
    });
  });
};
