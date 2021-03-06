<template>
  <v-container class="find-court-alert-container">
    <v-card flat>
      <div class="find-court-alert-header">
        <TitleWithButton
          titleText="영입/방출 알림"
          goBackButton
          @goBackButtonClicked="goBackButtonClicked"
        />
      </div>
      <v-divider class="my-3"></v-divider>
    </v-card>

    <div class="result">
      <FindPeopleCard
        v-for="(schedule, index) in schedules"
        :key="index"
        :schedule="schedule"
        :alertStatus="schedule.alertStatus"
        :createdAt="schedule.alertCreatedAt"
      ></FindPeopleCard>
      <v-card v-if="schedules && schedules.length === 0" flat>
        <v-card-text class="mt-12" align="center">
          영입/방출 알림이 없습니다 🎾
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
      try {
        const alertList = await this.$firebase
          .firestore()
          .collection('users')
          .doc(this.fireUser.uid)
          .collection('FindCourtAlert')
          .orderBy('createdAt', 'desc')
          .get()
        const alertScheduleIdList = alertList.docs.map(
          (value) => value.data().scheduleId,
        )
        const snapshot = await this.$firebase
          .firestore()
          .collection('findPeople')
          .get()
        const scheduleList = {}
        snapshot.docs
          .filter((value) => alertScheduleIdList.includes(value.id))
          .map((value) => {
            const id = value.id
            const item = value.data()
            scheduleList[id] = {
              scheduleId: id,
              organizer: item.organizer,
              organizerNickName: item.organizerNickName,
              courtName: item.courtName,
              courtType: item.courtType,
              date: item.date,
              startTime: item.startTime,
              endTime: item.endTime,
              ntrp: item.ntrp,
              assignment: item.assignment,
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
        this.schedules = alertList.docs.map((value) => {
          const id = value.id
          const item = value.data()
          return {
            id: id,
            applicantsId: item.applicantsId,
            alertCreatedAt: item.createdAt,
            alertStatus: item.alertStatus,
            ...scheduleList[item.scheduleId],
          }
        })
        if (this.user.alertParticipationToggle) {
          await this.$firebase
            .firestore()
            .collection('users')
            .doc(this.fireUser.uid)
            .update({ alertParticipationToggle: false })
        }
      } catch (err) {
        alert('영입/방출 알림을 가져오는게 실패했습니다.', err)
        console.log(err)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.find-court-alert-container {
  background-color: white;
  width: 100%;
  height: calc(100vh - 48px);
  .result {
    height: calc(100vh - 130px);
    overflow: scroll;
  }
}
</style>
