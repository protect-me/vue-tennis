<template>
  <v-container class="mypage-container">
    <v-card v-if="fireUser">
      <div class="d-flex flex-no-wrap justify-space-between">
        <v-avatar class="ma-3" size="125" tile>
          <img :src="fireUser.photoURL" alt="photo" />
        </v-avatar>
        <div>
          <v-card-title class="text-h5">
            {{ fireUser.displayName }}
          </v-card-title>
          <v-card-subtitle class="pb-2">
            {{ fireUser.email }}
          </v-card-subtitle>

          <v-card-text class="py-0">
            <div>
              남 | 30 | 서울
            </div>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-chip small class="mt-1">
              NTRP 3.5
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
    // this.checkAdditionalInfo()
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
          text: '구인 내역',
          icon: 'mdi-account-search-outline',
          to: 'FindPeopleRecord',
        },
        {
          text: '참가 내역',
          icon: 'mdi-account-heart-outline',
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
        this.checkAdditionalInfo()
      }
    },
    checkAdditionalInfo() {
      if (
        this.fireUser &&
        (!this.fireUser.sex ||
          !this.fireUser.birth ||
          !this.fireUser.location ||
          !this.fireUser.ntrp)
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
}
.container {
  border: 2px solid red;
  .row {
    border: 2px solid green;
    .col {
      border: 2px solid blue;
    }
  }
}
</style>
