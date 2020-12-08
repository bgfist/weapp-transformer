import path from "path";
import { addDefault } from "@babel/helper-module-imports";
import { options } from "../cli/options";
import { genSdkDir } from "../cli/config";
import { getRelativePath } from "../cli/utils";

export default function ({ types: t }, _, dirname) {
    const sdkPath = path.resolve(options.src, genSdkDir, `component.js`);

    return {
        name: "transform-wx-component",

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
                    const filepath = state.file.opts.filename;
                    const sdkRelativePath = getRelativePath(filepath, sdkPath);
                    _path.replaceWith(
                        this.addDefaultImport(
                            sdkRelativePath,
                            "MCComponent"
                        )
                    );
                    return;
                }
            },
        }
    }
}