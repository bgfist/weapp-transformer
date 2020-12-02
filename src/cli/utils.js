import path from 'path';
import gulp from 'gulp';
import { componentModules } from './tasks/npm';
import { options } from './options';
import through2 from 'through2';
import { genNpmDir, supportedPlatforms, wxssSuffixes, wxmlSuffixes, wxsSuffixes } from './config';

function filterPlatformFiles(ext) {
    const files = new Map();

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
        } else if (files.has(filepath)) {
            cb();
            return;
        };

        files.set(filepath, file);
        cb();
    }

    function flush(cb) {
        for (const [, file] of files) {
            this.push(file);
        }
        cb();
    }

    return through2.obj(transform, flush);
}

function renameNodeModules() {
    return through2.obj(function (file, enc, cb) {
        file.path = replaceNodeModulesPath(file.path);
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

export function replaceNodeModulesPath(filepath) {
    return filepath.replace(/(?<=\/)node_modules(?=\/)/, genNpmDir);
}