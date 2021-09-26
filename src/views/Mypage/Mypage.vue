<template>
  <v-container class="mypage-container">
    <v-card v-if="user">
      <div class="user-info-card d-flex flex-no-wrap justify-space-between">
        <v-avatar class="ma-3" size="125" tile>
          <img :src="user.photoURL" alt="photo" />
        </v-avatar>
        <div>
          <v-card-title class="text-h6 pt-3 pl-0">
            {{ user.nickName || user.displayName }}
          </v-card-title>
          <v-card-subtitle class="pb-2 pl-0">
            {{ user.email }}
          </v-card-subtitle>

          <v-card-text class="py-0 pl-0">
            <div>
              <span v-if="user.sex">
                {{ user.sex === 1 ? '남' : '여' }}
              </span>
              <span class="mx-1">|</span>
              <span v-if="user.birth">
                {{ userAge }}
              </span>
              <span class="mx-1">|</span>
              <span v-if="user.location" v-text="user.location"></span>
            </div>

            <div></div>
          </v-card-text>

          <v-card-actions class="pt-1 pb-0 pl-0">
            <v-spacer></v-spacer>
            <v-chip small class="mt-1">
              <span class="mr-1">NTRP</span>
              <span v-if="user.ntrp" v-text="user.ntrp"></span>
            </v-chip>
          </v-card-actions>
        </div>
      </div>
    </v-card>

    <v-card v-else>
      <div class="d-flex flex-no-wrap justify-space-between">
        <v-avatar class="ma-3" size="125" tile>
          <v-icon x-large>mdi-account-circle-outline</v-icon>
        </v-avatar>
        <div
          class="mr-10"
          style="display: flex; justify-content: center; align-items: center;"
        >
          <v-btn
            :disabled="isProcessing"
            @click="loginWithGoogle"
            :loading="isProcessing"
            color="primary"
          >
            <v-icon left dark>
              mdi-google-plus
            </v-icon>
            <span>
              구글 로그인
            </span>
          </v-btn>
        </div>
      </div>
    </v-card>

    <v-list nav class="mt-5">
      <v-list-item-group v-model="selectedItem" color="primary">
        <v-list-item v-for="(item, i) in items" :key="i" :to="item.to">
          <v-list-item-icon>
            <v-icon v-text="item.icon"></v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title v-text="item.text"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="fireUser" @click="logout">
          <v-list-item-icon>
            <v-icon>mdi-logout-variant</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>로그아웃</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'

export default {
  mounted() {
    this.checkAdditionalInfo()
  },
  data() {
    return {
      addtionalUserInfoToggle: false,
      isProcessing: false,
      selectedItem: 0,
      items: [
        {
          text: '정보 수정',
          icon: 'mdi-badge-account-horizontal-outline',
          to: 'EditUserInfo',
        },
        {
          text: '게스트 모집 내역',
          icon: 'mdi-account-search-outline',
          to: 'FindPeopleRecord',
        },
        {
          text: '참가 요청 내역',
          icon: 'mdi-account-heart-outline',
          to: 'FindCourtRecord',
        },
        {
          text: '참가 확정 내역',
          icon: 'mdi-account-check-outline',
          to: 'FindCourtRecord',
        },
        {
          text: '운영 정책',
          icon: 'mdi-laptop',
          to: 'OperationPolicy',
        },
        // { text: '참가 내역', icon: 'mdi-folder' },
        // { text: 'Offline', icon: 'mdi-check-circle' },
        // { text: 'Uploads', icon: 'mdi-upload' },
        // { text: 'Backups', icon: 'mdi-cloud-upload' },
      ],
    }
  },
  computed: {
    ...mapState(['fireUser', 'user']),
    userAge() {
      return Math.floor((new Date().getFullYear() - this.user.birth) / 10) * 10
    },
  },
  watch: {
    user() {
      this.checkAdditionalInfo()
    },
  },
  methods: {
    async loginWithGoogle() {
      if (this.isProcessing) return
      this.isProcessing = true
      const provider = new this.$firebase.auth.GoogleAuthProvider()

      this.$firebase.auth().languageCode = 'ko'
      try {
        const snapshot = await this.$firebase.auth().signInWithPopup(provider)
        console.log('로그인 성공')
      } catch (err) {
        alert('로그인에 실패했습니다.', err)
        console.log(err)
      } finally {
        this.isProcessing = false
      }
    },
    checkAdditionalInfo() {
      if (
        this.user &&
        (!this.user.sex ||
          !this.user.birth ||
          !this.user.location ||
          !this.user.ntrp)
      ) {
        this.$router.push('EditUserInfo')
      }
    },
    logout() {
      this.$firebase.auth().signOut()

      alert('로그아웃 되었습니다')
    },
  },
}
</script>

<style lang="scss" scoped>
.mypage-container {
  width: 100%;
  height: 100%;
  .user-info-card > * {
    overflow: hidden;
  }
}
</style>
