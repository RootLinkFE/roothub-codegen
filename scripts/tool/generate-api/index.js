const { generateApi } = require('swagger-typescript-api');
const path = require('path');
const fs = require('fs');
const rm = require('rimraf');
const request = require('request');

const config = require('./config');
const getResources = require('./resources');
const { camelCase, startCase, queue } = require('lodash');

function normalizeSchemaName(name) {
  return startCase(camelCase(name))
    .replace(/ /g, '')
    .replace(/[^a-zA-Z]/g, '')
    .replace(/api/gi, '');
}

function gen(schema) {
  return new Promise((resolve) => {
    // const spec = fs.readlinkSync(schema.schemaPath)
    const url = new URL(schema.url, config.url);
    request.get(url.toString(), function (err, response, body) {
      console.log('body: ', body);
      const spec = JSON.parse(body);
      delete spec.info.termsOfService;
      generateApi({
        name: `${normalizeSchemaName(schema.name)}Api.ts`,
        output: basePath,
        // url: schema.schemaPath,
        spec,
        templates: path.resolve(process.cwd(), './api-templates'),
        httpClientType: 'axios', // or "fetch"
        defaultResponseAsSuccess: false,
        generateRouteTypes: false,
        generateResponses: true,
        toJS: false,
        extractRequestParams: false,
        prettier: {
          printWidth: 120,
          tabWidth: 2,
          trailingComma: 'all',
          parser: 'typescript',
        },
        defaultResponseType: 'void',
        singleHttpClient: true,
        cleanOutput: false,
        enumNamesAsValues: false,
        moduleNameFirstTag: false,
        generateUnionEnums: false,
        extraTemplates: [],
        hooks: {
          onCreateComponent: (component) => {
            // component.typeName = component.typeName
            //   .replace(/返回对象/gi, 'ReturnObject')
            //   .replace(/对象/gi, 'Object')
          },
          onCreateRequestParams: (rawType) => {},
          onCreateRoute: (routeData) => {},
          onCreateRouteName: (routeNameInfo, rawRouteInfo) => {},
          onFormatRouteName: (routeInfo, templateRouteName) => {},
          onFormatTypeName: (typeName, rawTypeName) => {},
          onInit: (configuration) => {},
          onParseSchema: (originalSchema, parsedSchema) => {
            if (originalSchema.title === '登录返回参数对象')
              console.log(originalSchema, parsedSchema);
          },
          onPrepareConfig: (currentConfiguration) => {},
        },
      })
        .then(({ files, configuration }) => {
          resolve();
        })
        .catch((e) => console.error(e));
    });
  });
}

const basePath = path.resolve(process.cwd(), './src/rh/apis');
rm.sync(path.join(basePath, '*'));

async function main() {
  const schemas = await getResources(config.url);
  schemas.reduce((_p, schema) => {
    return _p.then(() => {
      return gen(schema);
    });
  }, Promise.resolve());
}

main();
