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
    const params = new URLSearchParams({
      format: 'json',
      limit: '1',
      countrycodes: 'pl',
      'accept-language': 'pl',
      q: query.value,
    })

    const url = `https://nominatim.openstreetmap.org/search?${params}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Nie udało się pobrać adresu.')
    }

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
  } catch {
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
  margin-bottom: 0.5rem;
}

.address-search input {
  flex: 1;
  min-width: 200px;
  padding: 0.65rem 0.9rem;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--imw-color-text);
  background-color: var(--imw-color-surface);
  border: 1px solid var(--imw-color-border);
  border-radius: var(--imw-radius-small);
}

.address-search input:focus {
  outline: none;
  border-color: var(--imw-color-accent);
  box-shadow: 0 0 0 3px rgba(199, 157, 98, 0.25);
}

.address-search button {
  padding: 0.65rem 1.25rem;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.9rem;
  color: white;
  background-color: var(--imw-color-primary);
  border: none;
  border-radius: var(--imw-radius-small);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.address-search button:hover:not(:disabled) {
  background-color: #0f2b24;
}

.address-search button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  width: 100%;
  color: #b33a3a;
  font-size: 0.85rem;
  margin: 0;
}

.recent-addresses {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin: 0.5rem 0 1.5rem;
}

.recent-addresses__item {
  text-align: left;
  background: none;
  border: none;
  padding: 0.2rem 0;
  font-family: inherit;
  font-size: 0.85rem;
  color: var(--imw-color-text-muted);
  cursor: pointer;
}

.recent-addresses__item:hover {
  color: var(--imw-color-primary);
}
</style>
