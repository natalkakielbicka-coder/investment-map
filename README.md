# Mapa okolicy inwestycji

Interaktywna mapa pokazująca otoczenie inwestycji deweloperskiej — po wpisaniu adresu aplikacja zaznacza lokalizację i wyszukuje w wybranym promieniu (5/10/15 minut pieszo) pobliskie miejsca: szkoły, sklepy, przystanki, restauracje i inne.

## Funkcje

- Wyszukiwanie adresu i automatyczne wycentrowanie mapy
- Wybór promienia zasięgu (5/10/15 min pieszo) z wizualnym kołem na mapie
- Automatyczne pobieranie pobliskich miejsc w wybranym promieniu, pogrupowanych kategoriami (edukacja, jedzenie, zakupy, zdrowie, rekreacja, usługi, transport)
- Kolorowe oznaczenia na mapie wg kategorii miejsca
- Dymek z pełnym adresem po kliknięciu na główną pinezkę inwestycji

## Stack technologiczny

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- [Vite](https://vite.dev/) — narzędzie budujące
- [Leaflet](https://leafletjs.com/) — biblioteka mapowa
- [OpenStreetMap](https://www.openstreetmap.org/) — kafelki mapy
- [Nominatim](https://nominatim.org/) — geokodowanie adresów (zamiana adresu na współrzędne)
- [Overpass API](https://overpass-api.de/) — wyszukiwanie pobliskich miejsc

Wszystkie użyte API są darmowe i nie wymagają kluczy dostępowych.

## Uruchomienie lokalne

```sh
npm install
npm run dev
```

Aplikacja uruchomi się pod adresem podanym w terminalu (domyślnie `http://localhost:5173`).

### Budowanie wersji produkcyjnej

```sh
npm run build
```

### Lintowanie kodu

```sh
npm run lint
```

## Struktura projektu
