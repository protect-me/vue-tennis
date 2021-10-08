<template>
  <v-container class="mypage-container">
    <v-card v-if="user">
      <UserCard :user="user"></UserCard>
    </v-card>
    <v-card v-else>
      <div class="d-flex flex-no-wrap justify-space-between">
        <v-avatar class="ma-3" size="125" tile>
          <v-icon x-large>mdi-account-circle-outline</v-icon>
        </v-avatar>
        <div
          class="mr-10"
          style="
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          "
        >
          <div>
            <v-btn
              @click="loginWithGoogle"
              :disabled="isProcessing"
              :loading="isProcessing"
              color="primary"
              class="mb-3"
              width="140px"
            >
              <v-icon left dark>
                mdi-google-plus
              </v-icon>
              <span>구글 로그인</span>
            </v-btn>
          </div>
          <div>
            <v-btn
              @click="loginWithKakao"
              :disabled="isProcessing"
              :loading="isProcessing"
              color="rgba(252,228,77)"
              width="140px"
            >
              <v-icon left dark small>
                mdi-message-outline
              </v-icon>
              <span>카카오 로그인</span>
            </v-btn>
          </div>
        </div>
      </div>
    </v-card>

    <!-- 게스트 모집 -->
    <v-list-group
      :value="user && user.alertApplicationToggle"
      no-action
      class="mt-5"
    >
      <template v-slot:activator>
        <v-list-item-icon>
          <v-icon>mdi-account-search-outline</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            게스트 모집
          </v-list-item-title>
        </v-list-item-content>
      </template>

      <v-list-item
        v-for="(item, index) in findPeopleGroup"
        :key="index"
        link
        :to="item.to"
      >
        <v-list-item-content>
          <v-list-item-title
            v-if="(item.type === 'alert' && user && user.alertApplicationToggle)"
          >
            <v-badge color="pink" dot>
              <span>{{ item.text }}</span>
            </v-badge>
          </v-list-item-title>
          <v-list-item-title v-else v-text="item.text"></v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list-group>

    <!-- 게스트 요청 -->
    <v-list-group :value="user && user.alertParticipationToggle" no-action>
      <template v-slot:activator>
        <v-list-item-icon>
          <v-icon>mdi-calendar-search</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            게스트 참가
          </v-list-item-title>
        </v-list-item-content>
      </template>

      <v-list-item
        v-for="(item, index) in applyRecordGroup"
        :key="index"
        link
        :to="item.to"
      >
        <v-list-item-title
          v-if="(item.type === 'alert' && user && user.alertParticipationToggle)"
        >
          <v-badge color="pink" dot>
            <span>{{ item.text }}</span>
          </v-badge>
        </v-list-item-title>
        <v-list-item-title v-else v-text="item.text"></v-list-item-title>
      </v-list-item>
    </v-list-group>

    <v-list nav>
      <v-list-item-group v-model="selectedItem" color="primary">
        <!-- 회원 정보 수정 / 운영 정책 -->
        <v-list-item v-for="(item, i) in items" :key="i" :to="item.to">
          <v-list-item-icon>
            <v-icon v-text="item.icon"></v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="item.text"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- 로그아웃 -->
        <!-- <v-list-item v-if="fireUser" @click="logout"> -->
        <v-list-item @click="logout">
          <v-list-item-icon>
            <v-icon>mdi-logout-variant</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>로그아웃</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="check">
          <v-list-item-icon>
            <v-icon>mdi-logout-variant</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>check</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-container>
</template>

<script>
import UserCard from '../../components/UserCard'
import { mapState } from 'vuex'
// import firebase from 'firebase'
// import KakaoAuth from '@/shared/KakaoAuth'

if (!window.Kakao.isInitialized()) {
  window.Kakao.init(process.env.VUE_APP_KAKAO_JAVASCRIPT_KEY)
  window.Kakao.isInitialized()
}

export default {
  components: {
    UserCard,
  },
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
          text: '회원 정보 수정',
          icon: 'mdi-badge-account-horizontal-outline',
          to: 'EditUserInfo',
        },
        {
          text: '운영 정책',
          icon: 'mdi-laptop',
          to: 'OperationPolicy',
        },
      ],
      findPeopleGroup: [
        {
          text: '게스트 모집 기록',
          icon: 'mdi-account-search-outline',
          type: '',
          to: 'FindPeopleRecord',
        },
        {
          text: '참가 요청/취소 알림',
          icon: 'mdi-account-search-outline',
          type: 'alert',
          to: 'FindPeopleAlert',
        },
      ],
      applyRecordGroup: [
        {
          text: '게스트 참가 요청 기록',
          icon: 'mdi-account-heart-outline',
          type: '',
          to: 'FindCourtRecord',
        },
        {
          text: '영입/방출 알림',
          icon: 'mdi-account-check-outline',
          type: 'alert',
          to: 'FindCourtAlert',
        },
      ],
    }
  },
  computed: {
    ...mapState(['fireUser', 'user']),
  },
  watch: {
    user() {
      this.checkAdditionalInfo()
    },
  },
  methods: {
    check() {
      const protocol = location.protocol
      const hostName = location.hostname
      const port = location.port

      let url = protocol + '//' + hostName + (port ? ':' + port : '')
      // url += '/#/signupfinish';
      url += '/mypage/callback/kakaotalk'
      console.log('?????', url)
    },
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
    loginWithKakao() {
      const protocol = location.protocol
      const hostName = location.hostname
      const port = location.port

      let url = protocol + '//' + hostName + (port ? ':' + port : '')
      // url += '/#/signupfinish';
      url += '/mypage/callback/kakaotalk'
      console.log('?????', url)

      // const auth = new KakaoAuth();
      // auth.auth();
      window.Kakao.Auth.authorize({
        redirectUri: url,
        // , state:""
        // , scope:""
        throughTalk: true,
      })
    },
    // async loginWithKakao() {
    //   try {
    //     if (!Kakao) {
    //       alert('로그인 실패')
    //       console.log('Kakao 인스턴스가 존재하지 않습니다.')
    //     } else if (Kakao.Auth.getAccessToken()) {
    //       console.log('이미 로그인 되어있습니다.')
    //     }
    //     await Kakao.Auth.login({
    //       success: (auth) => {
    //         console.log('로그인 성공', auth)
    //         // this.getFirebaseJwt(auth.access_token)
    //       },
    //       fail: (err) => {
    //         console.log(err)
    //       },
    //     })
    //   } catch (err) {
    //     alert('로그인 실패')
    //     console.error(err)
    //   }
    // },
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
      const answer = window.confirm('로그아웃 하시겠습니까?')
      if (answer) {
        if (Kakao.Auth.getAccessToken()) {
          Kakao.Auth.logout(() => {
            console.log('카카오 로그아웃 성공')
          })
        } else {
          this.$firebase.auth().signOut()
          console.log('구글 로그아웃 성공')
        }
        alert('로그아웃 되었습니다')
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.mypage-container {
  height: calc(100vh - 48px);
}
</style>
