<template>
  <v-container class="find-people-record-container">
    <v-card flat>
      <div class="find-people-record-header">
        <TitleWithButton titleText="게스트 모집 내역" goBackButton />
      </div>
      <v-divider class="my-3"></v-divider>
    </v-card>

    <div class="result">
      <FindPeopleCard
        v-for="(schedule, index) in schedules"
        :key="index"
        :schedule="schedule"
      ></FindPeopleCard>

      <v-card v-if="schedules && schedules.length === 0" flat>
        <v-card-text class="mt-12" align="center">
          모집 중인 데이터가 없습니다 🎾
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
    async initData() {
      if (this.user.findPeopleList.length === 0) return
      const idList = this.user.findPeopleList
      try {
        const snapshot = await this.$firebase
          .firestore()
          .collection('findPeople')
          .get()
        this.schedules = snapshot.docs
          .filter((value) => idList.includes(value.id))
          .map((value) => {
            const id = value.id
            const item = value.data()
            return {
              findPeopleId: id,
              organizer: item.organizer,
              organizerNickName: item.organizerNickName,
              name: item.name,
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
  .result {
    height: calc(100vh - 140px);
    overflow: scroll;
  }
}
</style>
