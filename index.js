export function MCComponent(options) {
  if (typeof my === undefined) {
    return Component;
  }

  const { created: onInit, attached, ready, detached: didUnmount, properties: props, observers, ...extra } = options;

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

    if (keySegment in keySegments) {
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

  return Component({
    onInit,
    didMount() {
      attached && attached();
      ready && ready();
    },
    didUnmount,
    didUpdate,
    props,
    triggerEvent(eventName, data, options) {
      eventName = eventName[0].toUpperCase() + eventName.slice(1);
      const handler = this.props["bind" + eventName] || this.props["catch" + eventName];
      handler && handler(data);
    },
    ...extra
  });
}
