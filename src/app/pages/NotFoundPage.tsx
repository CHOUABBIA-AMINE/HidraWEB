import { Button, Container, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Stack spacing={2}>
        <Typography component="h1" variant="h4">
          Page not found
        </Typography>
        <Typography color="text.secondary">
          The requested HidraWeb route is not part of the current implementation baseline.
        </Typography>
        <Button component={Link} to="/overview" variant="contained">
          Return to overview
        </Button>
      </Stack>
    </Container>
  );
}
