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
  once(name, handler) {
    const wrapper = (...args) => {
      handler(...args)
      this.off(name, wrapper)
    }
    this.on(name, wrapper)
  },
  emit(name, ...args) {
    const list = this.events[name]
    if (!list) {
      return
    }
    // 从后往前遍历，避免遍历的时候删除元素，导致不正确的结果产生
    for (let i = list.length - 1; i >= 0; i --) {
      const handler = list[i]
      handler(...args)
    }
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
