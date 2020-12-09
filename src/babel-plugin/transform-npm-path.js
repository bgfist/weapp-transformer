import path from 'path';
import { genNpmDir } from '../cli/config';
import { options } from '../cli/options';
import { npmModules } from "../cli/tasks/npm";
import { getRelativePath, normalizeRelativePath } from '../cli/utils';

export default function declare({ types: t }, _, dirname) {

    function getRealPath(p, filepath) {
        if (p in npmModules) {
            const npmBundlePath = path.resolve(options.src, genNpmDir, p, 'index.js');
            p = getRelativePath(filepath, npmBundlePath);
        }

        return normalizeRelativePath(p);
    }

    return {
        name: "transform-npm-path",

        visitor: {
            ImportDeclaration(path, state) {
                const { node } = path;
                const modulePath = node.source.value;
                const filepath = state.file.opts.filename;
                const realPath = getRealPath(modulePath, filepath);

                path.get('source').replaceWith(t.StringLiteral(realPath));
            },
            CallExpression(path, state) {
                const { node } = path;
                const { callee, arguments: args } = node;

                if (t.isIdentifier(callee) && callee.name === 'require') {
                    if (t.isStringLiteral(args[0])) {
                        const modulePath = args[0].value;
                        const filepath = state.file.opts.filename;
                        const realPath = getRealPath(modulePath, filepath);

                        path.get('arguments.0').replaceWith(t.StringLiteral(realPath));
                    }
                }
            }
        }
    }
}