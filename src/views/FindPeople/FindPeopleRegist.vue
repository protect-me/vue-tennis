<template>
  <v-container class="find-people-regist-container">
    <v-card flat class="find-people-regist-content">
      <div class="find-people-regist-header">
        <TitleWithButton
          titleText="신규 게스트 모집 등록"
          goBackButton
          @goBackButtonClicked="goBackButtonClicked"
        />
      </div>
      <v-divider class="my-3"></v-divider>
      <v-form ref="form" v-model="valid" lazy-validation>
        <div class="divide-column">
          <v-text-field
            style="width: 60%;"
            class="mb-3 mr-3"
            v-model="form.name"
            label="장소"
            readonly
            type="text"
            outlined
            hide-details
            @click="openCourtDialog"
            :rules="[rules.required]"
          />
          <v-select
            v-model="form.courtType"
            :items="courtTypes"
            label="코트 타입"
            outlined
            hide-details
            :rules="[rules.required]"
          ></v-select>
        </div>

        <div class="divide-column">
          <v-menu
            v-model="dateMenu"
            :close-on-content-click="false"
            offset-y
            transition="scale-transition"
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                bottom
                left
                class="mb-3 mr-3"
                outlined
                v-model="form.date"
                label="일시"
                readonly
                hide-details
                v-bind="attrs"
                v-on="on"
                :rules="[rules.required, rules.beforeToday]"
              ></v-text-field>
            </template>
            <v-date-picker
              locale="ko-KR"
              v-model="form.date"
              @input="dateMenu = false"
              full-width
            ></v-date-picker>
          </v-menu>

          <v-menu
            bottom
            :nudge-left="startTimeNudgeLeft"
            v-model="startTimeMenu"
            :close-on-content-click="false"
            offset-y
            transition="scale-transition"
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                class="mb-3 mr-3"
                outlined
                v-model="form.startTime"
                label="시작"
                readonly
                hide-details
                v-bind="attrs"
                v-on="on"
                :rules="[rules.required]"
              ></v-text-field>
            </template>
            <v-time-picker
              ampm-in-title
              v-model="form.startTime"
              :max="form.endTime"
              @input="startTimeMenu = false"
            ></v-time-picker>
          </v-menu>

          <v-menu
            bottom
            left
            v-model="endTimeMenu"
            :close-on-content-click="false"
            offset-y
            transition="scale-transition"
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                class="mb-3"
                outlined
                v-model="form.endTime"
                label="종료"
                readonly
                hide-details
                v-bind="attrs"
                v-on="on"
                :rules="[rules.required]"
              ></v-text-field>
            </template>
            <v-time-picker
              ampm-in-title
              v-model="form.endTime"
              :min="form.startTime"
              @input="endTimeMenu = false"
            ></v-time-picker>
          </v-menu>
        </div>

        <div
          class="mb-3"
          style="
            color: gray;
            border: 1px solid;
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

        <div class="divide-column">
          <v-text-field
            class="mb-3 mr-3"
            label="구하는 인원(명)"
            v-model="form.vacant"
            type="number"
            outlined
            hide-details
            :rules="[rules.required, rules.vacantCount]"
          />
          <v-text-field
            class="mb-3"
            label="총 인원(명)"
            v-model="form.total"
            type="number"
            outlined
            hide-details
            :rules="[rules.required, rules.totalCount]"
          />
        </div>

        <div class="divide-column">
          <v-text-field
            class="mb-3 mr-3"
            label="연락처 | 메신저"
            v-model="form.contact"
            type="text"
            outlined
            hide-details
            :rules="[rules.required]"
          />
          <v-text-field
            class="mb-3"
            label="참가비(원)"
            v-model="form.cost"
            type="Number"
            outlined
            hide-details
            :rules="[rules.required]"
          />
        </div>

        <v-textarea
          class="mb-3"
          label="기타"
          v-model="form.memo"
          type="text"
          outlined
          no-resize
          counter="100"
          :rules="[rules.counter]"
        />
      </v-form>
    </v-card>
    <v-spacer></v-spacer>
    <v-btn
      class="compelete-btn"
      block
      color="primary"
      @click="apply"
      :disabled="isProcessing"
      :loading="isProcessing"
    >
      신규 등록
    </v-btn>

    <v-dialog v-if="courtDialogToggle" v-model="courtDialogToggle" fullscreen>
      <v-card>
        <CourtList
          mode="select"
          @selectCourt="selectCourt"
          @closeSelectDialog="closeCourtDialog"
        ></CourtList>
      </v-card>
    </v-dialog>

    <v-dialog v-if="helpNtrpToggle" v-model="helpNtrpToggle" scrollable>
      <HelpNtrp @closeHelpNtrp="closeHelpNtrp"></HelpNtrp>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import CourtList from '../admin/CourtList'
import HelpNtrp from '../../components/HelpNtrp'
import TitleWithButton from '../../components/TitleWithButton'

export default {
  components: {
    CourtList,
    HelpNtrp,
    TitleWithButton,
  },
  async beforeDestroy() {
    await this.$store.dispatch('setSelectedTab', 0)
  },
  computed: {
    ...mapState(['fireUser', 'user']),
    startTimeNudgeLeft() {
      let vMenuWidth = (window.innerWidth - 36) / 3
      return `${(290 - vMenuWidth) / 2}px`
    },
  },
  data() {
    return {
      isComplete: false,
      isProcessing: false,
      valid: true,
      rules: {
        required: (value) => !!value || '필수 기입',
        counter: (value) => value.length <= 100 || '100자 이하로 입력해주세요',
        vacantCount: (value) =>
          (value <= 10 && value >= 0) || '0~10 사이의 숫자를 입력해주세요',
        totalCount: (value) =>
          (value <= 10 && value >= 0 && value >= Number(this.form.vacant)) ||
          '0~10 사이의 숫자를 입력해주세요',
        beforeToday: (value) => {
          const inputDate = new Date(value)
          const today = new Date().setHours(0)
          if (inputDate < today) {
            return '날짜를 확인해주세요'
          }
          return true
        },
      },
      courtDialogToggle: false,
      helpNtrpToggle: false,
      selectedCourt: {},
      courtTypes: [],
      selectedNtrp: 5,
      form: {
        organizer: '',
        organizerNickName: '',
        participants: [],
        applicants: [],
        applicantsCount: 0,
        name: '',
        courtType: '',
        date: '',
        startTime: '',
        endTime: '',
        ntrp: '',
        vacant: '',
        total: '',
        contact: '',
        cost: '',
        memo: '',
        createdAt: '',
        updatedAt: '',
        status: 1, // 모집(1) / 마감(2) / 완료(3) / 기간만료(-)
      },
      dateMenu: false,
      startTimeMenu: false,
      endTimeMenu: false,
    }
  },
  methods: {
    goBackButtonClicked() {
      this.$router.go(-1)
    },
    openCourtDialog() {
      this.courtDialogToggle = true
    },
    closeCourtDialog() {
      this.courtDialogToggle = false
    },
    selectCourt(item) {
      this.selectedCourt = item
      this.form.name = item.name
      this.courtTypes = item.courtTypes
      if (this.selectedCourt) this.closeCourtDialog()
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
      this.form.ntrp = (this.selectedNtrp + 1) / 2
      this.registNewFindPeople()
    },
    async registNewFindPeople() {
      try {
        this.form.total = Number(this.form.total)
        this.form.vacant = Number(this.form.vacant)
        this.form.organizer = this.fireUser.uid
        this.form.organizerNickName = this.user.nickName
        this.form.createdAt = new Date()
        this.form.updatedAt = this.form.createdAt
        const id = this.form.createdAt.getTime().toString()

        const ref = this.$firebase.firestore().collection('findPeople').doc(id)
        const refUser = this.$firebase
          .firestore()
          .collection('users')
          .doc(this.fireUser.uid)

        const batch = await this.$firebase.firestore().batch()
        batch.set(ref, this.form)
        batch.update(refUser, {
          findPeopleList: this.$firebase.firestore.FieldValue.arrayUnion(id),
        })
        await batch.commit()

        console.log('등록 성공')
      } catch (err) {
        alert('등록에 실패했습니다.', err.message)
        console.log('등록 실패', err.message)
      } finally {
        this.isProcessing = false
        this.isComplete = true
        this.$router.push('FindPeopleHome')
      }
    },
    openNtrpHelp() {
      this.helpNtrpToggle = true
    },
    closeHelpNtrp() {
      this.helpNtrpToggle = false
    },
  },
  beforeRouteLeave(to, from, next) {
    if (this.isComplete) {
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
.find-people-regist-container {
  width: 100%;
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;

  .find-people-regist-content {
    height: calc(100vh - 120px);
    overflow: scroll;
  }
  .compelete-btn {
    max-height: 36px;
  }
  .divide-column {
    display: flex;
  }
}
</style>
