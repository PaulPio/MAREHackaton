<template>
  <div>
    <!-- Demo Salon Picker (remove/hide for production) -->
    <div class="demo-bar" v-if="salons.length > 1">
      <span class="demo-label">Demo: viewing microsite for</span>
      <div class="demo-tabs">
        <button
          v-for="s in salons"
          :key="s.id"
          :class="['demo-tab', { active: s.id === activeSalonId }]"
          @click="switchSalon(s.id)"
        >{{ s.name }}</button>
      </div>
    </div>

    <MicrositePage
      v-if="activeSalon && activeMicrositeContent"
      :salon="activeSalon"
      :microsite-content="activeMicrositeContent"
    />

    <div v-else class="loading">
      <p>Loading microsite data…</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MicrositePage from './components/MicrositePage.vue'
import salonsData from '../data/salons.json'
import micrositeData from '../data/generated_microsite_content.json'

const salons = ref(salonsData)
const micrositeContents = ref(micrositeData)

const activeSalonId = ref(salonsData[0]?.id ?? null)

const activeSalon = computed(() =>
  salons.value.find(s => s.id === activeSalonId.value) ?? null
)

const activeMicrositeContent = computed(() =>
  micrositeContents.value.find(m => m.salon_id === activeSalonId.value) ?? null
)

function switchSalon(id) {
  activeSalonId.value = id
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
html { scroll-behavior: smooth; }
body {
  background: #2A2420;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

<style scoped>
.demo-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: rgba(12, 29, 31, 0.95);
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(41, 97, 103, 0.3);
  padding: 0.75rem clamp(1rem, 4vw, 3rem);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.demo-label {
  font-family: 'Manrope', sans-serif;
  font-weight: 300;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #538085;
  white-space: nowrap;
}
.demo-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.demo-tab {
  font-family: 'Manrope', sans-serif;
  font-weight: 400;
  font-size: 0.78rem;
  letter-spacing: -0.02em;
  color: #7C9FA3;
  background: transparent;
  border: 1px solid rgba(41, 97, 103, 0.3);
  padding: 0.4rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
}
.demo-tab:hover {
  color: #E2E2DE;
  border-color: rgba(41, 97, 103, 0.7);
}
.demo-tab.active {
  color: #E2E2DE;
  background: #296167;
  border-color: #296167;
}
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
