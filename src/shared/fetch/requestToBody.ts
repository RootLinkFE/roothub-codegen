const request = require('request');

export function requestToBody(url = ''): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    request.get(
      url.toString(),
      (err: any, res: { statusCode: number }, body: string) => {
        if (err || res.statusCode !== 200) {
          reject(err);
          return;
        } else {
          resolve(JSON.parse(body));
        }
      },
    );
  });
}
