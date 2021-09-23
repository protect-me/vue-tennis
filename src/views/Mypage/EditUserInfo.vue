<template>
  <v-container class="edit-user-info-container">
    <v-card flat>
      <div class="edit-user-info-header">
        <div class="title font-weight-black">회원 정보 수정</div>
        <!-- <v-spacer></v-spacer>
        <v-btn small text color="error">
          <v-icon>
            mdi-trash-can-outline
          </v-icon>
        </v-btn> -->
      </div>
      <v-divider class="my-3"></v-divider>
      <div></div>
      <v-form v-if="fireUser" ref="form" v-model="valid" lazy-validation>
        <div class="divide-column">
          <v-text-field
            class="mb-3"
            v-model="form.nickName"
            label="닉네임"
            type="text"
            outlined
            hide-details
            :rules="[rules.required]"
          />
          <v-text-field
            class="mb-3"
            v-model="form.sex"
            label="성별"
            type="text"
            outlined
            hide-details
            :rules="[rules.required]"
          />
          <v-text-field
            class="mb-3"
            v-model="form.birth"
            label="태어난 년도 (e.g. 1988)"
            type="number"
            max="4"
            outlined
            hide-details
            :rules="[rules.required, rules.counter]"
          />
          <v-text-field
            class="mb-3"
            v-model="form.location"
            label="지역 (e.g. 서울시 중구)"
            type="text"
            :counter="4"
            outlined
            hide-details
            :rules="[rules.required]"
          />
          <div
            class="mb-3"
            style="
              color: gray;
              border: 1px solid gray;
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
          <!-- @click="openCourtDialog"
            :rules="[rules.required]" -->
        </div>
      </v-form>
    </v-card>
    <v-spacer></v-spacer>

    <v-btn class="regist-btn" block color="primary" @click="apply">
      수정 완료
    </v-btn>

    <v-dialog v-if="helpNtrpToggle" v-model="helpNtrpToggle" scrollable>
      <HelpNtrp @closeHelpNtrp="closeHelpNtrp"></HelpNtrp>
    </v-dialog>
  </v-container>
</template>

<script>
import HelpNtrp from '../../components/HelpNtrp'

export default {
  components: {
    HelpNtrp,
  },
  computed: {
    fireUser() {
      console.log('computed', this.$store.state.fireUser)
      return this.$store.state.fireUser
    },
  },
  watch: {
    fireUser(nv, ov) {
      console.log('watch', nv, ov)
      const info = this.fireUser
      this.form = {
        nickName: info.nickName,
        sex: info.sex,
        birth: info.birth,
        location: info.location,
        ntrp: info.ntrp,
      }
    },
  },
  data() {
    return {
      helpNtrpToggle: false,
      selectedNtrp: 7,
      rules: {
        required: (value) => !!value || '필수 기입',
        counter: (value) =>
          (value && value.length === 4) || '4자리 숫자로 입력해주세요',
      },

      form: {
        nickName: '',
        sex: '',
        birth: '',
        location: '',
        ntrp: 0,
      },
      valid: false,
    }
  },

  methods: {
    apply() {
      console.log(this.$store.state.fireUser.displayName)
    },
    openNtrpHelp() {
      this.helpNtrpToggle = true
    },
    closeHelpNtrp() {
      this.helpNtrpToggle = false
    },
  },
}
</script>

<style lang="scss" scoped>
.edit-user-info-container {
  width: 100%;
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  border: 1px solid green;
  .regist-btn {
    max-height: 36px;
  }
}
</style>
