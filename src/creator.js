import instantiateComponent from './instantiate'
import parseRenderData from './parse'
import { isFunction, isUndef, isStr } from './util'
import * as cache from './cache'

const eventBeforeDestroy = 'hook:beforeDestroy'

export default function apiCreator(Component, events = [], single = false) {
  let Vue = this
  let singleMap = {}
  const beforeHooks = []

  function createComponent(renderData, renderFn, options, single, ownerInstance) {
    beforeHooks.forEach((before) => {
      before(renderData, renderFn, single)
    })
    const ownerInsUid = options.parent ? options.parent._uid : -1
    const {comp, ins} = singleMap[ownerInsUid] ? singleMap[ownerInsUid] : {}
    if (single && comp && ins) {
      ins.updateRenderData(renderData, renderFn)
      ins.$forceUpdate()
      return comp
    }
    const component = instantiateComponent(Vue, Component, renderData, renderFn, options)
    const instance = component.$parent
    const originRemove = component.remove
    const isInVueInstance = !!ownerInstance.$on

    component.remove = function () {
      if (isInVueInstance) {
        cancelWatchProps(ownerInstance)
      }
      if (single) {
        if (!singleMap[ownerInsUid]) {
          return
        }
        singleMap[ownerInsUid] = null
      }
      originRemove && originRemove.apply(this, arguments)
      instance.destroy()
      cache.remove(component)
    }

    const originShow = component.show
    component.show = function () {
      originShow && originShow.apply(this, arguments)
      return this
    }

    const originHide = component.hide
    component.hide = function () {
      originHide && originHide.apply(this, arguments)
      return this
    }

    if (single) {
      singleMap[ownerInsUid] = {
        comp: component,
        ins: instance
      }
    }
    return component
  }

  function processProps(ownerInstance, renderData, isInVueInstance, onChange) {
    const $props = renderData.props.$props
    if ($props) {
      delete renderData.props.$props

      const watchKeys = []
      const watchPropKeys = []
      Object.keys($props).forEach((key) => {
        const propKey = $props[key]
        if (isStr(propKey) && propKey in ownerInstance) {
          // get instance value
          renderData.props[key] = ownerInstance[propKey]
          watchKeys.push(key)
          watchPropKeys.push(propKey)
        } else {
          renderData.props[key] = propKey
        }
      })
      if (isInVueInstance) {
        const unwatchFn = ownerInstance.$watch(function () {
          const props = {}
          watchKeys.forEach((key, i) => {
            props[key] = ownerInstance[watchPropKeys[i]]
          })
          return props
        }, onChange)
        ownerInstance.__unwatchFns__.push(unwatchFn)
      }
    }
  }

  function processEvents(renderData, ownerInstance
  ) {
    const $events = renderData.props.$events
    if ($events) {
      delete renderData.props.$events

      Object.keys($events).forEach((event) => {
        let eventHandler = $events[event]
        if (typeof eventHandler === 'string') {
          eventHandler = ownerInstance[eventHandler]
        }
        renderData.on[event] = eventHandler
      })
    }
  }

  function process$(renderData) {
    const props = renderData.props
    Object.keys(props).forEach((prop) => {
      if (prop.charAt(0) === '$') {
        renderData[prop.slice(1)] = props[prop]
        delete props[prop]
      }
    })
  }

  function cancelWatchProps(ownerInstance) {
    if (ownerInstance.__unwatchFns__) {
      ownerInstance.__unwatchFns__.forEach((unwatchFn) => {
        unwatchFn()
      })
      ownerInstance.__unwatchFns__ = null
    }
  }

  const api = {
    before(hook) {
      beforeHooks.push(hook)
    },
    create(config, renderFn, _single) {
      if (!isFunction(renderFn) && isUndef(_single)) {
        _single = renderFn
        renderFn = null
      }

      if (isUndef(_single)) {
        _single = single
      }

      const ownerInstance = this
      const isInVueInstance = !!ownerInstance.$on
      let options = {}

      if (isInVueInstance) {
        // Set parent to store router i18n ...
        options.parent = ownerInstance
        if (!ownerInstance.__unwatchFns__) {
          ownerInstance.__unwatchFns__ = []
        }
      }

      const renderData = parseRenderData(config, events)

      let component = null

      processProps(ownerInstance, renderData, isInVueInstance, (newProps) => {
        component && component.$updateProps(newProps)
      })
      processEvents(renderData, ownerInstance)
      process$(renderData)

      component = createComponent(renderData, renderFn, options, _single, ownerInstance)

      if (isInVueInstance) {
        ownerInstance.$on(eventBeforeDestroy, component.remove.bind(component))
      }

      cache.add(component)

      return component
    }
  }

  return api
}
