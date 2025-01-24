import { isFunction, isArray } from './util'

const instances = []

export function add(component) {
  let alreadyIn = false
  for (let i = 0; i < instances.length; i += 1) {
    const ins = instances[i]
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
  for (let i = 0; i < instances.length; i += 1) {
    const ins = instances[i]
    if (ins === component) {
      instances.splice(i, 1)
      return
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
  if (hasFilter) {
    _instances.forEach(ins => {
      if (ins && isFunction(ins.remove)) {
        ins.remove()
        remove(ins)
      }
    })
  } else {
    _instances.forEach(ins => {
      if (ins && isFunction(ins.remove)) {
        ins.remove()
      }
    })
    instances.length = 0
  }
}
