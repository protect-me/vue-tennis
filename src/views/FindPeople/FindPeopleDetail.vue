<template>
  <v-container
    class="find-people-detail-container"
    v-if="subscribedSchedule && subscribedSchedule.scheduleId"
  >
    <div class="find-people-detail-content">
      <div class="find-people-detail-header">
        <TitleWithButton
          titleText="게스트 모집 상세"
          goBackButton
          :editButton="
            fireUser.uid === schedule.organizer &&
            subscribedSchedule.status !== 3
          "
          :icon="titleIcon"
          @editButtonClicked="editButtonClicked"
          @goBackButtonClicked="goBackButtonClicked"
        />
      </div>
      <v-divider class="my-3"></v-divider>
      <FindPeopleCard :schedule="subscribedSchedule" mode="detail" />
      <v-card>
        <v-card-text>
          <v-icon class="mr-1" small>mdi-forum-outline</v-icon>
          open kakao talk link
          <v-icon class="mr-1" small>mdi-link-varian</v-icon>
          <span>{{ schedule.contact }}</span>
        </v-card-text>
      </v-card>

      <div class="my-3" style="display: flex;">
        <v-divider class="mt-3" />
        <div class="mx-3">현재 참가자</div>
        <v-divider class="mt-3" />
      </div>

      <v-container class="participants-container pa-0" v-if="participants">
        <v-card
          v-for="(participant, index) in participants"
          :key="index"
          :class="{
            'participants-card': true,
            'mb-1': true,
            'mr-1': index % 2 === 0,
            'ml-1': index % 2 === 1,
          }"
          :dark="participant.userId === fireUser.uid"
          @click="selectParticipant(participant)"
        >
          <v-card-subtitle class="pt-2 px-2 pb-0">
            {{ participant.nickName }}
            <v-icon v-if="index === 0" small class="mb-1">
              mdi-crown-outline
            </v-icon>
            <v-icon v-if="participant.userId === 'Ghost'" small class="mb-1">
              mdi-ghost-outline
            </v-icon>
          </v-card-subtitle>

          <v-card-text
            v-if="participant.userId !== 'Ghost'"
            class="pt-0 px-2 pb-2"
          >
            <div>
              <span v-if="participant.sex">
                {{ participant.sex === 1 ? '남' : '여' }}
              </span>
              <span class="mx-1">|</span>
              <span v-if="participant.age">
                {{ participant.age }}
              </span>
              <span class="mx-1">|</span>
              <span
                v-if="participant.location"
                v-text="participant.location"
              ></span>
            </div>
            <div align="right" class="mt-1">
              <v-chip small>
                <span>NTRP</span>
                <span v-if="participant.ntrp" v-text="participant.ntrp"></span>
              </v-chip>
            </div>
          </v-card-text>
          <v-card-text
            v-else-if="participant.userId === 'Ghost'"
            class="pt-0 px-2 pb-2"
          >
            <div>-</div>
            <div align="right" class="mt-1">
              <v-chip small><span>NTRP</span></v-chip>
            </div>
          </v-card-text>
        </v-card>

        <v-card
          flat
          v-for="(vacant, index) in subscribedSchedule.vacant"
          :key="participants.length + index"
          :class="{
            'participants-card': true,
            'vacant-card': true,
            'mb-1': true,
            'mr-1': (participants.length + index) % 2 === 0,
            'ml-1': (participants.length + index) % 2 === 1,
          }"
        ></v-card>
      </v-container>

      <div class="my-3" style="display: flex;">
        <v-divider class="mt-3" />
        <div class="mx-3">참가 신청자</div>
        <v-divider class="mt-3" />
      </div>

      <v-container v-if="applicants && applicants.length === 0">
        <v-card flat>
          Notice. 참가 신청한 게스트가 없습니다 🎾
        </v-card>
      </v-container>

      <v-container v-else class="applicants-container pa-0">
        <v-card
          v-for="(applicant, index) in applicants"
          :key="index"
          :class="{
            'applicants-card': true,
            'mb-1': true,
            'mr-1': index % 2 === 0,
            'ml-1': index % 2 === 1,
          }"
          @click="selectApplicant(applicant)"
        >
          <v-card-subtitle class="pt-2 px-2 pb-0">
            {{ applicant.nickName }}
          </v-card-subtitle>
          <v-card-text class="pt-0 px-2 pb-2">
            <div>
              <span v-if="applicant.sex">
                {{ applicant.sex === 1 ? '남' : '여' }}
              </span>
              <span class="mx-1">|</span>
              <span v-if="applicant.age">
                {{ applicant.age }}
              </span>
              <span class="mx-1">|</span>
              <span
                v-if="applicant.location"
                v-text="applicant.location"
              ></span>
            </div>
            <div v-if="applicant.comment">
              <v-icon small class="mr-1 mb-1">mdi-bullhorn-outline</v-icon>
              <span>{{ applicant.comment }}</span>
            </div>
            <div align="right" class="mt-1">
              <v-chip small>
                <span class="mr-1">NTRP</span>
                <span v-if="applicant.ntrp" v-text="applicant.ntrp"></span>
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </div>

    <v-spacer></v-spacer>
    <FindPeopleDetailActionBtn
      :subscribedSchedule="subscribedSchedule"
      :applicants="applicants"
      :applicantsUserIdList="applicantsUserIdList"
      @apply="openApplyDialog"
    />

    <v-bottom-sheet
      v-if="applyDialogToggle"
      v-model="applyDialogToggle"
      @click:outside="closeApplyDialog"
    >
      <FindPeopleApplyDialog
        :schedule="schedule"
        @closeApplyDialog="closeApplyDialog"
      />
    </v-bottom-sheet>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import TitleWithButton from '../../components/TitleWithButton'
import FindPeopleCard from './FindPeopleCard'
import UserCard from '../../components/UserCard'
import FindPeopleApplyDialog from '../../components/FindPeopleApplyDialog'
import FindPeopleDetailActionBtn from '../../components/FindPeopleDetailActionBtn'

export default {
  components: {
    TitleWithButton,
    FindPeopleCard,
    UserCard,
    FindPeopleApplyDialog,
    FindPeopleDetailActionBtn,
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
      applyDialogToggle: false,
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
    goBackButtonClicked() {
      this.$router.go(-1)
    },
    editButtonClicked() {
      if (this.subscribedSchedule.status === 3) return
      console.log('editButtonClicked')
    },
    openApplyDialog() {
      console.log('????')
      this.applyDialogToggle = true
    },
    closeApplyDialog() {
      this.applyDialogToggle = false
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
      console.log('init', this.subscribedSchedule)
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

    async selectParticipant(participant) {
      if (this.subscribedSchedule.status === 3) return
      if (this.subscribedSchedule.organizer !== this.fireUser.uid) return
      if (this.subscribedSchedule.organizer === participant.userId) return
      if (participant.userId === 'Ghost') return

      const answer = window.confirm('게스트를 방출하시겠어요?')
      if (!answer) return
      const answer2 = window.confirm('방출할 게스트에게 방출 사실을 알렸나요?')
      if (answer && answer2) {
        try {
          const batch = await this.$firebase.firestore().batch()
          batch.update(this.ref, {
            participants: this.$firebase.firestore.FieldValue.arrayRemove(
              participant.userId,
            ),
          })
          if (
            this.subscribedSchedule.participants.includes(participant.userId)
          ) {
            batch.update(this.ref, {
              vacant: this.$firebase.firestore.FieldValue.increment(1),
            })
          }
          batch.update(this.refUser.doc(participant.userId), {
            applyList: this.$firebase.firestore.FieldValue.arrayRemove(
              this.fireUser.uid,
            ),
          })
          await batch.commit()
          alert('방출된 게스트에게 방출 사실을 꼭 알리세요 🎾')
          console.log('게스트 방출 성공')
        } catch (err) {
          alert('게스트 방출 실패', err)
          console.log(err)
        } finally {
        }
      }
    },

    async selectApplicant(applicant) {
      if (this.subscribedSchedule.status === 3) return
      if (this.subscribedSchedule.organizer !== this.fireUser.uid) return
      if (this.subscribedSchedule.participants.includes(applicant.userId)) {
        alert('이미 참여한 게스트입니다!')
        return
      }

      const answer = window.confirm('게스트로 영입하시겠어요?')
      if (answer) {
        try {
          const batch = await this.$firebase.firestore().batch()
          batch.update(this.ref, {
            participants: this.$firebase.firestore.FieldValue.arrayUnion(
              applicant.userId,
            ),
            vacant: this.$firebase.firestore.FieldValue.increment(-1),
          })
          await batch.commit()
          console.log('게스트 영입 성공')
          alert('영입된 게스트에게 영입 사실을 꼭 알리세요 🎾')
        } catch (err) {
          alert('게스트 영입 실패', err)
          console.log(err)
        }
      }
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
    .participants-container {
      width: calc(100vw - 24px);
      display: flex;
      flex-wrap: wrap;
      .participants-card {
        width: calc(50% - 4px);
      }
      .vacant-card {
        min-height: 89px;
        border: 1px dashed grey;
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
    .applicants-container {
      width: calc(100vw - 24px);
      display: flex;
      flex-wrap: wrap;
      .applicants-card {
        width: calc(50% - 4px);
      }
    }
  }
  .compelete-btn {
    max-height: 36px;
  }
}
</style>
