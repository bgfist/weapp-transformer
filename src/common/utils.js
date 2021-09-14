import path from 'path';

/**
 * 规范相对路径
 */
export function normalizeRelativePath(p) {
  if (path.isAbsolute(p)) {
    return p;
  }

  if (p.indexOf("..") !== 0 && p.indexOf("./") !== 0) {
    p = "./" + p;
  }

  return p;
}

export function getRelativePath(from, to) {
  const relativePath = path.relative(path.dirname(from), to).replace(/\\/g, "/");
  return normalizeRelativePath(relativePath);
}

export function isAlipay(platform) {
  return platform === "alipay";
}

export function endsWith(str, haystack) {
  return str.indexOf(haystack) === str.length - haystack.length;
}
