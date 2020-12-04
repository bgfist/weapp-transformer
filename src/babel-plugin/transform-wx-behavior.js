export default function declare({ types: t }, options, dirname) {
    return {
        name: "transform-wx-behavior",

        visitor: {
            CallExpression(path) {
                const { node } = path;
                const { callee, arguments: args } = node;

                if (t.isIdentifier(callee) && callee.name === 'Behavior') {
                    if (args.length !== 1) {
                        throw new Error("不正确的Behaviour用法");
                    }

                    path.replaceWith(args[0]);
                }
            },
        }
    }
}