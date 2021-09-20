<template>
  <v-container class="map-container pa-0">
    <div id="map"></div>
  </v-container>
</template>

<script>
export default {
  mounted() {
    window.kakao && window.kakao.maps
      ? this.initMap()
      : this.addKakaoMapScript()
    // this.handleResize()
    // window.addEventListener('resize', this.handleResize)
  },

  methods: {
    addKakaoMapScript() {
      const script = document.createElement('script')
      /* global kakao */
      script.onload = () => kakao.maps.load(this.initMap)
      script.src = `http://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${process.env.VUE_APP_KAKAO_MAP_JAVASCRIPT_KEY}`
      document.head.appendChild(script)
    },
    initMap() {
      var container = document.getElementById('map') //지도를 담을 영역의 DOM 레퍼런스
      var options = {
        // 지도 생성 기본 옵션
        // center: new kakao.maps.LatLng(37.5662952, 126.9757511), //지도의 중심좌표. // 서울 중심
        // center: new kakao.maps.LatLng(37.555946, 126.9635623), //지도의 중심좌표. // 서울역
        center: new kakao.maps.LatLng(37.5609532, 126.9789347), //지도의 중심좌표. // 시청
        level: 8, //지도의 레벨(확대, 축소 정도)
      }

      var map = new kakao.maps.Map(container, options) //지도 생성 및 객체 리턴

      var zoomControl = new kakao.maps.ZoomControl() //줌 컨트롤 생성
      map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT)
      this.map = map
      // this.setMarker()
    },
  },
}
</script>

<style lang="scss" scoped>
.map-container {
  width: 100%;
  height: 100%;
}
#map {
  width: 100%;
  height: 100%;
  /* background-color: gray;
  min-width: 200px;
  min-height: 200px; */
}
</style>
