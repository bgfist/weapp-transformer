const path = require('path');

export function replaceExt(filePath, ext) {
  const extname = path.extname(filePath);
  return filePath.replace(extname, ext);
}