---
name: ai-synapse-engine
description: Implements AI vector embeddings, cosine similarity computation, spontaneous association generators, and multi-note idea synthesis for Neural Zettelkasten.
---

# AI Synapse Engine Skill

This skill guides the implementation of semantic embeddings, vector similarity matching, and generative RAG synthesis.

## 1. Cosine Similarity Calculation
```typescript
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecA[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

## 2. Multi-Note Synthesis Prompt Template
```typescript
export const SYNTHESIS_PROMPT = `
You are the Cognitive Synthesis Engine of a Neural Zettelkasten.
Given the following interconnected notes:
{{selectedNotes}}

Generate a cohesive synthesis essay that:
1. Identifies the emergent central thesis connecting these concepts.
2. Explains the dialectic or synergy between the ideas.
3. Proposes 2 new novel research questions or unasked hypothesis.
`;
```
