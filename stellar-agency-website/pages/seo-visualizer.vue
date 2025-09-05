<template>
  <div>
    <h1 class="text-3xl font-bold text-center my-8">SEO Neural Network Visualizer</h1>
    <div class="controls-container">
      <div class="url-controls">
        <input class="url-input" type="text" v-model="url" placeholder="Enter URL to analyze" />
        <button class="analyze-button" @click="analyzeUrl" :disabled="isLoading">
          {{ isLoading ? 'Analyzing...' : 'Analyze' }}
        </button>
      </div>
      <div v-if="graphData" class="vis-controls">
        <button @click="freezeGraph">Freeze</button>
        <button @click="reheatGraph">Re-energize</button>
      </div>
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="graphData" class="graph-wrapper">
      <NeuralNetwork ref="neuralNetworkRef" :graphData="graphData" :contextData="contextData" />
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
const contextData = ref(null);
const isLoading = ref(false);
const error = ref(null);
const hasAnalyzed = ref(false);
const neuralNetworkRef = ref(null); // Ref for the component

const analyzeUrl = async () => {
  if (!url.value) {
    error.value = 'Please enter a URL.';
    return;
  }
  isLoading.value = true;
  hasAnalyzed.value = true;
  error.value = null;
  graphData.value = null;
  contextData.value = null;

  try {
    const response = await fetch(`/api/analyze?url=${encodeURIComponent(url.value)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch analysis. The API returned an error.');
    }
    const data = await response.json();
    graphData.value = data.graph;
    contextData.value = data.context;
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

const freezeGraph = () => {
  if (neuralNetworkRef.value) {
    neuralNetworkRef.value.pauseAnimation();
  }
};

const reheatGraph = () => {
  if (neuralNetworkRef.value) {
    neuralNetworkRef.value.resumeAnimation();
  }
};

</script>

<style scoped>
/* Using TailwindCSS classes where possible, but keeping some scoped styles for structure */
.controls-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.url-controls, .vis-controls {
  display: flex;
  gap: 1rem;
}

.url-input {
  width: 350px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.375rem;
}

.analyze-button, .vis-controls button {
  padding: 0.5rem 1.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.375rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  transition: background-color 0.2s;
}

.analyze-button:hover, .vis-controls button:hover {
  background-color: #2563eb;
}

.analyze-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.vis-controls button {
  background-color: #6b7280;
}
.vis-controls button:hover {
  background-color: #4b5563;
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
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  height: 70vh;
  margin: 0 auto;
  max-width: 90%;
  background-color: #f9fafb;
}
</style>
