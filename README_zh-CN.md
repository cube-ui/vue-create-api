# vue-create-api

一个能够让 Vue 组件通过 API 方式调用的插件。

## 安装

通过 npm

```
$ npm install vue-create-api
```

通过 cdn 

```
<script src="https://unpkg.com/vue-create-api/dist/vue-create-api.min.js"></script>
```

## 使用

``` js
import CreateAPI from 'create-api'

Vue.use(CreateAPI)

// 也可以传递一个配置项

Vue.use(CreateAPI, {
  componentPrefix: 'cube-'
  apiPrefix: '$create-'
})

// 之后会在 Vue 构造器下添加一个 createAPI 方法

import Dialog from './components/dialog.vue'

// 调用 createAPI 生成对应 API，并挂载到 Vue.prototype 和 Dialog 对象上

Vue.createAPI(Dialog, true)

// 之后便可以在普通的 js 文件中使用，但是 $props 不具有响应式

Dialog.$create({
  $props: {
    title: 'Hello',
    content: 'I am from pure JS'
  }
}).show()

// 在 vue 组件中可以通过 this 调用

this.$createDialog({
  $props: {
    title: 'Hello',
    content: 'I am from a vue component'
  },
}).show()
```

## 构造器配置项

| 键名 | 描述 | 默认值 |
| :--- | --- | --- |
| `componentPrefix` | 组件名前缀，最终生成的 API 会忽略该前缀 | - |
| `apiPrefix` | 为生成的 API 添加统一前缀 | `$create` |

## 方法

### Vue.createAPI(Component, [single])

- 参数:

  - `{Function | Object} Component` Vue 组件必须要有组件名 `name`
  - `{Boolean} [single]` 是否采用单例模式实例化组件

- 使用:

  - 调用该方法会在 Vue.prototype 上添加名为 `$create{camelize(Component.name)}` 的方法, 之后在其他 vue 组件中可以通过 `const instance = this.$createAaBb(config, [renderFn, single])` 实例化该组件。组件实例化后对应的 DOM 元素会添加到 `body` 中。

  - `const instance = this.$createAaBb(config, renderFn, single)`

    **参数：**

    | 名称 | 描述 | 类型 | 可选值 | 默认值 |
    | - | - | - | - | - |
    | config | 配置参数 | Object | {} | - |
    | renderFn | 可选参数，用于生成子 VNode 节点，通常通常用于处理插槽 | Function | - | function (createElement) {...} |
    | single | 可选参数, 决定示例化是否采用单例模式。在没有传递 renderFn 时，可以直接作为第二个参数传入。 | Boolean | true/false | 调用 createAPI 时传入的 single 值 |

    **配置项 `config`:**

    你可以在 `config` 中配置 `$props` 和 `$events`, `$props` 中的属性会被 watch，从而支持响应式更新.

    | 属性 | 描述 | 类型 | 可选值 | 默认值 |
    | - | - | - | - | - |
    | $props | 组件的 Prop | Object | - | {<br> title: 'title',<br> content: 'my content',<br> open: false<br>} |
    | $events | 组件的事件回调 | Object | - | {<br> click: 'clickHandler',<br> select: this.selectHandler<br>} |

    `$props` 示例, `{ [key]: [propKey] }`:

    ```js
    {
      title: 'title',
      content: 'my content',
      open: false
    }
    ```

    `title`, `content` 和 `open` 是传递给组件的 Prop 键名, 而 Prop 对应的值采用下面的步骤得到:

    1. 如果 `propKey` 不是一个字符串, 则直接取 `propKey` 作为该 Prop 值。
    1. 如果 `propKey` 是一个字符串，但该字符串并没有作为属性名存在于调用 `$createAaBb()` 的组件中，则直接取 `propKey` 这个字符串作为该 Prop 值。
    1. 如果 `propKey` 是一个字符串，且作为属性名存在于调用 `$createAaBb()` 的组件中, 则会取该实例对应的属性值作为该 Prop 值。 同时会 watch 该属性，做到响应式更新。

    `$events` 示例, `{ [eventName]: [eventValue] }`:

    ```js
    {
      click: 'clickHandler',
      select: this.selectHandler
    }
    ```

    `click` 和 `select` 是事件名, 同时对应的事件回调会通过下面的步骤确定:

    1. 如果 `eventValue` 不是一个字符串, 那么直接取 `eventValue` 作为事件回调.
    1. 如果 `eventValue` 是一个字符串, 那么会取调用 `$createAaBb` 的组件中以 `eventValue` 作为属性名的值，当做事件回调.

    同时，config 中可以设置 Vue 支持的[所有的配置值](https://cn.vuejs.org/v2/guide/render-function.html#%E6%B7%B1%E5%85%A5-data-%E5%AF%B9%E8%B1%A1)，但是必须要加 `$`。比如:

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

    **返回值 `instance`:**

    `instance` 是一个实例化的 Vue 组件。
    > 实例上会包含一个 `remove` 方法。你可以调用 `remove` 方法去销毁该组件，同时原本添加到 `body` 下的 DOM 元素也会删除。

    如果调用 `$createAaBb` 的组件销毁了，那么该组件也会自动销毁。

- 示例:

  首先我们先创建一个 Hello.vue 组件：

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

  然后我们通过调用 `createAPI`，得到一个可以命令式创建该组件的 API 。

  ```js
    import Vue from 'vue'
    import Hello from './Hello.vue'
    import CreateAPI from 'create-api'
    Vue.use(CreateAPI)

    // 得到 this.$createHello API，它会添加到 Vue 原型上
    Vue.createAPI(Vue, Hello, true)

    // 实例化 Vue
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

  在该示例中，我们创建了一个 `Hello` 组件，利用 `createAPI()` 你可以在其他组件中调用 API 去创建该组件。可以看到，在 `showHello()` 方法中，通过 `this.$createHello(config, renderFn)` 可以实例化 `Hello` 组件。

### 如何在普通 js 文件中或者全局调用

由于使用 `createAPI()` 生成实例化组件的 API 时，会将该 API 添加到 Vue 原型上，因此在 Vue 实例中，可以直接通过 `this.$createHello(config, renderFn)` 创建组件。而如果在普通 JS 中，可以通过组件自身的 `$create` 来进行实例化了，因为我们同样将该 API 添加到了组件自身上，比如：

```js
import Vue from 'vue'
import Hello from './Hello.vue'
import CreateAPI from 'create-api'
Vue.use(CreateAPI)

// 得到 Vue.prototype.$createHello 和 Hello.create API
Vue.createAPI(Hello, true)

Hello.$create(config, renderFn)
```

注意：当我们在普通 JS 文件中使用时，无法让 Prop 响应式更新。