<template>
  <div class="find-people-detail-container">
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
</template>

<script>
import FindPeopleCard from './FindPeopleCard'

export default {
  props: {
    schedules: {
      type: Array,
      default: [],
    },
  },
  components: {
    FindPeopleCard,
  },
}
</script>

<style lang="scss" scoped></style>
