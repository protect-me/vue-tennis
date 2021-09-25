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
      <v-tabs-items class="tabs-item" v-model="tab">
        <v-tab-item v-for="item in items" :key="item.tab">
          <component
            v-if="schedules"
            v-bind:is="item.content"
            :schedules="schedules"
          ></component>
        </v-tab-item>
      </v-tabs-items>
    </div>
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
  data() {
    return {
      findPeoples: [],
      tab: null,
      items: [
        { tab: '모집', content: 'FindPeopleOpen' },
        { tab: '마감', content: 'FindPeopleClose' },
        { tab: '완료', content: 'FindPeopleComplete' },
      ],
    }
  },
  methods: {
    moveToRegist() {
      this.$router.push('FindPeopleRegist')
    },
  },
}
</script>

<style lang="scss" scoped>
.find-people-container {
  width: 100%;
  height: calc(100vh - 48px);
  .tabs-item {
    height: calc(100vh - 180px);
    overflow: scroll;
  }
}
</style>
