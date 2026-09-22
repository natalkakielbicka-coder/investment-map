# Mapa okolicy inwestycji

Interaktywna mapa prezentująca otoczenie inwestycji deweloperskiej. Po wpisaniu adresu aplikacja zaznacza lokalizację i pokazuje miejsca znajdujące się w wybranym promieniu — odpowiadającym orientacyjnie 5, 10 lub 15 minutom spaceru.

## Demo

**[Otwórz aplikację](https://natalkakielbicka-coder.github.io/investment-map/)**

## Status projektu

Projekt portfolio w wersji demonstracyjnej. Aplikacja korzysta z publicznych usług OpenStreetMap, dlatego nie jest przeznaczona do obsługi komercyjnego ruchu bez własnego backendu lub dostawcy API gwarantującego odpowiednią dostępność.

## Funkcje

- wyszukiwanie adresów na terenie Polski,
- automatyczne wycentrowanie mapy na wybranej lokalizacji,
- wybór orientacyjnego czasu dojścia: 5, 10 lub 15 minut,
- automatyczne dopasowanie przybliżenia tak, aby cały wybrany obszar mieścił się na mapie,
- wizualizacja zasięgu za pomocą koła,
- wyszukiwanie pobliskich miejsc i grupowanie ich według kategorii,
- włączanie i wyłączanie wybranych kategorii,
- lista najbliższych widocznych miejsc wraz z odległością,
- przejście do wybranego miejsca po kliknięciu na liście,
- zapis ostatnio wyszukiwanych adresów w przeglądarce,
- obsługa ładowania, błędów i pustych wyników,
- responsywny interfejs oraz podstawowe usprawnienia dostępności.

## Ograniczenia wersji demonstracyjnej

- Nominatim i Overpass to publiczne usługi bez gwarancji dostępności (SLA). Mogą czasowo odrzucać lub ograniczać zapytania.
- Czas dojścia jest orientacyjny. Zasięg jest liczony w linii prostej, a nie na podstawie rzeczywistej trasy pieszej.
- Niektóre obiekty zapisane w OpenStreetMap jako obszary mogą nie pojawić się w wynikach.
- Zakres i aktualność wyników zależą od danych dostępnych w OpenStreetMap.
- Wersja produkcyjna powinna korzystać z własnego backendu z pamięcią podręczną i limitami zapytań albo z komercyjnego API.

## Technologie

- [Vue 3](https://vuejs.org/) — Composition API i `<script setup>`,
- [Vite](https://vite.dev/) — środowisko deweloperskie i budowanie,
- [Leaflet](https://leafletjs.com/) — interaktywna mapa,
- [OpenStreetMap](https://www.openstreetmap.org/) — kafelki i dane mapowe,
- [Nominatim](https://nominatim.org/) — geokodowanie adresów,
- [Overpass API](https://overpass-api.de/) — wyszukiwanie miejsc w okolicy,
- GitHub Actions i GitHub Pages — automatyczne wdrożenie.

## Uruchomienie lokalne

Wymagany jest Node.js 22 lub nowszy.

```sh
npm install
npm run dev
```

Aplikacja uruchomi się pod adresem podanym w terminalu, domyślnie `http://localhost:5173`.

## Kontrola jakości

```sh
npm run lint
npm run build
```

## Wdrożenie

Workflow `.github/workflows/deploy.yml` automatycznie buduje aplikację i publikuje katalog `dist` w GitHub Pages po każdym pushu do gałęzi `main`.

## Struktura projektu

```text
src/
├── components/
│   ├── AddressSearch.vue
│   └── InvestmentMap.vue
├── composables/
│   ├── useOverpass.js
│   └── useRecentAddresses.js
├── App.vue
└── main.js
```
