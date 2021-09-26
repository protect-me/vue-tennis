<template>
  <v-container class="find-people-container">
    <v-card flat>
      <TitleWithButton
        titleText="게스트 모집"
        registNewButton
        @registNewButtonClicked="moveToRegist"
      />
      <v-divider class="my-3"></v-divider>
    </v-card>

    <v-tabs v-model="tab" grow>
      <v-tab v-for="item in items" :key="item.tab">
        {{ item.tab }}
      </v-tab>
    </v-tabs>
    <v-tabs-items class="tabs-item" v-model="tab" v-if="schedules">
      <v-tab-item>
        <FindPeopleOpen :schedules="schedulesOpen"></FindPeopleOpen>
      </v-tab-item>
      <v-tab-item>
        <FindPeopleClose :schedules="schedulesClose"></FindPeopleClose>
      </v-tab-item>
      <v-tab-item>
        <FindPeopleComplete :schedules="schedulesComplete"></FindPeopleComplete>
      </v-tab-item>

      <v-tab-item v-for="item in items" :key="item.tab">
        <component
          v-if="schedules"
          v-bind:is="item.content"
          :schedules="schedules"
        ></component>
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { mapGetters } from 'vuex'
import FindPeopleOpen from './FindPeopleOpen'
import FindPeopleClose from './FindPeopleClose'
import FindPeopleComplete from './FindPeopleComplete'
import TitleWithButton from '../../components/TitleWithButton'

export default {
  components: {
    FindPeopleOpen,
    FindPeopleClose,
    FindPeopleComplete,
    TitleWithButton,
  },
  mounted() {
    this.$nextTick(function () {
      this.$store.dispatch('setSchedules')
    })
  },
  unmounted() {
    if (this.unsubscribeFindPeople) {
      this.unsubscribeFindPeople()
    }
  },
  computed: {
    ...mapGetters(['unsubscribeFindPeople']),
    ...mapState(['fireUser', 'user', 'schedules']),
  },
  watch: {
    schedules() {
      this.filtering()
    },
  },
  data() {
    return {
      findPeoples: [],
      tab: null,
      items: [
        { tab: '모집', content: 'FindPeopleOpen' },
        { tab: '마감', content: 'FindPeopleClose' },
        { tab: '완료', content: 'FindPeopleComplete' },
      ],
      schedulesOpen: [],
      schedulesClose: [],
      schedulesComplete: [],
    }
  },
  methods: {
    filtering() {
      this.schedulesOpen = []
      this.schedulesClose = []
      this.schedulesComplete = []

      function leftPad(value) {
        if (value >= 10) {
          return value
        }
        return `0${value}`
      }
      const length = this.schedules.length
      const today = new Date()
      const year = today.getFullYear()
      const month = leftPad(today.getMonth() + 1)
      const date = leftPad(today.getDate())
      const hour = leftPad(today.getHours())
      const minute = leftPad(today.getMinutes())
      const currentTime = `${hour}:${minute}`
      const dateOfToday = [year, month, date].join('-')

      for (let i = 0; i < length; i++) {
        const schedule = this.schedules[i]
        const scheduleDateFormat = new Date(this.schedules[i].date)
        const elapsedDate = (today - scheduleDateFormat) / 86400000 // / 1000 / 60 / 60 / 24

        // 30일을 경과한 구인 => Continue
        // To Do: snapshot에서 부터 filtering 해오기
        if (elapsedDate > 30) {
          continue
        }
        if (
          schedule.date < dateOfToday ||
          (schedule.date === dateOfToday && schedule.endTime <= currentTime)
        ) {
          // 30일 이내 ~ 종료시간이 지난 구인 => Complete
          this.schedulesComplete.push(schedule)
        } else if (schedule.status === 0) {
          this.schedulesClose.push(schedule)
        } else if (schedule.status === 1) {
          this.schedulesOpen.push(schedule)
        }
      }
    },
    moveToRegist() {
      this.$router.push('FindPeopleRegist')
    },
  },
}
</script>

<style lang="scss" scoped>
.find-people-container {
  height: calc(100vh - 48px);
  .tabs-item {
    height: calc(100vh - 180px);
    overflow: scroll;
  }
}
</style>
