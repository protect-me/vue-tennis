<template>
  <v-container class="find-people-record-container">
    <div class="find-people-record-header">
      <TitleWithButton
        titleText="게스트 참가 요청 기록"
        goBackButton
        @goBackButtonClicked="goBackButtonClicked"
      />
    </div>
    <v-divider class="my-3"></v-divider>

    <div class="find-people-record-content">
      <FindPeopleCard
        v-for="(schedule, index) in schedules"
        :key="index"
        :schedule="schedule"
      ></FindPeopleCard>

      <v-card v-if="schedules && schedules.length === 0" flat>
        <v-card-text class="mt-12" align="center">
          게스트 참가를 요청한 기록이 없습니다 🎾
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import TitleWithButton from '../../components/TitleWithButton'
import FindPeopleCard from '../FindPeople/FindPeopleCard'

export default {
  mounted() {
    if (this.user) this.initData()
  },
  components: {
    FindPeopleCard,
    TitleWithButton,
  },
  computed: {
    ...mapState(['fireUser', 'user']),
  },
  watch: {
    user() {
      this.initData()
    },
  },
  data() {
    return {
      schedules: [],
    }
  },
  methods: {
    goBackButtonClicked() {
      this.$router.push({ name: 'Mypage' })
    },
    async initData() {
      if (this.user.applicationList.length === 0) return
      const idList = this.user.applicationList
      try {
        const snapshot = await this.$firebase
          .firestore()
          .collection('findPeople')
          .orderBy('date')
          .orderBy('startTime')
          .get()
        this.schedules = snapshot.docs
          .filter((value) => idList.includes(value.id))
          .map((value) => {
            const id = value.id
            const item = value.data()
            return {
              scheduleId: id,
              organizer: item.organizer,
              organizerNickName: item.organizerNickName,
              courtName: item.courtName,
              courtType: item.courtType,
              date: item.date,
              startTime: item.startTime,
              endTime: item.endTime,
              ntrp: item.ntrp,
              vacant: item.vacant,
              total: item.total,
              contact: item.contact,
              cost: item.cost,
              memo: item.memo,
              participants: item.participants,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              status: item.status,
            }
          })
      } catch (err) {
        alert('데이터를 가져오는데 실패했습니다.', err)
        console.log(err)
      } finally {
        console.log(this.schedules)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.find-people-record-container {
  height: calc(100vh - 48px);
  .find-people-record-content {
    height: calc(100vh - 133px);
    overflow: scroll;
  }
}
</style>
