<template>
  <section class="cta-section" ref="ctaRef">
    <div class="cta-inner">
      <div class="cta-left">
        <div class="section-label">
          <span class="label-line" />
          <span class="label-text">Next step</span>
        </div>
        <h2 class="cta-title">Book a walkthrough<br>with Rebecca.</h2>
        <p class="cta-body">MaRe partners with a curated set of venues that match our standard for excellence. This conversation is the first step in determining if we are a fit — for both of us.</p>
        <div class="cta-contact-info">
          <p class="contact-line">Rebecca — MaRe Growth Lead</p>
          <p class="contact-line"><a href="mailto:partners@mareheadspa.com">partners@mareheadspa.com</a></p>
        </div>
      </div>
      <div class="cta-right">
        <form class="contact-form" @submit.prevent="handleSubmit">
          <div class="form-field">
            <label for="name">Full name</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              :placeholder="salonName + ' — your name'"
              required
            />
          </div>
          <div class="form-field">
            <label for="email">Business email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="you@salonname.com"
              required
            />
          </div>
          <div class="form-field">
            <label for="salon">Salon name</label>
            <input
              id="salon"
              type="text"
              :value="salonName"
              readonly
            />
          </div>
          <div class="form-field">
            <label for="message">Anything you'd like us to know</label>
            <textarea
              id="message"
              v-model="form.message"
              rows="3"
              placeholder="Optional — context, questions, preferred timing."
            />
          </div>
          <button type="submit" class="btn-submit" :disabled="submitted">
            <span v-if="!submitted">Request a walkthrough</span>
            <span v-else>Request received — Rebecca will be in touch.</span>
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  salonName: {
    type: String,
    required: true
  }
})

const ctaRef = ref(null)
const submitted = ref(false)
const form = reactive({
  name: '',
  email: '',
  salon: props.salonName,
  message: ''
})

function handleSubmit() {
  // In production: POST to an API endpoint. For hackathon demo, simulate success.
  submitted.value = true
}

defineExpose({ ctaRef })
</script>

<style scoped>
.cta-section {
  background: #E2E2DE;
  padding: clamp(5rem, 10vw, 9rem) 0;
}
.cta-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(2rem, 8vw, 8rem);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  align-items: start;
}
@media (max-width: 768px) {
  .cta-inner {
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
  color: #296167;
}
.cta-title {
  font-family: 'Playfair Display', serif;
  font-weight: 400;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: #2A2420;
  margin: 0 0 1.75rem;
}
.cta-body {
  font-family: 'Manrope', sans-serif;
  font-weight: 300;
  font-size: 0.95rem;
  line-height: 1.7;
  letter-spacing: -0.03em;
  color: #3B3632;
  margin: 0 0 2.5rem;
}
.cta-contact-info {
  border-top: 1px solid rgba(41, 97, 103, 0.2);
  padding-top: 1.5rem;
}
.contact-line {
  font-family: 'Manrope', sans-serif;
  font-weight: 400;
  font-size: 0.85rem;
  letter-spacing: -0.03em;
  color: #3B3632;
  margin: 0 0 0.4rem;
}
.contact-line a {
  color: #296167;
  text-decoration: none;
}
.contact-line a:hover {
  text-decoration: underline;
}
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-field label {
  font-family: 'Manrope', sans-serif;
  font-weight: 500;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2A2420;
}
.form-field input,
.form-field textarea {
  font-family: 'Manrope', sans-serif;
  font-weight: 300;
  font-size: 0.9rem;
  letter-spacing: -0.03em;
  color: #2A2420;
  background: #FFFFFF;
  border: 1px solid rgba(42, 36, 32, 0.2);
  padding: 0.85rem 1rem;
  outline: none;
  transition: border-color 0.2s;
  resize: none;
}
.form-field input:focus,
.form-field textarea:focus {
  border-color: #296167;
}
.form-field input[readonly] {
  background: #F6F6F4;
  color: #3B3632;
  cursor: default;
}
.btn-submit {
  font-family: 'Manrope', sans-serif;
  font-weight: 500;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #E2E2DE;
  background: #2A2420;
  border: none;
  padding: 1rem 2rem;
  cursor: pointer;
  transition: background 0.25s;
  align-self: flex-start;
}
.btn-submit:hover:not(:disabled) {
  background: #296167;
}
.btn-submit:disabled {
  background: #296167;
  cursor: default;
}
</style>
