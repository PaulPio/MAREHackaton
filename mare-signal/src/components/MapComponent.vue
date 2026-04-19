<template>
  <div style="height: 100%; width: 100%; position: relative; z-index: 0">
    <l-map
      ref="mapRef"
      v-model:zoom="zoom"
      :center="mapCenter"
      :options="{ zoomControl: true }"
      style="height: 100%; width: 100%; border-radius: 16px"
      @update:zoom="onZoom"
    >
      <l-tile-layer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      ></l-tile-layer>

      <!-- Zoomed out clusters by State -->
      <template v-if="zoom < 7">
        <l-marker
          v-for="cluster in stateClusters"
          :key="cluster.state"
          :lat-lng="[cluster.lat, cluster.lng]"
          :icon="cluster.icon"
          @click="zoomToCluster(cluster)"
        ></l-marker>
      </template>

      <!-- Zoomed in individual salons -->
      <template v-else>
        <l-marker
          v-for="salon in filteredSalons"
          :key="salon.name"
          :lat-lng="[salon.lat, salon.lng]"
          :icon="markerIcon"
          @click="selectSalon(salon)"
        >
          <l-popup>
            <div style="font-family: 'Manrope', sans-serif">
              <strong style="color: #2A2420; font-size: 14px">{{ salon.name }}</strong><br />
              <span style="color: #3B3632; font-size: 12px">{{ salon.city }}</span><br />
              <span style="color: #296167; font-size: 12px; font-weight: 600">Fit Score: {{ salon.fit_score }}</span>
            </div>
          </l-popup>
        </l-marker>
      </template>
    </l-map>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'

const props = defineProps({
  salons: { type: Array, default: () => [] },
  center: { type: Object, default: null },
  selectedSalon: { type: Object, default: null }
})

const emit = defineEmits(['select'])

const mapRef = ref(null)
const zoom = ref(props.center ? 11 : 4)

const mapCenter = computed(() => {
  if (props.center && props.center.lat && props.center.lng) {
    return [props.center.lat, props.center.lng]
  }
  return [39.8283, -98.5795] // US center
})

// Pan to center when it changes
watch(() => props.center, (newCenter) => {
  if (newCenter && mapRef.value && mapRef.value.leafletObject) {
    mapRef.value.leafletObject.setView([newCenter.lat, newCenter.lng], 11, { animate: true })
  }
})

// Setup marker icon
const markerIcon = L.icon({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function createStateIcon(stateCode, count) {
  return L.divIcon({
    html: `<div style="background-color: #296167; color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 600; font-family: Manrope, sans-serif; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); line-height: 1.1; cursor: pointer;">
      <span style="font-size: 14px; letter-spacing: 0.5px;">${stateCode}</span>
      <span style="font-size: 10px; opacity: 0.85;">${count} salons</span>
    </div>`,
    className: 'custom-state-icon',
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  })
}

// Filter salons with valid coordinates
const filteredSalons = computed(() => {
  return props.salons.filter(s => s.lat !== undefined && s.lng !== undefined)
})

// Update stateClusters to use filteredSalons
const stateClusters = computed(() => {
  const groups = {}
  filteredSalons.value.forEach((salon) => {
    const parts = salon.city ? salon.city.split(', ') : []
    const stateCode = parts.length > 1 ? parts[1] : salon.city || ''
    if (!groups[stateCode]) {
      groups[stateCode] = { state: stateCode, count: 0, lat: 0, lng: 0 }
    }
    groups[stateCode].count += 1
    groups[stateCode].lat += salon.lat
    groups[stateCode].lng += salon.lng
  })
  return Object.values(groups).map(g => ({
    state: g.state,
    count: g.count,
    lat: g.lat / g.count,
    lng: g.lng / g.count,
    icon: createStateIcon(g.state, g.count)
  }))
})

// In template, replace salon loop with filteredSalons


function onZoom(newZoom) {
  zoom.value = newZoom
}

function zoomToCluster(cluster) {
  if (mapRef.value && mapRef.value.leafletObject) {
    mapRef.value.leafletObject.setView([cluster.lat, cluster.lng], 9, { animate: true })
  }
}

function selectSalon(salon) {
  emit('select', salon)
  if (mapRef.value && mapRef.value.leafletObject) {
    mapRef.value.leafletObject.setView([salon.lat, salon.lng], 13, { animate: true })
  }
}
</script>
