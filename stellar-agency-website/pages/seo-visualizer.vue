<template>
  <div>
    <h1>SEO Neural Network Visualizer</h1>
    <div class="controls">
      <input type="text" v-model="url" placeholder="Enter URL to analyze" />
      <button @click="analyzeUrl" :disabled="isLoading">
        {{ isLoading ? 'Analyzing...' : 'Analyze' }}
      </button>
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="graphData" class="graph-wrapper">
      <NeuralNetwork :graphData="graphData" />
    </div>
    <div v-else-if="!isLoading && !hasAnalyzed" class="placeholder">
      Enter a URL and click Analyze to see the visualization.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import NeuralNetwork from '~/components/NeuralNetwork.vue';

const url = ref('https://nuxtjs.org'); // default url
const graphData = ref(null);
const isLoading = ref(false);
const error = ref(null);
const hasAnalyzed = ref(false); // To track if an analysis has been run

const analyzeUrl = async () => {
  if (!url.value) {
    error.value = 'Please enter a URL.';
    return;
  }
  isLoading.value = true;
  hasAnalyzed.value = true;
  error.value = null;
  graphData.value = null;

  try {
    const response = await fetch(`/api/analyze?url=${encodeURIComponent(url.value)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch analysis. The API returned an error.');
    }
    const data = await response.json();
    graphData.value = data;
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
h1 {
  font-family: sans-serif;
  text-align: center;
  margin-bottom: 2rem;
}
.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}
input {
  width: 300px;
  padding: 0.5rem;
  font-size: 1rem;
}
button {
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
}
.error-message {
  color: red;
  text-align: center;
  margin-bottom: 2rem;
}
.placeholder {
  text-align: center;
  color: #888;
  font-size: 1.2rem;
  margin-top: 5rem;
}
.graph-wrapper {
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  height: 70vh; /* give a fixed height to the container of the graph */
  margin: 0 auto;
  max-width: 90%;
}
</style>
