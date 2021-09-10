import fs from 'fs';
import path from 'path';
import * as rollup from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import babelTransformWxApi from '../../babel/transformWxApi';
import { options } from '../options';
import { genNpmDir, jsApiPrefixes } from '../config';

export const npmModules = {};
export const componentModules = {};

/**
 * 将npm模块分成普通的模块和自定义组件模块
 */
export function splitNodeModules() {
	const packageJsonPath = path.resolve(options.src, 'package.json');

	if (!fs.existsSync(packageJsonPath)) {
		return {
			npmModules,
			componentModules
		};
	}

	const packageJson = require(packageJsonPath);
	const nodeModules = packageJson.dependencies || {};

	for (const nodeModule in nodeModules) {
		const packageJsonPath = path.resolve(options.src, 'node_modules', nodeModule, 'package.json')
		const packageJson = require(packageJsonPath);

		if (packageJson.miniprogram) {
			const componentIndexPath = path.resolve(packageJsonPath, '..', packageJson.miniprogram);
			componentModules[nodeModule] = componentIndexPath;
		} else {
			const npmIndexPath = path.resolve(packageJsonPath, '..', packageJson.main || "index.js");
			npmModules[nodeModule] = npmIndexPath;
		}
	}
}

/**
 * 用rollup打包npm包
 */
export function bundleNpm(cb) {
	if (Object.keys(npmModules).length === 0) {
		cb();
		return;
	}

	function appendIndex(input) {
		const ret = {};
		for (const entry in input) {
			ret[entry + '/index'] = input[entry];
		}
		return ret;
	}

	return rollup.rollup({
		input: appendIndex(npmModules),
		plugins: [
			json(),
			nodeResolve({
				preferBuiltins: false
			}),
			commonjs(),
			babel({
				configFile: false,
				retainLines: true,
				babelHelpers: 'bundled',
				plugins: [
					[babelTransformWxApi, { namespace: jsApiPrefixes[options.platform] }]
				],
			})
		]
	}).then(bundle => {
		bundle.write({
			output: {
				dir: path.resolve(options.dist, genNpmDir),
				format: 'cjs',
				exports: 'auto'
			}
		})
	});
}