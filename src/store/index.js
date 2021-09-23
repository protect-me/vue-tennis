import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    fireUser: null,
    user: null,
  },
  mutations: {
    // commit
    setFireUser(state, payload) {
      state.fireUser = payload
    },
    setUser(state, payload) {
      state.user = payload
    },
  },
  actions: {
    // dispatch
    setFireUser({ commit }, payload) {
      commit('setFireUser', payload)
    },
    setUser({ commit }, payload) {
      commit('setUser', payload)
    },
  },
  modules: {},
})
