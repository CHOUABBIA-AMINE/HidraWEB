import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';

import { CustodyDiscrepanciesPage } from './CustodyDiscrepanciesPage';
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
          <Tab label="Discrepancies & reconciliation" />
        </Tabs>
      </Box>
      {workspace === 0 ? <CustodyMeasurementPeriodsPage /> : null}
      {workspace === 1 ? <CustodyTransferTicketsPage /> : null}
      {workspace === 2 ? <CustodyDiscrepanciesPage /> : null}
    </Box>
  );
}
