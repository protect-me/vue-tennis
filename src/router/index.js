import Vue from 'vue'
import VueRouter from 'vue-router'
import Map from '../views/Map.vue'
import store from '@/store'

Vue.use(VueRouter)

const onlyAuthUser = (to, from, next) => {
  if (store.state.fireUser) {
    next()
  } else {
    alert('로그인을 해주세요 🎾')
    router.push('Mypage')
  }
}

const onlyAuthUserForMypage = (to, from, next) => {
  if (store.state.fireUser) {
    next()
  } else {
    alert('로그인을 해주세요 🎾')
  }
}

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
    beforeEnter: onlyAuthUser,
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
    beforeEnter: onlyAuthUser,
    component: () => import('../views/FindPeople/FindPeopleRegist.vue'),
  },
  {
    path: '/findcourt',
    name: 'FindCourt',
    component: () => import('../views/FindCourt.vue'),
  },
  {
    path: '/mypage',
    name: 'Mypage',
    component: () => import('../views/Mypage/Mypage.vue'),
  },
  {
    path: '/edituserinfo',
    name: 'EditUserInfo',
    beforeEnter: onlyAuthUserForMypage,
    component: () => import('../views/Mypage/EditUserInfo.vue'),
  },
  {
    path: '/findpeoplerecord',
    name: 'FindPeopleRecord',
    component: () => import('../views/Mypage/FindPeopleRecord.vue'),
  },
  {
    path: '/findcourtrecord',
    name: 'FindCourtRecord',
    component: () => import('../views/Mypage/FindCourtRecord.vue'),
  },
  {
    path: '/operationpolicy',
    name: 'OperationPolicy',
    component: () => import('../views/Mypage/OperationPolicy.vue'),
  },
  {
    path: '*',
    name: 'Error',
    component: () => import('../views/Error.vue'),
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
