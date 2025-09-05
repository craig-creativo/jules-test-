<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900">AI-Powered Content Brief Generator</h1>
    <p class="mt-2 text-gray-600">Enter a target keyword to analyze the top 10 search results and generate a data-driven content brief.</p>

    <div class="mt-8 card">
      <div class="input-group">
        <input
          type="text"
          v-model="keyword"
          @keyup.enter="startAnalysis"
          placeholder="e.g., 'what is nuxt js'"
          class="url-input"
        />
        <button
          @click="startAnalysis"
          :disabled="isLoading || !keyword.trim()"
          class="analyze-button"
        >
          {{ isLoading ? 'Generating...' : 'Generate Brief' }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="mt-8 text-center p-8 bg-blue-50 border-2 border-blue-200 border-dashed rounded-lg">
      <p class="text-xl font-semibold text-blue-700">Generating your content brief...</p>
      <p class="text-gray-600 mt-2">This involves analyzing multiple live web pages and can take up to a minute. Please be patient.</p>
    </div>

    <div v-if="error" class="mt-8 text-center p-4 bg-red-100 text-red-700 rounded-lg">
      <p><strong>Brief Generation Failed:</strong> {{ error }}</p>
    </div>

    <div v-if="results" class="mt-8 card space-y-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Content Brief for: <span class="text-blue-600">"{{ results.keyword }}"</span></h2>
        <p class="text-sm text-gray-500">Based on an analysis of {{ results.analyzedUrlCount }} top search results.</p>
      </div>

      <div class="border-t pt-6">
        <h3 class="text-xl font-semibold text-gray-800">Content Target</h3>
        <div class="mt-4 p-4 bg-gray-50 rounded-md">
          <p class="text-lg">Aim for a word count around: <strong class="text-2xl text-green-600">{{ results.averageWordCount }} words</strong></p>
        </div>
      </div>

      <div class="border-t pt-6">
        <h3 class="text-xl font-semibold text-gray-800">Key Topics & Phrases to Include</h3>
        <p class="text-sm text-gray-500">These are the most common keyphrases found across the top-ranking pages.</p>
        <div class="flex flex-wrap gap-3 mt-4">
          <span v-for="phrase in results.commonKeyphrases" :key="phrase" class="bg-indigo-100 text-indigo-800 text-md font-medium px-4 py-2 rounded-full">
            {{ phrase }}
          </span>
        </div>
      </div>

      <div class="border-t pt-6">
        <h3 class="text-xl font-semibold text-gray-800">Common Headings & Questions</h3>
        <p class="text-sm text-gray-500">Consider using these headings or variations of them in your content structure.</p>
        <ul class="list-disc list-inside mt-4 space-y-2">
          <li v-for="heading in results.commonHeadings" :key="heading" class="text-gray-700">
            {{ heading }}
          </li>
        </ul>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

const keyword = ref('');
const isLoading = ref(false);
const error = ref(null);
const results = ref(null);

const startAnalysis = async () => {
  if (!keyword.value.trim()) return;

  isLoading.value = true;
  error.value = null;
  results.value = null;

  try {
    const response = await fetch(`/api/generate-brief?keyword=${encodeURIComponent(keyword.value)}`);
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
.input-group {
  display: flex;
  gap: 1rem;
}
.url-input {
  @apply w-full p-3 border border-gray-300 rounded-lg;
}
.analyze-button {
  @apply py-3 px-6 cursor-pointer font-semibold rounded-lg bg-indigo-600 text-white transition-colors;
}
.analyze-button:hover {
  @apply bg-indigo-700;
}
.analyze-button:disabled {
  @apply bg-gray-400 cursor-not-allowed;
}
</style>
