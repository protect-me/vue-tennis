<template>
  <div>
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

// props로 받은 걸 open인 것만 filtering 해서 새 객체에 할당
// watch로 props가 변경되는 것을 감지한 후에 update해주는 방향으로
// orderBy 추가 필요

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
