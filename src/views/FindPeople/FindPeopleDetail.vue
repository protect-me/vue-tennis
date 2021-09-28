<template>
  <v-container
    class="find-people-detail-container"
    v-if="subscribedSchedule && subscribedSchedule.scheduleId"
  >
    <div class="find-people-detail-header">
      <TitleWithButton
        titleText="게스트 모집 상세"
        goBackButton
        :editButton="fireUser.uid === schedule.organizer"
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
            <span v-if="applicant.location" v-text="applicant.location"></span>
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
    <v-spacer></v-spacer>
    <v-btn
      v-if="
        schedule.organizer !== fireUser.uid &&
        applicantsUserIdList &&
        !applicantsUserIdList.includes(fireUser.uid)
      "
      class="compelete-btn"
      block
      color="primary"
      @click="openApplyDialog"
    >
      참가 신청
    </v-btn>
    <v-btn
      v-if="
        schedule.organizer !== fireUser.uid &&
        applicantsUserIdList &&
        applicantsUserIdList.includes(fireUser.uid)
      "
      class="compelete-btn"
      block
      color="error"
      @click="cancleApply"
    >
      참가 신청 취소
    </v-btn>

    <v-bottom-sheet
      v-if="applyDialogToggle"
      v-model="applyDialogToggle"
      @click:outside="closeApplyDialog"
    >
      <v-container>
        <v-card>
          <UserCard :user="user"></UserCard>
          <v-card-text class="py-2">
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                class="mb-3"
                label="Comment"
                v-model="comment"
                type="text"
                outlined
                :rules="[rules.counter20]"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <div style="display: flex; width: 100%;">
              <v-btn
                style="width: 125px;"
                class="mr-3"
                @click="closeApplyDialog"
              >
                취소
              </v-btn>
              <v-btn
                style="flex-grow: 1;"
                color="primary"
                @click="registApplicant"
              >
                참가 요청 완료
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-bottom-sheet>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import TitleWithButton from '../../components/TitleWithButton'
import FindPeopleCard from './FindPeopleCard'
import UserCard from '../../components/UserCard'

export default {
  components: {
    TitleWithButton,
    FindPeopleCard,
    UserCard,
  },
  mounted() {
    this.$nextTick(function () {
      this.subscribe()
    })
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
      comment: '',
      valid: false,
      rules: {
        counter20: (value) =>
          (value && value.length <= 20) || '20자리 이하로 입력해주세요',
      },
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
      console.log('editButtonClicked')
    },
    openApplyDialog() {
      this.applyDialogToggle = true
    },
    closeApplyDialog() {
      this.comment = ''
      this.applyDialogToggle = false
    },
    subscribe() {
      if (this.unsubscribe) {
        this.unsubscribe()
      }
      this.unsubscribe = this.$firebase
        .firestore()
        .collection('findPeople')
        .doc(this.schedule.scheduleId)
        .onSnapshot((sn) => {
          if (sn.empty) {
            this.subscribedSchedule = {}
            return
          }
          this.subscribedSchedule = sn.data()
          this.subscribedSchedule.scheduleId = this.schedule.scheduleId
          this.initData()
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

      // comment
      const applicantsUserIdListWithComment = {}
      const applicantsData = await this.$firebase
        .firestore()
        .collection('findPeople')
        .doc(this.subscribedSchedule.scheduleId)
        .collection('applicants')
        .get()
      this.applicantsUserIdList = applicantsData.docs.map((doc) => {
        applicantsUserIdListWithComment[doc.id] = doc.data().comment
        return doc.id
      })

      try {
        const snapshot = await this.$firebase
          .firestore()
          .collection('users')
          .get()
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
        }
      }
    },
    async registApplicant() {
      await this.$refs.form.validate()
      if (!this.valid) return

      try {
        const ref = this.$firebase
          .firestore()
          .collection('findPeople')
          .doc(this.subscribedSchedule.scheduleId)
        const refUser = this.$firebase
          .firestore()
          .collection('users')
          .doc(this.fireUser.uid)
        const batch = await this.$firebase.firestore().batch()
        batch.update(ref, {
          applicantsCount: this.$firebase.firestore.FieldValue.increment(1),
        })
        batch.set(ref.collection('applicants').doc(this.fireUser.uid), {
          comment: this.comment,
        })
        batch.update(refUser, {
          applyList: this.$firebase.firestore.FieldValue.arrayUnion(
            this.subscribedSchedule.scheduleId,
          ),
        })
        await batch.commit()
        console.log('참가 요청 성공')
      } catch (err) {
        alert('참가 요청 실패', err)
        console.log('참가 요청 실패', err)
      } finally {
        this.closeApplyDialog()
      }
    },
    async cancleApply() {
      const answer = window.confirm('참가 요청을 취소하시겠어요?')
      if (answer) {
        const ref = this.$firebase
          .firestore()
          .collection('findPeople')
          .doc(this.subscribedSchedule.scheduleId)
        const refUser = this.$firebase
          .firestore()
          .collection('users')
          .doc(this.fireUser.uid)
        try {
          const batch = await this.$firebase.firestore().batch()
          batch.update(ref, {
            applicantsCount: this.$firebase.firestore.FieldValue.increment(-1),
            participants: this.$firebase.firestore.FieldValue.arrayRemove(
              this.fireUser.uid,
            ),
          })
          if (
            this.subscribedSchedule.participants.includes(this.fireUser.uid)
          ) {
            batch.update(ref, {
              vacant: this.$firebase.firestore.FieldValue.increment(1),
            })
          }
          batch.delete(ref.collection('applicants').doc(this.fireUser.uid))
          batch.update(refUser, {
            applyList: this.$firebase.firestore.FieldValue.arrayRemove(
              this.fireUser.uid,
            ),
          })
          await batch.commit()
          console.log('참가 요청 취소 성공')
        } catch (err) {
          alert('참가 요청 취소 실패', err)
          console.log(err)
        } finally {
          const deleteIndex = this.applicants.findIndex(
            (v) => (v.userId = this.fireUser.uid),
          )
          if (deleteIndex > 0) {
            this.applicants.splice(deleteIndex, 1)
          }
        }
      }
    },
    async selectParticipant(participant) {
      if (this.subscribedSchedule.organizer !== this.fireUser.uid) return
      if (participant.userId === 'Ghost') return

      const answer = window.confirm('게스트를 방출하시겠어요?')
      if (answer) {
        const ref = this.$firebase
          .firestore()
          .collection('findPeople')
          .doc(this.subscribedSchedule.scheduleId)
        const refUser = this.$firebase
          .firestore()
          .collection('users')
          .doc(participant.userId)
        try {
          const batch = await this.$firebase.firestore().batch()
          batch.update(ref, {
            participants: this.$firebase.firestore.FieldValue.arrayRemove(
              participant.userId,
            ),
          })
          if (
            this.subscribedSchedule.participants.includes(participant.userId)
          ) {
            batch.update(ref, {
              vacant: this.$firebase.firestore.FieldValue.increment(1),
            })
          }
          batch.update(refUser, {
            applyList: this.$firebase.firestore.FieldValue.arrayRemove(
              this.fireUser.uid,
            ),
          })
          await batch.commit()
          console.log('게스트 방출 성공')
        } catch (err) {
          alert('게스트 방출 실패', err)
          console.log(err)
        } finally {
        }
      }
    },

    async selectApplicant(applicant) {
      if (this.subscribedSchedule.organizer !== this.fireUser.uid) return
      if (this.subscribedSchedule.participants.includes(applicant.userId)) {
        alert('이미 참여한 게스트입니다!')
        return
      }

      const answer = window.confirm('게스트로 영입하시겠어요?')
      if (answer) {
        const ref = this.$firebase
          .firestore()
          .collection('findPeople')
          .doc(this.subscribedSchedule.scheduleId)

        try {
          const batch = await this.$firebase.firestore().batch()
          batch.update(ref, {
            participants: this.$firebase.firestore.FieldValue.arrayUnion(
              applicant.userId,
            ),
            vacant: this.$firebase.firestore.FieldValue.increment(-1),
          })
          await batch.commit()
          console.log('게스트 영입 성공')
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
  .compelete-btn {
    max-height: 36px;
  }
}
</style>
