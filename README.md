# Mapa okolicy inwestycji

Interaktywna mapa pokazująca otoczenie inwestycji deweloperskiej — po wpisaniu adresu aplikacja zaznacza lokalizację i wyszukuje w wybranym promieniu (5/10/15 minut pieszo) pobliskie miejsca: szkoły, sklepy, przystanki, restauracje i inne.

## Status projektu

**Prototyp / projekt portfolio.** Aplikacja korzysta z publicznych usług
OpenStreetMap i nie jest przeznaczona do obsługi komercyjnego ruchu bez własnego
zaplecza API lub dostawcy gwarantującego odpowiednią dostępność.

## Ograniczenia wersji demonstracyjnej

- Nominatim i Overpass to publiczne usługi bez gwarancji dostępności (SLA).
  Mogą czasowo odrzucać lub ograniczać zapytania.
- Podany czas dojścia jest wartością orientacyjną. Promień jest liczony w linii
  prostej, a nie na podstawie rzeczywistej trasy pieszej.
- Niektóre obiekty zapisane w OpenStreetMap jako obszary mogą nie pojawić się
  w wynikach.
- Zakres i aktualność danych zależą od zawartości OpenStreetMap.
- Wersja produkcyjna powinna korzystać z własnego backendu albo komercyjnego API.

## Publikacja na GitHub Pages

Workflow w `.github/workflows/deploy.yml` buduje aplikację i publikuje katalog
`dist` po każdym pushu do gałęzi `main`.

Przed pierwszym wdrożeniem:

1. Wejdź w `Settings → Pages`.
2. Ustaw `Source: GitHub Actions`.
3. Wykonaj push do gałęzi `main`.

Adres aplikacji:

https://natalkakielbicka-coder.github.io/investment-map/

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
