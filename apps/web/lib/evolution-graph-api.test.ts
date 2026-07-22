import { describe, expect, it } from 'vitest';

import {
  EvolutionGraphResponse,
  validateEvolutionGraphResponse,
} from './evolution-graph-api';

describe('evolution graph api validation', () => {
  it('should reject graphs without future identity', () => {
    const response = {
      nodes: [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          type: 'goal',
          label: 'Goal',
          description: null,
        },
      ],
      relationships: [],
    };

    expect(() => validateEvolutionGraphResponse(response)).toThrow(
      'El grafo debe contener al menos la identidad futura central.'
    );
  });

  it('should reject graphs with two future identities', () => {
    const response = {
      nodes: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'future_identity',
          label: 'Future Identity 1',
          description: null,
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          type: 'future_identity',
          label: 'Future Identity 2',
          description: null,
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          type: 'goal',
          label: 'Goal',
          description: null,
        },
      ],
      relationships: [
        {
          from: '123e4567-e89b-12d3-a456-426614174000',
          to: '123e4567-e89b-12d3-a456-426614174002',
          type: 'has_goal',
        },
      ],
    };

    expect(() => validateEvolutionGraphResponse(response)).toThrow(
      'El grafo debe contener exactamente una identidad futura.'
    );
  });

  it('should accept valid graphs with exactly one future identity', () => {
    const response: EvolutionGraphResponse = {
      nodes: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'future_identity',
          label: 'Future Identity',
          description: null,
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          type: 'goal',
          label: 'Goal',
          description: null,
        },
      ],
      relationships: [
        {
          from: '123e4567-e89b-12d3-a456-426614174000',
          to: '123e4567-e89b-12d3-a456-426614174001',
          type: 'has_goal',
        },
      ],
    };

    expect(() => validateEvolutionGraphResponse(response)).not.toThrow();
  });

  it('should reject graphs without future identity', () => {
    const response = {
      nodes: [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          type: 'goal',
          label: 'Goal',
          description: null,
        },
      ],
      relationships: [],
    };

    expect(() => validateEvolutionGraphResponse(response)).toThrow(
      'El grafo debe contener al menos la identidad futura central.'
    );
  });

  it('should reject graphs with two future identities', () => {
    const response = {
      nodes: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'future_identity',
          label: 'Future Identity 1',
          description: null,
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          type: 'future_identity',
          label: 'Future Identity 2',
          description: null,
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          type: 'goal',
          label: 'Goal',
          description: null,
        },
      ],
      relationships: [
        {
          from: '123e4567-e89b-12d3-a456-426614174000',
          to: '123e4567-e89b-12d3-a456-426614174001',
          type: 'has_goal',
        },
      ],
    };

    expect(() => validateEvolutionGraphResponse(response)).toThrow(
      'El grafo debe contener exactamente una identidad futura.'
    );
  });
});