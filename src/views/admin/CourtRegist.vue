<template>
  <v-container class="court-container" style="border: 1px solid red;">
    <div class="title">
      신규 코트 등록
    </div>
    <v-divider class="my-3"></v-divider>
    <div class="subtitle mb-3">
      정확한 정보를 입력해주세요
    </div>
    <v-form>
      <v-text-field
        class="mb-3"
        label="코트명"
        v-model="form.name"
        type="text"
        outlined
        hide-details
      />
      <v-text-field
        class="mb-3"
        label="주소"
        v-model="form.address"
        @click="openAddressDialog"
        readonly
        type="text"
        outlined
        hide-details
      />
      <v-textarea
        class="mb-3"
        label="메모"
        v-model="form.memo"
        type="text"
        outlined
        hide-details
      />
      <v-btn block color="primary" @click="registNewCourt">신규 등록</v-btn>
    </v-form>

    <v-dialog v-if="addressDialogToggle" v-model="addressDialogToggle">
      <VueDaumPostcode @complete="addressSelected($event)">
        <!-- <div slot="loading" style="height: 50px; width: 50px;">
          <v-progress-circular
            indeterminate
            color="white"
            :size="50"
          ></v-progress-circular>
          <span class="white--text">
            loading...
          </span>
        </div> -->
      </VueDaumPostcode>
      <v-btn color="error" class="mt-5" @click="addressDialogToggle = false">
        close
      </v-btn>
    </v-dialog>
  </v-container>
</template>

<script>
import { VueDaumPostcode } from 'vue-daum-postcode'
import axios from 'axios'

export default {
  components: {
    VueDaumPostcode,
  },
  data() {
    return {
      isProcessing: false,
      addressDialogToggle: false,
      form: {
        name: '',
        address: '',
        addressSigungu: '',
        addressLocal: '',
        addressJibun: '',
        lat: 0,
        lng: 0,
        count: 0,
        type: [],
        memo: '',
      },
    }
  },
  methods: {
    openAddressDialog() {
      console.log('openAddressDialog')
      this.addressDialogToggle = true
    },
    addressSelected(selectedAddress) {
      this.form.address = selectedAddress.roadAddress
      this.form.addressSigungu = selectedAddress.sigungu
      this.form.addressLocal = selectedAddress.bname
      if (selectedAddress.autoJibunAddress) {
        this.form.addressJibun = selectedAddress.autoJibunAddress
      } else if (selectedAddress.jibunAddress) {
        this.form.addressJibun = selectedAddress.jibunAddress
      }
      console.log('selectedAddress', selectedAddress)
      this.addressDialogToggle = false
    },
    async registNewCourt() {
      console.log('registNewCourt')
      if (this.isProcessing) {
        console.log('isProcessing!')
      }
      this.isProcessing = true
      try {
        await this.$firebase.firestore().collection('courts').add(this.form)
        console.log('등록 성공')
      } catch (err) {
        alert('등록에 실패했습니다.', err.message)
        console.log('등록 실패', err.message)
      } finally {
        this.isProcessing = false
      }
      this.$router.push('CourtList')
    },
  },
}
</script>

<style lang="scss" scoped>
.court-regist-container {
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.court-regist-container > div {
  margin-bottom: 30px;
}
</style>
