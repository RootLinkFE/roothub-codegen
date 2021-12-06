export function cleanParameterDescription(s: string) {
  return s.replace(/([\.@#*+?^=!:${}()|\[\]\/\\])/g, '');
}

export function prettyCode(code: string) {
  const prettier = require('prettier/esm/standalone').default;
  const parserBabel = require('prettier/esm/parser-babel').default;
  try {
    return prettier.format(code, {
      parser: 'babel',
      plugins: [parserBabel],
    });
  } catch (err) {
    console.error(err);
    return code;
  }
}

export function prettyJSON(json: object) {
  return JSON.stringify(json, null, 2);
}
