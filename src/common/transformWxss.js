import { wxssSuffixes } from "./config";
import { normalizeRelativePath } from "./utils";

export function getPostcssPlugins(platform) {
  return [
    /** 替换 import 导入的路径 */
    function transformImportPath(root) {
      root.nodes
        .filter(n => n.type === 'atrule' && n.name === 'import')
        .forEach(n => {
          // n.params被引号包裹
          let importPath = n.params.slice(1, -1);
          importPath = normalizeRelativePath(importPath.replace(/\.wxss/, wxssSuffixes[platform]));
          importPath = n.params[0] + importPath + n.params[n.params.length - 1];
          n.params = importPath;
        });
    }
  ]
}