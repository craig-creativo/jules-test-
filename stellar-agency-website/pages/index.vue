<template>
  <div class="container">
    <div class="card">
      <h1 class="title">AIO Content Audit Tool</h1>
      <p class="subtitle">Enter a URL to generate a complete AI Optimization report.</p>
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
</template>

<script setup>
import { ref } from 'vue';
import { navigateTo } from '#app';

const url = ref('');

const startAnalysis = () => {
  if (url.value.trim()) {
    navigateTo({
      path: '/report',
      query: {
        url: url.value.trim(),
      },
    });
  }
};
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f3f4f6;
}
.card {
  background: white;
  padding: 3rem 4rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  text-align: center;
  max-width: 600px;
}
.title {
  font-size: 2.25rem;
  font-weight: bold;
  color: #111827;
}
.subtitle {
  font-size: 1.125rem;
  color: #4b5563;
  margin-top: 0.5rem;
  margin-bottom: 2.5rem;
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
