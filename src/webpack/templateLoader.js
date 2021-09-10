import transformTemplate from '../core/transformTemplate';
const loaderUtils = require('loader-utils');

function getDepPath(depName) {
  return `_mc_transform_wxs/${depName}`;
}

/**
 * @type {import('webpack').loader.Loader}
 */
const loader = function (source) {
  const { platform } = loaderUtils.getOptions();

  const { code, extraDeps } = transformTemplate(source, platform, getDepPath);
  extraDeps.forEach(dep => {
    this.emitFile(dep.path, dep.code);
  });

  return code;
};

export default loader;