import Vue from 'vue'
import VueRouter from 'vue-router'
import Map from '../views/Map.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Map',
    component: Map,
  },
  {
    path: '/courtlist',
    name: 'CourtList',
    component: () => import('../views/admin/CourtList.vue'),
  },
  {
    path: '/courtregist',
    name: 'CourtRegist',
    component: () => import('../views/admin/CourtRegist.vue'),
  },
  {
    path: '/findpeoplehome',
    name: 'FindPeopleHome',
    component: () => import('../views/FindPeople/FindPeopleHome.vue'),
  },
  {
    path: '/findpeopleregist',
    name: 'FindPeopleRegist',
    component: () => import('../views/FindPeople/FindPeopleRegist.vue'),
  },
  {
    path: '/findcourt',
    name: 'FindCourt',
    component: () => import('../views/FindCourt.vue'),
  },
  {
    path: '/court',
    name: 'Court',
    component: () => import('../views/Court.vue'),
  },
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ '../views/About.vue'),
  // },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
