const babel = require('@babel/core');
const generator = require('@babel/generator');
const fs = require('fs');
const util = require('util');

const code = fs.readFileSync('./source.js', 'utf-8');
const ast = babel.parseSync(code, {});
//(wx|swan|tt|quickapp|my)

const platform = 'quickapp';
const commentRegex = /enable: (\w+)/

babel.traverse(ast, {
    enter(path, state) {
        const comments = path.node.leadingComments;
        if (comments && comments.length) {
            const comment = comments[comments.length - 1];

            if (comment.type === 'CommentLine') {
                const str = comment.value;

                const match = str.match(commentRegex);
                if (match) {
                    if (match[1] !== platform) {
                        path.remove();
                    }
                }
            }
        }
    }
})

const gen = generator.default(ast, { retainLines: true }).code;

// console.log(util.inspect(ast));
fs.writeFileSync('./dist.js', gen, { encoding: 'utf-8' });