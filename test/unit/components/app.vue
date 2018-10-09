<template>
  <div id="app">
  </div>
</template>

<script>
  export default {
    name: 'App',
    data() {
      return {
        content: 'I am from App'
      }
    },
    methods: {
      showDialog() {
        return this.$createDialog({
          $props: {
            title: 'Hello',
            content: 'content'
          }
        }).show()
      },
      changeContent() {
        this.content = 'I am from App and content changed!'
      },
      showAnotherDialog() {
        return this.$createDialog({
          $props: {
            title: 'Hello',
            content: 'I am another dialog'
          }
        }).show()
      }
    }
  }
</script>
<style>
</style>
