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

const getDistanceMeters = (startLat, startLon, endLat, endLon) => {
  const earthRadius = 6371000
  const toRadians = (degrees) => (degrees * Math.PI) / 180

  const latDistance = toRadians(endLat - startLat)
  const lonDistance = toRadians(endLon - startLon)

  const a =
    Math.sin(latDistance / 2) ** 2 +
    Math.cos(toRadians(startLat)) * Math.cos(toRadians(endLat)) * Math.sin(lonDistance / 2) ** 2

  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

const normalizeName = (name) => {
  return name.trim().toLocaleLowerCase('pl-PL')
}

const removeDuplicatePlaces = (places) => {
  return places.reduce((uniquePlaces, place) => {
    if (!place.hasOwnName) {
      uniquePlaces.push(place)
      return uniquePlaces
    }

    const duplicate = uniquePlaces.some((savedPlace) => {
      if (!savedPlace.hasOwnName) return false
      if (savedPlace.group !== place.group) return false

      if (normalizeName(savedPlace.name) !== normalizeName(place.name)) {
        return false
      }

      return getDistanceMeters(savedPlace.lat, savedPlace.lon, place.lat, place.lon) <= 40
    })

    if (!duplicate) {
      uniquePlaces.push(place)
    }

    return uniquePlaces
  }, [])
}

export const fetchNearbyPlaces = async (lat, lon, radiusMeters, signal) => {
  const filters = CATEGORIES.map((category) => {
    return `nwr["${category.key}"="${category.value}"](around:${radiusMeters},${lat},${lon});`
  }).join('\n')

  const query = `
    [out:json][timeout:25];
    (
      ${filters}
    );
    out center;
  `

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
    signal,
  })

  if (!response.ok) {
    throw new Error('Serwer Overpass jest przeciążony. Spróbuj ponownie za chwilę.')
  }

  const data = await response.json()

  const places = data.elements
    .map((element) => {
      const category = findCategory(element.tags)

      return {
        id: `${element.type}-${element.id}`,
        lat: element.lat ?? element.center?.lat,
        lon: element.lon ?? element.center?.lon,
        name: element.tags?.name || category?.label || 'Bez nazwy',
        label: category?.label || 'Inne',
        group: category?.group || 'other',
        hasOwnName: Boolean(element.tags?.name),
      }
    })
    .filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lon))

  return removeDuplicatePlaces(places).map((place) => ({
    id: place.id,
    lat: place.lat,
    lon: place.lon,
    name: place.name,
    group: place.group,
    label: place.label,
    distanceMeters: getDistanceMeters(lat, lon, place.lat, place.lon),
  }))
}
