import Vue from 'vue'
import firebase from 'firebase/app'
import firebaseConfig from '../../firebaseConfig'
import 'firebase/auth'
import 'firebase/firebase-firestore'

firebase.initializeApp(firebaseConfig)

Vue.prototype.$firebase = firebase
