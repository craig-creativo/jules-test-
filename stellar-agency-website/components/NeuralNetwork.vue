<template>
  <div ref="graphContainer" class="graph-container">
    <ClientOnly>
      <VueForceGraph3D
        v-if="graphData"
        :graphData="graphData"
        :nodeLabel="'id'"
        :nodeAutoColorBy="'group'"
        :linkWidth="2"
        :linkDirectionalParticles="2"
        :linkDirectionalParticleWidth="2"
        :nodeVal="'val'"
        @nodeClick="onNodeClick"
        :height="height"
        :width="width"
      />
    </ClientOnly>
    <div v-if="selectedNode" class="node-details-panel">
      <h3>Node Details</h3>
      <p><strong>ID:</strong> {{ selectedNode.id }}</p>
      <p><strong>Group:</strong> {{ selectedNode.group }}</p>
      <p><strong>Value:</strong> {{ selectedNode.val }}</p>
      <button @click="selectedNode = null">Close</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineProps } from 'vue';
import { VueForceGraph3D } from 'vue-force-graph';

const props = defineProps({
  graphData: {
    type: Object,
    required: true,
  },
});

const graphContainer = ref(null);
const width = ref(800);
const height = ref(600);
const selectedNode = ref(null);

const onNodeClick = (node) => {
  selectedNode.value = node;
};

const updateDimensions = () => {
  if (graphContainer.value) {
    width.value = graphContainer.value.offsetWidth;
    height.value = graphContainer.value.offsetHeight;
  }
};

onMounted(() => {
  // Set initial dimensions
  updateDimensions();
  window.addEventListener('resize', updateDimensions);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDimensions);
});
</script>

<style scoped>
.graph-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.node-details-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  width: 250px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.node-details-panel h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid #555;
  padding-bottom: 0.5rem;
}

.node-details-panel p {
  margin: 0.5rem 0;
}

.node-details-panel button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  width: 100%;
  background-color: #555;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.node-details-panel button:hover {
  background-color: #777;
}
</style>
