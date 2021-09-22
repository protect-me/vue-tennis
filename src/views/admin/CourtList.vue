<template>
  <v-container class="court-list-container">
    <v-card flat>
      <div class="court-list-header">
        <div class="title font-weight-black">코트 리스트</div>
      </div>
      <v-divider class="my-3"></v-divider>
    </v-card>

    <v-data-table
      :headers="headers"
      :items="courts"
      :search="search"
      hide-default-footer
      mobile-breakpoint="1"
      disable-pagination
      sort-by="address"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
          <v-divider class="mx-3" inset vertical></v-divider>
          <v-btn color="primary" @click="moveToRegist">NEW</v-btn>
        </v-toolbar>
      </template>
      <template v-slot:[`item.address`]="{ item }">
        {{ item.addressSigungu }} {{ item.addressLocal }}
      </template>
      <template v-slot:[`item.addressJibun`]="{ item }">
        <v-icon class="mr-2" @click="moveToDetail(item)">
          mdi-arrow-right-bold-circle-outline
        </v-icon>
      </template>
      <template v-slot:no-data>No data</template>
    </v-data-table>
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
      headers: [
        {
          text: '코트명',
          align: 'start',
          // sortable: false,
          value: 'name',
        },
        { text: '위치', value: 'address' },
        { text: '', value: 'addressJibun', sortable: false },
        // { text: 'Carbs (g)', value: 'carbs' },
        // { text: 'Protein (g)', value: 'protein' },
        // { text: 'Iron (%)', value: 'iron' },
      ],
      search: '',
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
            const id = value.id
            const item = value.data()
            return {
              courtId: id,
              name: item.name,
              address: item.address,
              addressJibun: item.addressJibun,
              addressSigungu: item.addressSigungu,
              addressLocal: item.addressLocal,
              lat: item.lat,
              lng: item.lng,
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
    moveToDetail(item) {
      console.log(item)
    },
  },
}
</script>

<style lang="scss" scoped>
.court-list-container {
  width: 100%;
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
}
</style>
