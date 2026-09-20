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

const GROUP_LABELS = {
  family: 'Edukacja i dzieci',
  food: 'Jedzenie i rozrywka',
  shopping: 'Zakupy',
  health: 'Zdrowie',
  recreation: 'Rekreacja',
  services: 'Usługi',
  transport: 'Transport',
  other: 'Inne',
}

const createPinIcon = (color, scale = 1) => {
  const width = 24 * scale
  const height = 32 * scale

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z" fill="${color}" />
      <circle cx="12" cy="12" r="5" fill="white" />
    </svg>
  `

  return L.divIcon({
    html: svg,
    className: 'pin-icon',
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    tooltipAnchor: [0, -height],
  })
}

const radiusMeters = ref(400)

const setRadius = (meters) => {
  radiusMeters.value = meters
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

    marker = L.marker([newCenter.lat, newCenter.lon], {
      icon: createPinIcon('#000', 1.8),
    }).addTo(map)
    marker.bindPopup(newCenter.label)
    circle = L.circle([newCenter.lat, newCenter.lon], { radius: radiusMeters.value }).addTo(map)
    loadNearbyPlaces(newCenter.lat, newCenter.lon)
  },
)

watch(radiusMeters, () => {
  if (!props.center || !map) return

  if (circle) {
    circle.remove()
  }

  circle = L.circle([props.center.lat, props.center.lon], { radius: radiusMeters.value }).addTo(map)
})
</script>

<template>
  <div class="radius-controls">
    <button type="button" :class="{ active: radiusMeters === 400 }" @click="setRadius(400)">
      5 min
    </button>
    <button type="button" :class="{ active: radiusMeters === 800 }" @click="setRadius(800)">
      10 min
    </button>
    <button type="button" :class="{ active: radiusMeters === 1200 }" @click="setRadius(1200)">
      15 min
    </button>
  </div>

  <div class="legend">
    <div v-for="(label, group) in GROUP_LABELS" :key="group" class="legend-item">
      <span class="legend-dot" :style="{ backgroundColor: GROUP_COLORS[group] }"></span>
      <span>{{ label }}</span>
    </div>
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

.radius-controls button.active {
  background-color: #2c3e50;
  color: white;
  border-color: #2c3e50;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
</style>
