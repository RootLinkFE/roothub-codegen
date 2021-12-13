export function cleanParameterDescription(s: string) {
  const s1 = cleanEnumDesc(s);
  return s1.replace(/([\.@#*+?^=!:${}()|\[\]\/\\])/g, '');
}

function cleanEnumDesc(s: string) {
  const idx = s.indexOf('ENUM#');
  if (idx !== -1) {
    return s.substring(0, idx);
  }
  return s;
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
