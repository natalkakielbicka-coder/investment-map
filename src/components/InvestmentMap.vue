<script setup>
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchNearbyPlaces } from '../composables/useOverpass.js'

const props = defineProps({
  center: {
    type: Object,
    default: null,
  },
})

const mapContainer = ref(null)
let map = null
let marker = null
let circle = null
let placeMarkers = []

const GROUP_COLORS = {
  family: '#27ae60',
  food: '#e67e22',
  shopping: '#8e44ad',
  health: '#e74c3c',
  recreation: '#16a085',
  services: '#2980b9',
  transport: '#7f8c8d',
  other: '#34495e',
}

const createPinIcon = (color) => {
  const svg = `
    <svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z" fill="${color}" />
      <circle cx="12" cy="12" r="5" fill="white" />
    </svg>
  `

  return L.divIcon({
    html: svg,
    className: 'pin-icon',
    iconSize: [24, 32],
    iconAnchor: [12, 32],
  })
}

const radiusMeters = ref(400)

const setRadius = (meters) => {
  radiusMeters.value = meters
}

const radiusLabel = (meters) => {
  if (meters === 400) return '5 min pieszo'
  if (meters === 800) return '10 min pieszo'
  return '15 min pieszo'
}

const clearPlaceMarkers = () => {
  placeMarkers.forEach((placeMarker) => placeMarker.remove())
  placeMarkers = []
}

const loadNearbyPlaces = async (lat, lon) => {
  clearPlaceMarkers()

  const places = await fetchNearbyPlaces(lat, lon, radiusMeters.value)

  places.forEach((place) => {
    const placeMarker = L.marker([place.lat, place.lon], {
      icon: createPinIcon(GROUP_COLORS[place.group] || GROUP_COLORS.other),
    })
      .addTo(map)
      .bindTooltip(place.name)

    placeMarkers.push(placeMarker)
  })
}

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

    if (circle) {
      circle.remove()
    }

    marker = L.marker([newCenter.lat, newCenter.lon]).addTo(map)
    circle = L.circle([newCenter.lat, newCenter.lon], { radius: radiusMeters.value }).addTo(map)
    circle.bindTooltip(radiusLabel(radiusMeters.value), { permanent: true, direction: 'top' })
    loadNearbyPlaces(newCenter.lat, newCenter.lon)
  },
)

watch(radiusMeters, () => {
  if (!props.center || !map) return

  if (circle) {
    circle.remove()
  }

  circle = L.circle([props.center.lat, props.center.lon], { radius: radiusMeters.value }).addTo(map)
  circle.bindTooltip(radiusLabel(radiusMeters.value), { permanent: true, direction: 'top' })
})
</script>

<template>
  <div class="radius-controls">
    <button type="button" @click="setRadius(400)">5 min</button>
    <button type="button" @click="setRadius(800)">10 min</button>
    <button type="button" @click="setRadius(1200)">15 min</button>
  </div>

  <div ref="mapContainer" class="map"></div>
</template>

<style scoped>
.map {
  height: 500px;
  width: 100%;
}

.radius-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.radius-controls button {
  padding: 0.4rem 0.8rem;
  cursor: pointer;
}
</style>
