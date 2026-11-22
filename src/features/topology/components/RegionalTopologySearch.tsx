import { Alert, Box, Button, CircularProgress, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { useAuth } from '@/app/auth/useAuth';
import { usePermissions } from '@/features/permissions/usePermissions';
import { fetchRegionalTopologyFeature, searchRegionalTopology } from '@/features/topology/api/regionalTopologyApi';
import { TopologyInspector } from '@/features/topology/components/TopologyInspector';
import { exactRegionalFeature, parseRegionalReference, regionalFeatureReference, regionalSearchAdmission, validRegionalQuery } from '@/features/topology/model/regionalTopologySearch';
import { topologyFeatureLabel } from '@/features/topology/model/topologyPresentation';
import { useShellUiStore } from '@/shell/model/useShellUiStore';

const PAGE_SIZE = 25;

/** Selected scope uses ONLY the T34 server-filtered map, never an administrator fallback. */
export function RegionalTopologySearch() {
  const { t } = useTranslation();
  const auth = useAuth();
  const permissions = usePermissions();
  const selected = useShellUiStore(state => state.operationalContext);
  const [params, setParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [committed, setCommitted] = useState('');
  const [page, setPage] = useState(0);
  const principalId = auth.status === 'authenticated' ? auth.session?.principal?.userId : undefined;
  const admission = regionalSearchAdmission(permissions, principalId, selected);
  const company = admission.search ? selected!.companyPartyId : '';
  const ref = parseRegionalReference(params);
  const detailRequested = params.has('regionalLayer') || params.has('regionalEntityId');

  const search = useQuery({
    queryKey: ['hidra', 'topology', 'regional-map', principalId, company, selected?.scopeId, selected?.type, selected?.targetId, 'search', committed, page, PAGE_SIZE],
    queryFn: () => searchRegionalTopology(company, committed, page, PAGE_SIZE),
    enabled: admission.search && Boolean(validRegionalQuery(committed)),
    retry: false, staleTime: 0, gcTime: 0, refetchOnMount: 'always', refetchOnWindowFocus: true,
  });
  const detail = useQuery({
    queryKey: ['hidra', 'topology', 'regional-map', principalId, company, selected?.scopeId, selected?.type, selected?.targetId, 'feature', ref?.layer, ref?.entityId],
    queryFn: () => fetchRegionalTopologyFeature(company, ref!),
    enabled: admission.search && admission.detail && Boolean(ref),
    retry: false, staleTime: 0, gcTime: 0, refetchOnMount: 'always', refetchOnWindowFocus: true,
  });

  const closeDetail = () => {
    const next = new URLSearchParams(params);
    next.delete('regionalLayer');
    next.delete('regionalEntityId');
    setParams(next);
  };
  const openDetail = (layer: string, entityId: string) => {
    if (!admission.detail) return;
    const next = new URLSearchParams(params);
    next.set('regionalLayer', layer);
    next.set('regionalEntityId', entityId);
    setParams(next);
  };

  if (!admission.search) {
    return <Container maxWidth="xl" sx={{ py: 4 }}>
      <Alert severity="warning">{t('topology.regional.unavailable')}</Alert>
    </Container>;
  }
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Box>
          <Typography component="h1" variant="h4">{t('topology.regional.title')}</Typography>
          <Typography color="text.secondary" variant="body2">{t('topology.regional.contextHelp')}</Typography>
        </Box>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box component="form" onSubmit={(event) => {
            event.preventDefault();
            const value = validRegionalQuery(input);
            if (!value) return;
            setPage(0);
            setCommitted(value);
            closeDetail();
          }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField fullWidth label={t('topology.regional.searchLabel')} size="small"
                slotProps={{ htmlInput: { maxLength: 120 } }}
                value={input} onChange={event => setInput(event.target.value)} />
              <Button disabled={!validRegionalQuery(input)} type="submit" variant="contained">
                {t('topology.regional.searchAction')}
              </Button>
            </Stack>
          </Box>
          {search.isFetching ? <Typography role="status" sx={{ mt: 2 }}>{t('topology.regional.loading')}</Typography> : null}
          {search.isError ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {t(normalizeHidraApiError(search.error).status === 403 ? 'topology.regional.denied' : 'topology.regional.unavailable')}
            </Alert>
          ) : null}
          {search.isSuccess && !search.isFetching ? (
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                {t('topology.regional.results', { total: search.data.totalFeatures ?? 0 })}
              </Typography>
              {(search.data.features ?? []).map((feature, index) => {
                const reference = regionalFeatureReference(feature);
                return reference ? (
                  <Button key={feature.id ?? index} disabled={!admission.detail}
                    onClick={() => openDetail(reference.layer, reference.entityId)}
                    size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }}>
                    {topologyFeatureLabel(feature)}
                  </Button>
                ) : null;
              })}
              <Stack direction="row" spacing={1}>
                <Button disabled={page === 0} onClick={() => { setPage(p => Math.max(0, p - 1)); closeDetail(); }}>
                  {t('topology.regional.previous')}
                </Button>
                <Button disabled={!search.data.hasNext} onClick={() => { setPage(p => p + 1); closeDetail(); }}>
                  {t('topology.regional.next')}
                </Button>
              </Stack>
            </Stack>
          ) : null}
        </Paper>
        {detailRequested ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Button onClick={closeDetail} sx={{ alignSelf: 'flex-start' }} variant="outlined">
                {t('topology.regional.close')}
              </Button>
              {!ref || !admission.detail ? <Alert severity="warning">{t('topology.regional.unavailable')}</Alert> : null}
              {ref && admission.detail && detail.isFetching ? <CircularProgress size={22} /> : null}
              {ref && admission.detail && detail.isError ? (
                <Alert severity="warning">{t('topology.regional.unavailable')}</Alert>
              ) : null}
              {ref && admission.detail && detail.isSuccess && !detail.isFetching ?
                exactRegionalFeature(detail.data, ref)
                  ? <TopologyInspector feature={detail.data} />
                  : <Alert severity="warning">{t('topology.regional.unavailable')}</Alert>
                : null}
            </Stack>
          </Paper>
        ) : null}
      </Stack>
    </Container>
  );
}
