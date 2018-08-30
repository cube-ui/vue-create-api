<template>
  <div v-show="visible" class="mask">
    <div class="dialog">
      <h1 class="title">{{title}}</h1>
      <div class="content">{{content}}</div>
      <div @click="hide" class="btn">confirm</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'z-dialog',
    props: {
      content: {
        type: String,
        default: 'I am content'
      },
      title: {
        type: String,
        default: 'I am title'
      }
    },
    data() {
      return {
        visible: false
      }
    },
    methods: {
      show() {
        this.visible = true
      },
      hide() {
        this.visible = false
      }
    }
  }
</script>
<style>
  .mask {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: rgba(0, 0, 0, 0.6);
  }

  .dialog {
    position: relative;
    top: 50%;
    left: 50%;
    z-index: 200;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 120px;
    text-align: center;
    padding: 20px;
    background: white;
  }

  .title {
    line-height: 20px;
    font-size: 16px;
  }

  .content {
    line-height: 18px;
    font-size: 14px;
    margin-bottom: 20px;
  }

  .btn {
    width: 100%;
    height: 40px;
    line-height: 40px;
    background: #fc8919;
    text-align: center;
    font-size: 16px;
  }
</style>
