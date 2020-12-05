/**
 * 让支付宝的Component写法与微信保持统一
 */
export default function MCComponent(options) {
  options = normalizeOptions(options);

  const { created: onInit, attached, ready, detached: didUnmount, properties: props, observers, methods = {}, behaviours = [], ...extra } = options;

  for (const k in props) {
    if (typeof props[k] === "object") {
      props[k] = props[k].value;
    } else {
      delete props[k];
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

  methods.triggerEvent = function (eventName, data, options) {
    eventName = eventName[0].toUpperCase() + eventName.slice(1);
    const handler = this.props["on" + eventName] || this.props["catch" + eventName];
    handler && handler({ detail: data });
  };

  return Component({
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
  });
}

function normalizeOptions(options) {
  const hooks = {};
  const object = {};
  mixinBehaviors(options, object, hooks);

  function makeHook(name) {
    return function (...args) {
      hooks[name].forEach(hook => hook.apply(this, args));
    }
  }

  for (const k in hooks) {
    hooks[k] = makeHook(k);
  }

  return {
    ...object,
    ...hooks
  }
}

function mixinBehaviors(options, object, queue) {
  const { behaviours } = options;

  if (behaviours) {
    behaviours.map(behavior => mixinBehaviors(behavior, object, queue));
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