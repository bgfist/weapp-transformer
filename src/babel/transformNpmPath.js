/**
 * 将npm包的引用路径改为构建后的真实路径
 */
export default function declare({ types: t }, { getRealPath }) {
  return {
    name: "transformNpmPath",

    visitor: {
      ImportDeclaration(path, state) {
        const { node } = path;
        const modulePath = node.source.value;
        const filepath = state.file.opts.filename;
        const realPath = getRealPath(modulePath, filepath);

        path.get('source').replaceWith(t.StringLiteral(realPath));
      },
      CallExpression(path, state) {
        const { node } = path;
        const { callee, arguments: args } = node;

        if (t.isIdentifier(callee) && callee.name === 'require') {
          if (t.isStringLiteral(args[0])) {
            const modulePath = args[0].value;
            const filepath = state.file.opts.filename;
            const realPath = getRealPath(modulePath, filepath);

            path.get('arguments.0').replaceWith(t.StringLiteral(realPath));
          }
        }
      }
    }
  }
}