<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900">Content Gap Analysis</h1>
    <p class="mt-2 text-gray-600">Compare your page against a competitor's to find content opportunities and keyword gaps.</p>

    <div class="mt-8 card">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="myUrl" class="label">Your URL</label>
          <input id="myUrl" type="text" v-model="myUrl" placeholder="https://your-site.com/page" class="url-input" />
        </div>
        <div>
          <label for="competitorUrl" class="label">Competitor's URL</label>
          <input id="competitorUrl" type="text" v-model="competitorUrl" placeholder="https://competitor.com/page" class="url-input" />
        </div>
      </div>
      <div class="mt-6">
        <button @click="startAnalysis" :disabled="isLoading || !myUrl.trim() || !competitorUrl.trim()" class="analyze-button w-full">
          {{ isLoading ? 'Analyzing...' : 'Find Content Gaps' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="mt-8 text-center p-4 bg-red-100 text-red-700 rounded-lg">
      <p><strong>Analysis Failed:</strong> {{ error }}</p>
    </div>

    <div v-if="results" class="mt-8 card">
      <h2 class="text-2xl font-bold text-gray-900 border-b pb-3">Analysis Results</h2>
      <div class="mt-4">
        <p>Your page has <strong>{{ results.myKeyphraseCount }}</strong> keyphrases.</p>
        <p>Your competitor's page has <strong>{{ results.competitorKeyphraseCount }}</strong> keyphrases.</p>
      </div>
      <div class="mt-6">
        <h3 class="text-xl font-semibold">Keyphrases to consider adding:</h3>
        <p v-if="!results.gapKeyphrases.length" class="text-gray-600 mt-2">No significant gaps found. You cover the same topics!</p>
        <div v-else class="flex flex-wrap gap-3 mt-4">
          <span v-for="phrase in results.gapKeyphrases" :key="phrase" class="bg-green-100 text-green-800 text-md font-medium px-4 py-2 rounded-full">
            {{ phrase }}
          </span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

const myUrl = ref('');
const competitorUrl = ref('');
const isLoading = ref(false);
const error = ref(null);
const results = ref(null);

const startAnalysis = async () => {
  if (!myUrl.value.trim() || !competitorUrl.value.trim()) return;

  isLoading.value = true;
  error.value = null;
  results.value = null;

  try {
    const response = await fetch(`/api/content-gap?myUrl=${encodeURIComponent(myUrl.value)}&competitorUrl=${encodeURIComponent(competitorUrl.value)}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.statusMessage || 'Analysis failed.');
    }
    results.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.card {
  @apply bg-white p-8 rounded-lg shadow;
}
.label {
  @apply block mb-2 text-sm font-medium text-gray-700;
}
.url-input {
  @apply w-full p-3 border border-gray-300 rounded-lg;
}
.analyze-button {
  @apply py-3 px-6 cursor-pointer font-semibold rounded-lg bg-blue-600 text-white transition-colors;
}
.analyze-button:hover {
  @apply bg-blue-700;
}
.analyze-button:disabled {
  @apply bg-gray-400 cursor-not-allowed;
}
</style>
