<script setup>
import { ref } from 'vue'

const emit = defineEmits(['found'])

const query = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

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

    emit('found', {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      label: display_name,
    })
  } catch (error) {
    errorMessage.value = 'Coś poszło nie tak. Spróbuj ponownie.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form class="address-search" @submit.prevent="searchAddress">
    <input v-model="query" type="text" placeholder="Wpisz adres inwestycji..." />

    <button type="submit" :disabled="isLoading">
      {{ isLoading ? 'Szukam...' : 'Szukaj' }}
    </button>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </form>
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
</style>
