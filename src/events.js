export default {
  Event: {
    InstanceDestroy: 'instance:destroy'
  },
  events: {},
  on(name, handler) {
    const list = this.events[name]
    if (!list) {
      this.events[name] = [handler]
    } else if (!list.find(f => f === handler)) {
      list.push(handler)
    }
  },
  emit(name, ...args) {
    const list = this.events[name]
    if (!list) {
      return
    }
    list.forEach(handler => {
      handler(...args)
    })
  },
  off(name, handler) {
    if (!handler) {
      delete this.events[name]
    } else {
      const list = this.events[name]
      const index = list && list.findIndex(fn => fn === handler)
      index > -1 && list.splice(index, 1)
    }
  }
}
