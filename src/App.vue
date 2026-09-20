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
  <main>
    <h1>Mapa okolicy inwestycji</h1>
    <AddressSearch @found="handleAddressFound" />
    <InvestmentMap :center="mapCenter" />
  </main>
</template>
