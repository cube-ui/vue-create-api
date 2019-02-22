# vue-create-api
A Vue plugin which make Vue component invocated by API.

[中文文档](https://github.com/cube-ui/vue-create-api/blob/master/README_zh-CN.md)

## Installing

use npm

```
$ npm install vue-create-api
```

use cdn

```
<script src="https://unpkg.com/vue-create-api/dist/vue-create-api.min.js"></script>
```

## Usage

``` js
import CreateAPI from 'vue-create-api'

Vue.use(CreateAPI)

// or with options.

Vue.use(CreateAPI, {
  componentPrefix: 'cube-'
  apiPrefix: '$create-'
})

// then the Vue constructor will have the createAPI function.

import Dialog from './components/dialog.vue'

// make Dialog component invocated by API.

Vue.createAPI(Dialog, true)

// use in general JS files.
// however, the $props can not be reactive.

Dialog.$create({
  $props: {
    title: 'Hello',
    content: 'I am from pure JS'
  }
}).show()

// use in a vue component.

this.$createDialog({
  $props: {
    title: 'Hello',
    content: 'I am from a vue component'
  },
}).show()
```

```ts
// typescript
import CreateAPI from 'vue-create-api'

Vue.use(CreateAPI)

Vue.createAPI(Dialog, events, single)

this.$createDialog({
  $props: {
    title: 'Hello',
    content: 'I am from a vue component'
  }
}).show()
```
```ts
// d.ts
import Vue, { VueConstructor } from 'vue'
import { createFunction } from 'vue-create-api';

export declare class UIComponent extends Vue {
  show ():void
  hide ():void
}

declare module 'vue/types/vue' {
  interface Vue {
    /** create Dialog instance */
    $createDialog: createFunction<UIComponent>
  }
}
```
### Tip

> using typescript, `terser-webpack-plugin`(vue-cli3.x) or `uglifyjs`(vue-cli2.x) adds `{ keep_fnames: true }`

## Constructor Options

|key|description|default|
|:---|---|---|
| `componentPrefix`|the prefix name of your component| - |
|`apiPrefix`|the api prefix|`$create`|

## Methods

### Vue.createAPI(Component, [single])

- Parameters:

  - `{Function | Object} Component` Vue component which must contains `name`
  - `{Boolean} [single]` whether singleton

- Usage:

  - This method will add a method which is named `$create{camelize(Component.name)}` to Vue's prototype, so you can instantiate the Vue component by `const instance = this.$createAaBb(config, [renderFn, single])` in other components. The instantiated component's template content will be attached to `body` element.

  - `const instance = this.$createAaBb(config, renderFn, single)`

    **Parameters：**

    | Attribute | Description | Type | Accepted Values | Default |
    | - | - | - | - | - |
    | config | Config options | Object | {} | - |
    | renderFn | Optional, used to generate the VNode child node in the slot scene in general | Function | - | function (createElement) {...} |
    | single | Optional, whether the instantiated component is a singleton or not. If two parameters are provided and the `renderFn`'s type is not function, then the `single` value is the sencond parameter's value. | Boolean | true/false | single in createAPI() |

    **Config options `config`:**

    You can set `$props` and `$events` in `config`, `$props` supported reactive properties, these props will be watched.

    | Attribute | Description | Type | Accepted Values | Default |
    | - | - | - | - | - |
    | $props | Component props | Object | - | {<br> title: 'title',<br> content: 'my content',<br> open: false<br>} |
    | $events | Component event handlers | Object | - | {<br> click: 'clickHandler',<br> select: this.selectHandler<br>} |

    `$props` example, `{ [key]: [propKey] }`:

    ```js
    {
      title: 'title',
      content: 'my content',
      open: false
    }
    ```

    `title`, `content` and `open` are keys of the component prop or data, and the prop' value will be taken by the following steps:

    1. If `propKey` is not a string value, then use `propKey` as the prop value.
    1. If `propKey` is a string value and the caller instance dont have the `propKey` property, then use `propKey` as the prop value.
    1. If `propKey` is a string value and the caller instance have the `propKey` property, then use the caller's `propKey` property value as the prop value. And the prop value will be reactive.

    `$events` example, `{ [eventName]: [eventValue] }`:

    ```js
    {
      click: 'clickHandler',
      select: this.selectHandler
    }
    ```

    `click` and `select` are event names, and the event handlers will be taken by the following steps:

    1. If `eventValue` is not a string value, then use `eventValue` as the event handler.
    1. If `eventValue` is a string value, then use the caller's `eventValue` property value as the event handler.

    You can set [all avaliable properties in Vue](https://vuejs.org/v2/guide/render-function.html#The-Data-Object-In-Depth), but you need to add prefix `$`, eg:

    ```js
    this.$createAaBb({
      $attrs: {
        id: 'id'
      },
      $class: {
        'my-class': true
      }
    })
    ```

    **The Returned value `instance`:**

    `instance` is a instantiated Vue component.
    > And the `remove` method will be **attached** to this instance.

    You can invoke the `remove` method to destroy the component and detach the component's content from `body` element.

    If the caller is destroyed and the `instance` will be automatically destroyed.

- Example:

  First we create Hello.vue component：

  ```html
  <template>
    <div @click="clickHandler">
      {{content}}
      <slot name="other"></slot>
    </div>
  </template>

  <script type="text/ecmascript-6">
    export default {
      name: 'hello',
      props: {
        content: {
          type: String,
          default: 'Hello'
        }
      },
      methods: {
        clickHandler(e) {
          this.$emit('click', e)
        }
      }
    }
  </script>
  ```

  Then we make Hello.vue as an API style component by calling the `createAPI` method.

  ```js
    import Vue from 'vue'
    import Hello from './Hello.vue'
    import CreateAPI from 'vue-create-api'
    Vue.use(CreateAPI)

    // create this.$createHello API
    Vue.createAPI(Hello, true)

    // init Vue
    new Vue({
      el: '#app',
      render: function (h) {
        return h('button', {
          on: {
            click: this.showHello
          }
        }, ['Show Hello'])
      },
      methods: {
        showHello() {
          const instance = this.$createHello({
            $props: {
              content: 'My Hello Content',
            },
            $events: {
              click() {
                console.log('Hello component clicked.')
                instance.remove()
              }
            }
          }, /* renderFn */ (createElement) => {
            return [
              createElement('p', {
                slot: 'other'
              }, 'other content')
            ]
          })
        }
      }
    })
  ```
  In this example, we create a component `Hello` which needs to be invoked in api form and we invoke it in another component.The focus is what `showHello()` does: invoking method `this.$createHello(config, renderFn)` to instantiate `Hello`.

### How to use in general JS files or use it in global

In vue component, you can call by `this.$createHello(config, renderFn)` because the `this` is just a Vue instance. But in general JS files, you need to use `Hello.$create`. As shown below:

```js
import Vue from 'vue'
import Hello from './Hello.vue'
import CreateAPI from 'vue-create-api'
Vue.use(CreateAPI)

// create this.$createHello and Hello.create API
Vue.createAPI(Hello, true)

Hello.$create(config, renderFn)
```

Notice, when we use in general JS files, we can't make props be reactive.
