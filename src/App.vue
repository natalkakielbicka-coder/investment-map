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
    <h1 class="investment-map-widget__title">Mapa okolicy inwestycji</h1>
    <p class="investment-map-widget__notice">
      Wersja demonstracyjna. Dane o okolicy są pobierane z publicznych usług OpenStreetMap, dlatego
      wyniki mogą być chwilowo niedostępne.
    </p>
    <AddressSearch @found="handleAddressFound" />
    <InvestmentMap :center="mapCenter" />
  </main>
</template>

<style scoped>
.investment-map-widget {
  --imw-color-primary: #173f35;
  --imw-color-accent: #c79d62;
  --imw-color-background: #f6f4ef;
  --imw-color-surface: #ffffff;
  --imw-color-text: #1d2925;
  --imw-color-text-muted: #68736f;
  --imw-color-border: #dedfd9;

  --imw-font-heading: 'DM Serif Display', Georgia, serif;
  --imw-font-body: 'Manrope', Arial, sans-serif;

  --imw-radius-small: 6px;
  --imw-radius-medium: 14px;
  --imw-radius-large: 24px;
  --imw-shadow: 0 8px 30px rgba(23, 63, 53, 0.08);
  border: 1px solid var(--imw-color-border);
  border-radius: var(--imw-radius-large);
  box-shadow: var(--imw-shadow);
  padding: 2rem;
  font-family: var(--imw-font-body);
  color: var(--imw-color-text);
}

.investment-map-widget__title {
  font-family: var(--imw-font-heading);
  font-weight: 400;
  font-size: 1.75rem;
  color: var(--imw-color-primary);
  margin: 0 0 1.5rem;
}

.investment-map-widget__notice {
  padding: 0.875rem 1rem;
  border: 1px solid rgba(199, 157, 98, 0.45);
  border-left: 4px solid var(--imw-color-accent);
  border-radius: var(--imw-radius-small);
  margin: 0 0 1.5rem;
  background: rgba(199, 157, 98, 0.1);
  color: var(--imw-color-text-muted);
  font-size: 0.875rem;
  line-height: 1.55;
}

@media (max-width: 767px) {
  .investment-map-widget {
    padding: 1rem;
    border-radius: var(--imw-radius-medium);
  }

  .investment-map-widget__title {
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  .investment-map-widget__notice {
    margin-bottom: 1rem;
  }
}
</style>
