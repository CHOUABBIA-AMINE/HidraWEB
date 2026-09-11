import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

import type { OperationalResourceDescriptor } from '@/api/generated/workbench/model';

export interface AdvancedSearchDraft {
  filterField: string;
  filterValue: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

interface WorkbenchToolbarProps {
  modules: string[];
  resources: OperationalResourceDescriptor[];
  selectedModule: string;
  selectedResource: string;
  query: string;
  advanced: AdvancedSearchDraft;
  fieldCandidates: string[];
  searchEnabled: boolean;
  onModuleChange: (module: string) => void;
  onResourceChange: (resource: string) => void;
  onQueryChange: (query: string) => void;
  onBasicSearch: () => void;
  onAdvancedChange: (draft: AdvancedSearchDraft) => void;
  onAdvancedSearch: () => void;
  onReset: () => void;
}

export function WorkbenchToolbar(props: WorkbenchToolbarProps) {
  const { t } = useTranslation();
  const updateAdvanced = (patch: Partial<AdvancedSearchDraft>) => props.onAdvancedChange({ ...props.advanced, ...patch });

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '220px 260px minmax(280px, 1fr) auto' } }}>
        <Select
          aria-label={t('workbench.module')}
          onChange={(event) => props.onModuleChange(String(event.target.value))}
          size="small"
          value={props.selectedModule}
        >
          {props.modules.map((module) => <MenuItem key={module} value={module}>{module}</MenuItem>)}
        </Select>
        <Select
          aria-label={t('workbench.resource')}
          disabled={!props.selectedModule}
          onChange={(event) => props.onResourceChange(String(event.target.value))}
          size="small"
          value={props.selectedResource}
        >
          {props.resources.map((resource) => <MenuItem key={resource.resource} value={resource.resource}>{resource.resource}</MenuItem>)}
        </Select>
        <TextField
          onChange={(event) => props.onQueryChange(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') props.onBasicSearch(); }}
          placeholder={t('workbench.queryPlaceholder')}
          size="small"
          slotProps={{ htmlInput: { 'aria-label': t('workbench.query') } }}
          value={props.query}
        />
        <Button disabled={!props.selectedResource} onClick={props.onBasicSearch} variant="contained">{t('workbench.apply')}</Button>
      </Box>

      <Accordion disableGutters variant="outlined">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 600 }}>{t('workbench.advanced')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 160px' } }}>
            <Select
              aria-label={t('workbench.filterField')}
              onChange={(event) => updateAdvanced({ filterField: String(event.target.value) })}
              size="small"
              value={props.advanced.filterField}
            >
              <MenuItem value="">{t('workbench.noFilter')}</MenuItem>
              {props.fieldCandidates.map((field) => <MenuItem key={field} value={field}>{field}</MenuItem>)}
            </Select>
            <TextField
              disabled={!props.advanced.filterField}
              onChange={(event) => updateAdvanced({ filterValue: event.target.value })}
              size="small"
              slotProps={{ htmlInput: { 'aria-label': t('workbench.filterValue') } }}
              value={props.advanced.filterValue}
            />
            <Select
              aria-label={t('workbench.sortBy')}
              onChange={(event) => updateAdvanced({ sortBy: String(event.target.value) })}
              size="small"
              value={props.advanced.sortBy}
            >
              <MenuItem value="">{t('workbench.noSort')}</MenuItem>
              {props.fieldCandidates.map((field) => <MenuItem key={field} value={field}>{field}</MenuItem>)}
            </Select>
            <Select
              aria-label={t('workbench.sortDirection')}
              disabled={!props.advanced.sortBy}
              onChange={(event) => updateAdvanced({ sortDirection: event.target.value as 'asc' | 'desc' })}
              size="small"
              value={props.advanced.sortDirection}
            >
              <MenuItem value="asc">{t('workbench.ascending')}</MenuItem>
              <MenuItem value="desc">{t('workbench.descending')}</MenuItem>
            </Select>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={props.onReset}>{t('workbench.reset')}</Button>
            <Button disabled={!props.searchEnabled || !props.selectedResource} onClick={props.onAdvancedSearch} variant="outlined">
              {t('workbench.applyAdvanced')}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
