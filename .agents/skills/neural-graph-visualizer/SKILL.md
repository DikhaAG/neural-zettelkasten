---
name: neural-graph-visualizer
description: Best practices and recipes for rendering 2D/3D Force-Directed Graphs, glowing neural node shaders, synaptic edge animations, and camera interactions with React and Three.js.
---

# Neural Graph Visualizer Skill

This skill provides code recipes and aesthetic tuning guidelines for the Living Brain / Neural Network knowledge graph.

## 1. Aesthetic & Lighting Rules
- Background: Pitch black or deep slate (`#030712` / `rgb(3, 7, 18)`).
- Node Colors by Cluster:
  - PKM / Epistemology: Neon Cyan (`#06b6d4`)
  - Complexity / Systems: Emerald (`#10b981`)
  - Neuroscience & AI: Violet/Purple (`#8b5cf6`)
  - Cognition & Creativity: Amber (`#f59e0b`)
- Edge Types:
  - **Explicit Link (Solid)**: Color `#38bdf8`, opacity `0.4`, thickness `1.2`.
  - **Synaptic Link (Soft AI)**: Color `#a855f7`, dashed/pulsing, opacity `0.25`, thickness `0.8`.

## 2. Dynamic Physics Configuration
```typescript
export const graphPhysicsConfig = {
  charge: -120, // repulsion strength
  linkDistance: 45, // rest length of edges
  linkStrength: 0.7,
  friction: 0.85,
  clusteringForce: 0.15, // pulls same-cluster nodes closer
};
```

## 3. Node Pulse & Focus Interaction
- Hovering a node dims unrelated nodes (opacity `0.1`) and highlights 1st-degree neighbors with glowing haloes.
- Selecting a node centers camera with smooth interpolation.
