import Vue from 'vue'
import VueRouter from 'vue-router'
import demo1 from '../views/demo1.vue'
import demo2_1 from '../views/demo2-1.vue' // eslint-disable-line camelcase

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/demo2-1' },
  {
    path: '/demo1',
    name: 'demo1',
    component: demo1
  },
  {
    path: '/demo2-1',
    name: 'demo2_1',
    component: demo2_1
  }
]

const router = new VueRouter({
  routes
})

export default router
