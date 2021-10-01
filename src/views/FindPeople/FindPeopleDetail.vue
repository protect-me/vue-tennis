<template>
  <v-container
    class="find-people-detail-container"
    v-if="subscribedSchedule && subscribedSchedule.scheduleId"
  >
    <div class="find-people-detail-header">
      <TitleWithButton
        titleText="게스트 모집 상세"
        goBackButton
        :editButton="
          fireUser.uid === schedule.organizer && subscribedSchedule.status !== 3
        "
        :icon="titleIcon"
        @editButtonClicked="editButtonClicked"
        @goBackButtonClicked="goBackButtonClicked"
      />
      <v-divider class="my-3"></v-divider>
    </div>

    <div class="find-people-detail-content">
      <FindPeopleCard :schedule="subscribedSchedule" mode="detail" />
      <v-card v-if="subscribedSchedule.status !== 3">
        <v-card-text>
          <div v-if="subscribedSchedule.contact" class="mb-1">
            <span @click="copyContact">
              <v-icon class="mr-2 mb-1" small>mdi-cellphone-message</v-icon>
              <span>{{ subscribedSchedule.contact }}</span>
              <v-icon class="ml-2 mb-1" small color="primary">
                mdi-content-copy
              </v-icon>
            </span>
          </div>
          <div v-if="subscribedSchedule.openChatLink">
            <v-icon class="mr-2" small>mdi-forum-outline</v-icon>
            <a :href="subscribedSchedule.openChatLink" target="_blank">
              <span>{{ subscribedSchedule.openChatLink }}</span>
            </a>
          </div>
        </v-card-text>
      </v-card>

      <FindPeopleDetailPeople
        :subscribedSchedule="subscribedSchedule"
        :participants="participants"
        :applicants="applicants"
      />
    </div>

    <v-spacer></v-spacer>

    <FindPeopleDetailActionBtn
      :subscribedSchedule="subscribedSchedule"
      :applicants="applicants"
      :applicantsUserIdList="applicantsUserIdList"
    />

    <v-bottom-sheet
      v-if="editDialogToggle"
      v-model="editDialogToggle"
      fullscreen
    >
      <FindPeopleRegist
        :subscribedSchedule="subscribedSchedule"
        mode="edit"
        @closeButtonClicked="closeEditDialog"
      />
    </v-bottom-sheet>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import TitleWithButton from '../../components/TitleWithButton'
import FindPeopleCard from './FindPeopleCard'
import UserCard from '../../components/UserCard'
import FindPeopleDetailPeople from '../../components/FindPeopleDetailPeople'
import FindPeopleDetailActionBtn from '../../components/FindPeopleDetailActionBtn'
import FindPeopleRegist from './FindPeopleRegist'

export default {
  components: {
    TitleWithButton,
    FindPeopleCard,
    UserCard,
    FindPeopleDetailPeople,
    FindPeopleDetailActionBtn,
    FindPeopleRegist,
  },
  mounted() {
    this.$nextTick(function () {
      this.ref = this.$firebase
        .firestore()
        .collection('findPeople')
        .doc(this.schedule.scheduleId)
      this.subscribe()
    })
  },
  async beforeDestroy() {
    await this.$store.dispatch(
      'setSelectedTab',
      this.subscribedSchedule.status - 1,
    )
  },
  destroyed() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  },
  data() {
    return {
      unsubscribe: null,
      subscribedSchedule: {},
      titleIcon: '',
      editDialogToggle: false,
      participants: [],
      applicants: [],
      applicantsUserIdList: [],
      ghostParticipant: {
        userId: 'Ghost',
        nickName: 'Ghost',
        location: '',
        ntrp: '',
        sex: 0,
        age: 0,
      },
      organizerIndex: 0,
      ref: null,
      refUser: this.$firebase.firestore().collection('users'),
    }
  },
  computed: {
    ...mapState(['fireUser', 'user', 'schedule']),
    scheduleDate() {
      const week = ['일', '월', '화', '수', '목', '금', '토']
      const dayOfWeek = week[new Date(this.schedule.date).getDay()]
      const spread = this.schedule.date.split('-')
      return {
        year: spread[0],
        month: spread[1],
        date: spread[2],
        dayOfWeek: dayOfWeek,
      }
    },
  },
  methods: {
    closeEditDialog() {
      this.editDialogToggle = false
    },
    goBackButtonClicked() {
      this.$router.push('FindPeopleHome')
    },
    editButtonClicked() {
      if (this.subscribedSchedule.status === 3) return
      this.editDialogToggle = true
    },
    setTitleIcon() {
      // 모집(1) / 마감(2) / 완료(3) / 기간만료(-)
      switch (this.subscribedSchedule.status) {
        case 1:
          this.titleIcon = 'mdi-door-open'
          break
        case 2:
          this.titleIcon = 'mdi-door-closed'
          break
        default:
          this.titleIcon = 'mdi-door-closed-lock'
          break
      }
    },
    checkStatus() {
      function leftPad(value) {
        return value >= 10 ? value : `0${value}`
      }
      const now = new Date()
      const dateOfToday = `${now.getFullYear()}-${leftPad(
        now.getMonth() + 1,
      )}-${leftPad(now.getDate())}`
      const currentTime = `${leftPad(now.getHours())}:${leftPad(
        now.getMinutes(),
      )}`
      if (
        this.subscribedSchedule.date < dateOfToday ||
        (this.subscribedSchedule.date === dateOfToday &&
          this.subscribedSchedule.endTime <= currentTime)
      ) {
        this.subscribedSchedule.status = 3
      }
      this.setTitleIcon()
    },
    subscribe() {
      if (this.unsubscribe) {
        this.unsubscribe()
      }
      this.unsubscribe = this.ref.onSnapshot((sn) => {
        if (sn.empty) {
          this.subscribedSchedule = {}
          return
        }
        this.subscribedSchedule = sn.data()
        this.subscribedSchedule.scheduleId = this.schedule.scheduleId
        this.initData()
        this.checkStatus()
      })
    },
    async initData() {
      this.participants = []
      this.applicants = []
      const participantsIdList = [
        this.subscribedSchedule.organizer,
        ...this.subscribedSchedule.participants,
      ]
      const applicantsUserIdListWithComment = {}
      const applicantsUserIdListWithCreatedAt = {}
      const applicantsData = await this.ref.collection('applicants').get()
      this.applicantsUserIdList = applicantsData.docs.map((doc) => {
        applicantsUserIdListWithComment[doc.id] = doc.data().comment
        applicantsUserIdListWithCreatedAt[doc.id] = doc.data().createdAt
        return doc.id
      })

      try {
        const snapshot = await this.refUser.get()
        this.participants = snapshot.docs
          .filter((value) => participantsIdList.includes(value.id))
          .map((value, index) => {
            const id = value.id
            if (id === this.subscribedSchedule.organizer)
              this.organizerIndex = index
            const item = value.data()
            return {
              userId: id,
              nickName: item.nickName,
              location: item.location,
              ntrp: item.ntrp,
              sex: item.sex,
              age:
                Math.floor((new Date().getFullYear() - item.birth) / 10) * 10,
            }
          })

        this.applicants = snapshot.docs
          .filter((value) => this.applicantsUserIdList.includes(value.id))
          .map((value) => {
            const id = value.id
            const item = value.data()
            return {
              userId: id,
              nickName: item.nickName,
              location: item.location,
              ntrp: item.ntrp,
              sex: item.sex,
              age:
                Math.floor((new Date().getFullYear() - item.birth) / 10) * 10,
            }
          })
      } catch (err) {
        alert('데이터를 가져오는데 실패했습니다.', err)
        console.log(err)
      } finally {
        if (this.organizerIndex !== 0) {
          let tmp = Object.assign(this.participants[0])
          this.participants[0] = Object.assign(
            this.participants[this.organizerIndex],
          )
          this.participants[this.organizerIndex] = Object.assign(tmp)
        }
        const ghostNumber =
          this.subscribedSchedule.total -
          this.participants.length -
          this.subscribedSchedule.vacant
        for (let i = 0; i < ghostNumber; i++) {
          this.participants.push(Object.assign(this.ghostParticipant))
        }
        for (let j = 0; j < this.applicantsUserIdList.length; j++) {
          this.applicants[j].comment =
            applicantsUserIdListWithComment[this.applicants[j].userId]
          this.applicants[j].createdAt = Number(
            applicantsUserIdListWithCreatedAt[this.applicants[j].userId],
          )
        }
        this.applicants.sort((a, b) => {
          return a.createdAt - b.createdAt
        })
        if (this.subscribedSchedule.vacant === 0) {
          this.$nextTick().then(() => {
            setTimeout(() => {
              this.confirmStatusClose()
            }, 500)
          })
        }
      }
    },
    copyContact() {
      const tempEl = document.createElement('textarea')
      tempEl.value = this.subscribedSchedule.contact
      document.body.appendChild(tempEl)
      tempEl.select()
      document.execCommand('copy')
      document.body.removeChild(tempEl)
      alert('연락처가 클립보드로 복사되었습니다 🎾')
    },
  },
}
</script>

<style lang="scss" scoped>
.find-people-detail-container {
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  .find-people-detail-content {
    height: calc(100vh - 120px);
    overflow: scroll;
  }
  .compelete-btn {
    max-height: 36px;
  }
}
</style>
