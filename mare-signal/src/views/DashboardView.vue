<template>
  <div class="dashboard">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand">
          <!-- Temporary simple logo -->
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
          <h1>MaRe Outreach AI</h1>
        </div>
        <p class="subtitle">Prospect Discovery & Scraper</p>
      </div>

      <div class="search-bar">
        <input type="text" v-model="searchQuery" placeholder="Search salons by name or city..." />
      </div>

      <div class="salon-list">
        <div 
          v-for="salon in filteredSalons" 
          :key="salon.id"
          class="salon-card"
          :class="{ active: selectedSalon?.id === salon.id }"
          @click="selectSalon(salon)"
        >
          <div class="card-header">
            <h3>{{ salon.name }}</h3>
            <span class="score">{{ salon.fit_score }} Fit</span>
          </div>
          <p class="city">{{ salon.city }}</p>
          <div class="stats">
            <span>{{ salon.revenue_tier }} / yr</span>
            <span>{{ salon.estimated_weekly_clients }} clients/wk</span>
          </div>
          
          <div v-if="selectedSalon?.id === salon.id" class="card-actions">
            <!-- Simulated Inbox tracking link -->
            <button class="action-btn" @click.stop="goToInbox">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              View Draft Email in Inbox
            </button>
          </div>
        </div>
      </div>
    </aside>

    <main class="map-container">
      <MapComponent 
        :salons="salons"
        :center="mapCenter"
        :selected-salon="selectedSalon"
        @select="selectSalon"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import MapComponent from '../components/MapComponent.vue'
import salonsData from '../../../data/salons.json'

const router = useRouter()
const salons = ref(salonsData)
const searchQuery = ref('')
const selectedSalon = ref(null)

const filteredSalons = computed(() => {
  if (!searchQuery.value) return salons.value
  const query = searchQuery.value.toLowerCase()
  return salons.value.filter(s => 
    s.name.toLowerCase().includes(query) || 
    s.city.toLowerCase().includes(query)
  )
})

const mapCenter = computed(() => {
  if (selectedSalon.value) {
    return { lat: selectedSalon.value.lat, lng: selectedSalon.value.lng }
  }
  return null
})

function selectSalon(salon) {
  selectedSalon.value = salon
}

function goToInbox() {
  router.push('/inbox')
}
</script>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #2A2420;
  color: #E2E2DE;
  font-family: 'Manrope', sans-serif;
  overflow: hidden;
}

.sidebar {
  width: 400px;
  background: #3B3632;
  border-right: 1px solid rgba(226, 226, 222, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(226, 226, 222, 0.1);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #7C9FA3;
}

.brand h1 {
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 0.8rem;
  color: #9BA39B;
  margin-top: 0.25rem;
}

.search-bar {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(226, 226, 222, 0.1);
}

.search-bar input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #2A2420;
  border: 1px solid rgba(124, 159, 163, 0.3);
  border-radius: 8px;
  color: #E2E2DE;
  font-family: inherit;
}

.search-bar input:focus {
  outline: none;
  border-color: #7C9FA3;
}

.salon-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.salon-card {
  background: #2A2420;
  border: 1px solid rgba(226, 226, 222, 0.05);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.salon-card:hover {
  border-color: rgba(124, 159, 163, 0.5);
  transform: translateY(-2px);
}

.salon-card.active {
  background: #296167;
  border-color: #296167;
  color: #fff;
}

.salon-card.active .stats span {
  color: rgba(255, 255, 255, 0.8);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 500;
  line-height: 1.2;
}

.score {
  background: rgba(124, 159, 163, 0.2);
  color: #7C9FA3;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.salon-card.active .score {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.city {
  font-size: 0.85rem;
  color: #9BA39B;
  margin-bottom: 0.75rem;
}

.salon-card.active .city {
  color: rgba(255, 255, 255, 0.9);
}

.stats {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #7C9FA3;
}

.card-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  width: 100%;
  padding: 0.75rem;
  background: #fff;
  color: #296167;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 0.9;
}

.map-container {
  flex: 1;
  position: relative;
}
</style>
