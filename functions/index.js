const functions = require('firebase-functions')

var admin = require('firebase-admin')

var serviceAccount = require('./vue-tennis-key.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://vue-tennis-default-rtdb.firebaseio.com',
})

const db = admin.database()
const fdb = admin.firestore()

exports.createUser = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user
  const time = new Date()
  const userInfo = {
    email,
    displayName,
    photoURL,
    likeRequestList: [],
    createdAt: time,
    level: email == functions.config().admin.email ? 0 : 5,
  }
  await fdb.collection('users').doc(uid).set(userInfo) // set user at Firestore
  userInfo.createdAt = time.getTime()
  db.ref('users').child(uid).set(userInfo) // set user at RealTime Database
})

exports.deleteUser = functions.auth.user().onDelete(async (user) => {
  const { uid } = user
  await db.ref('users').child(uid).remove()
  await fdb.collection('users').doc(uid).delete()
})
