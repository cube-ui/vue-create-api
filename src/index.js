import { camelize, escapeReg, isBoolean } from './util'
import { assert, warn } from './debug'
import apiCreator from './creator'
import instantiateComponent from './instantiate'
import { batchDestroy } from './cache'

function install(Vue, options = {}) {
  const {componentPrefix = '', apiPrefix = '$create-'} = options

  Vue.createAPI = function (Component, events, single) {
    if (isBoolean(events)) {
      single = events
      events = []
    }
    const api = apiCreator.call(this, Component, events, single)
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
