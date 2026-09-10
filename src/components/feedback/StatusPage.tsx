import { Alert, Box, Button, Paper, Typography } from '@mui/material';

interface StatusPageProps {
  code: string;
  title: string;
  description: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function StatusPage({ code, title, description, detail, actionLabel, onAction }: StatusPageProps) {
  return (
    <Box sx={{ display: 'grid', minHeight: '55vh', placeItems: 'center', p: 3 }}>
      <Paper variant="outlined" sx={{ width: 'min(100%, 640px)', p: { xs: 3, md: 5 } }}>
        <Typography color="text.secondary" variant="overline">
          {code}
        </Typography>
        <Typography component="h1" sx={{ mt: 1 }} variant="h4">
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          {description}
        </Typography>
        {detail ? <Alert severity="info" sx={{ mt: 3 }}>{detail}</Alert> : null}
        {actionLabel && onAction ? (
          <Button onClick={onAction} sx={{ mt: 3 }} variant="contained">
            {actionLabel}
          </Button>
        ) : null}
      </Paper>
    </Box>
  );
}
