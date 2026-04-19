<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="logo-icon">◎</span>
        <span class="footer-wordmark">MaRe Head Spa System</span>
      </div>
      <p class="footer-tagline">Your Head. Your Way. Science Supported.</p>
      <div class="footer-links">
        <a href="https://mareheadspa.com" target="_blank">mareheadspa.com</a>
        <span class="divider">·</span>
        <a href="https://mareheadspa.com/pages/for-professionals" target="_blank">For Professionals</a>
        <span class="divider">·</span>
        <a href="https://www.instagram.com/mareheadspa/" target="_blank">Instagram</a>
      </div>
      <p class="footer-legal">© 2026 MaRe Head Spa System. All rights reserved. This microsite was prepared exclusively for the recipient named above.</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: #0C1D1F;
  padding: 4rem 0 3rem;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(2rem, 8vw, 8rem);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.logo-icon {
  font-size: 1.2rem;
  color: #296167;
}
.footer-wordmark {
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: -0.04em;
  color: #E2E2DE;
}
.footer-tagline {
  font-family: 'Manrope', sans-serif;
  font-weight: 300;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  color: #538085;
  margin: 0;
  font-style: italic;
}
.footer-links {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-top: 0.5rem;
}
.footer-links a {
  font-family: 'Manrope', sans-serif;
  font-weight: 300;
  font-size: 0.8rem;
  letter-spacing: -0.02em;
  color: #7C9FA3;
  text-decoration: none;
  transition: color 0.2s;
}
.footer-links a:hover {
  color: #E2E2DE;
}
.divider {
  color: #193A3E;
  font-size: 0.8rem;
}
.footer-legal {
  font-family: 'Manrope', sans-serif;
  font-weight: 300;
  font-size: 0.7rem;
  letter-spacing: -0.01em;
  color: #193A3E;
  margin: 0.5rem 0 0;
  max-width: 600px;
}
</style>
