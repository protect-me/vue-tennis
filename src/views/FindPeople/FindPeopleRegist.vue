<template>
  <v-container class="find-people-regist-container">
    <v-card flat>
      <div class="find-people-regist-header">
        <div class="title font-weight-black">신규 구인 등록</div>
        <v-spacer></v-spacer>
        <v-btn small text color="error">
          <v-icon>
            mdi-trash-can-outline
          </v-icon>
        </v-btn>
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
              class="mb-3"
              outlined
              v-model="form.date"
              label="일시"
              readonly
              hide-details
              v-bind="attrs"
              v-on="on"
              :rules="[rules.required]"
            ></v-text-field>
          </template>
          <v-date-picker
            locale="ko-KR"
            v-model="form.date"
            @input="dateMenu = false"
            full-width
          ></v-date-picker>
        </v-menu>

        <div class="divide-column">
          <v-menu
            bottom
            right
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

        <div class="divide-column">
          <v-text-field
            class="mb-3 mr-3"
            label="총 인원(명)"
            v-model="form.number"
            type="number"
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

        <v-text-field
          class="mb-3"
          label="연락처 | 메신저"
          v-model="form.contact"
          type="text"
          outlined
          hide-details
          :rules="[rules.required]"
        />
        <v-textarea
          class="mb-3"
          label="기타"
          v-model="form.memo"
          type="text"
          outlined
          hide-details
          no-resize
        />
      </v-form>
    </v-card>
    <v-spacer></v-spacer>
    <v-btn class="regist-btn" block color="primary" @click="apply">
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
import CourtList from '../admin/CourtList'
import HelpNtrp from '../../components/HelpNtrp'

export default {
  components: {
    CourtList,
    HelpNtrp,
  },
  data() {
    return {
      valid: true,
      rules: {
        required: (value) => !!value || '필수 기입',
        counter: (value) => value.length <= 100 || '100자 이하로 입력해주세요',
      },
      isProcessing: false,
      courtDialogToggle: false,
      helpNtrpToggle: false,
      selectedCourt: {},
      courtTypes: [],
      selectedNtrp: 5,
      form: {
        organizer: '',
        name: '',
        courtType: '',
        date: '',
        startTime: '',
        endTime: '',
        ntrp: 5,
        cost: '',
        contact: '',
        memo: '',
        createdAt: '',
        updatedAt: '',
      },
      dateMenu: false,
      startTimeMenu: false,
      endTimeMenu: false,
    }
  },
  methods: {
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
      const n = this.selectedNtrp
      this.form.ntrp = n - (n - 1) * 0.5
      this.registNewFindPeople()
    },
    async registNewFindPeople() {
      try {
        this.form.createdAt = Date.now()
        this.form.updatedAt = this.form.createdAt
        await this.$firebase.firestore().collection('findPeople').add(this.form)
        console.log('등록 성공')
      } catch (err) {
        alert('등록에 실패했습니다.', err.message)
        console.log('등록 실패', err.message)
      } finally {
        this.isProcessing = false
      }
      this.$router.push('FindPeopleHome')
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
.find-people-regist-container {
  width: 100%;
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  border: 1px solid green;
  .regist-btn {
    max-height: 36px;
  }
  .divide-column {
    display: flex;
  }
}
</style>
