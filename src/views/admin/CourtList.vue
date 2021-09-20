<template>
  <v-container class="court-list-container">
    <div>list</div>
    <div v-for="(court, index) in courts" :key="index">
      <div>{{ index }} = {{ court.name }} / {{ court.address }}</div>
    </div>

    <v-btn class="btn btn-sm" @click="moveToRegist">
      신규 등록
    </v-btn>
  </v-container>
</template>

<script>
export default {
  created() {
    this.subscribe()
  },
  unmounted() {
    if (this.unsubscribe) this.unsubscribe()
  },
  data() {
    return {
      courts: [],
    }
  },
  methods: {
    subscribe() {
      // .orderBy('createdAt', 'desc')
      this.unsubscribe = this.$firebase
        .firestore()
        .collection('courts')
        .onSnapshot((snapshot) => {
          if (snapshot.empty) {
            this.courts = []
            return
          }
          this.courts = snapshot.docs.map((value) => {
            const item = value.data()
            return {
              name: item.name,
              address: item.address,
              lat: value.lat,
              lng: value.lng,
              count: item.count,
              type: item.type,
              memo: item.memo,
            }
          })
        })
      console.log('courts', this.courts)
    },
    moveToRegist() {
      console.log('moveToRegist')
      this.$router.push('CourtRegist')
    },
  },
}
</script>

<style lang="scss" scoped>
.court-list-container {
  border: 1px solid red;
}
</style>
