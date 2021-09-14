import path from 'path';

export function replaceExt(filePath, ext) {
  return filePath.replace(getExt(filePath), ext);
}

export function getExt(filePath) {
  return path.extname(filePath);
}