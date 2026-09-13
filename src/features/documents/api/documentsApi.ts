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

function headerString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.join(', ');
  return undefined;
}

export async function downloadDocumentVersionContent(versionId: string): Promise<DownloadedDocumentVersion> {
  const response = await hidraAxios.get<Blob>(`/api/v1/documents/document-versions/${encodeURIComponent(versionId)}/content`, {
    responseType: 'blob',
  });
  const contentDisposition = headerString(response.headers.get('content-disposition'));
  const contentType = headerString(response.headers.get('content-type')) ?? response.data.type || 'application/octet-stream';
  const filename = decodeContentDispositionFilename(contentDisposition);
  if (!filename) {
    throw new Error('HidraAPI download response did not publish an attachment filename.');
  }
  return {
    blob: response.data,
    filename,
    contentType,
  };
}

export function linkDocumentToTarget(request: LinkDocumentToTargetRequest): Promise<DocumentTargetLinkResponse> {
  return hidraHttpClient<DocumentTargetLinkResponse>({ method: 'POST', url: '/api/v1/documents/target-links', data: request });
}
