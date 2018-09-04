/**
 * vue-create-api v1.0.0
 * (c) 2018 ustbhuangyi
 * @license MIT
 */
var camelizeRE = /-(\w)/g;

function camelize(str) {
  return (str + '').replace(camelizeRE, function (m, c) {
    return c ? c.toUpperCase() : ''
  })
}

function escapeReg(str, delimiter) {
  return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&')
}

function isBoolean(value) {
  return typeof value === 'boolean'
}



function isUndef(value) {
  return value === undefined
}

function isStr(value) {
  return typeof value === 'string'
}

function isFunction(fn) {
  return typeof fn === 'function'
}

function assert(condition, msg) {
  if (!condition) {
    throw new Error(("[create-api error]: " + msg))
  }
}

function instantiateComponent(Vue, Component, data, renderFn, options) {
  var renderData;
  var childrenRenderFn;

  var instance = new Vue(Object.assign({}, options,
    {render: function render(createElement) {
      var children = childrenRenderFn && childrenRenderFn(createElement);
      if (children && !Array.isArray(children)) {
        children = [children];
      }

      return createElement(Component, Object.assign({}, renderData), children || [])
    },
    methods: {
      init: function init() {
        document.body.appendChild(this.$el);
      },
      destroy: function destroy() {
        this.$destroy();
        document.body.removeChild(this.$el);
      }
    }}));
  instance.updateRenderData = function (data, render) {
    renderData = data;
    childrenRenderFn = render;
  };
  instance.updateRenderData(data, renderFn);
  instance.$mount();
  instance.init();
  var component = instance.$children[0];
  component.$updateProps = function (props) {
    Object.assign(renderData.props, props);
    instance.$forceUpdate();
  };
  return component
}

function parseRenderData(data, events) {
  if ( data === void 0 ) data = {};
  if ( events === void 0 ) events = {};

  events = parseEvents(events);
  var props = Object.assign({}, data);
  var on = {};
  for (var name in events) {
    if (events.hasOwnProperty(name)) {
      var handlerName = events[name];
      if (props[handlerName]) {
        on[name] = props[handlerName];
        delete props[handlerName];
      }
    }
  }
  return {
    props: props,
    on: on
  }
}

function parseEvents(events) {
  var parsedEvents = {};
  events.forEach(function (name) {
    parsedEvents[name] = camelize(("on-" + name));
  });
  return parsedEvents
}

var eventBeforeDestroy = 'hook:beforeDestroy';

function apiCreator(Component, events, single) {
  if ( events === void 0 ) events = [];
  if ( single === void 0 ) single = false;

  var Vue = this;
  var singleMap = {};
  var beforeHooks = [];

  function createComponent(renderData, renderFn, options, single) {
    beforeHooks.forEach(function (before) {
      before(renderData, renderFn, single);
    });
    var ownerInsUid = options.parent ? options.parent._uid : -1;
    var ref = singleMap[ownerInsUid] ? singleMap[ownerInsUid] : {};
    var comp = ref.comp;
    var ins = ref.ins;
    if (single && comp && ins) {
      ins.updateRenderData(renderData, renderFn);
      ins.$forceUpdate();
      return comp
    }
    var component = instantiateComponent(Vue, Component, renderData, renderFn, options);
    var instance = component.$parent;
    var originRemove = component.remove;

    component.remove = function () {
      originRemove && originRemove.call(this);
      instance.destroy();
      if (single) {
        singleMap[ownerInsUid] = null;
      }
    };

    var originShow = component.show;
    component.show = function () {
      originShow && originShow.call(this);
      return this
    };

    var originHide = component.hide;
    component.hide = function () {
      originHide && originHide.call(this);
      return this
    };

    if (single) {
      singleMap[ownerInsUid] = {
        comp: component,
        ins: instance
      };
      
    }
    return component
  }

  function processProps(ownerInstance, renderData, isInVueInstance, onChange) {
    var $props = renderData.props.$props;
    if ($props) {
      delete renderData.props.$props;

      var watchKeys = [];
      var watchPropKeys = [];
      Object.keys($props).forEach(function (key) {
        var propKey = $props[key];
        if (isStr(propKey) && propKey in ownerInstance) {
          // get instance value
          renderData.props[key] = ownerInstance[propKey];
          watchKeys.push(key);
          watchPropKeys.push(propKey);
        } else {
          renderData.props[key] = propKey;
        }
      });
      if (isInVueInstance) {
        var unwatchFn = ownerInstance.$watch(function () {
          var props = {};
          watchKeys.forEach(function (key, i) {
            props[key] = ownerInstance[watchPropKeys[i]];
          });
          return props
        }, onChange);
        ownerInstance.__unwatchFns__.push(unwatchFn);
      }
    }
  }

  function processEvents(renderData, ownerInstance
  ) {
    var $events = renderData.props.$events;
    if ($events) {
      delete renderData.props.$events;

      Object.keys($events).forEach(function (event) {
        var eventHandler = $events[event];
        if (typeof eventHandler === 'string') {
          eventHandler = ownerInstance[eventHandler];
        }
        renderData.on[event] = eventHandler;
      });
    }
  }

  function process$(renderData) {
    var props = renderData.props;
    Object.keys(props).forEach(function (prop) {
      if (prop.charAt(0) === '$') {
        renderData[prop.slice(1)] = props[prop];
        delete props[prop];
      }
    });
  }

  function cancelWatchProps(ownerInstance) {
    if (ownerInstance.__unwatchFns__) {
      ownerInstance.__unwatchFns__.forEach(function (unwatchFn) {
        unwatchFn();
      });
      ownerInstance.__unwatchFns__ = null;
    }
  }

  var api = {
    before: function before(hook) {
      beforeHooks.push(hook);
    },
    create: function create(config, renderFn, _single) {
      if (!isFunction(renderFn) && isUndef(_single)) {
        _single = renderFn;
        renderFn = null;
      }

      if (isUndef(_single)) {
        _single = single;
      }

      var ownerInstance = this;
      var isInVueInstance = !!ownerInstance.$on;
      var options = {};

      if (isInVueInstance) {
        // Set parent to store router i18n ...
        options.parent = ownerInstance;
        if (!ownerInstance.__unwatchFns__) {
          ownerInstance.__unwatchFns__ = [];
        }
      }

      var renderData = parseRenderData(config, events);

      var component = null;

      processProps(ownerInstance, renderData, isInVueInstance, function (newProps) {
        component && component.$updateProps(newProps);
      });
      processEvents(renderData, ownerInstance);
      process$(renderData);

      component = createComponent(renderData, renderFn, options, _single);

      if (isInVueInstance) {
        ownerInstance.$on(eventBeforeDestroy, beforeDestroy);
      }

      function beforeDestroy() {
        cancelWatchProps(ownerInstance);
        component.remove();
        component = null;
      }

      return component
    }
  };

  return api
}

var index = function (Vue, options) {
  if ( options === void 0 ) options = {};

  var componentPrefix = options.componentPrefix; if ( componentPrefix === void 0 ) componentPrefix = '';
  var apiPrefix = options.apiPrefix; if ( apiPrefix === void 0 ) apiPrefix = '$create-';

  Vue.createAPI = function (Component, events, single) {
    if (isBoolean(events)) {
      single = events;
      events = [];
    }
    var api = apiCreator.call(this, Component, events, single);
    var createName = processComponentName(Component, {
      componentPrefix: componentPrefix,
      apiPrefix: apiPrefix,
    });
    Vue.prototype[createName] = Component.$create = api.create;
    return api
  };
};

function processComponentName(Component, options) {
  var componentPrefix = options.componentPrefix;
  var apiPrefix = options.apiPrefix;
  var name = Component.name;
  assert(name, 'Component must have name while using create-api!');
  var prefixReg = new RegExp(("^" + (escapeReg(componentPrefix))), 'i');
  var pureName = name.replace(prefixReg, '');
  var camelizeName = "" + (camelize(("" + apiPrefix + pureName)));
  return camelizeName
}

export default index;
