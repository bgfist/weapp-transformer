/**
 * 让支付宝的Component写法与微信保持统一
 */
export default function MCComponent(options) {
  options = polyfillMixin(options);

  const {
    created: onInit,
    attached,
    ready,
    detached: didUnmount,
    properties,
    observers = {},
    methods = {},
    behaviours,
    ...extra
  } = options;

  const props = {}
  for (const k in properties) {
    if (typeof properties[k] === "object") {
      const property = properties[k]
      if ('value' in property) {
        props[k] = property.value
      }
      if (typeof property.observer === 'function') {
        observers[k] = property.observer
      } else if (typeof property.observer === 'string') {
        observers[k] = methods[property.observer]
      }
    }
  }

  function tryGet(obj, keySegments) {
    let keySegment;
    [keySegment, ...keySegments] = keySegments;
    if (!keySegment || keySegment === "**") {
      return obj;
    }

    if (keySegment in obj) {
      return tryGet(obj[keySegment], keySegments);
    }

    return undefined;
  }

  function didUpdate(prevProps, prevData) {
    const prev = { ...prevProps, ...prevData };
    const next = { ...this.props, ...this.data };

    for (const k in observers) {
      let changed = false;
      const keypath = k.split(",");
      const newData = keypath.map(function (key) {
        const keySegments = key.split(".");
        const _old = tryGet(prev, keySegments);
        const _new = tryGet(next, keySegments);
        if (_new !== _old) {
          changed = true;
        }
        return _new;
      });
      changed && observers[k].apply(this, newData);
    }
  }

  options = {
    onInit,
    didMount() {
      attached && attached.call(this);
      ready && ready.call(this);
    },
    didUnmount,
    didUpdate,
    props,
    methods,
    ...extra
  };

  polyfillThis(options);

  return Component(options);
}

/**
 * 处理Behavior
 * TODO: 可用mixins配置代替？
 */
function polyfillMixin(options) {
  if (!options.behaviours) {
    return options;
  }

  function collectBehavior(options, object, queue) {
    const { behaviours } = options;

    if (behaviours) {
      behaviours.map(behavior => collectBehavior(behavior, object, queue));
    }

    for (const k in options) {
      const v = options[k];

      if (typeof v === 'function') {
        if (!queue[k]) {
          queue[k] = [];
        }
        queue[k].unshift(v);
      } else {
        if (!object[k]) {
          object[k] = {};
        }
        Object.assign(object[k], v);
      }
    }
  }

  function makeHook(name) {
    const hookFns = hooks[name];
    return function (...args) {
      hookFns.forEach(hook => hook.apply(this, args));
    }
  }

  const hooks = {};
  const object = {};
  collectBehavior(options, object, hooks);
  for (const k in hooks) {
    hooks[k] = makeHook(k);
  }

  return {
    ...object,
    ...hooks
  }
}

/**
 * 给component实例注入一些属性和方法
 */
function polyfillThis(options) {
  function bindThis(fn) {
    return function (...args) {
      const self = this;
      const instance = Object.create(self);

      Object.defineProperties(instance, {
        'properties': {
          get() {
            return {
              ...self.props,
              ...self.data
            };
          }
        },
        'data': {
          get() {
            return {
              ...self.props,
              ...self.data
            };
          }
        },
        'triggerEvent': {
          value: function (eventName, data, options) {
            eventName = eventName[0].toUpperCase() + eventName.slice(1);
            const handler = this.props["on" + eventName] || this.props["catch" + eventName];
            handler && handler({ detail: data });
          }
        },
        'createSelectorQuery': {
          value: my.createSelectorQuery
        }
      });

      return fn.apply(instance, args);
    }
  }

  for (const k in options) {
    const option = options[k];

    if (typeof option === 'object' && option) {
      polyfillThis(option);
    } else if (typeof option === 'function') {
      options[k] = bindThis(option);
    }
  }
}