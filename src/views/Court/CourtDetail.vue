<template>
  <v-container class="court-detail-container">
    <div class="court-detail-header">
      <TitleWithButton
        :titleText="court.courtName"
        goBackButton
        @goBackButtonClicked="goBackButtonClicked"
      />
      <v-divider class="my-3"></v-divider>
    </div>
    <div class="court-detail-content" v-if="court">
      <v-card>
        <v-card-text>
          <div>
            <span>총 코트 수:</span>
            <span>{{ court.courtTypes.length }}</span>
          </div>
          <div>
            <span>주소:</span>
            <span>{{ court.address }}</span>
          </div>
          <div>
            <span>유형:</span>
            <v-chip small v-for="(type, index) in court.types" :key="index">
              {{ type }}
            </v-chip>
          </div>
          <div>
            <span>코트:</span>
            <v-chip
              small
              v-for="(courType, index) in court.courtTypes"
              :key="index"
            >
              {{ courType }}
            </v-chip>
          </div>
          <div>{{ court.memo }}</div>
        </v-card-text>
      </v-card>
      <div class="my-5" style="display: flex;">
        <v-divider class="mt-3" />
        <div class="mx-3">게스트 모집 중인 공고</div>
        <v-divider class="mt-3" />
      </div>
      <FindPeopleCard
        v-for="(schedule, index) in schedules"
        :key="index"
        :schedule="schedule"
      ></FindPeopleCard>
      <v-card v-if="schedules && schedules.length === 0" flat>
        <v-card-text class="mt-12" align="center">
          해당 테니스장에는 게스트 모집 중인 공고가 없습니다 🎾
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
  components: {
    TitleWithButton,
    FindPeopleCard,
  },
  mounted() {
    this.$nextTick(function () {
      this.initData()
    })
  },
  computed: {
    ...mapState(['fireUser', 'user', 'court']),
  },
  data() {
    return {
      schedules: [],
    }
  },
  methods: {
    goBackButtonClicked() {
      this.$router.go(-1)
    },
    async initData() {
      try {
        const snapshot = await this.$firebase
          .firestore()
          .collection('findPeople')
          .orderBy('date')
          .orderBy('startTime')
          .get()
        this.schedules = snapshot.docs
          .filter(
            (value) =>
              value.data().courtId === this.court.courtId &&
              value.data().status === 1,
          )
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
        alert('에러 발생', err)
        console.log(err)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.court-detail-container {
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  overflow: scroll;
  .court-detail-content {
    height: calc(100vh - 120px);
    overflow: scroll;
  }
}
</style>
