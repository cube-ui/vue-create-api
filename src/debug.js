export function warn(msg) {
  console.error(`[vue-create-api warn]: ${msg}`)
}

export function assert(condition, msg) {
  if (!condition) {
    throw new Error(`[vue-create-api error]: ${msg}`)
  }
}

export function tip(msg) {
  console.warn(`[vue-create-api tip]: ${msg}`)
}
