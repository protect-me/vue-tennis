<template>
  <v-container class="court-report-container">
    <div class="court-report-header">
      <TitleWithButton
        titleText="피드백 작성"
        goBackButton
        @goBackButtonClicked="goBackButtonClicked"
      />
    </div>
    <v-divider class="my-3"></v-divider>
    <div class="court-report-content">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card class="mb-2">
          <v-card-subtitle>
            <span>Notice. 수정 전/후 내용을 함께 작성해주세요 🎾</span>
          </v-card-subtitle>
        </v-card>

        <v-textarea
          id="textarea"
          label="요청 사항"
          v-model="form.content"
          type="text"
          outlined
          counter="1000"
          :rules="[rules.required, rules.counter]"
        />
      </v-form>
    </div>
    <v-spacer></v-spacer>
    <v-btn
      class="compelete-btn"
      block
      color="primary"
      @click="apply"
      :disabled="isProcessing"
      :loading="isProcessing"
    >
      피드백 완료
    </v-btn>
  </v-container>
</template>

<script>
import TitleWithButton from '../../components/TitleWithButton'
import { mapState } from 'vuex'

export default {
  components: {
    TitleWithButton,
  },
  computed: {
    ...mapState(['fireUser', 'user']),
  },
  mounted() {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  },
  unmounted() {
    window.removeEventListener('resize', this.handleResize)
  },
  data() {
    return {
      form: {
        content: '',
        createdAt: '',
        userId: '',
      },
      valid: true,
      isProcessing: false,
      rules: {
        required: (value) => !!value || value === 0 || '필수 기입',
        counter: (value) =>
          value.length <= 1000 || '1000자 이하로 입력해주세요',
      },
    }
  },
  methods: {
    handleResize() {
      const h = window.innerHeight
      const calcH = h - 300 + 'px'
      const textarea = document.getElementById('textarea')
      textarea.style.height = calcH
    },
    goBackButtonClicked() {
      this.$router.push('CourtList')
    },
    async apply() {
      if (this.isProcessing) {
        console.log('isProcessing!')
        return
      }
      if (!this.fireUser.uid) {
        alert('회원 정보가 확인되지 않습니다. 다시 로그인해주세요!')
        return
      }
      this.isProcessing = true
      this.form.userId = this.fireUser.uid

      await this.$refs.form.validate()
      if (!this.valid) {
        console.log('please check validation!')
        this.isProcessing = false
        return
      }
      this.registNewReport()
    },
    async registNewReport() {
      try {
        this.form.createdAt = new Date()
        const id = this.form.createdAt.getTime().toString()

        await this.$firebase
          .firestore()
          .collection('reports')
          .doc(id)
          .set(this.form)
        console.log('등록 성공')
      } catch (err) {
        alert('등록에 실패했습니다.', err.message)
        console.log('등록 실패', err.message)
      } finally {
        this.isProcessing = false
      }
      this.$router.push('CourtList')
    },
  },
}
</script>

<style lang="scss" scoped>
.court-report-container {
  width: 100%;
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  .court-report-content {
    height: calc(100vh - 140px);
    #textarea {
      height: 300px;
    }
  }
  .compelete-btn {
    max-height: 36px;
  }
}
</style>
