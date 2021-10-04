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
          <v-icon>mdi-account-group-outline</v-icon>
        </router-link>
      </v-btn>

      <v-btn icon>
        <router-link
          to="Map"
          class="white--text"
          style="text-decoration: none;"
        >
          <v-icon>mdi-map-search-outline</v-icon>
        </router-link>
      </v-btn>

      <v-btn icon>
        <router-link
          to="CourtList"
          class="white--text"
          style="text-decoration: none;"
        >
          <v-icon>mdi-stadium</v-icon>
        </router-link>
      </v-btn>

      <v-btn icon>
        <router-link
          to="/Mypage"
          class="white--text"
          style="text-decoration: none;"
        >
          <v-icon>mdi-account-circle-outline</v-icon>
        </router-link>
      </v-btn>
    </v-app-bar>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
}
</script>

<style lang="scss" scoped></style>
