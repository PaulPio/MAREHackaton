<template>
  <div class="inbox-layout">
    <aside class="inbox-nav">
      <div class="brand">
        <!-- Back to Dashboard -->
        <button class="back-btn" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2>CRM Inbox</h2>
      </div>
      <div class="nav-filters">
        <button class="filter active">All Active Deals ({{ salons.length }})</button>
        <button class="filter">Outreach Generated ({{ salons.length }})</button>
        <button class="filter">Replied (0)</button>
        <button class="filter">Closed Won (0)</button>
      </div>
    </aside>

    <main class="inbox-content">
      <div class="content-header">
        <h1>Active Sequences</h1>
      </div>

      <div class="deals-grid">
        <div class="deal-card" v-for="salon in salons" :key="salon.id">
          <div class="deal-status">
            <span class="status-dot"></span>
            Awaiting Approval
          </div>
          <h3>{{ salon.name }}</h3>
          <p class="city">{{ salon.city }}</p>

          <div class="deal-details">
            <div class="detail-row">
              <span>Potential MRR</span>
              <strong>{{ formatCurrency(Math.floor(salon.projected_retail_uplift_annual_usd / 12)) }}</strong>
            </div>
            <div class="detail-row">
              <span>Fit Score</span>
              <strong>{{ salon.fit_score }}</strong>
            </div>
          </div>

          <div class="deal-actions">
            <!-- View Draft Button -->
            <button class="view-draft-btn" @click="viewDraft(salon)">
              View Draft Email
            </button>
            <router-link :to="`/site/${salon.id}`" target="_blank" class="preview-btn">
              Preview Microsite
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
            </router-link>
            <button class="send-btn" @click="simulateSend(salon.id)">Send Email</button>
          </div>
        </div>
      </div>
    </main>

    <!-- Email Draft Modal -->
    <div v-if="selectedDraft" class="modal-overlay" @click="closeDraft">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Email Draft for {{ selectedSalonDetails?.name }}</h2>
          <button class="close-btn" @click="closeDraft">×</button>
        </div>
        <div class="email-preview">
          <div class="email-field"><strong>Subject:</strong> {{ selectedDraft.subject }}</div>
          <div class="email-body">
            <p v-for="(line, idx) in selectedDraft.body.split('\n')" :key="idx" class="email-line">
              {{ line }}
              <!-- We could auto-inject the generated link placeholder here if we wanted to visually show it -->
            </p>
            <p class="email-link">
               [Included Link: <strong>http://localhost:5173/#/site/{{ selectedSalonDetails?.id }}</strong>]
            </p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn cancel-btn" @click="closeDraft">Close</button>
          <button class="action-btn send-btn" @click="simulateSend(selectedSalonDetails.id)">Approve & Send Sequence</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import salonsData from '../../data/salons.json'
import emailsData from '../../data/generated_emails.json' // fetch generated emails

const router = useRouter()
const salons = ref(salonsData.slice(0, 8)) // active deals

const selectedDraft = ref(null)
const selectedSalonDetails = ref(null)

function goBack() {
  console.log('Back button clicked')
  router.push('/')
}

function formatCurrency(num) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
}

function viewDraft(salon) {
  console.log('View Draft clicked for', salon.id)
  selectedSalonDetails.value = salon
  const email = emailsData.find(e => e.salon_id === salon.id)
  
  if (email && email.subject && email.body) {
    selectedDraft.value = email
  } else {
    // Fallback if not generated
    selectedDraft.value = {
      subject: `Exclusive Growth Strategy for ${salon.name}`,
      body: `Hi there,\n\nI was looking into ${salon.name} and was blown away by your location in ${salon.city}.\n\nBased on your revenue profile, we've modeled that installing the MaRe engine could drive an additional ${formatCurrency(salon.projected_retail_uplift_annual_usd)} annually. I've prepared a custom microsite for you below covering our strategic analysis.\n\nBest,\nMaRe Team`
    }
  }
}

function closeDraft() {
  selectedDraft.value = null
  selectedSalonDetails.value = null
}

function simulateSend(id) {
  closeDraft()
  alert('Email successfully dispatched to sequence queue!')
}
</script>

<style scoped>
.inbox-layout {
  display: flex;
  height: 100vh;
  background: #1A1614;
  color: #E2E2DE;
  font-family: 'Manrope', sans-serif;
  overflow: hidden;
}

.inbox-nav {
  width: 280px;
  background: #2A2420;
  border-right: 1px solid rgba(226, 226, 222, 0.05);
  padding: 1.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  background: transparent;
  border: 1px solid rgba(226, 226, 222, 0.2);
  color: #E2E2DE;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(226, 226, 222, 0.1);
}

.brand h2 {
  font-size: 1.2rem;
  font-weight: 500;
}

.nav-filters {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter {
  background: transparent;
  border: none;
  color: #9BA39B;
  text-align: left;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.filter:hover {
  background: rgba(255, 255, 255, 0.05);
}

.filter.active {
  background: rgba(124, 159, 163, 0.15);
  color: #7C9FA3;
  font-weight: 600;
}

.inbox-content {
  flex: 1;
  padding: 2.5rem;
  overflow-y: auto;
}

.content-header {
  margin-bottom: 2rem;
}

.content-header h1 {
  font-size: 1.8rem;
  font-weight: 400;
}

.deals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.deal-card {
  background: #2A2420;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.deal-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #D4A373;
  margin-bottom: 1rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #D4A373;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(212, 163, 115, 0.5);
}

.deal-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.city {
  color: #9BA39B;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.deal-details {
  background: #1A1614;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  flex: 1;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row span {
  color: #7C9FA3;
}

.deal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.view-draft-btn, .preview-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.05);
  color: #E2E2DE;
  text-decoration: none;
  padding: 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  border: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;
  transition: background 0.2s;
}

.view-draft-btn:hover, .preview-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.send-btn {
  background: #296167;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.2s;
}

.send-btn:hover {
  filter: brightness(1.1);
}

/* Modal styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(12, 29, 31, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #2A2420;
  width: 90%;
  max-width: 600px;
  border-radius: 12px;
  border: 1px solid rgba(124, 159, 163, 0.3);
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.modal-header h2 {
  font-size: 1.1rem;
  color: #E2E2DE;
}

.close-btn {
  background: transparent;
  border: none;
  color: #9BA39B;
  font-size: 1.5rem;
  cursor: pointer;
}

.close-btn:hover {
  color: #fff;
}

.email-preview {
  padding: 1.5rem;
  background: #FDFCF8;
  color: #2A2420;
}

.email-field {
  padding-bottom: 1rem;
  border-bottom: 1px solid #E2E2DE;
  margin-bottom: 1rem;
}

.email-body {
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.6;
}

.email-line {
  min-height: 1rem;
  margin-bottom: 0.5rem;
}

.email-link {
  margin-top: 1.5rem;
  color: #296167;
  font-size: 0.9rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: #1A1614;
}

.action-btn {
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
}

.cancel-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
}

.cancel-btn:hover {
  background: rgba(255,255,255,0.05);
}
</style>
