import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type {
  DocumentResponse,
  DocumentTargetLinkResponse,
  DocumentVersionResponse,
  LinkDocumentToTargetRequest,
  RegisterDocumentRequest,
  UploadDocumentVersionRequest,
} from '@/api/generated/documents/model';

export function registerDocument(request: RegisterDocumentRequest): Promise<DocumentResponse> {
  return hidraHttpClient<DocumentResponse>({ method: 'POST', url: '/api/v1/documents/documents', data: request });
}

export function registerDocumentVersion(request: UploadDocumentVersionRequest): Promise<DocumentVersionResponse> {
  return hidraHttpClient<DocumentVersionResponse>({ method: 'POST', url: '/api/v1/documents/document-versions', data: request });
}

export function linkDocumentToTarget(request: LinkDocumentToTargetRequest): Promise<DocumentTargetLinkResponse> {
  return hidraHttpClient<DocumentTargetLinkResponse>({ method: 'POST', url: '/api/v1/documents/target-links', data: request });
}
