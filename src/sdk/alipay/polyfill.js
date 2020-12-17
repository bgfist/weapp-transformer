/**
 * 让 `my.` 系列api的写法与微信保持统一
 */

const showToast = my.showToast;

my.showToast = function (options) {
    const { icon: type, title: content, ...extra } = options;

    return showToast.call(my, {
        type,
        content,
        ...extra
    })
}

my.showModal = function (options) {
    const { showCancel = true, cancelText, cancelColor, confirmText, confirmColor, ...extra } = options;

    if (showCancel) {
        return my.confirm({
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            ...extra,
            success(res) {
                res.cancel = !res.confirm;
                extra.success && extra.success(res);
            }
        })
    }

    return my.alert({
        buttonText: confirmText,
        ...extra
    })
}

const getStorageSync = my.getStorageSync;

my.getStorageSync = function (key) {
    const data = getStorageSync.call(my, { key }).data;

    return data == null ? '' : data;
}

const setStorageSync = my.setStorageSync;

my.setStorageSync = function (key, data) {
    return setStorageSync.call(my, { key, data });
}

const removeStorageSync = my.removeStorageSync;

my.removeStorageSync = function (key) {
    return removeStorageSync.call(my, { key });
}

my.login = function (options) {
    const { success, ...extra } = options;

    return my.getAuthCode({
        ...extra,
        success(res) {
            success && success({
                code: res.authCode,
                ...res
            })
        }
    })
}

my.getUserInfo = function (options) {
    const { success, ...extra } = options;

    return my.getOpenUserInfo({
        ...extra,
        success(res) {
            success && success({
                userInfo: JSON.parse(res.response).response,
                ...res
            })
        }
    })
}

my.onPageNotFound = function () {
    // TODO
}

my.nextTick = function (cb) {
    setTimeout(cb)
}

my.setNavigationBarTitle = my.setNavigationBar

const request = my.request

my.request = function (options) {
    const { header: headers, success, ...extra } = options
    return request.call(my, {
        headers,
        success({ header: headers, ...extra }) {
            return success && success.call(this, {
                headers,
                ...extra
            })
        },
        ...extra
    })
}