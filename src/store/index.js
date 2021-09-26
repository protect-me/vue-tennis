import Vue from 'vue'
import Vuex from 'vuex'
import firebase from '../plugins/firebase.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    unsubscribeFindPeople: null,
    schedules: [],
    loading: false,
    fireUser: null,
    user: null,
  },
  getters: {
    unsubscribeFindPeople(state) {
      return state.unsubscribeFindPeople
    },
  },
  mutations: {
    // commit
    updateState(state, payload) {
      Object.keys(payload).forEach((key) => {
        state[key] = payload[key]
      })
    },
    resetSchedules(state) {
      state.resetSchedules = []
      state.loading = false
    },
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
    async setSchedules({ state, commit }) {
      if (state.loading) return // Loading 중일 경우 return

      try {
        commit('updateState', { loading: true }) // Loading On
        let schedules = []

        const unsubscribeFindPeople = await firebase
          .firestore()
          .collection('findPeople')
          .orderBy('date')
          .orderBy('startTime')
          .onSnapshot((snapshot) => {
            if (snapshot.empty) {
              return
            }
            schedules = snapshot.docs.map((value) => {
              const id = value.id
              const item = value.data()
              return {
                findPeopleId: id,
                organizer: item.organizer,
                organizerNickName: item.organizerNickName,
                name: item.name,
                courtType: item.courtType,
                date: item.date,
                startTime: item.startTime,
                endTime: item.endTime,
                ntrp: item.ntrp,
                vacant: item.vacant,
                total: item.total,
                contact: item.contact,
                cost: item.cost,
                memo: item.memo,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                status: item.status,
              }
            })
            commit('updateState', {
              unsubscribeFindPeople,
              schedules,
              loading: false,
            })
          })
      } catch (err) {
        alert('데이터를 가져오는데 실패했습니다', err)
        console.log(err)
        commit('updateState', { loading: false })
      }
    },
  },
  modules: {},
})
