<script setup>
import { ref } from 'vue'
import InvestmentMap from './components/InvestmentMap.vue'
import AddressSearch from './components/AddressSearch.vue'

const mapCenter = ref(null)

const handleAddressFound = (location) => {
  mapCenter.value = location
}
</script>

<template>
  <main class="investment-map-widget">
    <AddressSearch @found="handleAddressFound" />
    <InvestmentMap :center="mapCenter" />
  </main>
</template>

<style scoped>
.investment-map-widget {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
