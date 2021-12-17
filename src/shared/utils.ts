export function cleanParameterDescription(s: string) {
  let s1 = cleanEnumDesc(s);
  s1 = cleanREF(s1);
  return s1.replace(/([\.@#*+?^=!:${}()|\[\]\/\\])/g, '');
}

function cleanEnumDesc(s: string) {
  if (!s) {
    return '';
  }
  const idx = s.indexOf('ENUM#');
  if (idx !== -1) {
    return s.substring(0, idx);
  }
  return s;
}

function cleanREF(s: string) {
  const idx = s.indexOf('REF#');
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
