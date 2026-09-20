const CATEGORIES = [
  { key: 'amenity', value: 'school', group: 'family', label: 'Szkoła' },
  { key: 'amenity', value: 'kindergarten', group: 'family', label: 'Przedszkole' },
  { key: 'leisure', value: 'playground', group: 'family', label: 'Plac zabaw' },

  { key: 'amenity', value: 'restaurant', group: 'food', label: 'Restauracja' },
  { key: 'amenity', value: 'fast_food', group: 'food', label: 'Fast food' },
  { key: 'amenity', value: 'cafe', group: 'food', label: 'Kawiarnia' },
  { key: 'amenity', value: 'cinema', group: 'food', label: 'Kino' },
  { key: 'amenity', value: 'theatre', group: 'food', label: 'Teatr' },

  { key: 'shop', value: 'mall', group: 'shopping', label: 'Centrum handlowe' },
  { key: 'shop', value: 'supermarket', group: 'shopping', label: 'Supermarket' },
  { key: 'shop', value: 'convenience', group: 'shopping', label: 'Sklep osiedlowy' },
  { key: 'shop', value: 'bakery', group: 'shopping', label: 'Piekarnia' },
  { key: 'shop', value: 'clothes', group: 'shopping', label: 'Sklep odzieżowy' },

  { key: 'amenity', value: 'pharmacy', group: 'health', label: 'Apteka' },
  { key: 'amenity', value: 'hospital', group: 'health', label: 'Szpital' },
  { key: 'amenity', value: 'clinic', group: 'health', label: 'Przychodnia' },
  { key: 'amenity', value: 'dentist', group: 'health', label: 'Dentysta' },

  { key: 'leisure', value: 'park', group: 'recreation', label: 'Park' },
  { key: 'leisure', value: 'fitness_centre', group: 'recreation', label: 'Siłownia' },
  { key: 'leisure', value: 'sports_centre', group: 'recreation', label: 'Centrum sportowe' },

  { key: 'amenity', value: 'bank', group: 'services', label: 'Bank' },
  { key: 'amenity', value: 'post_office', group: 'services', label: 'Poczta' },
  { key: 'amenity', value: 'parking', group: 'services', label: 'Parking' },

  { key: 'highway', value: 'bus_stop', group: 'transport', label: 'Przystanek autobusowy' },
  { key: 'railway', value: 'tram_stop', group: 'transport', label: 'Przystanek tramwajowy' },
  { key: 'railway', value: 'station', group: 'transport', label: 'Stacja kolejowa' },
]

const findCategory = (tags) => {
  return CATEGORIES.find((category) => tags?.[category.key] === category.value)
}

export const fetchNearbyPlaces = async (lat, lon, radiusMeters) => {
  const filters = CATEGORIES.map((category) => {
    return `node["${category.key}"="${category.value}"](around:${radiusMeters},${lat},${lon});`
  }).join('\n')

  const query = `
    [out:json][timeout:25];
    (
      ${filters}
    );
    out body;
  `

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  })

  const data = await response.json()

  return data.elements.map((element) => {
    const category = findCategory(element.tags)

    return {
      id: element.id,
      lat: element.lat,
      lon: element.lon,
      name: element.tags?.name || category?.label || 'Bez nazwy',
      group: category?.group || 'other',
    }
  })
}
