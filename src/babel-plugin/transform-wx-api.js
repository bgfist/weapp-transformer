export default function declare({ types: t }, options, dirname) {
    const namespace = options?.namespace;

    if (!namespace) {
        throw new Error("Please specify the target miniapp platform");
    }

    return {
        name: "transform-wx-api",

        visitor: {
            ReferencedIdentifier(path) {
                const { node, scope } = path;
                const { name } = node;

                if (scope.getBindingIdentifier(name)) return;

                // transform `wx`
                if (name === "wx") {
                    path.replaceWith(
                        t.identifier(namespace)
                    );
                    return;
                }
            },
        }
    }
}