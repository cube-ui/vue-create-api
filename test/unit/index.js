import Vue from 'vue'
import CreateAPI from '../../src/index.js'
import Dialog from '../../examples/dialog/components/dialog.vue'
import App from '../../examples/dialog/components/App.vue'

Vue.config.productionTip = false

describe('create api 单元测试', function () {
  before(() => {
    Vue.use(CreateAPI, {
      componentPrefix: 'z-'
    })
  })

  describe('#Vue.use', function() {
    it('expect to create Dialog API', function () {
      expect(Vue.createAPI).to.be.a('function')
      
      Vue.createAPI(Dialog, true)

      expect(Vue.prototype.$createDialog).to.be.a('function')
      expect(Dialog.$create).to.be.a('function')
    })
  })

  describe('#CreateAPI in pure JS', function () {
    it('expect to render correct content', function () {
      Vue.createAPI(Dialog, true)

      const dialog = Dialog.$create({
        $props: {
          title: 'Hello',
          content: 'I am from pure JS'
        }
      })

      dialog.show()
      dialog.hide()
  
      let content = document.querySelector('.dialog .content')
      expect(content.textContent).to.equal('I am from pure JS')
    })

    it('expect to add beforeHooks', function () {
      const api = Vue.createAPI(Dialog, true)

      const fake = sinon.fake()

      api.before(fake)

      Dialog.$create({
        $props: {
          title: 'Hello',
          content: 'I am from pure JS'
        }
      }).show()
  
      expect(fake).to.be.called
    })

    it('expect to parse all config options', function() {
      Vue.createAPI(Dialog, ['click'], true)

      const dialog = Dialog.$create({
        $props: {
          title: 'Hello',
          content: 'I am from pure JS'
        },
        onClick: () => {},
        $events: {
          change: () => {},
          test: 'test'
        },
        $class: {
          'my-class': true
        }
      }).show()

      expect(Object.keys(dialog.$listeners)).to.include('click')
      expect(Object.keys(dialog.$listeners)).to.include('change')
      expect(Array.prototype.slice.apply(dialog.$el.classList)).to.include('my-class')
    })
  })

  describe('#createAPI in Vue instance', function() {
    it('expect to update when $props in ownInstance change', function() {
      Vue.createAPI(Dialog, true)

      const instance = new Vue({
        render: h => h(App),
        components: { App }
      }).$mount()

      document.body.appendChild(instance.$el)

      instance.$el.querySelectorAll('button')[0].click()

      setTimeout(() => {
        let text = document.querySelector('.dialog .content').textContent
        expect(text).to.equal('I am from App')

        instance.$children[0].change()

        text = document.querySelector('.dialog .content').textContent
        expect(text).to.equal('I am from App and content changed!')
      }, 0)
    })

    it('expect to remove dom before destory', function() {
      Vue.createAPI(Dialog, true)

      const instance = new Vue({
        render: h => h(App),
        components: { App }
      }).$mount()

      document.body.appendChild(instance.$el)

      instance.$el.querySelectorAll('button')[0].click()

      setTimeout(() => {
        expect(document.querySelector('.dialog .content').textContent).to.equal('I am from App')

        instance.$destroy()

        expect(document.querySelector('.dialog')).to.be.undefined
      }, 0)
    })
  })
})