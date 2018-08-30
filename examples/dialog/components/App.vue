<template>
  <div id="app">
    <h1>Dialog Demo</h1>
    <button @click="show">Show Dialog</button>
    <button @click="change">Change content</button>
    <child></child>
  </div>
</template>

<script>
  import Child from './child.vue'

  export default {
    name: 'App',
    data() {
      return {
        content: 'I am from App'
      }
    },
    components: {Child},
    methods: {
      show() {
        this.dialog = this.dialog || this.$createDialog({
          $props: {
            title: 'Hello',
            content: 'content'
          }
        })
        this.dialog.show()
      },
      change() {
        this.content = 'I am from App and content changed!'
      }
    }
  }
</script>
<style>
</style>
