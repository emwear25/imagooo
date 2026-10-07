<template>
  <div class="shell">
    <a href="#main" class="skip-link">Към основното съдържание</a>
    <SiteHeader />
    <main id="main" tabindex="-1" class="shell__main">
      <slot />
    </main>
    <SiteFooter />
    <CartDrawer />
    <ToastRegion />
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}
.shell__main {
  flex: 1;
  outline: none;
}
</style>
