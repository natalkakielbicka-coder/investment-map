<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
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
const placeMarkers = new Map()
let placesAbortController = null
let placesRequestId = 0
const isCategoriesOpen = ref(true)

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
  placeMarkers.clear()
}

const allPlaces = ref([])

const placesError = ref('')
const isLoadingPlaces = ref(false)

const availableGroups = computed(() => {
  const foundGroups = new Set(allPlaces.value.map((place) => place.group))
  return Object.keys(GROUP_LABELS).filter((group) => foundGroups.has(group))
})

const groupCounts = computed(() => {
  const counts = {}

  allPlaces.value.forEach((place) => {
    counts[place.group] = (counts[place.group] || 0) + 1
  })

  return counts
})

const allVisible = computed(() => {
  return availableGroups.value.every((group) => visibleGroups[group])
})

const nearestVisiblePlaces = computed(() => {
  return allPlaces.value.filter((place) => visibleGroups[place.group]).slice(0, 6)
})

const toggleAllGroups = () => {
  const nextValue = !allVisible.value

  availableGroups.value.forEach((group) => {
    visibleGroups[group] = nextValue
  })
}

const noPlacesFound = computed(() => {
  return (
    Boolean(props.center) &&
    !isLoadingPlaces.value &&
    !placesError.value &&
    allPlaces.value.length === 0
  )
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
        .bindTooltip(createPlaceTooltip(place))

      placeMarkers.set(place.id, placeMarker)
    })
}

const focusPlace = (place) => {
  const placeMarker = placeMarkers.get(place.id)

  if (!placeMarker) return

  map.panTo([place.lat, place.lon])
  placeMarker.openTooltip()
}

const formatDistance = (distanceMeters) => {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters / 10) * 10} m`
  }

  return `${(distanceMeters / 1000).toFixed(1).replace('.', ',')} km`
}

const createPlaceTooltip = (place) => {
  const tooltip = document.createElement('div')
  const name = document.createElement('strong')
  const details = document.createElement('div')

  name.textContent = place.name
  details.textContent = `${place.label} · ${formatDistance(place.distanceMeters)}`

  tooltip.append(name, details)

  return tooltip
}

const loadNearbyPlaces = async (lat, lon) => {
  placesAbortController?.abort()

  const requestId = ++placesRequestId
  const controller = new AbortController()

  placesAbortController = controller
  isLoadingPlaces.value = true
  placesError.value = ''

  try {
    const places = await fetchNearbyPlaces(lat, lon, radiusMeters.value, controller.signal)

    if (requestId !== placesRequestId) return

    allPlaces.value = places
    renderPlaceMarkers()
  } catch (error) {
    if (error.name === 'AbortError') return
    if (requestId !== placesRequestId) return

    placesError.value = error.message
    allPlaces.value = []
    clearPlaceMarkers()
  } finally {
    if (requestId === placesRequestId) {
      isLoadingPlaces.value = false
    }
  }
}

onMounted(() => {
  isCategoriesOpen.value = !window.matchMedia('(max-width: 767px)').matches

  map = L.map(mapContainer.value).setView([52.2297, 21.0122], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)
})

onUnmounted(() => {
  placesAbortController?.abort()
  map?.remove()
  map = null
})

const drawCircle = (center) => {
  if (circle) {
    circle.remove()
  }

  circle = L.circle([center.lat, center.lon], {
    radius: radiusMeters.value,
    color: '#c79d62',
    weight: 2,
    fillColor: '#c79d62',
    fillOpacity: 0.08,
  }).addTo(map)

  map.fitBounds(circle.getBounds(), {
    padding: [32, 32],
    maxZoom: 16,
    animate: true,
  })
}

watch(
  () => props.center,
  (newCenter) => {
    if (!newCenter || !map) return

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
      <fieldset class="sidebar__section sidebar__fieldset">
        <legend class="sidebar__heading">Orientacyjny czas dojścia</legend>

        <div class="radius-controls">
          <button
            type="button"
            :class="{ active: radiusMeters === 400 }"
            :aria-pressed="radiusMeters === 400"
            @click="setRadius(400)"
          >
            5 min
          </button>

          <button
            type="button"
            :class="{ active: radiusMeters === 800 }"
            :aria-pressed="radiusMeters === 800"
            @click="setRadius(800)"
          >
            10 min
          </button>

          <button
            type="button"
            :class="{ active: radiusMeters === 1200 }"
            :aria-pressed="radiusMeters === 1200"
            @click="setRadius(1200)"
          >
            15 min
          </button>
        </div>
      </fieldset>

      <button
        v-if="center"
        type="button"
        class="categories-toggle"
        :aria-expanded="isCategoriesOpen"
        aria-controls="map-categories"
        @click="isCategoriesOpen = !isCategoriesOpen"
      >
        <span>Kategorie i najbliższe miejsca</span>

        <span aria-hidden="true">
          {{ isCategoriesOpen ? '−' : '+' }}
        </span>
      </button>

      <fieldset
        v-if="center"
        id="map-categories"
        class="sidebar__section sidebar__fieldset sidebar__categories"
        :class="{
          'is-mobile-collapsed': !isCategoriesOpen,
        }"
      >
        <legend class="sr-only">Kategorie miejsc w okolicy</legend>

        <div class="sidebar__row">
          <span class="sidebar__heading">Kategorie</span>

          <button
            v-if="availableGroups.length > 0"
            type="button"
            class="toggle-all"
            @click="toggleAllGroups"
          >
            {{ allVisible ? 'Odznacz wszystkie' : 'Zaznacz wszystkie' }}
          </button>
        </div>

        <div aria-live="polite" aria-atomic="true">
          <p v-if="isLoadingPlaces" class="status-text">Szukam miejsc w okolicy...</p>

          <p v-else-if="placesError" class="status-text status-text--error">
            {{ placesError }}
          </p>

          <p v-else-if="noPlacesFound" class="status-text">
            Nie znaleziono nic w tym zasięgu — spróbuj większego promienia.
          </p>
        </div>

        <div class="legend">
          <label v-for="group in availableGroups" :key="group" class="legend-item">
            <input type="checkbox" :checked="visibleGroups[group]" @change="toggleGroup(group)" />

            <span
              class="legend-dot"
              :style="{
                backgroundColor: GROUP_COLORS[group],
              }"
            ></span>

            <span>
              {{ GROUP_LABELS[group] }}
              ({{ groupCounts[group] }})
            </span>
          </label>
        </div>

        <div v-if="nearestVisiblePlaces.length > 0" class="nearest-places">
          <span class="sidebar__heading"> Najbliżej </span>

          <button
            v-for="place in nearestVisiblePlaces"
            :key="place.id"
            type="button"
            class="nearest-place"
            @click="focusPlace(place)"
          >
            <span class="nearest-place__name">
              {{ place.name }}
            </span>

            <span class="nearest-place__details">
              {{ place.label }} ·
              {{ formatDistance(place.distanceMeters) }}
            </span>
          </button>
        </div>
      </fieldset>
    </aside>

    <div ref="mapContainer" class="map"></div>
  </div>
</template>

<style scoped>
.map-layout {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.sidebar {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.sidebar__row .sidebar__heading {
  margin-bottom: 0;
}

.sidebar__fieldset {
  min-width: 0;
  padding: 0;
  margin: 0;
  border: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sidebar__heading {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--imw-color-text-muted);
  margin-bottom: 0.6rem;
}

.toggle-all {
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  font-size: 0.75rem;
  color: var(--imw-color-accent);
  cursor: pointer;
  text-decoration: underline;
}

.radius-controls {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.radius-controls button {
  padding: 0.5rem 0.9rem;
  font-family: inherit;
  font-size: 0.85rem;
  color: var(--imw-color-text);
  background-color: var(--imw-color-surface);
  border: 1px solid var(--imw-color-border);
  border-radius: var(--imw-radius-small);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.radius-controls button.active {
  background-color: var(--imw-color-primary);
  color: white;
  border-color: var(--imw-color-primary);
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  font-size: 0.85rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.legend-item input[type='checkbox'] {
  accent-color: var(--imw-color-primary);
  width: 15px;
  height: 15px;
  cursor: pointer;
}

.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.map {
  height: 480px;
  flex: 1;
  min-width: 0;
  border-radius: var(--imw-radius-medium);
  overflow: hidden;
}

.status-text {
  font-size: 0.82rem;
  color: var(--imw-color-text-muted);
  margin: 0 0 0.5rem;
}

.status-text--error {
  color: #b33a3a;
}

.nearest-places {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 1.5rem;
}

.nearest-place {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.45rem 0;
  font-family: inherit;
  color: var(--imw-color-text);
  text-align: left;
  background: none;
  border: 0;
  border-bottom: 1px solid var(--imw-color-border);
  cursor: pointer;
}

.nearest-place__name {
  font-size: 0.82rem;
  font-weight: 600;
}

.nearest-place__details {
  font-size: 0.75rem;
  color: var(--imw-color-text-muted);
}

.categories-toggle {
  display: none;
}

@media (max-width: 767px) {
  .map-layout {
    flex-direction: column;
    gap: 1rem;
  }

  .sidebar {
    width: 100%;
    gap: 1rem;
  }

  .radius-controls {
    flex-direction: row;
  }

  .radius-controls button {
    flex: 1;
    min-height: 44px;
    text-align: center;
  }

  .map {
    width: 100%;
    height: 420px;
  }

  .nearest-places {
    margin-top: 1rem;
  }

  .categories-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 44px;
    padding: 0.7rem 0.9rem;
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--imw-color-primary);
    background: var(--imw-color-surface);
    border: 1px solid var(--imw-color-border);
    border-radius: var(--imw-radius-small);
    cursor: pointer;
  }

  .sidebar__categories.is-mobile-collapsed {
    display: none;
  }
}

@media (max-width: 479px) {
  .map {
    height: 360px;
  }
}
</style>
