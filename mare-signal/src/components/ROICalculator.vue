<template>
  <section class="roi-block">
    <div class="roi-inner">
      <div class="roi-left">
        <div class="section-label">
          <span class="label-line" />
          <span class="label-text">Revenue projection</span>
        </div>
        <h2 class="roi-title">The numbers, specific to you.</h2>
        <p class="roi-copy">{{ content.roi_copy }}</p>
        <div class="roi-stat-row">
          <div class="roi-stat">
            <span class="stat-value">3%</span>
            <span class="stat-label">Industry avg. retail conversion</span>
          </div>
          <div class="stat-arrow">→</div>
          <div class="roi-stat roi-stat--accent">
            <span class="stat-value">40%+</span>
            <span class="stat-label">With MaRe Eye diagnostics</span>
          </div>
        </div>
      </div>
      <div class="roi-right">
        <div class="roi-card">
          <p class="roi-card-eyebrow">Projected annual uplift</p>
          <p class="roi-card-amount">{{ formattedUplift }}</p>
          <p class="roi-card-note">Based on {{ salon.estimated_weekly_clients }} clients/week × MaRe Eye conversion protocol × Philip Martin's average basket.</p>
          <div class="roi-card-divider" />
          <p class="roi-card-sub">This projection assumes ~40% retail attach rate, consistent with published MaRe Eye deployment data.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: Object,
    required: true
  },
  salon: {
    type: Object,
    required: true
  }
})

const formattedUplift = computed(() => {
  const amount = props.salon.projected_retail_uplift_annual_usd
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount)
})
</script>

<style scoped>
.roi-block {
  background: #2A2420;
  padding: clamp(5rem, 10vw, 9rem) 0;
}
.roi-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(2rem, 8vw, 8rem);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  align-items: center;
}
@media (max-width: 768px) {
  .roi-inner {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}
.section-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}
.label-line {
  display: block;
  width: 40px;
  height: 1px;
  background: #296167;
}
.label-text {
  font-family: 'Manrope', sans-serif;
  font-weight: 300;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7C9FA3;
}
.roi-title {
  font-family: 'Playfair Display', serif;
  font-weight: 400;
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: #E2E2DE;
  margin: 0 0 2rem;
}
.roi-copy {
  font-family: 'Manrope', sans-serif;
  font-weight: 300;
  font-size: 1rem;
  line-height: 1.7;
  letter-spacing: -0.03em;
  color: #A6BEC0;
  margin: 0 0 3rem;
}
.roi-stat-row {
  display: flex;
  align-items: center;
  gap: 2rem;
}
.roi-stat {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.stat-value {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 400;
  color: #E2E2DE;
  line-height: 1;
}
.roi-stat--accent .stat-value {
  color: #296167;
}
.stat-label {
  font-family: 'Manrope', sans-serif;
  font-weight: 300;
  font-size: 0.72rem;
  letter-spacing: -0.01em;
  color: #538085;
}
.stat-arrow {
  font-size: 1.4rem;
  color: #296167;
  margin-top: -0.75rem;
}
.roi-card {
  background: rgba(41, 97, 103, 0.12);
  border: 1px solid rgba(41, 97, 103, 0.3);
  padding: 3rem;
}
.roi-card-eyebrow {
  font-family: 'Manrope', sans-serif;
  font-weight: 300;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7C9FA3;
  margin: 0 0 1rem;
}
.roi-card-amount {
  font-family: 'Playfair Display', serif;
  font-weight: 400;
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  line-height: 1;
  letter-spacing: -0.03em;
  color: #E2E2DE;
  margin: 0 0 1rem;
}
.roi-card-note {
  font-family: 'Manrope', sans-serif;
  font-weight: 300;
  font-size: 0.85rem;
  line-height: 1.6;
  letter-spacing: -0.03em;
  color: #7C9FA3;
  margin: 0;
}
.roi-card-divider {
  width: 100%;
  height: 1px;
  background: rgba(41, 97, 103, 0.25);
  margin: 1.5rem 0;
}
.roi-card-sub {
  font-family: 'Manrope', sans-serif;
  font-weight: 300;
  font-size: 0.75rem;
  line-height: 1.6;
  letter-spacing: -0.02em;
  color: #538085;
  margin: 0;
}
</style>
