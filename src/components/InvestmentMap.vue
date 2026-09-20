<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
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

const visibleGroups = reactive(
  Object.fromEntries(Object.keys(GROUP_LABELS).map((group) => [group, true])),
)

const toggleGroup = (group) => {
  visibleGroups[group] = !visibleGroups[group]
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
    popupAnchor: [0, -height],
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

const allPlaces = ref([])

const placesError = ref('')
const isLoadingPlaces = ref(false)

const availableGroups = computed(() => {
  const foundGroups = new Set(allPlaces.value.map((place) => place.group))
  return Object.keys(GROUP_LABELS).filter((group) => foundGroups.has(group))
})

const renderPlaceMarkers = () => {
  clearPlaceMarkers()

  allPlaces.value
    .filter((place) => visibleGroups[place.group])
    .forEach((place) => {
      const placeMarker = L.marker([place.lat, place.lon], {
        icon: createPinIcon(GROUP_COLORS[place.group] || GROUP_COLORS.other),
      })
        .addTo(map)
        .bindTooltip(place.name)

      placeMarkers.push(placeMarker)
    })
}

const loadNearbyPlaces = async (lat, lon) => {
  isLoadingPlaces.value = true
  placesError.value = ''

  try {
    allPlaces.value = await fetchNearbyPlaces(lat, lon, radiusMeters.value)
    renderPlaceMarkers()
  } catch (error) {
    placesError.value = error.message
    allPlaces.value = []
    clearPlaceMarkers()
  } finally {
    isLoadingPlaces.value = false
  }
}

onMounted(() => {
  map = L.map(mapContainer.value).setView([52.2297, 21.0122], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)
})

const drawCircle = (center) => {
  if (circle) {
    circle.remove()
  }

  circle = L.circle([center.lat, center.lon], { radius: radiusMeters.value }).addTo(map)
}

watch(
  () => props.center,
  (newCenter) => {
    if (!newCenter || !map) return

    map.setView([newCenter.lat, newCenter.lon], 16)

    if (marker) {
      marker.remove()
    }

    marker = L.marker([newCenter.lat, newCenter.lon], {
      icon: createPinIcon('#000', 1.8),
    }).addTo(map)
    marker.bindPopup(newCenter.label)

    drawCircle(newCenter)
    loadNearbyPlaces(newCenter.lat, newCenter.lon)
  },
)

watch(radiusMeters, () => {
  if (!props.center || !map) return

  drawCircle(props.center)
  loadNearbyPlaces(props.center.lat, props.center.lon)
})

watch(visibleGroups, renderPlaceMarkers)
</script>

<template>
  <div class="map-layout">
    <aside class="sidebar">
      <div class="sidebar__section">
        <span class="sidebar__heading">Promień dojścia</span>
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
      </div>

      <div class="sidebar__section">
        <span class="sidebar__heading">Kategorie</span>
        <p v-if="isLoadingPlaces" class="status-text">Szukam miejsc w okolicy...</p>
        <p v-if="placesError" class="status-text status-text--error">{{ placesError }}</p>
        <div class="legend">
          <label v-for="group in availableGroups" :key="group" class="legend-item">
            <input type="checkbox" :checked="visibleGroups[group]" @change="toggleGroup(group)" />
            <span class="legend-dot" :style="{ backgroundColor: GROUP_COLORS[group] }"></span>
            <span>{{ GROUP_LABELS[group] }}</span>
          </label>
        </div>
      </div>
    </aside>

    <div ref="mapContainer" class="map"></div>
  </div>
</template>

<style scoped>
.map-layout {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

.sidebar {
  width: 190px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sidebar__heading {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #5a5f66;
  margin-bottom: 0.5rem;
}

.radius-controls {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.radius-controls button {
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  text-align: left;
}

.radius-controls button.active {
  background-color: #2c3e50;
  color: white;
  border-color: #2c3e50;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.map {
  height: 480px;
  flex: 1;
  min-width: 0;
  border-radius: 6px;
  overflow: hidden;
}

.status-text {
  font-size: 0.85rem;
  color: #5a5f66;
  margin: 0 0 0.5rem;
}

.status-text--error {
  color: #c0392b;
}

@media (max-width: 767px) {
  .map-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .radius-controls {
    flex-direction: row;
  }
}
</style>
