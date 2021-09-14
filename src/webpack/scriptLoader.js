import path from "path";
import { transform } from "@babel/core";
import { packageName } from "../common/config";
import { getBabelPlugins } from "../common/transformJs";
const loaderUtils = require("loader-utils");

/**
 * @type {import('webpack').loader.Loader}
 */
const loader = function scriptLoader(source) {
  const { platform } = loaderUtils.getOptions(this);
  const callback = this.async();

  transform(
    source,
    {
      filename: this.resourcePath,
      plugins: getBabelPlugins(platform, {
        transformWxFunc: {
          sdkDir: path.join(packageName, "lib/sdk", platform),
          request: this.resourcePath,
        },
      }),
    },
    (err, result) => {
      callback(err, result && result.code);
    }
  );
};

export default loader;
