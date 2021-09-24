<template>
  <v-container class="find-people-container">
    <v-card flat>
      <TitleWithButton
        titleText="인력 시장"
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
    <v-tabs-items v-model="tab">
      <v-tab-item v-for="item in items" :key="item.tab">
        <v-card flat>
          <v-card-text>
            <component v-bind:is="item.content"></component>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
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
  data() {
    return {
      tab: null,
      items: [
        { tab: '구인', content: 'FindPeopleOpen' },
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
  .find-people-header {
    display: flex;
  }
}
</style>
