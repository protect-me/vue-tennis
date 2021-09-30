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
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
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
      btnColor: '',
      btnText: '',
      btnMethod: '',
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
          this.$emit('apply')
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
  },
}
</script>

<style></style>
