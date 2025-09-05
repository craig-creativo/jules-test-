<template>
  <div ref="graphContainer" class="graph-container">
    <ClientOnly>
      <VueForceGraph3D
        ref="graphRef"
        v-if="graphData"
        :graphData="graphData"
        :nodeLabel="'id'"
        :nodeVal="'val'"
        :nodeColor="nodeColor"
        :linkColor="linkColor"
        :linkWidth="linkWidth"
        :linkDirectionalParticles="linkDirectionalParticles"
        :linkDirectionalParticleWidth="linkDirectionalParticleWidth"
        @nodeClick="onNodeClick"
        @onBackgroundClick="clearHighlights"
        :height="height"
        :width="width"
        :cooldownTime="3000"
      />
    </ClientOnly>
    <div v-if="selectedNode" class="node-details-panel">
      <h3>{{ selectedNode.id }}</h3>
      <div class="details-content">
        <p><strong>Group:</strong> {{ selectedNode.group }}</p>
        <p><strong>Strength:</strong> {{ selectedNode.val }}</p>
        <div v-if="contextSentences && contextSentences.length" class="context-sentences">
          <h4>Context Sentences:</h4>
          <ul>
            <li v-for="(sentence, index) in contextSentences" :key="index">
              "{{ sentence }}"
            </li>
          </ul>
        </div>
      </div>
      <button @click="clearHighlights">Close</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, defineProps, defineExpose } from 'vue';
import { VueForceGraph3D } from 'vue-force-graph';

const props = defineProps({
  graphData: {
    type: Object,
    required: true,
  },
  contextData: {
    type: Object,
    required: false,
    default: () => ({})
  }
});

const graphContainer = ref(null);
const graphRef = ref();
const width = ref(800);
const height = ref(600);
const selectedNode = ref(null);
const highlightNodes = ref(new Set());
const highlightLinks = ref(new Set());

const contextSentences = computed(() => {
  if (!selectedNode.value || !props.contextData) return [];
  return props.contextData[selectedNode.value.id] || [];
});

const onNodeClick = (node) => {
  selectedNode.value = node;
  highlightNodes.value.clear();
  highlightLinks.value.clear();
  highlightNodes.value.add(node);

  if (props.graphData && props.graphData.links) {
    props.graphData.links.forEach(link => {
      const source = link.source.id || link.source;
      const target = link.target.id || link.target;
      if (source === node.id || target === node.id) {
        highlightLinks.value.add(link);
        const neighbor = source === node.id ? target : source;
        const neighborNode = props.graphData.nodes.find(n => n.id === neighbor);
        if(neighborNode) highlightNodes.value.add(neighborNode);
      }
    });
  }
};

const clearHighlights = () => {
  selectedNode.value = null;
  highlightNodes.value.clear();
  highlightLinks.value.clear();
};

const nodeColor = (node) => {
  if (highlightNodes.value.size > 0) {
    return highlightNodes.value.has(node) ? getNodeColor(node.group) : 'rgba(150, 150, 150, 0.2)';
  }
  return getNodeColor(node.group);
};

const linkColor = (link) => {
  if (highlightLinks.value.size > 0) {
    return highlightLinks.value.has(link) ? '#ffffff' : 'rgba(100, 100, 100, 0.1)';
  }
  return '#a0a0a0';
};

const linkWidth = (link) => {
  if (highlightLinks.value.size > 0) {
    return highlightLinks.value.has(link) ? 4 : 1;
  }
  // Use the value from the data, with clamping
  return Math.max(1, Math.min(link.value * 0.5, 8));
};

const linkDirectionalParticles = (link) => {
  return highlightLinks.value.has(link) ? 4 : 2;
};

const linkDirectionalParticleWidth = (link) => {
  if (highlightLinks.value.has(link)) {
    return 4;
  }
  return Math.max(1, Math.min(link.value * 0.5, 8));
};


const getNodeColor = (group) => {
  switch (group) {
    case 'page': return '#ff7f0e';
    case 'topic': return '#1f77b4';
    default: return '#d62728';
  }
};

const updateDimensions = () => {
  if (graphContainer.value) {
    width.value = graphContainer.value.offsetWidth;
    height.value = graphContainer.value.offsetHeight;
  }
};

const pauseAnimation = () => graphRef.value?.pauseAnimation();
const resumeAnimation = () => graphRef.value?.resumeAnimation();

defineExpose({ pauseAnimation, resumeAnimation });

onMounted(() => {
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
  background-color: #000011;
}

.node-details-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(5px);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  width: 300px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.details-content {
  overflow-y: auto;
  flex-grow: 1;
}

.node-details-panel h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid #4b5563;
  padding-bottom: 0.75rem;
  font-size: 1.25rem;
}

.node-details-panel p {
  margin: 0.5rem 0;
}

.context-sentences {
  margin-top: 1.5rem;
}

.context-sentences h4 {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.context-sentences ul {
  list-style-type: none;
  padding-left: 0;
  max-height: 300px;
  overflow-y: auto;
}

.context-sentences li {
  font-style: italic;
  padding: 0.5rem;
  border-bottom: 1px solid #374151;
  color: #d1d5db;
}
.context-sentences li:last-child {
  border-bottom: none;
}

.node-details-panel button {
  margin-top: 1.5rem;
  padding: 0.5rem 1rem;
  width: 100%;
  background-color: #4b5563;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
}

.node-details-panel button:hover {
  background-color: #6b7280;
}
</style>
