import path from 'path';
import { transformTemplate } from '../common/transformWxml';
const loaderUtils = require('loader-utils');

function getDepPath(depName) {
  return `./_mc_transform_wxs/${depName}`;
}

/**
 * @type {import('webpack').loader.Loader}
 */
const loader = function (source) {
  const { platform, context = this.rootContext } = loaderUtils.getOptions(this);

  const { code, extraDeps } = transformTemplate(source, platform, getDepPath);

  extraDeps.forEach(dep => {
    const outputPath = path.relative(context, path.join(path.dirname(this.resourcePath), dep.path));
    this.emitFile(outputPath, dep.code);
  });

  return code;
};

export default loader;