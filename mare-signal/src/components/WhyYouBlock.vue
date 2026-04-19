<template>
  <section class="why-you">
    <div class="section-inner">
      <div class="section-label">
        <span class="label-line" />
        <span class="label-text">Why this partnership works</span>
      </div>
      <h2 class="section-title">Curated for {{ salonName }}.</h2>
      <div class="bullets-grid">
        <div
          v-for="(bullet, i) in content.why_you_bullets"
          :key="i"
          class="bullet-card"
        >
          <span class="bullet-index">0{{ i + 1 }}</span>
          <p class="bullet-text">{{ bullet }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  content: {
    type: Object,
    required: true
  },
  salonName: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.why-you {
  background: #FFFFFF;
  padding: clamp(5rem, 10vw, 9rem) 0;
}
.section-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(2rem, 8vw, 8rem);
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
  color: #296167;
}
.section-title {
  font-family: 'Playfair Display', serif;
  font-weight: 400;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: #2A2420;
  margin: 0 0 4rem;
}
.bullets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0;
  border-top: 1px solid #E2E2DE;
}
.bullet-card {
  padding: 3rem 2.5rem 3rem 0;
  border-bottom: 1px solid #E2E2DE;
  border-right: 1px solid #E2E2DE;
  transition: background 0.2s;
}
.bullet-card:hover {
  background: #F6F6F4;
}
.bullet-index {
  display: block;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: #296167;
  margin-bottom: 1.25rem;
}
.bullet-text {
  font-family: 'Manrope', sans-serif;
  font-weight: 300;
  font-size: 0.95rem;
  line-height: 1.7;
  letter-spacing: -0.03em;
  color: #3B3632;
  margin: 0;
}
</style>
