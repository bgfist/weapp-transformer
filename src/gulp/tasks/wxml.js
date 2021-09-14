import through2 from "through2";
import gulp from "gulp";
import path from 'path';

import { genWxsDir } from "../config";
import { options } from '../options';
import { globExt } from "../utils";
import { transformTemplate } from "../../common/transformWxml";
import { getRelativePath } from "../../common/utils";

export function transformWxml() {
	return globExt('wxml')
		.pipe(through2.obj(function (file, enc, callback) {
			if (!file.isBuffer()) {
				callback(null, file);
				return;
			}

			const { code, extraDeps } = transformTemplate(String(file.contents), options.platform, depName => {
				// 相对路径
				return getRelativePath(file.path, path.join(file.base, genWxsDir, depName));
			});
			extraDeps.forEach(dep => {
				const vinyl = file.clone({ contents: false });
				vinyl.contents = Buffer.from(dep.code);
				// 绝对路径
				vinyl.path = path.join(path.dirname(file.path), dep.path);
				this.push(vinyl);
			});

			file.contents = Buffer.from(code);
			this.push(file);

			callback();
		}))
		.pipe(gulp.dest(options.dist));
}