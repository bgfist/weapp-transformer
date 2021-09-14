/**
 * 将 `wx.` api改为各平台对应的全局对象名
 */
export default function declare({ types: t }, { namespace }) {
  return {
    name: "transformWxApi",

    visitor: {
      ReferencedIdentifier(path) {
        const { node, scope } = path;
        const { name } = node;

        if (scope.getBindingIdentifier(name)) return;

        if (name === "wx") {
          path.replaceWith(t.identifier(namespace));
          return;
        }
      },
    },
  };
}
