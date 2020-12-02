import { addDefault } from "@babel/helper-module-imports";

export default function ({ types: t }, options, dirname) {
    const platform = options?.platform;

    if (!platform) {
        throw new Error("Please specify the target miniapp platform");
    }

    const modulePath = 1;

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
            ReferencedIdentifier(path) {
                const { node, scope } = path;
                const { name } = node;

                if (scope.getBindingIdentifier(name)) return;

                // transform `Component`
                if (name === "Component") {
                    path.replaceWith(
                        this.addDefaultImport(
                            `${modulePath}/${platform}/component.${platform}`,
                            "MCComponent"
                        )
                    );
                    return;
                }
            },
        }
    }
}