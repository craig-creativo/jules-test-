<template>
  <div>
    <div v-if="isLoading" class="text-center py-20">
      <p class="text-2xl text-gray-600">Analyzing page... this may take a moment.</p>
    </div>
    <div v-else-if="error" class="text-center py-20">
      <h2 class="text-3xl text-red-600 font-bold">Analysis Failed</h2>
      <p class="text-xl text-gray-700 mt-2">{{ error }}</p>
      <NuxtLink to="/audit" class="mt-8 inline-block bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">Try another URL</NuxtLink>
    </div>
    <div v-else-if="reportData" class="space-y-8">
      <h1 class="text-3xl font-bold text-gray-900">Audit Report for: <a :href="reportData.url" target="_blank" class="text-blue-600 hover:underline">{{ reportData.url }}</a></h1>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Recommendations -->
        <div class="lg:col-span-1">
          <div class="bg-white p-6 rounded-lg shadow sticky top-8">
            <h3 class="text-xl font-bold text-gray-900 border-b pb-2">Top Recommendations</h3>
            <ul v-if="reportData.recommendations.length" class="mt-4 space-y-3">
              <li v-for="rec in reportData.recommendations" :key="rec" class="flex items-start">
                <span class="text-green-500 mr-3 mt-1 flex-shrink-0">&#10003;</span>
                <span class="text-gray-700">{{ rec }}</span>
              </li>
            </ul>
            <p v-else class="text-gray-600 mt-4">No specific recommendations. Great job!</p>
          </div>
        </div>

        <!-- Right Column: Main Report -->
        <div class="lg:col-span-2 space-y-8">
          <SERPSnippet
            :title="reportData.summary.title"
            :description="reportData.summary.description"
            :url="reportData.url"
          />

          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-xl font-bold text-gray-900 border-b pb-2">Page Summary</h3>
            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><strong>Title:</strong> <span class="text-gray-700">{{ reportData.summary.title }}</span></div>
              <div><strong>Word Count:</strong> <span class="text-gray-700">{{ reportData.summary.wordCount }}</span></div>
              <div><strong>Readability (Flesch-Kincaid):</strong> <span class="text-gray-700">{{ reportData.summary.readabilityScore }}</span></div>
              <div class="sm:col-span-2"><strong>Meta Description:</strong> <span class="text-gray-700">{{ reportData.summary.description }}</span></div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-xl font-bold text-gray-900 border-b pb-2">Heading Structure ({{ reportData.headings.count }})</h3>
            <ul class="mt-4 space-y-2">
              <li v-for="h in reportData.headings.structure" :key="h.text" :style="{ 'margin-left': `${(h.level - 1) * 2}rem` }">
                <span class="font-mono text-xs bg-gray-200 text-gray-700 rounded-sm px-1 mr-2">H{{ h.level }}</span>
                <span>{{ h.text }}</span>
              </li>
            </ul>
            <div v-if="reportData.headings.errors.length" class="mt-4 border-t pt-4">
               <p v-for="err in reportData.headings.errors" :key="err" class="text-red-500 font-semibold">{{ err }}</p>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-xl font-bold text-gray-900 border-b pb-2">Schema & Structured Data</h3>
            <div v-if="reportData.schema.found" class="mt-4">
              <p>Found {{ reportData.schema.count }} schema(s) of type: <strong>{{ reportData.schema.types.join(', ') }}</strong></p>
              <pre class="bg-gray-800 text-white p-4 rounded-md mt-4 text-xs overflow-x-auto"><code>{{ JSON.stringify(reportData.schema.details, null, 2) }}</code></pre>
            </div>
            <p v-else class="text-gray-600 mt-4">No Schema.org structured data found.</p>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-xl font-bold text-gray-900 border-b pb-2">Keyphrase Prominence</h3>
            <table class="w-full mt-4 text-left">
              <thead>
                <tr>
                  <th class="p-2">Keyphrase</th>
                  <th class="p-2 text-center">In Title</th>
                  <th class="p-2 text-center">In Description</th>
                  <th class="p-2 text-center">In H1</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in reportData.keyphraseProminence" :key="p.phrase" class="border-t">
                  <td class="p-2 font-semibold">{{ p.phrase }}</td>
                  <td class="p-2 text-center text-2xl" :class="p.inTitle ? 'text-green-500' : 'text-gray-300'">✓</td>
                  <td class="p-2 text-center text-2xl" :class="p.inDescription ? 'text-green-500' : 'text-gray-300'">✓</td>
                  <td class="p-2 text-center text-2xl" :class="p.inH1 ? 'text-green-500' : 'text-gray-300'">✓</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-xl font-bold text-gray-900 border-b pb-2">Full Entity Analysis</h3>
             <div class="mt-4">
               <strong>Top Keyphrases:</strong>
               <div class="flex flex-wrap gap-2 mt-2">
                 <span v-for="phrase in reportData.entities.keyphrases" :key="phrase.text" class="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">{{ phrase.text }} ({{ phrase.count }})</span>
               </div>
             </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-xl font-bold text-gray-900 border-b pb-2">Link & Image Audit</h3>
            <div class="mt-4 grid grid-cols-2 gap-4">
              <div><strong>Internal Links:</strong> {{ reportData.links.internalCount }}</div>
              <div><strong>External Links:</strong> {{ reportData.links.externalCount }}</div>
              <div><strong>Images:</strong> {{ reportData.links.imageCount }}</div>
              <div><strong>Images without Alt Text:</strong> <span :class="reportData.links.imagesWithoutAlt > 0 ? 'text-red-500 font-bold' : ''">{{ reportData.links.imagesWithoutAlt }}</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import SERPSnippet from '~/components/SERPSnippet.vue';

const route = useRoute();
const reportData = ref(null);
const isLoading = ref(true);
const error = ref(null);

onMounted(async () => {
  const urlToAnalyze = route.query.url;
  if (!urlToAnalyze) {
    error.value = 'No URL provided for analysis.';
    isLoading.value = false;
    return;
  }

  try {
    const response = await fetch(`/api/analyze?url=${encodeURIComponent(urlToAnalyze)}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.statusMessage || 'Analysis failed.');
    }
    reportData.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
</style>
