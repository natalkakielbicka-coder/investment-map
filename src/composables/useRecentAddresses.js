const STORAGE_KEY = 'investment-map:recent-addresses'
const MAX_ITEMS = 5

export const getRecentAddresses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const addRecentAddress = (address) => {
  const current = getRecentAddresses()
  const withoutDuplicate = current.filter((item) => item.label !== address.label)
  const updated = [address, ...withoutDuplicate].slice(0, MAX_ITEMS)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

  return updated
}
