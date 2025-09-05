<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900">AIO Page Audit</h1>
    <p class="mt-2 text-gray-600">Enter a single URL to run a comprehensive AIO audit.</p>
    <div class="mt-8 max-w-xl">
      <div class="card">
        <div class="input-group">
          <input
            type="text"
            v-model="url"
            @keyup.enter="startAnalysis"
            placeholder="https://example.com"
            class="url-input"
          />
          <button
            @click="startAnalysis"
            :disabled="!url.trim()"
            class="analyze-button"
          >
            Analyze
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { navigateTo } from '#app';

const url = ref('');

const startAnalysis = () => {
  if (url.value.trim()) {
    navigateTo({
      path: '/audit/report',
      query: {
        url: url.value.trim(),
      },
    });
  }
};
</script>

<style scoped>
.card {
  @apply bg-white p-6 rounded-lg shadow;
}
.input-group {
  display: flex;
  gap: 1rem;
}
.url-input {
  width: 100%;
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}
.analyze-button {
  padding: 0.75rem 2rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  transition: background-color 0.2s;
}
.analyze-button:hover {
  background-color: #2563eb;
}
.analyze-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
</style>
