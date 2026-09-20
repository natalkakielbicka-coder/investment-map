<script setup>
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  center: {
    type: Object,
    default: null,
  },
})

const mapContainer = ref(null)
let map = null
let marker = null

onMounted(() => {
  map = L.map(mapContainer.value).setView([52.2297, 21.0122], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)
})

watch(
  () => props.center,
  (newCenter) => {
    if (!newCenter || !map) return

    map.setView([newCenter.lat, newCenter.lon], 16)

    if (marker) {
      marker.remove()
    }

    marker = L.marker([newCenter.lat, newCenter.lon]).addTo(map)
  },
)
</script>

<template>
  <div ref="mapContainer" class="map"></div>
</template>

<style scoped>
.map {
  height: 500px;
  width: 100%;
}
</style>
