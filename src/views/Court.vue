<template>
  <v-container class="court-container">
    <div>
      <div class="input-group mb-3">
        <v-text-field
          v-model="form.name"
          type="text"
          class="form-control"
          placeholder="코트명"
        />
      </div>
      <div class="input-group mb-3">
        <v-text-field
          v-model="form.address"
          type="text"
          class="form-control"
          placeholder="주소"
        />
      </div>
      <div class="input-group mb-3">
        <v-text-field
          v-model="form.lat"
          type="text"
          class="form-control"
          placeholder="코트명"
        />
      </div>
      <v-btn @click="createCourt">C</v-btn>
    </div>
    <div>
      <v-btn>R</v-btn>
    </div>
    <div>
      <v-btn>U</v-btn>
    </div>
    <div>
      <v-btn>D</v-btn>
    </div>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      isProcessing: false,
      form: {
        name: '',
        address: '',
        lat: 0,
        lng: 0,
        count: 0,
        type: [],
        memo: '',
      },
    }
  },
  methods: {
    async createCourt() {
      console.log('createCourt')
      if (this.isProcessing) {
        console.log('isProcessing!')
      }
      this.isProcessing = true
      try {
        await this.$firebase.firestore().collection('court').add(this.form)
        console.log('등록 성공')
      } catch (err) {
        alert('등록에 실패했습니다.', err.message)
        console.log('등록 실패', err.message)
      } finally {
        this.isProcessing = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.court-container {
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.court-container > div {
  margin-bottom: 30px;
}
</style>
