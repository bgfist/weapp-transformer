import path from "path";
import { addDefault } from "@babel/helper-module-imports";
import { getRelativePath } from "../cli/utils";

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
export default function ({ types: t }, { sdkDir, isNpm }) {
  const sdkComponentPath = path.join(sdkDir, 'component.js');
  const sdkPagePath = path.join(sdkDir, 'page.js');

  return {
    name: "transformWxComponent",

    pre(file) {
      this.addDefaultImport = (source, nameHint) => {
        return addDefault(file.path, source, {
          importedInterop: "uncompiled",
          nameHint,
        });
      }
    },

    visitor: {
      ReferencedIdentifier(_path, state) {
        const { node, scope } = _path;
        const { name } = node;

        if (scope.getBindingIdentifier(name)) return;

        // transform `Component`
        if (name === "Component") {
          if (isNpm) {
            _path.replaceWith(
              this.addDefaultImport(
                sdkComponentPath,
                "MCComponent"
              )
            );
            return;
          }

          const filepath = state.file.opts.filename;
          const sdkRelativePath = getRelativePath(filepath, sdkComponentPath);
          _path.replaceWith(
            this.addDefaultImport(
              sdkRelativePath,
              "MCComponent"
            )
          );
          return;
        }
        // transform `Page`
        else if (name === 'Page') {
          if (isNpm) {
            _path.replaceWith(
              this.addDefaultImport(
                sdkPagePath,
                "MCPage"
              )
            );
            return;
          }

          const filepath = state.file.opts.filename;
          const sdkRelativePath = getRelativePath(filepath, sdkPagePath);
          _path.replaceWith(
            this.addDefaultImport(
              sdkRelativePath,
              "MCPage"
            )
          );
          return;
        }
      },
    }
  }
}