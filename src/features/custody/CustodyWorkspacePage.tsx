import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';

import { CustodyMeasurementPeriodsPage } from './CustodyMeasurementPeriodsPage';
import { CustodyTransferTicketsPage } from './CustodyTransferTicketsPage';

export function CustodyWorkspacePage() {
  const [workspace, setWorkspace] = useState(0);

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 2, sm: 3 }, pt: 2 }}>
        <Tabs
          aria-label="Custody workspace"
          value={workspace}
          onChange={(_, value: number) => setWorkspace(value)}
        >
          <Tab label="Measurement periods" />
          <Tab label="Transfer tickets" />
        </Tabs>
      </Box>
      {workspace === 0 ? <CustodyMeasurementPeriodsPage /> : <CustodyTransferTicketsPage />}
    </Box>
  );
}
