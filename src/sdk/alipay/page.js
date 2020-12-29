/**
 * 支付宝的Page函数机制跟微信不一样，会在一开始就调用
 */
export default function MCPage(_options) {
    const { options, data, onLoad, ...extra } = _options;

    // 将函数(包括生命周期函数)与自定义属性分开
    const customProps = {};
    const funcs = {};
    for (const k in extra) {
        const v = extra[k];
        if (typeof v === 'function') {
            funcs[k] = v;
        } else {
            customProps[k] = v;
        }
    }

    return Page({
        options,
        data,
        onLoad(...args) {
            // 深拷贝，然后赋值给this
            Object.assign(this, JSON.parse(JSON.stringify(customProps)));
            onLoad && onLoad.apply(this, args);
        },
        ...funcs
    });
}