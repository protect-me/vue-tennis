<template>
  <div>
    <v-card>
      <v-card-subtitle>
        <span>Notice. 최근 30일 이내의 데이터만 노출됩니다 🎾</span>
      </v-card-subtitle>
    </v-card>
    <FindPeopleCard
      v-for="(schedule, index) in schedules"
      :key="index"
      :schedule="schedule"
    ></FindPeopleCard>

    <v-card v-if="schedules && schedules.length === 0" flat>
      <v-card-text class="mt-12" align="center">
        완료된 데이터가 없습니다 🎾
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
  data() {
    return {}
  },
  methods: {},
}
</script>

<style></style>
