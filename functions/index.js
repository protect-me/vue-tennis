const functions = require('firebase-functions')
var admin = require('firebase-admin')
var serviceAccount = require('./vue-tennis-key.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: functions.config().admin.db_url, //'https://vue-tennis-default-rtdb.firebaseio.com'
})

const db = admin.database()
const fdb = admin.firestore()

exports.createUser = functions.auth.user().onCreate(async (user) => {
  console.log('here functions')
  const { uid, email, displayName, photoURL } = user
  const time = new Date()
  const userInfo = {
    email,
    displayName,
    photoURL,
    nickName: displayName,
    sex: '',
    birth: '',
    location: '',
    ntrp: 0,
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
