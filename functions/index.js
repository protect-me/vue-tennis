const functions = require('firebase-functions')
var admin = require('firebase-admin')
var serviceAccount = require('./vue-tennis-key.json')
require('dotenv').config()

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: functions.config().admin.db_url, //'https://vue-tennis-default-rtdb.firebaseio.com'
  databaseURL: 'https://vue-tennis-default-rtdb.firebaseio.com',
})

// Kakao OAuth
const request = require('request-promise')

/**
 * requestMe - Returns user profile from Kakao API
 *
 * @param  {String} kakaoAccessToken Access token retrieved by Kakao Login API
 * @return {Promiise<Response>}      User profile response in a promise
 */
const kakaoRequestMeUrl =
  'https://kapi.kakao.com/v2/user/me?secure_resource=true'
function requestMe(kakaoAccessToken) {
  console.log('Requesting user profile from Kakao API server.')
  return request({
    method: 'GET',
    headers: { Authorization: 'Bearer ' + kakaoAccessToken },
    url: kakaoRequestMeUrl,
  })
}

const kakaoRequestTokenUrl = 'https://kauth.kakao.com/oauth/token'
function requestAccessToken(kakaoAuthCode) {
  console.log('Requesting user access token from Kakao API server.')
  // console.log('Kakao Client id : ', process.env.KAKAO_APP_KEY_REST)

  return request({
    method: 'POST',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    url: kakaoRequestTokenUrl,
    form: {
      grant_type: 'authorization_code',
      client_id: process.env.VUE_APP_KAKAO_REST_API_KEY,
      redirect_uri: process.env.VUE_APP_KAKAO_APP_REDIRECT_URI,
      code: kakaoAuthCode,
      // client_secret: ''
    },
  })
}

/**
 * updateOrCreateUser - Update Firebase user with the give email, create if
 * none exists.
 *
 * @param  {String} userId        user id per app
 * @param  {String} email         user's email address
 * @param  {String} displayName   user
 * @param  {String} photoURL      profile photo url
 * @return {Prommise<UserRecord>} Firebase user record in a promise
 */
function updateOrCreateUser(userId, email, displayName, photoURL) {
  console.log('updating or creating a firebase user')
  const updateParams = {
    provider: 'KAKAO',
    displayName: displayName,
  }
  if (displayName) {
    updateParams['displayName'] = displayName
  } else {
    updateParams['displayName'] = email
  }
  if (photoURL) {
    updateParams['photoURL'] = photoURL
  }
  console.log(updateParams)

  // 사용자 정보 갱신
  return admin
    .auth()
    .updateUser(userId, updateParams)
    .catch((error) => {
      if (error.code === 'auth/user-not-found') {
        updateParams['uid'] = userId
        if (email) {
          updateParams['email'] = email
        }

        // 신규 사용자 등록
        return admin
          .auth()
          .createUser(updateParams)
          .catch((err) => {
            // 동일한 메일주소로 이미 가입되어 있는 경우에 사용자 검색하여 반환
            if (err.code === 'auth/email-already-exists') {
              console.log(err)
              // console.log('auth/email-already-exists --------------- ', email);
              return admin.auth().getUserByEmail(email)
            } else {
              throw err
            }
          })
      }
      throw error
    })
}

/**
 * createFirebaseToken - returns Firebase token using Firebase Admin SDK
 *
 * @param  {String} kakaoAccessToken access token from Kakao Login API
 * @return {Promise<String>}                  Firebase token in a promise
 */
function createFirebaseToken(kakaoAccessToken) {
  return requestMe(kakaoAccessToken)
    .then((response) => {
      console.log('RequestMe : ', response)

      const body = JSON.parse(response)
      console.log(body)

      const userId = `kakao:${body.id}`
      if (!userId) {
        return res
          .status(404)
          .send({ message: 'There was no user with the given access token.' })
      }
      let nickname = null
      let profileImage = null
      if (body.properties) {
        nickname = body.properties.nickname
        profileImage = body.properties.profile_image
      }
      let accountEmail = null
      if (body.kakao_account) {
        accountEmail = body.kakao_account.email
        console.log('Email', accountEmail)
      }
      return updateOrCreateUser(userId, accountEmail, nickname, profileImage)
    })
    .then((userRecord) => {
      const userId = userRecord.uid
      console.log(`creating a custom firebase token based on uid ${userId}`)
      return admin.auth().createCustomToken(userId, { provider: 'KAKAO' })
    })
    .catch((error) => {
      console.log('Error createFirebaseToken', error)
      throw error
    })
}

// exports.kakaoCustomAuth = functions.region('asia-northeast1').https
exports.KakaoAuth = functions.https.onRequest((req, res) => {
  console.log('Kakao Request:', req)
  try {
    if (req.method === 'POST') {
      let kakaoToken = null
      let firebaseToken = null

      const authCode = req.body.data.code
      console.log('Kakao Auth Code:', authCode)
      if (!authCode) {
        return cors(req, res, () => {
          res.status(400).json({
            error: 'There is no token.',
            message: 'Access token is a required parameter.',
          })
        })
      }

      console.log(`Verifying Kakao Auth Code: ${authCode}`)
      requestAccessToken(authCode)
        .then((response) => {
          console.log(response)

          const body = JSON.parse(response)
          console.log(body)

          kakaoToken = body.access_token
          console.log('Kakao Access Token:', kakaoToken)
          // console.log(`Verifying Kakao token: ${kakaoToken}`);
          return createFirebaseToken(kakaoToken)
        })
        .then((fireToken) => {
          firebaseToken = fireToken
          console.log(`Returning firebase token to user: ${fireToken}`)

          return cors(req, res, () => {
            return res.status(200).json({
              data: {
                kakao_token: kakaoToken,
                firebase_token: fireToken,
              },
            })
          })
        })
        .catch((error) => {
          console.log(error)
          // console.log(error.body);
          return cors(req, res, () => {
            if (error.error) {
              const body = JSON.parse(error.error)
              res.status(error.statusCode).json({
                error: {
                  status: error.statusCode,
                  message: body.error,
                  details: body.error_description,
                },
              })
            } else {
              res.status(500).json({ error: 'Error' })
            }
          })
        })
    } else {
      return cors(req, res, () => {
        res.json({})
      })
    }
  } catch (error) {
    console.log(error)
  }
})

//
//
// functions : createUser, deleteUser ...
const db = admin.database()
const fdb = admin.firestore()

exports.createUser = functions.auth.user().onCreate(async (user) => {
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
    findPeopleList: [],
    applicationList: [],
    participationList: [],
    alertApplicationToggle: false,
    alertParticipationToggle: false,
    updateNickName: false,
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

// user => new collection => id: new Date toString / scheduleId:xxx, status: n
// [alertList status]
// 1: 신규 게스트 참여 요청
// 2: 참가자 참여 취소
// 3: 게스트 영입
// 4: 게스트 방출

exports.createApplicants = functions.firestore
  .document('findPeople/{scheduleId}/applicants/{applicantsId}')
  .onCreate(async (snap, context) => {
    try {
      const refSchedule = fdb
        .collection('findPeople')
        .doc(context.params.scheduleId)
      const schedule = await refSchedule.get()
      if (!schedule) return
      const organizer = schedule.data().organizer
      const refOrganizer = fdb.collection('users').doc(organizer)
      const refApplicant = fdb
        .collection('users')
        .doc(context.params.applicantsId)
      const batch = fdb.batch()

      // update 참여 신청자의 참여 요청 리스트
      batch.update(refApplicant, {
        applicationList: admin.firestore.FieldValue.arrayUnion(
          context.params.scheduleId,
        ),
      })
      // update 방장의 알림 ON
      batch.update(refOrganizer, {
        alertApplicationToggle: true,
      })
      // set 방장의 알림 리스트
      const createdAt = new Date()
      const id = createdAt.getTime().toString()
      batch.set(
        refOrganizer.collection('FindPeopleAlert').doc(id),
        {
          scheduleId: context.params.scheduleId,
          applicantsId: context.params.applicantsId,
          createdAt: createdAt,
          alertStatus: 1,
        }, // 신규 게스트 참여 요청 알림
      )

      await batch.commit()
    } catch (err) {
      console.log(err)
    }
  })

exports.deleteApplicants = functions.firestore
  .document('findPeople/{scheduleId}/applicants/{applicantsId}')
  .onDelete(async (snap, context) => {
    try {
      const refSchedule = fdb
        .collection('findPeople')
        .doc(context.params.scheduleId)
      const schedule = await refSchedule.get()
      if (!schedule) return
      const organizer = schedule.data().organizer
      const refApplicant = fdb
        .collection('users')
        .doc(context.params.applicantsId)
      const refOrganizer = fdb.collection('users').doc(organizer)

      const batch = fdb.batch()
      // update 참여 신청자의 참여 요청 리스트
      batch.update(refApplicant, {
        applicationList: admin.firestore.FieldValue.arrayRemove(
          context.params.applicantsId,
        ),
      })
      // update 방장의 알림 On
      batch.update(refOrganizer, {
        alertApplicationToggle: true,
      })
      // set 방장의 알림 리스트
      const createdAt = new Date()
      const id = createdAt.getTime().toString()
      batch.set(refOrganizer.collection('FindPeopleAlert').doc(id), {
        scheduleId: context.params.scheduleId,
        applicantsId: context.params.applicantsId,
        createdAt: createdAt,
        alertStatus: 2,
      })
      await batch.commit()
    } catch (err) {
      console.log(err)
    }
  })

exports.updateParticipants = functions.firestore
  .document('findPeople/{scheduleId}')
  .onUpdate(async (change, context) => {
    try {
      const nv = change.after.data()
      const nvLen = nv.participants.length
      const ov = change.before.data()
      const ovLen = ov.participants.length
      let recruit = null
      if (nvLen === ovLen) return
      else if (nvLen > ovLen) recruit = true
      else if (nvLen < ovLen) recruit = false
      let guest = null
      let alertStatus = 0

      if (recruit) {
        guest = nv.participants.filter((x) => !ov.participants.includes(x))[0] // 영입
        alertStatus = 3
      } else {
        guest = ov.participants.filter((x) => !nv.participants.includes(x))[0] // 방출
        alertStatus = 4
      }
      const refApplicant = fdb.collection('users').doc(guest)
      const batch = fdb.batch()
      // update 참가 게스트의 알림 ON
      batch.update(refApplicant, {
        alertParticipationToggle: true,
      })
      // update 참가 요청자의 참가 리스트(추가/제거)
      if (recruit) {
        batch.update(refApplicant, {
          participationList: admin.firestore.FieldValue.arrayUnion(
            context.params.scheduleId,
          ),
        })
      } else {
        batch.update(refApplicant, {
          participationList: admin.firestore.FieldValue.arrayRemove(
            context.params.scheduleId,
          ),
        })
      }
      const createdAt = new Date()
      const id = createdAt.getTime().toString()
      batch.set(refApplicant.collection('FindCourtAlert').doc(id), {
        scheduleId: context.params.scheduleId,
        applicantsId: guest,
        createdAt: createdAt,
        alertStatus: alertStatus,
      })
      await batch.commit()
    } catch (err) {
      console.log(err)
    }
  })

// 모집(1) / 마감(2) / 완료(3) / 기간만료(-)
exports.scheduledFunction = functions.pubsub
  .schedule('every 10 minutes')
  .onRun(async (context) => {
    function leftPad(value) {
      return value >= 10 ? value : `0${value}`
    }
    const curr = new Date()
    const utc = curr.getTime() + curr.getTimezoneOffset() * 60 * 1000
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000
    const now = new Date(utc + KR_TIME_DIFF)
    const dateOfToday = `${now.getFullYear()}-${leftPad(
      now.getMonth() + 1,
    )}-${leftPad(now.getDate())}`
    const currentTime = `${leftPad(now.getHours())}:${leftPad(
      now.getMinutes(),
    )}`
    try {
      const snapshot = await fdb.collection('findPeople').get()
      // exceptStatusPast
      const schedules = snapshot.docs
        .filter((value) => {
          return value.data().status !== 4
        })
        .map((value) => {
          const item = value.data()
          return {
            scheduleId: value.id,
            date: item.date,
            startTime: item.startTime,
            endTime: item.endTime,
            status: item.status,
          }
        })
      const updateStatus3to4 = []
      const updateStatusNto3 = []
      const length = schedules.length

      for (let i = 0; i < length; i++) {
        const schedule = schedules[i]
        const scheduleDateFormat = new Date(schedules[i].date)
        const elapsedDate = (now - scheduleDateFormat) / 86400000 // / 1000 / 60 / 60 / 24
        if (elapsedDate > 30 && schedule.status === 3) {
          // 30일 경과
          updateStatus3to4.push(schedule.scheduleId)
        } else if (
          (schedule.date < dateOfToday ||
            (schedule.date === dateOfToday &&
              schedule.endTime <= currentTime)) &&
          (schedule.status === 1 || schedule.status === 2)
        ) {
          // 날짜가 지났거나 || 같은 날이어도 종료시간이 지난 모집
          updateStatusNto3.push(schedule.scheduleId)
        }
      }
      const updateStatus3to4Length = updateStatus3to4.length
      for (let i = 0; i < updateStatus3to4Length; i++) {
        await fdb
          .collection('findPeople')
          .doc(updateStatus3to4[i])
          .update({ status: 4 })
      }
      const updateStatusNto3Length = updateStatusNto3.length
      for (let i = 0; i < updateStatusNto3Length; i++) {
        await fdb
          .collection('findPeople')
          .doc(updateStatusNto3[i])
          .update({ status: 3 })
      }
    } catch (err) {
      console.log(err)
    }
  })
