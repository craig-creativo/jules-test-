<template>
  <div class="flex h-screen bg-gray-100 font-sans">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
      <div class="h-16 flex items-center justify-center border-b border-gray-700">
        <h1 class="text-xl font-bold">AIO Dashboard</h1>
      </div>
      <nav class="flex-1 p-4 space-y-2">
        <NuxtLink to="/" class="nav-link">
          Dashboard Home
        </NuxtLink>
        <NuxtLink to="/audit" class="nav-link">
          AIO Page Audit
        </NuxtLink>
        <NuxtLink to="/content-gap" class="nav-link">
          Content Gap Analysis
        </NuxtLink>
        <NuxtLink to="/brief-generator" class="nav-link">
          Content Brief Generator
        </NuxtLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <div class="container mx-auto px-6 py-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.nav-link {
  @apply block px-4 py-2.5 rounded-md transition duration-200;
}
.nav-link:hover {
  @apply bg-gray-700;
}
.router-link-exact-active {
  @apply bg-blue-600;
}
</style>
