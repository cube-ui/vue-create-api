import Vue from 'vue'
import CreateAPI from '../../src/index.js'
import Dialog from './components/dialog.vue'
import App from './components/app.vue'

Vue.config.productionTip = false

describe('create api 单元测试', function () {
  before(() => {
    Vue.use(CreateAPI, {
      componentPrefix: 'z-'
    })
  })

  describe('#Vue.use', function() {
    it('expect to add createDialog API', function () {
      expect(Vue.createAPI).to.be.a('function')
      
      Vue.createAPI(Dialog, true)

      expect(Vue.prototype.$createDialog).to.be.a('function')
      expect(Dialog.$create).to.be.a('function')
    })
  })

  describe('#CreateAPI in pure JS', function () {
    let dialog
    let api
    before(() => {
      api = Vue.createAPI(Dialog, ['click'], true)
    })
    after(() => {
      dialog.$parent.destroy()
    })

    // 测试正确渲染内容
    it('expect to render correct content', function () {
      dialog = Dialog.$create({
        title: 'Hello',
        content: 'I am from pure JS1'
      })

      dialog.show()
      dialog.hide()

      let content = document.querySelector('.dialog .content')
      expect(content.textContent).to.equal('I am from pure JS1')
    })

    // 测试 beforeHooks 能够正常执行
    it('expect to execuate beforeHooks', function () {
      const fake = sinon.fake()

      api.before(fake)

      dialog = Dialog.$create()
  
      expect(fake).to.be.called
    })

    // 测试配置项支持 $event
    it('expect config options to support $props/$event', function(done) {
      dialog = Dialog.$create({
        $props: {
          title: 'Hello',
          content: 'I am from pure JS1'
        },
        $events: {
          change: () => {}
        }
      })

      dialog.$nextTick(() => {
        expect(Object.keys(dialog.$listeners)).to.include('change')
        done()
      })
    })

    // 测试配置项支持 on* 形式指定 事件回调
    it(`expect config options to support 'on'`, function(done) {
      dialog = Dialog.$create({
        title: 'Hello',
        content: 'I am from pure JS2',
        onClick: () => {},
      })

      dialog.$nextTick(() => {
        expect(Object.keys(dialog.$listeners)).to.include('click')

        let content = document.querySelector('.dialog .content')
        expect(content.textContent).to.equal('I am from pure JS2')
        done()
      })
    })

    // 测试配置项支持任何 Vue 配置
    it(`expect config options to support $xx`, function(done) {
      dialog = Dialog.$create({
        $class: ['my-class'],
      })

      dialog.$nextTick(() => {
        const classList = Array.prototype.slice.apply(dialog.$el.classList)
        expect(classList).to.include('my-class')
        done()
      })
    })
  })

  describe('#createAPI in Vue instance', function() {
    let app
    before(() => {
      Vue.createAPI(Dialog, true)

      const instance = new Vue({
        render: h => h(App),
        components: { App }
      }).$mount()

      document.body.appendChild(instance.$el)

      app = instance.$children[0]
    })

    it('expect to update when $props in ownInstance change', function(done) {
      app.showDialog()

      app.$nextTick(() => {
        let text = document.querySelector('.dialog .content').textContent
        expect(text).to.equal('I am from App')

        app.changeContent()
        app.$nextTick(() => {

          text = document.querySelector('.dialog .content').textContent
          expect(text).to.equal('I am from App and content changed!')

          done()
        })
      })
    })

    it('expect to remove dom before destory', function(done) {
      app.showDialog()

      app.$nextTick(() => {
        app.$parent.$destroy()

        expect(document.querySelector('.dialog')).to.be.null

        done()
      })
    })
  })

  describe('#Single mode', function() {
    let app
    before(() => {
      const instance = new Vue({
        render: h => h(App),
        components: { App }
      }).$mount()

      document.body.appendChild(instance.$el)

      app = instance.$children[0]
    })

    // 测试单例模式 返回同一个实例
    it('expect to return the same components in single mode', function() {
      Vue.createAPI(Dialog, true)
      const dialog1 = app.showDialog()
      const dialog2 = app.showAnotherDialog()
      expect(dialog1 === dialog2).to.be.true

      dialog1.$parent.destroy()
    })
    // 测试非单例模式 返回多个实例
    it('expect to return different components when not in single mode', function(done) {
      Vue.createAPI(Dialog, false)
      const dialog1 = app.showDialog()
      const dialog2 = app.showAnotherDialog()
      expect(dialog1 === dialog2).to.be.false

      Vue.nextTick(() => {
        const dialogs = document.querySelectorAll('.dialog')
        const length = Array.prototype.slice.apply(dialogs).length
        expect(length).to.equal(2)

        done()
      })
    })
  })

  describe('#Batch destroy', function() {
    before(() => {
      Vue.createAPI(Dialog, ['click'], false)
    })

    // 测试batchDestroy 销毁非this调用组件
    it('expect to clear all instances in batch destory', function(done) {
      const cls = 'dialog-batch-destroy'
      const dialog1 = Dialog.$create({
        title: 'Hello',
        content: 'I am from pure JS1',
        $class: cls
      })
      const dialog2 = Dialog.$create({
        title: 'Hello',
        content: 'I am from pure JS2',
        $class: cls
      })

      dialog1.show()
      dialog2.show()

      Vue.nextTick(() => {
        const dialogs = document.querySelectorAll(`.${cls}`)
        const length = Array.prototype.slice.apply(dialogs).length
        expect(length).to.equal(2)

        CreateAPI.batchDestroy()

        {
          const dialogs = document.querySelectorAll(cls)
          const length = Array.prototype.slice.apply(dialogs).length
          expect(length).to.equal(0)

          done()
        }
      })
    })
  })
})