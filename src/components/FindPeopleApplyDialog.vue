<template>
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
          <v-btn style="width: 125px;" class="mr-3" @click="closeApplyDialog">
            취소
          </v-btn>
          <v-btn style="flex-grow: 1;" color="primary" @click="registApplicant">
            참가 요청 완료
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import UserCard from './UserCard'

export default {
  components: {
    UserCard,
  },
  props: {
    schedule: {
      type: Object,
      default: () => ({}),
    },
  },
  mounted() {
    console.log(this.schedule)
  },
  computed: {
    ...mapState(['fireUser', 'user']),
  },
  data() {
    return {
      comment: '',
      valid: false,
      rules: {
        counter20: (value) =>
          (value && value.length <= 20) || '20자리 이하로 입력해주세요',
      },
      ref: this.$firebase
        .firestore()
        .collection('findPeople')
        .doc(this.schedule.scheduleId),
      refUser: this.$firebase.firestore().collection('users'),
    }
  },
  methods: {
    closeApplyDialog() {
      this.$emit('closeApplyDialog')
    },
    registApplicant() {},
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
            this.schedule.scheduleId,
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
