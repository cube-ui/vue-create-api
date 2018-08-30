export function warn(msg) {
  console.error(`[create-api warn]: ${msg}`)
}

export function assert(condition, msg) {
  if (!condition) {
    throw new Error(`[create-api error]: ${msg}`)
  }
}

export function tip(msg) {
  console.warn(`[create-api tip]: ${msg}`)
}
