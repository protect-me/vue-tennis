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
        <span class="mr-2">{{ item.tab }}</span>
        <v-icon>{{ item.icon }}</v-icon>
      </v-tab>
    </v-tabs>
    <v-tabs-items class="tabs-item" v-model="tab" v-if="schedules">
      <v-tab-item class="tab-item">
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
      this.tab = this.selectedTab
    })
  },
  async beforeDestroy() {
    await this.$store.dispatch('setSelectedTab', this.tab)
    if (this.unsubscribeFindPeople) {
      this.unsubscribeFindPeople()
    }
  },
  computed: {
    ...mapGetters(['unsubscribeFindPeople']),
    ...mapState(['fireUser', 'user', 'schedules', 'selectedTab']),
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
        { tab: '모집', icon: 'mdi-door-open', content: 'FindPeopleOpen' },
        { tab: '마감', icon: 'mdi-door-closed', content: 'FindPeopleClose' },
        {
          tab: '완료',
          icon: 'mdi-door-closed-lock',
          content: 'FindPeopleComplete',
        },
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

      // 모집(1) / 마감(2) / 완료(3) / 기간만료(-)
      const length = this.schedules.length
      function leftPad(value) {
        return value >= 10 ? value : `0${value}`
      }

      const now = new Date()
      const dateOfToday = `${now.getFullYear()}-${leftPad(
        now.getMonth() + 1,
      )}-${leftPad(now.getDate())}`
      const currentTime = `${leftPad(now.getHours())}:${leftPad(
        now.getMinutes(),
      )}`

      for (let i = 0; i < length; i++) {
        const schedule = this.schedules[i]
        const scheduleDateFormat = new Date(this.schedules[i].date)
        const elapsedDate = (now - scheduleDateFormat) / 86400000 // / 1000 / 60 / 60 / 24

        // 30일을 경과한 모집 => Continue
        // To Do: snapshot에서 부터 filtering 해오기
        if (elapsedDate > 30) {
          continue
        } else if (
          schedule.date < dateOfToday ||
          (schedule.date === dateOfToday && schedule.endTime <= currentTime)
        ) {
          // 30일 이내 ~ 종료시간이 지난 모집 => Complete
          schedule.status = 3 // status를 3으로 변경 후 push
          this.schedulesComplete.push(schedule)
        } else if (schedule.status === 2) {
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
    padding: 0px 2px;
    height: calc(100vh - 180px);
    overflow: scroll;
    .tab-item {
      margin-top: 5px;
    }
  }
}
</style>
