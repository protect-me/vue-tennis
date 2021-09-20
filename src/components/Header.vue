<template>
  <div>
    <v-app-bar dark dense max-height="48px" style="border: 1px solid red;">
      <!-- <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon> -->

      <v-toolbar-title>
        <router-link to="/" class="white--text" style="text-decoration: none;">
          🎾 👟
        </router-link>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-filter</v-icon>
      </v-btn>

      <v-btn icon>
        <router-link
          to="/about"
          class="white--text"
          style="text-decoration: none;"
        >
          <v-icon>mdi-dots-vertical</v-icon>
        </router-link>
      </v-btn>
    </v-app-bar>

    <!-- <v-navigation-drawer v-model="drawer" absolute temporary>
      <v-list nav>
        <v-list-item-group
          v-model="group"
          active-class="deep-purple--text text--accent-4"
        >
          <v-list-item>
            <v-list-item-title>Foo</v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Bar</v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Fizz</v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Buzz</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      // drawer: false,
      // group: null,
    }
  },
  watch: {
    // group() {
    //   this.drawer = false
    // },
  },
}
</script>

<style lang="scss" scoped>
/* .router-link-active {
  color: #fff;
  text-decoration: none;
  outline: none;
}
.router-link-active:hover,
.router-link-active:active {
  text-decoration: none;
  color: #fff;
} */
</style>
