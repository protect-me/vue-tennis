<template>
  <div class="find-people-detail-container">
    <transition-group
      name="fade"
      @before-enter="beforeEnter"
      @after-enter="afterEnter"
      @enter-cancelled="afterEnter"
    >
      <FindPeopleCard
        v-for="(schedule, index) in schedules"
        :key="schedule.scheduleId"
        :data-index="index"
        :schedule="schedule"
      ></FindPeopleCard>
    </transition-group>
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
  methods: {
    beforeEnter(el) {
      el.style.transitionDelay = 200 * parseInt(el.dataset.index, 10) + 'ms'
    },
    afterEnter(el) {
      el.style.transitionDelay = ''
    },
  },
}
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
