import { ref } from 'vue'

interface GooglePlace {
  place_id: string
  description: string
  structured_formatting?: {
    main_text: string
    secondary_text: string
  }
}

interface GooglePlaceDetails {
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  formatted_address: string
  place_id: string
}

export const useGoogleMaps = () => {
  const autocomplete = ref<google.maps.places.Autocomplete | null>(null)
  const predictions = ref<GooglePlace[]>([])
  const selectedPlace = ref<GooglePlaceDetails | null>(null)

  // Centro aproximado entre Gijón y Oviedo
  const CENTER = { lat: 43.5322, lng: -5.6997 }
  const RADIUS = 30000 // 30km de radio

  const initAutocomplete = (inputRef: HTMLElement) => {
    if (typeof window.google === 'undefined') {
      console.error('Google Maps no está cargado')
      return
    }

    autocomplete.value = new window.google.maps.places.Autocomplete(inputRef, {
      types: ['address'],
      componentRestrictions: { country: 'es' },
      bounds: new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(CENTER.lat - 0.3, CENTER.lng - 0.3),
        new window.google.maps.LatLng(CENTER.lat + 0.3, CENTER.lng + 0.3)
      )
    })

    autocomplete.value.addListener('place_changed', () => {
      const place = autocomplete.value?.getPlace()
      if (place?.geometry) {
        selectedPlace.value = place as GooglePlaceDetails
      }
    })
  }

  const searchPlaces = (input: string) => {
    if (!input) {
      predictions.value = []
      return
    }

    const service = new window.google.maps.places.AutocompleteService()
    service.getPlacePredictions(
      {
        input,
        types: ['address'],
        componentRestrictions: { country: 'es' },
        bounds: new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(CENTER.lat - 0.3, CENTER.lng - 0.3),
          new window.google.maps.LatLng(CENTER.lat + 0.3, CENTER.lng + 0.3)
        )
      },
      (results: GooglePlace[] | null, status: google.maps.places.PlacesServiceStatus) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          // Filtrar resultados para mostrar solo lugares cerca de Gijón/Oviedo
          predictions.value = results.filter(place => {
            // Aquí podrías agregar lógica adicional para filtrar por distancia
            // usando el servicio de Geocoding si es necesario
            return true
          })
        } else {
          predictions.value = []
        }
      }
    )
  }

  return {
    initAutocomplete,
    searchPlaces,
    predictions,
    selectedPlace
  }
} 