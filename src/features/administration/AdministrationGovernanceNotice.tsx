import { Alert, AlertTitle, Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';

export function AdministrationGovernanceNotice() {
  return (
    <Alert severity="info" sx={{ mx: { xs: 2, md: 3 }, mt: 3 }}>
      <AlertTitle>Administration governance</AlertTitle>
      <Stack spacing={1}>
        <Typography variant="body2">
          Destructive administration actions require explicit confirmation before execution. Audit references are displayed only when HidraAPI explicitly returns them; HidraWEB does not synthesize audit identifiers from entity IDs, statuses, or client correlation values.
        </Typography>
        <Typography variant="body2">
          Use the audit workspace to inspect backend-owned evidence for completed administration activity.
        </Typography>
        <Button component={RouterLink} to="/administration/audit" variant="text" sx={{ alignSelf: 'flex-start', px: 0 }}>
          Open audit evidence
        </Button>
      </Stack>
    </Alert>
  );
}
