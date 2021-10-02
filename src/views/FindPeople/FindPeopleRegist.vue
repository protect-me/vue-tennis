<template>
  <v-container
    :class="{
      'find-people-regist-container': true,
      'edit-mode': mode === 'edit',
    }"
  >
    <v-card flat class="find-people-regist-content">
      <div class="find-people-regist-header">
        <TitleWithButton
          v-if="mode === 'regist'"
          titleText="게스트 모집 등록"
          goBackButton
          @goBackButtonClicked="goBackButtonClicked"
        />
        <TitleWithButton
          v-else-if="mode === 'edit'"
          titleText="게스트 모집 수정"
          closeButton
          @closeButtonClicked="closeButtonClicked"
        />
      </div>
      <v-divider class="my-3"></v-divider>
      <v-form ref="form" v-model="valid" lazy-validation>
        <div class="divide-column">
          <v-text-field
            style="width: 60%;"
            class="mb-3 mr-3"
            v-model="form.courtName"
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
            style="font-size: 12px; width: calc(100% - 10px);"
          ></v-slider>
        </div>

        <div class="divide-column">
          <v-text-field
            class="mb-3 mr-3"
            label="구하는 인원(명)"
            v-model="form.vacant"
            type="number"
            hide-details
            outlined
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
        <v-text-field
          label="오픈 채팅방 링크"
          v-model="form.openChatLink"
          type="text"
          hint="'오픈 채팅방 링크 공유'로 복사한 내용 그대로 붙여넣으세요 🎾"
          outlined
        />
        <v-textarea
          class="mb-3"
          label="메모"
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
    <div style="display: flex;">
      <v-btn
        color="error"
        style="width: calc(35% - 12px); margin-right: 12px;"
        @click="deleteButtonClicked"
      >
        <span>삭제</span>
      </v-btn>
      <v-btn
        class="compelete-btn"
        style="width: 65%;"
        color="primary"
        @click="completeBtnClicked"
        :disabled="isProcessing"
        :loading="isProcessing"
      >
        <span v-if="mode === 'regist'">신규 등록</span>
        <span v-else-if="mode === 'edit'">수정 내용 저장</span>
      </v-btn>
    </div>

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
  props: {
    mode: {
      type: String,
      default: 'regist', // regist | edit
    },
    subscribedSchedule: {
      type: Object,
      default: () => ({}),
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.mode === 'edit') this.initData()
    })
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
        required: (value) => !!value || value === 0 || '필수 기입',
        counter: (value) => value.length <= 100 || '100자 이하로 입력해주세요',
        vacantCount: (value) =>
          (value <= 10 && value >= 0) || '0~10 사이의 숫자를 입력해주세요',
        totalCount: (value) =>
          (value <= 10 && value >= 2 && value >= Number(this.form.vacant)) ||
          '2~10 사이의 숫자를 입력해주세요',
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
        applicantsCount: 0,
        courtName: '',
        courtType: '',
        date: '',
        startTime: '',
        endTime: '',
        ntrp: '',
        vacant: '',
        total: '',
        openChatLink: '',
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
    closeButtonClicked() {
      this.$emit('closeButtonClicked')
    },
    deleteButtonClicked() {
      this.$emit('deleteButtonClicked')
      this.closeButtonClicked()
    },
    goBackButtonClicked() {
      this.$router.push('FindPeopleHome')
    },
    openCourtDialog() {
      this.courtDialogToggle = true
    },
    closeCourtDialog() {
      this.courtDialogToggle = false
    },
    async initData() {
      try {
        const snapshot = await this.$firebase
          .firestore()
          .collection('courts')
          .doc(this.subscribedSchedule.courtId)
          .get()
        if (!snapshot) return
        this.courtTypes = snapshot.data().courtTypes
      } catch (err) {
        alert('코트 타입 정보 확인 불가', err)
        console.log(err)
      }
      this.selectedNtrp = Number(this.subscribedSchedule.ntrp) * 2 - 1 || 7
      this.form = {
        organizer: this.subscribedSchedule.organizer,
        organizerNickName: this.subscribedSchedule.organizerNickName,
        participants: this.subscribedSchedule.participants,
        courtName: this.subscribedSchedule.courtName,
        courtId: this.subscribedSchedule.courtId,
        courtType: this.subscribedSchedule.courtType,
        date: this.subscribedSchedule.date,
        startTime: this.subscribedSchedule.startTime,
        endTime: this.subscribedSchedule.endTime,
        vacant: this.subscribedSchedule.vacant,
        total: this.subscribedSchedule.total,
        contact: this.subscribedSchedule.contact,
        openChatLink: this.subscribedSchedule.openChatLink,
        cost: this.subscribedSchedule.cost,
        memo: this.subscribedSchedule.memo,
        createdAt: this.subscribedSchedule.createdAt,
        updatedAt: this.subscribedSchedule.updatedAt,
        status: this.subscribedSchedule.status, // 모집(1) / 마감(2) / 완료(3) / 기간만료(-)
      }
      this.$forceUpdate()
    },
    selectCourt(item) {
      this.selectedCourt = item
      this.form.courtId = item.courtId
      this.form.courtName = item.courtName
      this.courtTypes = item.courtTypes
      if (this.selectedCourt) this.closeCourtDialog()
    },
    async completeBtnClicked() {
      if (this.isProcessing) {
        console.log('is processing!')
        return
      }
      this.isProcessing = true
      await this.$refs.form.validate()
      if (!this.valid) {
        console.log('please check validation!')
        this.isProcessing = false
        return
      }
      if (!this.form.contact && !this.form.openChatLink) {
        alert('연락처 혹은 오픈채팅방 링크를 입력해주세요!')
        this.isProcessing = false
        return
      }
      this.updateFindPeople()
    },
    async updateFindPeople() {
      try {
        const openChatLinkIndex = this.form.openChatLink.indexOf(
          'https://open.kakao.com/o/',
        )
        this.form.openChatLink = this.form.openChatLink.slice(openChatLinkIndex)
        this.form.ntrp = (this.selectedNtrp + 1) / 2
        this.form.total = Number(this.form.total)
        this.form.vacant = Number(this.form.vacant)
        this.form.organizer = this.fireUser.uid
        this.form.organizerNickName = this.user.nickName
        let id = ''
        if (this.mode === 'regist') {
          this.form.createdAt = new Date()
          this.form.updatedAt = this.form.createdAt
          id = this.form.createdAt.getTime().toString()
        } else if (this.mode === 'edit') {
          id = this.subscribedSchedule.scheduleId
          this.form.updatedAt = new Date()
        }

        const ref = this.$firebase.firestore().collection('findPeople').doc(id)
        const refUser = this.$firebase
          .firestore()
          .collection('users')
          .doc(this.fireUser.uid)
        const batch = await this.$firebase.firestore().batch()

        if (this.mode === 'regist') {
          batch.set(ref, this.form)
          batch.update(refUser, {
            findPeopleList: this.$firebase.firestore.FieldValue.arrayUnion(id),
          })
        } else if (this.mode === 'edit') {
          batch.update(ref, this.form)
        }
        await batch.commit()
        console.log('등록 성공')
      } catch (err) {
        alert('등록에 실패했습니다.', err.message)
        console.log('등록 실패', err.message)
      } finally {
        this.isProcessing = false
        this.isComplete = true
        if (this.mode === 'regist') {
          this.$router.push('FindPeopleHome')
        } else if (this.mode === 'edit') {
          this.closeButtonClicked()
        }
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
  background-color: white;
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
.find-people-regist-container.edit-mode {
  height: 100vh;
  .find-people-regist-content {
    height: calc(100vh - 60px);
    overflow: scroll;
  }
}
</style>
