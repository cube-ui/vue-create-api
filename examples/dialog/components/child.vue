<template>
  <div>
    <h1>I am child</h1>
    <button @click="show">Show Dialog in child</button>
    <button @click="showPure">Show pure JS Dialog in child</button>
  </div>
</template>

<script>
  import Dialog from './dialog.vue'

  export default {
    name: 'child',
    methods: {
      show() {
        this.dialog = this.dialog || this.$createDialog({
          $props: {
            title: 'Hi',
            content: 'I am from child'
          }
        })
        this.dialog.show()
      },
      showPure() {
        Dialog.$create({
          $props: {
            title: 'Hello',
            content: 'I am from pure JS in Child'
          }
        }).show()
      }
    }
  }
</script>

<style>

</style>
