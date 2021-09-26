<template>
  <div class="title-wrapper">
    <v-btn
      v-if="goBackButton"
      tile
      icon
      color="gray"
      class="mr-1"
      @click="$emit('goBackButtonClicked')"
    >
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn>
    <div v-if="titleText" class="title-text title font-weight-black">
      {{ titleText }}
    </div>
    <v-spacer></v-spacer>
    <v-btn
      v-if="registNewButton"
      @click="$emit('registNewButtonClicked')"
      color="primary"
    >
      NEW
    </v-btn>
    <v-btn
      v-if="editButton"
      @click="$emit('editButtonClicked')"
      color="primary"
    >
      Edit
    </v-btn>
  </div>
</template>

<script>
export default {
  props: {
    titleText: {
      type: String,
      default: '',
    },
    goBackButton: {
      type: Boolean,
      default: false,
    },
    registNewButton: {
      type: Boolean,
      default: false,
    },
    editButton: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss" scoped>
.title-wrapper {
  display: flex;
  height: 36px;
  .title-text {
    margin-top: 2px;
  }
}
</style>
