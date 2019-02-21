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

export interface Api {
  before: (config: object,renderFn: renderFunction, single: boolean) => void,
  create: (config: object,renderFn: renderFunction, single: boolean) => Component
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