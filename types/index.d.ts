import Vue, { Component, PluginFunction, ComponentOptions, VNode, CreateElement } from 'vue'

declare module 'vue/types/vue' {
  export interface VueConstructor {
    createAPI: (Component: Component, events?: string[], single?: boolean) => Api
  }
}

export interface ApiOption {
  componentPrefix?: string
  apiPrefix?: string
}

export interface renderFunction {
  (createElement: CreateElement): VNode
}

export interface createFunction<V extends Vue> {
  (options: object, renderFn: renderFunction, single?: boolean):V
  (options: object, renderFn?: renderFunction):V
  (options: object, single?: renderFunction):V
}

export interface Api {
  before: (config: object,renderFn: renderFunction, single: boolean) => void,
  create: createFunction<Vue>
}

export interface instantiateComponent {
  (Vue: Vue, Component: Component, data: object, renderFn: renderFunction, options: ComponentOptions<Vue>): Component
}

export interface PluginFn {
  (ctx: Ctx, ...args: any): void
}

export interface PluginObject {
  install: PluginFn
}

export interface Event {
  InstanceDestroy: 'instance:destroy'
}

export interface Ctx {
  plugins: (PluginFn | PluginObject)[]
  Event: Event
  events: Record<string, Function>
  on(name: string, handler: Function): void
  once(name: string, handler: Function): void
  emit(name: string, ...args: any): void
  off(name: string, handler: Function): void
}

export interface CreateAPI {
  use(plugin: (PluginFn | PluginObject), ...args: [Ctx, ...any] | []): Ctx
  install: PluginFunction<ApiOption>
  instantiateComponent: instantiateComponent
  version: string
}

declare const CreateAPI: CreateAPI
export default CreateAPI

// todo 扩展Component.$create方法