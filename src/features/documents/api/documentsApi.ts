import { hidraAxios } from '@/api/client/hidraAxios';
import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type {
  DocumentResponse,
  DocumentTargetLinkResponse,
  DocumentVersionResponse,
  LinkDocumentToTargetRequest,
  RegisterDocumentRequest,
  UploadDocumentBinaryVersionRequest,
} from '@/api/generated/documents/model';

export interface DownloadedDocumentVersion {
  blob: Blob;
  filename: string;
  contentType: string;
}

export function registerDocument(request: RegisterDocumentRequest): Promise<DocumentResponse> {
  return hidraHttpClient<DocumentResponse>({ method: 'POST', url: '/api/v1/documents/documents', data: request });
}

export async function uploadDocumentVersionContent(
  metadata: UploadDocumentBinaryVersionRequest,
  file: File,
): Promise<DocumentVersionResponse> {
  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', file, file.name);
  return hidraHttpClient<DocumentVersionResponse>({
    method: 'POST',
    url: '/api/v1/documents/document-versions/upload',
    data: formData,
  });
}

function decodeContentDispositionFilename(value: string | undefined): string | null {
  if (!value) return null;
  const encoded = value.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded);
    } catch {
      return encoded;
    }
  }
  const quoted = value.match(/filename="([^"]+)"/i)?.[1];
  return quoted ?? null;
}

export async function downloadDocumentVersionContent(versionId: string): Promise<DownloadedDocumentVersion> {
  const response = await hidraAxios.get<Blob>(`/api/v1/documents/document-versions/${encodeURIComponent(versionId)}/content`, {
    responseType: 'blob',
  });
  const filename = decodeContentDispositionFilename(response.headers['content-disposition']);
  if (!filename) {
    throw new Error('HidraAPI download response did not publish an attachment filename.');
  }
  return {
    blob: response.data,
    filename,
    contentType: response.headers['content-type'] ?? response.data.type ?? 'application/octet-stream',
  };
}

export function linkDocumentToTarget(request: LinkDocumentToTargetRequest): Promise<DocumentTargetLinkResponse> {
  return hidraHttpClient<DocumentTargetLinkResponse>({ method: 'POST', url: '/api/v1/documents/target-links', data: request });
}
