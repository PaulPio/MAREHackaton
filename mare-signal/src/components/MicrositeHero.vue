<template>
  <section class="hero">
    <div class="hero-bg" aria-hidden="true">
      <div class="hero-gradient" />
    </div>
    <div class="hero-content">
      <p class="hero-eyebrow">A curated partner opportunity</p>
      <h1 class="hero-headline">{{ content.hero_headline }}</h1>
      <p class="hero-subhead">{{ content.hero_subhead }}</p>
      <div class="hero-cta">
        <button class="btn-primary" @click="$emit('scrollToCta')">Book a walkthrough</button>
        <span class="hero-cta-note">with Rebecca, MaRe Growth Lead</span>
      </div>
    </div>
    <div class="hero-scroll-hint" aria-hidden="true">
      <span class="scroll-line" />
    </div>
  </section>
</template>

<script setup>
defineProps({
  content: {
    type: Object,
    required: true
  }
})
defineEmits(['scrollToCta'])
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: #2A2420;
}
.hero-bg {
  position: absolute;
  inset: 0;
}
.hero-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 60% 40%, rgba(41, 97, 103, 0.55) 0%, transparent 70%),
    radial-gradient(ellipse 60% 80% at 10% 80%, rgba(101, 61, 36, 0.3) 0%, transparent 60%),
    linear-gradient(160deg, #0C1D1F 0%, #2A2420 50%, #1E120B 100%);
}
.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 10rem 2rem 6rem;
  max-width: 780px;
  padding-left: clamp(2rem, 8vw, 8rem);
}
.hero-eyebrow {
  font-family: 'Manrope', sans-serif;
  font-weight: 300;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #7C9FA3;
  margin-bottom: 1.5rem;
}
.hero-headline {
  font-family: 'Playfair Display', serif;
  font-weight: 400;
  font-size: clamp(2.4rem, 5vw, 4rem);
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: #E2E2DE;
  margin: 0 0 1.75rem;
  max-width: 680px;
}
.hero-subhead {
  font-family: 'Manrope', sans-serif;
  font-weight: 300;
  font-size: clamp(1rem, 1.8vw, 1.2rem);
  line-height: 1.6;
  letter-spacing: -0.03em;
  color: #A6BEC0;
  margin: 0 0 3rem;
  max-width: 560px;
}
.hero-cta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.btn-primary {
  font-family: 'Manrope', sans-serif;
  font-weight: 500;
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #E2E2DE;
  background: #296167;
  border: none;
  padding: 1rem 2.4rem;
  cursor: pointer;
  transition: background 0.25s;
  outline: none;
}
.btn-primary:hover {
  background: #214E52;
}
.hero-cta-note {
  font-family: 'Manrope', sans-serif;
  font-weight: 300;
  font-size: 0.8rem;
  letter-spacing: -0.02em;
  color: #538085;
}
.hero-scroll-hint {
  position: absolute;
  bottom: 3rem;
  left: clamp(2rem, 8vw, 8rem);
  z-index: 2;
}
.scroll-line {
  display: block;
  width: 1px;
  height: 60px;
  background: linear-gradient(to bottom, #296167, transparent);
  animation: scrollPulse 2s ease-in-out infinite;
}
@keyframes scrollPulse {
  0%, 100% { opacity: 0.3; transform: scaleY(0.8); }
  50% { opacity: 1; transform: scaleY(1); }
}
</style>
