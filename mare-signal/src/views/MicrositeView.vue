<template>
  <div v-if="activeSalon && activeMicrositeContent">
    <MicrositePage :salon="activeSalon" :microsite-content="activeMicrositeContent" />
  </div>
  <div v-else class="loading">
    <p>Loading microsite data... (or salon not found)</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MicrositePage from '../components/MicrositePage.vue'
import salonsData from '../../data/salons.json'
import micrositeData from '../../data/generated_microsite_content.json'

const route = useRoute()
const activeSalonId = computed(() => route.params.id)

const activeSalon = computed(() =>
  salonsData.find(s => s.id === activeSalonId.value) ?? null
)

const activeMicrositeContent = computed(() =>
  micrositeData.find(m => m.salon_id === activeSalonId.value) ?? null
)
</script>

<style scoped>
.loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Manrope', sans-serif;
  color: #7C9FA3;
  font-size: 0.9rem;
}
</style>
