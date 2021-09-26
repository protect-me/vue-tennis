<template>
  <v-container class="edit-user-info-container">
    <v-card flat>
      <div class="edit-user-info-header">
        <TitleWithButton
          titleText="회원 정보 수정"
          goBackButton
          @goBackButtonClicked="goBackButtonClicked"
        />
      </div>
      <v-divider class="my-3"></v-divider>
      <div></div>
      <v-form v-if="user" ref="form" v-model="valid" lazy-validation>
        <div class="divide-column">
          <v-text-field
            class="mb-3"
            v-model="form.nickName"
            label="닉네임"
            type="text"
            outlined
            hide-details
            :rules="[rules.required, rules.counter8]"
          />
          <v-btn-toggle
            style="
              width: 100%;
              border: 1px solid rgba(0, 0, 0, 0.42);
              border-radius: 4px;
            "
            v-model="sex"
            class="mb-3"
            color="primary"
            mandatory
            tile
          >
            <v-btn width="50%" :value="1">남</v-btn>
            <v-btn width="50%" :value="2">여</v-btn>
          </v-btn-toggle>
          <v-text-field
            class="mb-3"
            v-model="form.birth"
            label="생년 (e.g. 1988)"
            type="number"
            max="4"
            outlined
            hide-details
            :rules="[rules.required, rules.counter4number]"
          />
          <v-text-field
            class="mb-3"
            v-model="form.location"
            label="지역 (e.g. 서울시 중구)"
            max="8"
            type="text"
            outlined
            hide-details
            :rules="[rules.required, rules.counter8]"
          />
          <div
            class="mb-3"
            style="
              color: gray;
              border: 1px solid rgba(0, 0, 0, 0.42);
              border-radius: 5px;
              padding: 10px;
            "
          >
            <span>
              실력 | NTRP
            </span>
            <span @click="openNtrpHelp">
              <v-icon small>mdi-help-circle-outline</v-icon>
            </span>
            <v-slider
              v-model="selectedNtrp"
              :tick-labels="[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7]"
              :min="1"
              :max="13"
              step="1"
              ticks="always"
              tick-size="0"
              style="font-size: 12px;"
            ></v-slider>
          </div>
        </div>
      </v-form>
    </v-card>
    <v-spacer></v-spacer>

    <v-btn
      class="compelete-btn"
      block
      color="primary"
      @click="apply"
      :loading="isProcessing"
    >
      수정 완료
    </v-btn>

    <v-dialog v-if="helpNtrpToggle" v-model="helpNtrpToggle" scrollable>
      <HelpNtrp @closeHelpNtrp="closeHelpNtrp"></HelpNtrp>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import HelpNtrp from '../../components/HelpNtrp'
import TitleWithButton from '../../components/TitleWithButton'

export default {
  components: {
    HelpNtrp,
    TitleWithButton,
  },
  mounted() {
    this.$nextTick(function () {
      if (!this.user) {
        this.moveToMypage()
      } else {
        const info = this.$store.state.user
        this.form.nickName = info.nickName
        this.form.birth = info.birth
        this.form.location = info.location
        this.selectedNtrp = Number(info.ntrp) * 2 - 1 || 7
        this.sex = Number(info.sex)
      }
    })
  },
  computed: {
    ...mapState(['fireUser', 'user']),
  },
  data() {
    return {
      isComplete: false,
      isProcessing: false,
      helpNtrpToggle: false,
      selectedNtrp: 7,
      sex: 1,
      rules: {
        required: (value) => !!value || '필수 기입',
        counter4number: (value) =>
          (value && value.length === 4) || '4자리 숫자로 입력해주세요',
        counter8: (value) =>
          (value && value.length <= 8) || '8자리 이하로 입력해주세요',
      },

      form: {
        nickName: '',
        sex: '',
        birth: '',
        location: '',
        ntrp: 0,
        updatedAt: '',
      },
      valid: false,
    }
  },
  methods: {
    goBackButtonClicked() {
      this.$router.go(-1)
    },
    async apply() {
      if (this.isProcessing) {
        console.log('isProcessing!')
        return
      }
      this.isProcessing = true
      await this.$refs.form.validate()

      if (!this.valid) {
        console.log('check validation!')
        this.isProcessing = false
        return
      }
      if (this.checkSameData()) {
        console.log('same data')
        this.isProcessing = false
        this.moveToMypage()
        return
      } else {
        this.form.sex = this.sex
        this.form.ntrp = (this.selectedNtrp + 1) / 2
        this.updateUserInfo()
      }
    },
    checkSameData() {
      const info = this.$store.state.user
      if (
        this.form.nickName === info.nickName &&
        this.form.birth === info.birth &&
        this.form.location === info.location &&
        this.sex === Number(info.sex) &&
        this.selectedNtrp === (Number(info.ntrp) * 2 - 1 || 7)
      ) {
        return true
      } else {
        return false
      }
    },
    async updateUserInfo() {
      try {
        this.form.updatedAt = Date.now()
        await this.$firebase
          .firestore()
          .collection('users')
          .doc(this.fireUser.uid)
          .update(this.form)
        console.log('수정 성공')
      } catch (err) {
        alert('수정 실패', err.message)
        console.log('수정 실패', err.message)
      } finally {
        this.isProcessing = false
        this.moveToMypage()
      }
    },
    moveToMypage() {
      this.$router.push('Mypage')
    },
    openNtrpHelp() {
      this.helpNtrpToggle = true
    },
    closeHelpNtrp() {
      this.helpNtrpToggle = false
    },
  },
  beforeRouteLeave(to, from, next) {
    if (this.isComplete || this.checkSameData()) {
      next()
    } else {
      const answer = window.confirm(
        '저장되지 않은 작업이 있습니다! 정말 나갈까요?',
      )
      if (answer) {
        next()
      } else {
        next(false)
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.edit-user-info-container {
  width: 100%;
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  .compelete-btn {
    max-height: 36px;
  }
}
</style>
