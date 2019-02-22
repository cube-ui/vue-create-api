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

export interface CreateAPI {
  install: PluginFunction<ApiOption>
  instantiateComponent: instantiateComponent
  version: string
}

declare const CreateAPI: CreateAPI
export default CreateAPI

// todo 扩展Component.$create方法