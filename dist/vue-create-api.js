/**
 * vue-create-api v0.2.3
 * (c) 2019 ustbhuangyi
 * @license MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.VueCreateAPI = factory());
}(this, (function () { 'use strict';

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  var camelizeRE = /-(\w)/g;

  function camelize(str) {
    return (str + '').replace(camelizeRE, function (m, c) {
      return c ? c.toUpperCase() : '';
    });
  }

  function escapeReg(str, delimiter) {
    return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
  }

  function isBoolean(value) {
    return typeof value === 'boolean';
  }

  function isUndef(value) {
    return value === undefined;
  }

  function isStr(value) {
    return typeof value === 'string';
  }

  function isFunction(fn) {
    return typeof fn === 'function';
  }

  function assert(condition, msg) {
    if (!condition) {
      throw new Error("[vue-create-api error]: " + msg);
    }
  }

  function instantiateComponent(Vue, Component, data, renderFn, options) {
    var renderData = void 0;
    var childrenRenderFn = void 0;

    var instance = new Vue(_extends({}, options, {
      render: function render(createElement) {
        var children = childrenRenderFn && childrenRenderFn(createElement);
        if (children && !Array.isArray(children)) {
          children = [children];
        }

        return createElement(Component, _extends({}, renderData), children || []);
      },

      methods: {
        init: function init() {
          document.body.appendChild(this.$el);
        },
        destroy: function destroy() {
          this.$destroy();
          if (this.$el && this.$el.parentNode === document.body) {
            document.body.removeChild(this.$el);
          }
        }
      }
    }));
    instance.updateRenderData = function (data, render) {
      renderData = data;
      childrenRenderFn = render;
    };
    instance.updateRenderData(data, renderFn);
    instance.$mount();
    instance.init();
    var component = instance.$children[0];
    component.$updateProps = function (props) {
      _extends(renderData.props, props);
      instance.$forceUpdate();
    };
    return component;
  }

  function parseRenderData() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var events = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    events = parseEvents(events);
    var props = _extends({}, data);
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
    };
  }

  function parseEvents(events) {
    var parsedEvents = {};
    events.forEach(function (name) {
      parsedEvents[name] = camelize('on-' + name);
    });
    return parsedEvents;
  }

  var eventBeforeDestroy = 'hook:beforeDestroy';

  function apiCreator(Component) {
    var events = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var single = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var Vue = this;
    var singleMap = {};
    var beforeHooks = [];

    function createComponent(renderData, renderFn, options, single) {
      beforeHooks.forEach(function (before) {
        before(renderData, renderFn, single);
      });
      var ownerInsUid = options.parent ? options.parent._uid : -1;

      var _ref = singleMap[ownerInsUid] ? singleMap[ownerInsUid] : {},
          comp = _ref.comp,
          ins = _ref.ins;

      if (single && comp && ins) {
        ins.updateRenderData(renderData, renderFn);
        ins.$forceUpdate();
        return comp;
      }
      var component = instantiateComponent(Vue, Component, renderData, renderFn, options);
      var instance = component.$parent;
      var originRemove = component.remove;

      component.remove = function () {
        if (single) {
          if (!singleMap[ownerInsUid]) {
            return;
          }
          singleMap[ownerInsUid] = null;
        }
        originRemove && originRemove.apply(this, arguments);
        instance.destroy();
      };

      var originShow = component.show;
      component.show = function () {
        originShow && originShow.apply(this, arguments);
        return this;
      };

      var originHide = component.hide;
      component.hide = function () {
        originHide && originHide.apply(this, arguments);
        return this;
      };

      if (single) {
        singleMap[ownerInsUid] = {
          comp: component,
          ins: instance
        };
      }
      return component;
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
            return props;
          }, onChange);
          ownerInstance.__unwatchFns__.push(unwatchFn);
        }
      }
    }

    function processEvents(renderData, ownerInstance) {
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

        return component;
      }
    };

    return api;
  }

  function install(Vue) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$componentPre = options.componentPrefix,
        componentPrefix = _options$componentPre === undefined ? '' : _options$componentPre,
        _options$apiPrefix = options.apiPrefix,
        apiPrefix = _options$apiPrefix === undefined ? '$create-' : _options$apiPrefix;


    Vue.createAPI = function (Component, events, single) {
      if (isBoolean(events)) {
        single = events;
        events = [];
      }
      var api = apiCreator.call(this, Component, events, single);
      var createName = processComponentName(Component, {
        componentPrefix: componentPrefix,
        apiPrefix: apiPrefix
      });
      Vue.prototype[createName] = Component.$create = api.create;
      return api;
    };
  }

  function processComponentName(Component, options) {
    var componentPrefix = options.componentPrefix,
        apiPrefix = options.apiPrefix;

    var name = Component.name;
    assert(name, 'Component must have name while using create-api!');
    var prefixReg = new RegExp('^' + escapeReg(componentPrefix), 'i');
    var pureName = name.replace(prefixReg, '');
    var camelizeName = '' + camelize('' + apiPrefix + pureName);
    return camelizeName;
  }

  var index = {
    install: install,
    instantiateComponent: instantiateComponent,
    version: '0.2.3'
  };

  return index;

})));
