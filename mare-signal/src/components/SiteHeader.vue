<template>
  <header class="site-header">
    <div class="header-inner">
      <div class="logo-wordmark">
        <span class="logo-icon">◎</span>
        <span class="logo-text">MaRe<span class="logo-sub">Head Spa System</span></span>
      </div>
      <nav class="header-nav">
        <a href="https://mareheadspa.com/pages/about-us" target="_blank">About Us</a>
        <a href="https://mareheadspa.com" target="_blank">Visit MaRe</a>
      </nav>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(226, 226, 222, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(41, 97, 103, 0.1);
}
.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo-wordmark {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: #2A2420;
}
.logo-icon {
  font-size: 1.5rem;
  color: #296167;
  line-height: 1;
}
.logo-text {
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: -0.04em;
  color: #2A2420;
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.logo-sub {
  font-weight: 300;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #296167;
}
.header-nav {
  display: flex;
  gap: 2rem;
}
.header-nav a {
  font-family: 'Manrope', sans-serif;
  font-weight: 400;
  font-size: 0.85rem;
  letter-spacing: -0.04em;
  color: #3B3632;
  text-decoration: none;
  transition: color 0.2s;
}
.header-nav a:hover {
  color: #296167;
}
</style>
