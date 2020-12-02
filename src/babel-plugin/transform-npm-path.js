export default function declare({ types: t }, options, dirname) {
    const platform = options?.platform;

    if (!platform) {
        throw new Error("Please specify the target miniapp platform");
    }

    return {
        name: "transform-npm-path",

        visitor: {
            ReferencedIdentifier(path) {
                const { node, scope } = path;
                const { name } = node;

                if (scope.getBindingIdentifier(name)) return;

                // transform `wx`
                if (name === "wx") {
                    path.replaceWith(
                        t.identifier(platform)
                    );
                    return;
                }
            },
        }
    }
}