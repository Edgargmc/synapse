import { AttentionNode } from '../../domain/attention-node';

export type AttentionNodeResponse = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toAttentionNodeResponse(
  attentionNode: AttentionNode,
): AttentionNodeResponse {
  return {
    id: attentionNode.id,
    name: attentionNode.name,
    description: attentionNode.description,
    createdAt: attentionNode.createdAt.toISOString(),
    updatedAt: attentionNode.updatedAt.toISOString(),
  };
}
