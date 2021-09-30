<template>
  <div class="compelete-btn">
    <v-btn
      v-if="btnMode !== 'disalbed'"
      block
      :color="btnColor"
      @click="runMethod"
    >
      {{ btnText }}
    </v-btn>

    <v-btn v-else block disabled></v-btn>

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
  </div>
</template>

<script>
import { mapState } from 'vuex'
import UserCard from './UserCard'

export default {
  components: {
    UserCard,
  },
  props: {
    subscribedSchedule: {
      type: Object,
      default: () => ({}),
    },
    applicants: {
      type: Array,
      default: () => [],
    },
    applicantsUserIdList: {
      type: Array,
      default: () => [],
    },
  },
  mounted() {
    this.$nextTick(function () {
      this.ref = this.$firebase
        .firestore()
        .collection('findPeople')
        .doc(this.subscribedSchedule.scheduleId)
    })
  },
  data() {
    return {
      applyDialogToggle: false,
      btnColor: '',
      btnText: '',
      comment: '',
      valid: false,
      rules: {
        counter20: (value) =>
          (value && value.length <= 20) || '20자리 이하로 입력해주세요',
      },
      refUser: this.$firebase.firestore().collection('users'),
    }
  },
  computed: {
    ...mapState(['fireUser', 'user']),
    btnMode() {
      if (this.subscribedSchedule.organizer === this.fireUser.uid) {
        if (this.subscribedSchedule.status === 1) {
          this.btnColor = 'error'
          this.btnText = '게스트 모집 마감'
          return 'closeSchedule'
        } else if (this.subscribedSchedule.status === 2) {
          this.btnColor = 'primary'
          this.btnText = '게스트 모집'
          return 'openSchedule'
        }
      } else if (this.subscribedSchedule.organizer !== this.fireUser.uid) {
        if (this.subscribedSchedule.status === 2) {
          this.btnColor = 'gray'
          this.btnText = '-'
          return 'disalbed'
        } else if (this.applicantsUserIdList.includes(this.fireUser.uid)) {
          this.btnColor = 'error'
          this.btnText = '참가 신청 취소'
          return 'cancleApply'
        } else if (!this.applicantsUserIdList.includes(this.fireUser.uid)) {
          this.btnColor = 'primary'
          this.btnText = '참가 신청'
          return 'apply'
        }
      } else {
        this.btnColor = 'gray'
        this.btnText = '-'
        return 'disalbed'
      }
    },
  },
  methods: {
    runMethod() {
      switch (this.btnMode) {
        case 'closeSchedule':
          this.closeSchedule()
          break
        case 'openSchedule':
          this.openSchedule()
          break
        case 'cancleApply':
          this.cancleApply()
          break
        case 'apply':
          this.openApplyDialog()
          break
      }
    },
    async openSchedule() {
      if (
        this.subscribedSchedule.status === 2 &&
        this.subscribedSchedule.organizer === this.fireUser.uid
      ) {
        const answer = window.confirm('게스트 모집 상태로 변경할까요?')
        if (answer) {
          try {
            await this.ref.update({ status: 1 })
            console.log('게스트 모집 상태 변경 성공')
          } catch (err) {
            alert('게스트 모집 상태 변경 실패', err.message)
            console.log('게스트 모집 상태 변경 실패', err.message)
          }
        }
      } else {
        return
      }
    },
    async closeSchedule() {
      if (
        this.subscribedSchedule.status === 1 &&
        this.subscribedSchedule.organizer === this.fireUser.uid
      ) {
        const answer = window.confirm('게스트 모집을 마감할까요?')
        if (answer) {
          try {
            await this.ref.update({ status: 2 })
            console.log('게스트 모집 마감 성공')
          } catch (err) {
            alert('게스트 모집 마감 실패', err.message)
            console.log('게스트 모집 마감 실패', err.message)
          }
        }
      } else {
        return
      }
    },
    async cancleApply() {
      const answer = window.confirm('참가 요청을 취소하시겠어요?')
      if (answer) {
        try {
          const batch = await this.$firebase.firestore().batch()
          batch.update(this.ref, {
            applicantsCount: this.$firebase.firestore.FieldValue.increment(-1),
            participants: this.$firebase.firestore.FieldValue.arrayRemove(
              this.fireUser.uid,
            ),
          })
          if (
            this.subscribedSchedule.participants.includes(this.fireUser.uid)
          ) {
            batch.update(this.ref, {
              vacant: this.$firebase.firestore.FieldValue.increment(1),
            })
          }
          batch.delete(this.ref.collection('applicants').doc(this.fireUser.uid))
          batch.update(this.refUser.doc(this.fireUser.uid), {
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

    openApplyDialog() {
      this.applyDialogToggle = true
    },
    closeApplyDialog() {
      this.applyDialogToggle = false
    },
    async registApplicant() {
      await this.$refs.form.validate()
      if (!this.valid) return

      try {
        const ref = this.ref
        const refUser = this.refUser.doc(this.fireUser.uid)
        const batch = await this.$firebase.firestore().batch()
        batch.update(ref, {
          applicantsCount: this.$firebase.firestore.FieldValue.increment(1),
        })
        batch.set(ref.collection('applicants').doc(this.fireUser.uid), {
          comment: this.comment,
          createdAt: new Date().getTime().toString(),
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
  },
}
</script>

<style></style>
