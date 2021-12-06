const request = require('request');

module.exports = function requestToBody(baseUrl) {
  //   const url = new URL("/swagger-resources", baseUrl);
  const url = baseUrl;
  return new Promise((resolve, reject) => {
    request.get(url.toString(), function (err, res, body) {
      if (err || res.statusCode !== 200) {
        reject(err);
        return;
      } else {
        resolve(JSON.parse(body));
      }
    });
  });
};
