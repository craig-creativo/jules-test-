<template>
  <div class="bg-gray-100 min-h-screen">
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <a href="/" class="text-xl font-bold text-gray-800">AIO Content Audit Tool</a>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <div v-if="isLoading" class="text-center py-20">
        <p class="text-2xl text-gray-600">Analyzing page... this may take a moment.</p>
      </div>
      <div v-else-if="error" class="text-center py-20">
        <h2 class="text-3xl text-red-600 font-bold">Analysis Failed</h2>
        <p class="text-xl text-gray-700 mt-2">{{ error }}</p>
        <a href="/" class="mt-8 inline-block bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">Try another URL</a>
      </div>
      <div v-else-if="reportData" class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Left Column: Recommendations -->
          <div class="md:col-span-1">
            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-bold text-gray-900 border-b pb-2">Top Recommendations</h3>
              <ul v-if="reportData.recommendations.length" class="mt-4 space-y-3">
                <li v-for="rec in reportData.recommendations" :key="rec" class="flex items-start">
                  <span class="text-green-500 mr-2">&#10003;</span>
                  <span class="text-gray-700">{{ rec }}</span>
                </li>
              </ul>
              <p v-else class="text-gray-600 mt-4">No specific recommendations. Great job!</p>
            </div>
          </div>

          <!-- Right Column: Main Report -->
          <div class="md:col-span-2 space-y-8">
            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-bold text-gray-900 border-b pb-2">Page Summary</h3>
              <div class="mt-4 grid grid-cols-2 gap-4">
                <div><strong>Title:</strong> <span class="text-gray-700">{{ reportData.summary.title }}</span></div>
                <div><strong>Word Count:</strong> <span class="text-gray-700">{{ reportData.summary.wordCount }}</span></div>
                <div><strong>Readability (Flesch-Kincaid):</strong> <span class="text-gray-700">{{ reportData.summary.readabilityScore }}</span></div>
                <div><strong>Meta Description:</strong> <span class="text-gray-700">{{ reportData.summary.description }}</span></div>
              </div>
            </div>

            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-bold text-gray-900 border-b pb-2">Heading Structure</h3>
              <ul class="mt-4 space-y-2">
                <li v-for="h in reportData.headings.structure" :key="h.text" :class="`pl-${h.level * 4}`">
                  <span class="font-mono text-xs bg-gray-200 text-gray-700 rounded-sm px-1 mr-2">H{{ h.level }}</span>
                  <span>{{ h.text }}</span>
                </li>
              </ul>
              <div v-if="reportData.headings.errors.length" class="mt-4 border-t pt-4">
                 <p v-for="err in reportData.headings.errors" :key="err" class="text-red-500">{{ err }}</p>
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
              <h3 class="text-xl font-bold text-gray-900 border-b pb-2">Entity & Topic Analysis</h3>
               <div class="mt-4">
                 <strong>Top Topics:</strong>
                 <div class="flex flex-wrap gap-2 mt-2">
                   <span v-for="topic in reportData.entities.topics" :key="topic.text" class="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">{{ topic.text }} ({{ topic.count }})</span>
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
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

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
/* Scoped styles can be added here if needed, but most styling is done with Tailwind CSS */
</style>
