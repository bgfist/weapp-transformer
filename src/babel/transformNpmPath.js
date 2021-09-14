/**
 * 将npm包的引用路径改为构建后的真实路径
 */
export default function declare({ types: t }, { getRealPath }) {
  function RealPathLiteral(state, modulePath) {
    const filepath = state.file.opts.filename;
    const realPath = getRealPath(modulePath, filepath);
    return t.StringLiteral(realPath);
  }

  return {
    name: "transformNpmPath",

    visitor: {
      ImportDeclaration(path, state) {
        const modulePath = path.node.source.value;
        const replacedPath = RealPathLiteral(state, modulePath);
        path.get("source").replaceWith(replacedPath);
      },
      CallExpression(path, state) {
        const {
          node: { callee, arguments: args },
        } = path;

        if (t.isIdentifier(callee) && callee.name === "require") {
          if (t.isStringLiteral(args[0])) {
            const modulePath = args[0].value;
            const replacedPath = RealPathLiteral(state, modulePath);
            path.get("arguments.0").replaceWith(replacedPath);
          }
        }
      },
    },
  };
}
