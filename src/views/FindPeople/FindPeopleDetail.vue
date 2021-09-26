<template>
  <v-container>
    <div class="find-people-regist-header">
      <TitleWithButton
        titleText="게스트 모집 상세"
        goBackButton
        :editButton="fireUser.uid === schedule.organizer"
        @editButtonClicked="editButtonClicked"
        @goBackButtonClicked="goBackButtonClicked"
      />
    </div>
    <v-divider class="my-3"></v-divider>
    <v-card class="find-people-card-container">
      <div class="left">
        <v-card-title class="title-container mb-0 pa-2">
          <div class="title-year">{{ scheduleDate.year }}</div>
          <div class="title-etc">
            <div class="title-month">{{ scheduleDate.month }}</div>
            <div class="title-date">{{ scheduleDate.date }}</div>
          </div>
        </v-card-title>
        <v-card-subtitle class="ma-0">
          {{ scheduleDate.dayOfWeek }}요일
        </v-card-subtitle>
      </div>

      <div class="right">
        <v-card-text class="right-wrapper">
          <div class="divide-column">
            <div>
              <v-icon class="mr-1 mb-1" small>
                mdi-clock-time-four-outline
              </v-icon>
              <span>{{ schedule.startTime }} ~ {{ schedule.endTime }}</span>
            </div>
            <div>
              <v-icon class="mr-1 mb-1" small>mdi-sofa-single-outline</v-icon>
              <span>{{ schedule.total - schedule.vacant + ' / ' }}</span>
              <span>{{ schedule.total }}</span>
            </div>
          </div>

          <div class="divide-column">
            <div>
              <v-icon class="mr-1 mb-1" small>mdi-map-marker-outline</v-icon>
              <span>{{ schedule.name }}</span>
            </div>
            <div>
              <v-icon class="mr-1 mb-1" small>mdi-tennis</v-icon>
              <span>NTRP {{ schedule.ntrp }}</span>
            </div>
          </div>

          <div class="divide-column">
            <div>
              <v-icon class="mr-1 mb-1" small>
                mdi-account-cowboy-hat-outline
              </v-icon>
              <span>{{ schedule.organizerNickName }}</span>
            </div>
            <div>
              <v-icon class="mr-1 mb-1" small>mdi-cash-multiple</v-icon>
              <span>{{ Number(schedule.cost).toLocaleString('ko-KR') }}</span>
            </div>
          </div>

          <div class="memo">
            <div class="memo-icon">
              <v-icon class="mr-1 mb-1" small>mdi-bullhorn-outline</v-icon>
            </div>
            <div class="memo-text">
              <span>{{ schedule.memo }}</span>
            </div>
          </div>
        </v-card-text>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import TitleWithButton from '../../components/TitleWithButton'

export default {
  components: {
    TitleWithButton,
  },

  computed: {
    ...mapState(['fireUser', 'user', 'schedule']),
    scheduleDate() {
      const week = ['일', '월', '화', '수', '목', '금', '토']
      const dayOfWeek = week[new Date(this.schedule.date).getDay()]
      const spread = this.schedule.date.split('-')
      return {
        year: spread[0],
        month: spread[1],
        date: spread[2],
        dayOfWeek: dayOfWeek,
      }
    },
  },
  methods: {
    goBackButtonClicked() {
      this.$router.go(-1)
    },
    editButtonClicked() {
      console.log('editButtonClicked')
    },
  },
}
</script>

<style lang="scss" scoped>
.find-people-card-container {
  display: flex;
  margin: 0px 2px;
  width: calc(100% - 4px);
  .left {
    min-width: 70px;
    .title-container {
      display: flex;
      flex-direction: column;
      .title-year {
        font-size: 12px;
      }
      .title-etc {
        .title-month {
        }
        .title-date {
          margin-top: -10px;
        }
      }
    }
  }
  .right {
    flex-grow: 1;
    .right-wrapper {
      .divide-column {
        display: flex;
        justify-content: space-between;
      }
      .memo {
        display: flex;
        .memo-text {
          /* white-space: nowrap; */
          /* text-overflow: ellipsis; */
          height: 48.6px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }
    }
  }
}
</style>
