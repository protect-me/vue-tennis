<template>
  <div>
    <v-app-bar dark dense max-height="48px">
      <v-toolbar-title>
        <router-link to="/" class="white--text" style="text-decoration: none;">
          🎾
        </router-link>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <router-link
          to="FindPeopleHome"
          class="white--text"
          style="text-decoration: none;"
        >
          <v-icon :color="checkRoute('FindPeopleHome')">
            mdi-account-search-outline
          </v-icon>
        </router-link>
      </v-btn>

      <v-btn icon>
        <router-link
          to="Map"
          class="white--text"
          style="text-decoration: none;"
        >
          <v-icon :color="checkRoute('Map')">
            mdi-map-search-outline
          </v-icon>
        </router-link>
      </v-btn>

      <v-btn icon>
        <router-link
          to="CourtList"
          class="white--text"
          style="text-decoration: none;"
        >
          <v-icon :color="checkRoute('CourtList')">
            mdi-stadium
          </v-icon>
        </router-link>
      </v-btn>

      <v-btn icon>
        <router-link
          to="Mypage"
          class="white--text"
          style="text-decoration: none;"
        >
          <v-icon :color="checkRoute('Mypage')">
            mdi-account-circle-outline
          </v-icon>
        </router-link>
      </v-btn>
    </v-app-bar>
  </div>
</template>

<script>
export default {
  methods: {
    checkRoute(rt) {
      if (this.$route.name === rt) {
        return 'white'
      } else {
        return 'grey'
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.not-active {
  color: grey;
}
</style>
