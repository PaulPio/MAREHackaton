<template>
  <div class="microsite">
    <SiteHeader />

    <MicrositeHero
      :content="micrositeContent"
      @scroll-to-cta="scrollToCta"
    />

    <WhyYouBlock
      :content="micrositeContent"
      :salon-name="salon.name"
    />

    <ROICalculator
      :content="micrositeContent"
      :salon="salon"
    />

    <CTASection
      ref="ctaSectionRef"
      :salon-name="salon.name"
    />

    <SiteFooter />
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import SiteHeader from './SiteHeader.vue'
import MicrositeHero from './MicrositeHero.vue'
import WhyYouBlock from './WhyYouBlock.vue'
import ROICalculator from './ROICalculator.vue'
import CTASection from './CTASection.vue'
import SiteFooter from './SiteFooter.vue'

defineProps({
  salon: {
    type: Object,
    required: true
  },
  micrositeContent: {
    type: Object,
    required: true
  }
})

const ctaSectionRef = ref(null)

function scrollToCta() {
  nextTick(() => {
    const el = document.querySelector('.cta-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  })
}
</script>

<style scoped>
.microsite {
  min-height: 100vh;
}
</style>
