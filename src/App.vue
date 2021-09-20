<template>
  <v-app>
    <Header></Header>

    <v-main style="border: 1px solid red;">
      <router-view />
    </v-main>
    <!-- </v-sheet> -->
  </v-app>
</template>

<script>
import Header from '@/components/Header'
export default {
  components: {
    Header,
  },
  mounted() {
    console.log('here', this.$firebase)
  },
  data() {
    return {}
  },
}
</script>
