import Vue from 'vue'
import store from '../store'
import firebase from 'firebase/app'
import firebaseConfig from '../../firebaseConfig'
import firebaseDefault from 'firebase'

import 'firebase/auth'
import 'firebase/firebase-database'
import 'firebase/firebase-firestore'
import 'firebase/firebase-storage'

firebaseDefault.initializeApp(firebaseConfig)

if (window.location.hostname === 'localhost') {
  firebaseDefault.firestore().settings({ host: 'localhost:8080', ssl: false })
  firebaseDefault.functions().useFunctionsEmulator('http://localhost:5001')
}

let unsubscribe = null

Vue.prototype.$firebase = firebase

// Set Firestore User
const subscribe = (fireUser) => {
  const ref = firebase.firestore().collection('users').doc(fireUser.uid)
  unsubscribe = ref.onSnapshot((doc) => {
    if (doc.exists) store.dispatch('setUser', doc.data())
  }, console.error)
}

// Set Realtime Database User
firebase.auth().onAuthStateChanged((fireUser) => {
  store.dispatch('setFireUser', fireUser)
  if (!fireUser) {
    store.dispatch('setUser', null)
    if (unsubscribe) unsubscribe()
    return
  }
  subscribe(fireUser)
})

// Auth 변경 감지 => Set Realtime Database User => Set Firestore User

export default firebase
