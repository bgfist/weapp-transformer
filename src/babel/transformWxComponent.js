import { addDefault } from "@babel/helper-module-imports";

import { getRelativePath } from "../common/utils";

/**
 * 将Component调用转换为对MCComponent的调用，主要给支付宝适配用
 *
 * ```
 *  Component(...)
 *
 * ```
 * 转换为：
 *
 * ```
 * import MCComponent from '../mc_transform/sdk/component.js';
 *
 * MCComponent(...)
 *
 * ```
 */
export default function (_, { sdkDir, request }) {
  const replaceConfig = {
    Component: {
      name: "MCComponent",
      path: require("path").join(sdkDir, "component.js"),
    },
    Page: {
      name: "MCPage",
      path: require("path").join(sdkDir, "page.js"),
    },
  };

  return {
    name: "transformWxComponent",

    pre(file) {
      this.addDefaultImport = (source, nameHint) => {
        return addDefault(file.path, source, {
          importedInterop: "uncompiled",
          nameHint,
        });
      };
    },

    visitor: {
      ReferencedIdentifier(path, state) {
        const { node, scope } = path;
        const { name } = node;

        if (scope.getBindingIdentifier(name)) return;

        if (replaceConfig[name]) {
          let { name: replaceName, path: replacePath } = replaceConfig[name];
          const filepath = state.file.opts.filename;

          // 文件本身就是sdk里的
          if (request && request.indexOf(replacePath) !== -1) {
            return;
          }

          if (require("path").isAbsolute(replacePath)) {
            replacePath = getRelativePath(filepath, replacePath);
          }
          path.replaceWith(this.addDefaultImport(replacePath, replaceName));
        }
      },
    },
  };
}
