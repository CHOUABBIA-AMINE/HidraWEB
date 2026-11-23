import { Button, Stack, Typography } from '@mui/material';

export interface FileEvidencePanelProps {
  versionId: string;
  attributes: Readonly<Record<string, unknown>>;
  downloadPermitted: boolean;
  downloading?: boolean;
  onDownload: (versionId: string) => void;
}

function publishedText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function byteSize(value: unknown): string | undefined {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
    ? `${value} bytes` : undefined;
}

/** Binary retrieval and integrity are owner-controlled; this UI never hashes or signs file bytes. */
export function FileEvidencePanel({ versionId, attributes, downloadPermitted, downloading = false, onDownload }: FileEvidencePanelProps) {
  const evidence = [
    ['Filename', publishedText(attributes.originalFilename)],
    ['MIME type', publishedText(attributes.mimeType)],
    ['File size', byteSize(attributes.fileSizeBytes)],
    ['Owner checksum', publishedText(attributes.checksumValue)],
  ] as const;
  return (
    <Stack spacing={1} aria-label="File evidence" role="group">
      <Stack component="dl" spacing={0.5} sx={{ m: 0 }}>
        {evidence.filter(([,value]) => value !== undefined).map(([label,value]) => (
          <Stack key={label} direction="row" spacing={1}>
            <Typography component="dt" color="text.secondary" variant="caption">{label}:</Typography>
            <Typography component="dd" sx={{ m: 0, overflowWrap: 'anywhere' }} variant="caption">{value}</Typography>
          </Stack>
        ))}
      </Stack>
      <Typography color="text.secondary" variant="caption">Metadata supplied by HidraAPI; checksum is not independently verified in the browser.</Typography>
      <Button size="small" disabled={!downloadPermitted || !versionId || downloading}
        onClick={() => onDownload(versionId)}>Download</Button>
    </Stack>
  );
}
