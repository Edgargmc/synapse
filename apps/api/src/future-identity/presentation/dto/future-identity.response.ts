import { FutureIdentity } from '../../domain/future-identity';

export type FutureIdentityResponse = {
  id: string;
  statement: string;
  purpose: string;
  createdAt: string;
  updatedAt: string;
};

export function toFutureIdentityResponse(
  identity: FutureIdentity,
): FutureIdentityResponse {
  return {
    id: identity.id,
    statement: identity.statement,
    purpose: identity.purpose,
    createdAt: identity.createdAt.toISOString(),
    updatedAt: identity.updatedAt.toISOString(),
  };
}
