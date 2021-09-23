<template>
  <v-container class="find-people-container">
    <v-card flat>
      <div class="find-people-header">
        <div class="title font-weight-black">인력시장</div>
        <v-spacer></v-spacer>
        <v-btn color="primary" small @click="moveToRegist">NEW</v-btn>
      </div>
      <v-divider class="my-3"></v-divider>
    </v-card>

    <!-- <v-btn small text color="primary">
          <v-icon>
            mdi-filter-variant
          </v-icon>
        </v-btn> -->

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

    <!-- <v-tabs-items v-model="tab">
      <v-tab-item v-for="item in items" :key="item">
        <v-card color="basil" flat>
          <v-card-text>{{ text }}</v-card-text>
          
        </v-card>
      </v-tab-item>
    </v-tabs-items> -->
  </v-container>
</template>

<script>
import FindPeopleOpen from './FindPeopleOpen'
import FindPeopleClose from './FindPeopleClose'
import FindPeopleComplete from './FindPeopleComplete'

export default {
  components: {
    FindPeopleOpen,
    FindPeopleClose,
    FindPeopleComplete,
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
