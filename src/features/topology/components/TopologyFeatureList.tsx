import { Button, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { Feature } from '@/api/generated/topology/model';
import { topologyFeatureLabel } from '@/features/topology/model/topologyPresentation';

export interface TopologyFeatureListProps {
  features: readonly Feature[];
  onSelect: (feature: Feature) => void;
  maxItems?: number;
}

export function TopologyFeatureList({ features, onSelect, maxItems = 100 }: TopologyFeatureListProps) {
  const { t } = useTranslation();
  const visibleFeatures = features.slice(0, maxItems);

  return (
    <>
      <Typography component="h2" sx={{ mt: 2 }} variant="subtitle1">{t('topology.keyboardList')}</Typography>
      <List dense disablePadding>
        {visibleFeatures.map((feature, index) => (
          <ListItem key={feature.id ?? `feature-${index}`} disableGutters secondaryAction={(
            <Button onClick={() => onSelect(feature)} size="small">{t('topology.inspect')}</Button>
          )}>
            <ListItemText
              primary={topologyFeatureLabel(feature)}
              secondary={`${feature.properties?.layer ?? '—'} · ${feature.properties?.entityType ?? '—'}`}
            />
          </ListItem>
        ))}
      </List>
      {features.length > visibleFeatures.length ? (
        <Typography color="text.secondary" variant="caption">
          {t('topology.keyboardListLimited', { count: visibleFeatures.length })}
        </Typography>
      ) : null}
    </>
  );
}
