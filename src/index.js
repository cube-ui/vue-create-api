import { camelize, escapeReg, isBoolean, isFunction, isArray } from './util'
import { assert, warn } from './debug'
import apiCreator from './creator'
import instantiateComponent from './instantiate'

const cache = {
  instances: [],
  add(component) {
    let alreadyIn = false
    const instances = cache.instances
    const len = instances.length
    for (let i = 0; i < len; i += 1) {
      const ins = instances[i]
      if (ins === component) {
        alreadyIn = true
        break 
      }
    }
    if (!alreadyIn) {
      instances.push(component)
    }
  },
  remove(component) {
    const instances = cache.instances
    const len = instances.length
    for (let i = 0; i < len; i += 1) {
      const ins = instances[i]
      if (ins === component) {
        instances.splice(i, 1)
        return
      }
    }
  }
}

function batchDestroy(filter) {
  const hasFilter = isFunction(filter)
  const instancesCopy = cache.instances.slice()
  const instances = hasFilter ? filter(instancesCopy) : instancesCopy
  if (!isArray(instances)) {
    return
  }
  if (hasFilter) {
    instances.forEach(ins => {
      if (ins && isFunction(ins.remove)) {
        ins.remove()
        cache.remove(ins)
      }
    })
  } else {
    instances.forEach(ins => {
      if (ins && isFunction(ins.remove)) {
        ins.remove()
      }
    })
    cache.instances.length = 0
  }
}

function install(Vue, options = {}) {
  const {componentPrefix = '', apiPrefix = '$create-'} = options

  Vue.createAPI = function (Component, events, single) {
    if (isBoolean(events)) {
      single = events
      events = []
    }
    const api = apiCreator.call(this, Component, events, single, cache)
    const createName = processComponentName(Component, {
      componentPrefix,
      apiPrefix,
    })
    Vue.prototype[createName] = Component.$create = api.create
    return api
  }
}

function processComponentName(Component, options) {
  const {componentPrefix, apiPrefix} = options
  const name = Component.name
  assert(name, 'Component must have name while using create-api!')
  const prefixReg = new RegExp(`^${escapeReg(componentPrefix)}`, 'i')
  const pureName = name.replace(prefixReg, '')
  let camelizeName = `${camelize(`${apiPrefix}${pureName}`)}`
  return camelizeName
}

export default {
  install,
  batchDestroy,
  instantiateComponent,
  version: '__VERSION__'
}
