<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h3 class="text-xl font-bold text-gray-900 border-b pb-2 mb-4">Google Snippet Preview</h3>
    <div class="p-4 border border-gray-200 rounded-lg">
      <div class="flex items-center">
        <span class="text-sm text-gray-700">{{ formattedUrl }}</span>
      </div>
      <h2 class="text-blue-800 text-xl hover:underline cursor-pointer truncate">
        {{ truncatedTitle }}
      </h2>
      <p class="text-gray-600 text-sm mt-1">
        {{ truncatedDescription }}
      </p>
    </div>
    <div class="mt-4 space-y-1 text-sm">
      <p v-if="isTitleTruncated" class="text-yellow-600">
        <strong>Warning:</strong> Title may be truncated by Google. ({{ title.length }} chars)
      </p>
      <p v-if="isDescriptionTruncated" class="text-yellow-600">
        <strong>Warning:</strong> Description may be truncated by Google. ({{ description.length }} chars)
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const TITLE_MAX_LENGTH = 60;
const DESC_MAX_LENGTH = 155;

const isTitleTruncated = computed(() => props.title.length > TITLE_MAX_LENGTH);
const isDescriptionTruncated = computed(() => props.description.length > DESC_MAX_LENGTH);

const truncatedTitle = computed(() => {
  if (isTitleTruncated.value) {
    return props.title.substring(0, TITLE_MAX_LENGTH) + '...';
  }
  return props.title;
});

const truncatedDescription = computed(() => {
  if (isDescriptionTruncated.value) {
    return props.description.substring(0, DESC_MAX_LENGTH) + '...';
  }
  return props.description;
});

const formattedUrl = computed(() => {
  try {
    const urlObj = new URL(props.url);
    // Remove 'www.' if it exists
    const hostname = urlObj.hostname.replace(/^www\./, '');
    // Rebuild the path part
    const path = urlObj.pathname === '/' ? '' : urlObj.pathname;
    return `${hostname}${path}`;
  } catch (e) {
    return props.url;
  }
});
</script>

<style scoped>
/* Scoped styles can be added here if needed */
</style>
