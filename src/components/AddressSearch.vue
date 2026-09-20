<script setup>
import { ref, onMounted } from 'vue'
import { getRecentAddresses, addRecentAddress } from '../composables/useRecentAddresses.js'

const emit = defineEmits(['found'])

const query = ref('')
const inputEl = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const recentAddresses = ref([])

onMounted(() => {
  recentAddresses.value = getRecentAddresses()
})

const searchAddress = async () => {
  if (!query.value.trim()) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query.value)}`
    const response = await fetch(url)
    const results = await response.json()

    if (results.length === 0) {
      errorMessage.value = 'Nie znaleziono takiego adresu.'
      return
    }

    const { lat, lon, display_name } = results[0]

    const location = {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      label: display_name,
    }

    emit('found', location)
    recentAddresses.value = addRecentAddress(location)
    query.value = ''
    inputEl.value?.blur()
  } catch (error) {
    errorMessage.value = 'Coś poszło nie tak. Spróbuj ponownie.'
  } finally {
    isLoading.value = false
  }
}

const selectRecent = (address) => {
  emit('found', address)
  query.value = ''
  inputEl.value?.blur()
}
</script>

<template>
  <form class="address-search" @submit.prevent="searchAddress">
    <input ref="inputEl" v-model="query" type="text" placeholder="Wpisz adres inwestycji..." />

    <button type="submit" :disabled="isLoading">
      {{ isLoading ? 'Szukam...' : 'Szukaj' }}
    </button>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </form>

  <div v-if="recentAddresses.length > 0" class="recent-addresses">
    <button
      v-for="address in recentAddresses"
      :key="address.label"
      type="button"
      class="recent-addresses__item"
      @click="selectRecent(address)"
    >
      {{ address.label }}
    </button>
  </div>
</template>

<style scoped>
.address-search {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.address-search input {
  flex: 1;
  min-width: 200px;
  padding: 0.5rem;
  font-size: 1rem;
}

.address-search button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.error {
  width: 100%;
  color: #c0392b;
  margin: 0;
}

.recent-addresses {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.recent-addresses__item {
  text-align: left;
  background: none;
  border: none;
  padding: 0.25rem 0;
  font-size: 0.85rem;
  color: #2980b9;
  cursor: pointer;
}

.recent-addresses__item:hover {
  text-decoration: underline;
}
</style>
