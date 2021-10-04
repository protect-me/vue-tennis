<template>
  <v-container
    :class="{
      'court-list-container': true,
      fullscreen: mode === 'select',
    }"
  >
    <v-card flat>
      <TitleWithButton
        titleText="테니스장 리스트"
        :registNewButton="mode === 'view'"
        @registNewButtonClicked="goToRegist"
      />
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
        </v-toolbar>
      </template>
      <template v-slot:[`item.address`]="{ item }">
        {{ item.addressSigungu }} {{ item.addressLocal }}
      </template>
      <template v-slot:[`item.addressJibun`]="{ item }">
        <v-icon v-if="mode === 'view'" class="mr-2" @click="goToDetail(item)">
          mdi-arrow-right-bold-circle-outline
        </v-icon>
        <v-icon
          v-if="mode === 'select'"
          class="mr-2"
          @click="selectCourt(item)"
        >
          mdi-check-circle-outline
        </v-icon>
      </template>
      <template v-slot:no-data>No data</template>
    </v-data-table>
    <v-spacer v-if="mode === 'select'" />
    <v-btn
      v-if="mode === 'select'"
      style="max-height: 36px;"
      block
      color="error"
      @click="closeSelectDialog"
    >
      취소
    </v-btn>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import TitleWithButton from '../../components/TitleWithButton'

export default {
  components: {
    TitleWithButton,
  },
  props: {
    mode: {
      type: String,
      default: 'view', // select || view
    },
  },
  created() {
    this.subscribe()
  },
  unmounted() {
    if (this.unsubscribe) this.unsubscribe()
  },
  computed: {
    ...mapState(['fireUser', 'user']),
  },
  data() {
    return {
      unsubscribe: null,
      courts: [],
      headers: [
        {
          text: '코트명',
          align: 'start',
          // sortable: false,
          value: 'courtName',
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
              courtName: item.courtName,
              address: item.address,
              addressJibun: item.addressJibun,
              addressSigungu: item.addressSigungu,
              addressLocal: item.addressLocal,
              lat: item.lat,
              lng: item.lng,
              count: item.count,
              types: item.types,
              courtTypes: item.courtTypes,
              memo: item.memo,
            }
          })
        })
    },
    goToRegist() {
      if (this.user && this.user.updateNickName) {
        this.$router.push('CourtRegist')
      } else {
        alert('회원 정보를 확인해주세요!')
        this.$router.push('Mypage')
      }
    },
    async goToDetail(item) {
      await this.$store.dispatch('setCourt', item)
      this.$router.push('CourtDetail')
    },
    selectCourt(item) {
      this.$emit('selectCourt', item)
    },
    closeSelectDialog() {
      this.$emit('closeSelectDialog')
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
.court-list-container.fullscreen {
  height: 100vh;
}
</style>
