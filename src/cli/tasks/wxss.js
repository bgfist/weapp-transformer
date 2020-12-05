import gulp from 'gulp';
import postcss from 'gulp-postcss';
import { wxssSuffixes } from '../config';
import { options } from "../options"
import { globExt, normalizeRelativePath } from '../utils';

function transformImportPath(root) {
    root.nodes
        .filter(n => n.type === 'atrule' && n.name === 'import')
        .forEach(n => {
            let importPath = n.params.slice(1, -1);
            importPath = normalizeRelativePath(importPath.replace(/\.wxss/, wxssSuffixes[options.platform]));
            importPath = n.params[0] + importPath + n.params[n.params.length - 1];
            n.params = importPath;
        });
}

export function transformWxss() {
    return globExt("wxss")
        .pipe(postcss([transformImportPath]))
        .pipe(gulp.dest(options.dist))
}