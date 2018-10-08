import Vue from 'vue'
import CreateAPI from '../src/index.js'
import Dialog from '../examples/dialog/components/dialog.vue'

Vue.config.productionTip = false

describe('create api 单元测试', function () {
  Vue.use(CreateAPI, {
    componentPrefix: 'z-'
  })
  describe('#Vue.use', function() {
    it('expect create Dialog API', function () {
      expect(Vue.createAPI).to.be.a('function')
      
      Vue.createAPI(Dialog, true)

      expect(Vue.prototype.$createDialog).to.be.a('function')
      expect(Dialog.$create).to.be.a('function')
    })
  })
  describe('#CreateAPI', function () {
    Vue.createAPI(Dialog, true)
    
    Vue.config.debug = true

    it('expect render correct content', function () {
      Dialog.$create({
        $props: {
          title: 'Hello',
          content: 'I am from pure JS'
        }
      }).show()
  
      let content = document.querySelector('.dialog .content')
      expect(content.textContent).to.equal('I am from pure JS')
    })
  })
})