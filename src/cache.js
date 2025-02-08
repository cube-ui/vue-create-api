import { isFunction, isArray } from './util'

const instances = []

export function add(component) {
  let ins
  let alreadyIn = false
  const len = instances.length
  for (let i = 0; i < len; i += 1) {
    ins = instances[i]
    if (ins === component) {
      alreadyIn = true
      break 
    }
  }
  if (!alreadyIn) {
    instances.push(component)
  }
}

export function remove(component) {
  let ins
  const len = instances.length
  for (let i = 0; i < len; i += 1) {
    ins = instances[i]
    if (ins === component) {
      instances.splice(i, 1)
    }
  }
}

export function batchDestroy(filter) {
  const hasFilter = isFunction(filter)
  const instancesCopy = instances.slice()
  const _instances = hasFilter ? filter(instancesCopy) : instancesCopy
  if (!isArray(_instances)) {
    return
  }
  _instances.forEach(ins => {
    if (ins && isFunction(ins.remove)) {
      ins.remove()
    }
  })
}
