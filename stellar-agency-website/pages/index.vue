<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
    <p class="mt-2 text-gray-600">Welcome to your AIO Dashboard. Select a tool from the sidebar to get started.</p>

    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="card">
        <h2 class="text-xl font-bold">AIO Page Audit</h2>
        <p class="mt-2 text-gray-600">Run a comprehensive AIO audit on a single URL.</p>
        <NuxtLink to="/audit" class="button mt-4">Go to Tool</NuxtLink>
      </div>
      <div class="card">
        <h2 class="text-xl font-bold">Content Gap Analysis</h2>
        <p class="mt-2 text-gray-600">Compare your page to a competitor's to find content gaps.</p>
        <NuxtLink to="/content-gap" class="button mt-4">Go to Tool</NuxtLink>
      </div>
      <div class="card">
        <h2 class="text-xl font-bold">Content Brief Generator</h2>
        <p class="mt-2 text-gray-600">Generate a content brief for a target keyword based on top SERP results.</p>
        <NuxtLink to="/brief-generator" class="button mt-4">Go to Tool</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.card {
  @apply bg-white p-6 rounded-lg shadow;
}
.button {
  @apply inline-block bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors;
}
</style>
