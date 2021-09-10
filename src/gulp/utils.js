import path from 'path';
import gulp from 'gulp';
import { componentModules } from './tasks/npm';
import { options } from './options';
import through2 from 'through2';
import { genNpmDir, supportedPlatforms, wxssSuffixes, wxmlSuffixes, wxsSuffixes } from './config';

/**
 * 根据文件名后缀过滤平台相关的文件
 */
function filterPlatformFiles(ext) {
  const files = {};

  const endsWith = (str, haystack) => str.indexOf(haystack) === str.length - haystack.length;
  const getPlatformExt = p => `.${p}.${ext}`;
  const platformExt = getPlatformExt(options.platform);
  const excludePlatformExts = supportedPlatforms.filter(p => p !== options.platform).map(getPlatformExt);

  function transform(file, enc, cb) {
    let filepath = file.path;

    for (const platformExt of excludePlatformExts) {
      if (endsWith(filepath, platformExt)) {
        cb();
        return;
      }
    }

    if (endsWith(filepath, platformExt)) {
      const idx = filepath.indexOf(platformExt);
      filepath = `${filepath.slice(0, idx)}.${ext}`;
      file.path = filepath;
    } else if (filepath in files) {
      cb();
      return;
    };

    files[filepath] = file;
    cb();
  }

  function flush(cb) {
    // trick, 先遍历app.json, 方便继承其配置
    const appJsonPath = getAppJsonPath();
    const appJsonFile = files[appJsonPath];
    if (appJsonFile) {
      delete files[appJsonPath];
      this.push(appJsonFile);
    }

    for (const filepath in files) {
      this.push(files[filepath]);
    }

    cb();
  }

  return through2.obj(transform, flush);
}

function renameNodeModules() {
  return through2.obj(function (file, enc, cb) {
    file.path = replaceNodeModulesPath(file.path, file);
    cb(null, file);
  });
}

function renameExt() {
  return through2.obj(function (file, enc, cb) {
    if (file.extname === '.wxml') {
      file.extname = wxmlSuffixes[options.platform];
    } else if (file.extname === '.wxs') {
      file.extname = wxsSuffixes[options.platform];
    } else if (file.extname === '.wxss') {
      file.extname = wxssSuffixes[options.platform];
    }
    cb(null, file);
  });
}

export function globExt(ext) {
  const pattern = `**/*.${ext}`;

  return gulp.src([
    pattern,
    '!' + path.join(options.distBase, "**"),
    '!miniprogram_npm/**',
    '!node_modules/**',
    ...Object.keys(componentModules).map(moduleName => path.join('node_modules', moduleName, pattern))
  ], { base: options.src, cwd: options.src })
    .pipe(filterPlatformFiles(ext))
    .pipe(renameNodeModules())
    .pipe(renameExt());
}

export function globOthers() {
  const pattern = '**/*';

  return gulp.src([
    pattern,
    '!' + path.join(options.distBase, "**"),
    '!miniprogram_npm/**',
    '!node_modules/**',
    ...Object.keys(componentModules).map(moduleName => path.join('node_modules', moduleName, pattern)),
    '!**/*.js',
    '!**/*.wxs',
    '!**/*.json',
    '!**/*.wxss',
    '!**/*.wxml',
  ], { base: options.src, cwd: options.src })
    .pipe(renameNodeModules())
}

/**
 * 替换npm模块里的文件路径为生成后的路径
 */
export function replaceNodeModulesPath(filepath, file) {
  return filepath.replace(/(?<=\/)node_modules(?=\/)/, () => {
    if (file) {
      file.isNpm = true
    }
    return genNpmDir
  });
}

export function getAppJsonPath() {
  return path.resolve(options.src, 'app.json')
}

export * from '../core/utils';