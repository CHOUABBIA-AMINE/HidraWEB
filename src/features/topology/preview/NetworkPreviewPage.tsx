import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { HidraMap } from '@/components/map/HidraMap';
import type { HidraGeographicBasemap, HidraMapFeatureCollection } from '@/components/map/mapTypes';

import { DigitalTwinDecisionPanel } from './DigitalTwinDecisionPanel';
import { digitalTwinCopy } from './digitalTwinCopy';
import {
  decisionFixtureVersion, decisionView, initialDecision, updateDecision, type DecisionActor, type InputSelection,
} from './digitalTwinDecision';
import {
  accessibleSystems, fixtureDate, fixtureVersion, roles, windows,
  type Evidence, type GasSystem, type RoleId, type Station, type SystemId, type WindowId,
} from './fixtures';
import basemapUrl from './north-africa.geojson?url';
import { formatTime, investigationCopy, previewCopy, windowLabel, type PreviewLanguage } from './previewCopy';
import { StationInvestigationPanel } from './StationInvestigationPanel';
import { initialInvestigation, investigationVersion, investigationView, updateInvestigation, type InvestigationContext } from './stationInvestigation';
import './styles.css';

const initialContext: InvestigationContext = {
  role: 'operator', systemId: 'gz2', assetId: 'demo-gz2-atlas', windowId: 'morning',
};
const initialLayers = { pipelines: true, stations: true };
const rolesList = Object.keys(roles) as RoleId[];

export function NetworkPreviewPage() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage === 'ar' || i18n.resolvedLanguage === 'fr' ? i18n.resolvedLanguage : 'en';
  const copy = previewCopy[language];
  const date = new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(fixtureDate));
  const [context, setContext] = useState(initialContext);
  const [layers, setLayers] = useState(initialLayers);
  const [investigation, setInvestigation] = useState(initialInvestigation);
  const [investigationOpen, setInvestigationOpen] = useState(false);
  const investigationTrigger = useRef<HTMLButtonElement>(null);
  const [decision, setDecision] = useState(initialDecision);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decisionActor, setDecisionActor] = useState<DecisionActor>('operator');
  const [decisionInput, setDecisionInput] = useState<InputSelection>('matched');
  const decisionTrigger = useRef<HTMLButtonElement>(null);
  const systems = useMemo(() => accessibleSystems(context.role), [context.role]);
  const system = systems.find(({ id }) => id === context.systemId);
  const station = system?.stations.find(({ id }) => id === context.assetId);
  const openInvestigationView = investigationOpen ? investigationView(investigation, context) : undefined;
  const investigationLabels = investigationCopy[language];
  const twinLabels = digitalTwinCopy[language];
  const twinView = openInvestigationView ? decisionView(decision, context, decisionInput) : undefined;
  const alarmLinks = system?.stations.flatMap((asset) => {
    const alarm = asset.evidence[context.windowId].alarm;
    return 'value' in alarm ? [{ asset, alarm: alarm.value }] : [];
  }) ?? [];

  const selectRole = (role: RoleId) => {
    const target = accessibleSystems(role).find(({ id }) => id === context.systemId);
    const assetId = target?.stations.some(({ id }) => id === context.assetId) ? context.assetId : null;
    if (!assetId) {
      setInvestigationOpen(false);
      setDecisionOpen(false);
    }
    setContext({ ...context, role, assetId });
  };
  const selectAsset = (id: string) => setContext((previous) => {
    const target = accessibleSystems(previous.role).find(({ id }) => id === previous.systemId);
    return target?.stations.some((asset) => asset.id === id) ? { ...previous, assetId: id } : previous;
  });
  const openInvestigation = (trigger: HTMLButtonElement) => {
    investigationTrigger.current = trigger;
    setInvestigationOpen(true);
  };
  const closeInvestigation = () => {
    setDecisionOpen(false);
    setInvestigationOpen(false);
    investigationTrigger.current?.focus();
  };
  const reset = () => {
    setContext(initialContext);
    setLayers(initialLayers);
    setInvestigation(initialInvestigation);
    setInvestigationOpen(false);
    setDecision(initialDecision);
    setDecisionOpen(false);
    setDecisionActor('operator');
    setDecisionInput('matched');
  };

  return (
    <section className="network-fixture-workspace" lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'} aria-labelledby="network-fixture-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{copy.badge}</p>
          <h1 id="network-fixture-title">{copy.heading}</h1>
          <p className="subheading">{copy.intro}</p>
        </div>
        <button className="secondary-button" onClick={reset}>{copy.reset}</button>
      </div>

      <section className="control-bar" aria-label={copy.workspace}>
        <label>
          <span>{copy.role}</span>
          <select value={context.role} onChange={(event) => selectRole(event.target.value as RoleId)}>
            {rolesList.map((id) => <option value={id} key={id}>{copy.roles[id]}</option>)}
          </select>
        </label>
        <label>
          <span>{copy.system}</span>
          <select disabled={!system} value={system?.id ?? ''} onChange={(event) => {
            const systemId = event.target.value as SystemId;
            if (systems.some(({ id }) => id === systemId)) {
              setContext({ ...context, systemId, assetId: null });
              setInvestigationOpen(false);
              setDecisionOpen(false);
            }
          }}>
            {!system && <option value="">{copy.noSystem}</option>}
            {systems.map(({ id }) => <option value={id} key={id}>{copy.systems[id]}</option>)}
          </select>
        </label>
        <label>
          <span>{copy.time} · {date}</span>
          <select disabled={!system} value={context.windowId} onChange={(event) => {
            const windowId = event.target.value as WindowId;
            setContext({ ...context, windowId });
          }}>
            {(Object.keys(windows) as WindowId[]).map((id) => <option value={id} key={id}>{windowLabel(id, language)}</option>)}
          </select>
        </label>
        <div className="scope" aria-live="polite">
          <span>{copy.scope}</span>
          <strong>{system ? copy.organizations[system.organization] : copy.noScope}</strong>
          {system && <small>{copy.company}</small>}
        </div>
      </section>

      {!system ? <section className="panel restricted" aria-label={copy.scopeStatus}>
        <h2>{copy.deniedTitle}</h2>
        <p role="status">{copy.denied}</p>
      </section> : <div className="workspace-grid">
        <section className="panel asset-panel" aria-labelledby="assets-heading">
          <div className="panel-heading">
            <p className="eyebrow">{copy.topology}</p>
            <h2 id="assets-heading">{copy.assetTree}</h2>
          </div>
          <ul className="tree">
            <li>
              <span className="tree-root"><span aria-hidden="true">◆</span> {copy.systems[system.id]}</span>
              <ul aria-label={copy.stationsLabel}>
                {system.stations.map((asset) => (
                  <li key={asset.id}><button aria-pressed={station?.id === asset.id} onClick={() => selectAsset(asset.id)}>
                    <span className="tree-dot" aria-hidden="true" />
                    <span><strong>{copy.stations[asset.id]}</strong><small>{copy.kinds[asset.kind]}</small></span>
                  </button></li>
                ))}
              </ul>
            </li>
          </ul>
          <div className="alarm-links" aria-labelledby="linked-alarms">
            <h3 id="linked-alarms">{copy.linkedAlarms}</h3>
            {alarmLinks.length === 0 ? <p className="muted">{copy.noLinkedAlarms}</p> :
              alarmLinks.map(({ asset, alarm }) => (
                <button key={alarm.id} onClick={(event) => {
                  selectAsset(asset.id);
                  openInvestigation(event.currentTarget);
                }}>
                  <span className="alarm-dot" aria-hidden="true" />
                  <span><strong>{copy.lowDischarge}</strong><small>{copy.stations[asset.id]} · <bdi>{alarm.id}</bdi></small></span>
                </button>
              ))}
          </div>
        </section>

        <section className="panel map-panel" aria-labelledby="map-heading">
          <div className="panel-heading map-heading">
            <div><p className="eyebrow">{copy.geographicMap}</p><h2 id="map-heading">{copy.systems[system.id]}</h2></div>
            <span className="read-only">{copy.readOnly}</span>
          </div>
          <fieldset className="layers">
            <legend>{copy.layers}</legend>
            <label><input type="checkbox" checked={layers.pipelines} onChange={(event) => setLayers({ ...layers, pipelines: event.target.checked })} /> {copy.pipelines}</label>
            <label><input type="checkbox" checked={layers.stations} onChange={(event) => setLayers({ ...layers, stations: event.target.checked })} /> {copy.stationsLabel}</label>
          </fieldset>
          <GeographicMap key={system.id + language} system={system} selected={station} layers={layers} language={language} onSelect={selectAsset} />
          <div className="map-caption"><span><i aria-hidden="true" /> {copy.corridor}</span><span>{copy.fictionalOverlay}</span></div>
        </section>

        <section className="panel evidence-panel" aria-labelledby="evidence-heading">
          <div className="panel-heading">
            <p className="eyebrow">{copy.stationEvidence}</p>
            <h2 id="evidence-heading">{station ? copy.stations[station.id] : copy.chooseStation}</h2>
            <p className="selection" aria-live="polite">
              {station ? <><bdi>{station.id}</bdi><bdi>{windowLabel(context.windowId, language)}</bdi></> : copy.useMapOrTree}
            </p>
          </div>
          {station && <>
            <EvidenceCards station={station} windowId={context.windowId} language={language} />
            <div className="investigation-entry">
              <button className="secondary-button" aria-expanded={!!openInvestigationView}
                aria-controls={openInvestigationView ? 'station-investigation' : undefined}
                onClick={(event) => openInvestigation(event.currentTarget)}
              >{investigationLabels.open}</button>
            </div>
          </>}
        </section>
      </div>}

      {openInvestigationView && (
        <StationInvestigationPanel view={openInvestigationView} context={context} language={language}
          onCommand={(command) => setInvestigation((previous) => updateInvestigation(previous, context, command))}
          onClose={closeInvestigation}
        />
      )}

      {twinView && (
        <div className="digital-twin-entry">
          <button ref={decisionTrigger} className="secondary-button" aria-expanded={decisionOpen}
            aria-controls={decisionOpen ? 'digital-twin-decision' : undefined}
            onClick={() => setDecisionOpen(true)}
          >{twinLabels.open}</button>
        </div>
      )}

      {twinView && decisionOpen && (
        <DigitalTwinDecisionPanel view={twinView} context={context} language={language} actor={decisionActor} input={decisionInput}
          onActor={setDecisionActor}
          onInput={setDecisionInput}
          onCommand={(command) => setDecision((previous) => updateDecision(previous, context, decisionInput, decisionActor, command))}
          onClose={() => {
            setDecisionOpen(false);
            decisionTrigger.current?.focus();
          }}
        />
      )}

      <footer>
        <span>{copy.syntheticDisclosure}</span>
        <span>{copy.fixture} <code dir="ltr">{fixtureVersion} / {investigationVersion} / {decisionFixtureVersion}</code></span>
      </footer>
    </section>
  );
}

function GeographicMap({ system, selected, layers, language, onSelect }: {
  system: GasSystem;
  selected: Station | undefined;
  layers: typeof initialLayers;
  language: PreviewLanguage;
  onSelect: (id: string) => void;
}) {
  const copy = previewCopy[language];
  const basemap = useMemo<HidraGeographicBasemap>(() => ({
    url: basemapUrl,
    bounds: [[-5, 29], [13, 40]],
    center: [3, 35.5],
    locale: copy.locale,
    errorLabel: copy.mapUnavailable,
  }), [copy]);
  const data = useMemo<HidraMapFeatureCollection>(() => ({
    type: 'FeatureCollection',
    features: [
      ...(layers.pipelines && system.stations.length > 1 ? [{
        type: 'Feature' as const, id: system.id + '-corridor',
        geometry: { type: 'LineString' as const, coordinates: system.stations.map(({ coordinates }) => [...coordinates]) },
        properties: { layer: 'pipeline' },
      }] : []),
      ...layers.stations ? system.stations.map(({ id, coordinates }) => ({
        type: 'Feature' as const, id,
        geometry: { type: 'Point' as const, coordinates: [...coordinates] },
        properties: { layer: 'station', label: copy.stations[id], markerLabel: copy.selectOnMap(copy.stations[id]) },
      })) : [],
    ],
  }), [copy, layers, system]);

  return <div className="geographic-map">
    <HidraMap
      data={data}
      selectedFeatureId={selected?.id}
      ariaLabel={copy.stationMap}
      minHeight={360}
      basemap={basemap}
      onFeatureSelect={({ featureId, layerId }) => { if (layerId === 'station') onSelect(featureId); }}
    />
  </div>;
}

function EvidenceCards({ station, windowId, language }: { station: Station; windowId: WindowId; language: PreviewLanguage }) {
  const { technical, pressure, alarm } = station.evidence[windowId];
  const copy = previewCopy[language];
  const number = new Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return <div className="cards">
    <EvidenceCard title={copy.technical} evidence={technical} language={language}>
      {(value) => <><strong><bdi>{value.revision}</bdi></strong><p>{copy.descriptions[value.description]}</p></>}
    </EvidenceCard>
    <EvidenceCard title={copy.telemetry} evidence={pressure} language={language}>
      {(value) => <>
        <p>{copy.pressure}</p>
        <div className="measurement">
          <strong><bdi>{number.format(value.samples.at(-1)!)} <small>bar(g)</small></bdi></strong>
          <PressureTrend samples={value.samples} label={copy.samples + ' · ' + value.samples.map((sample) => number.format(sample)).join(' · ')} />
        </div>
      </>}
    </EvidenceCard>
    <EvidenceCard title={copy.alarm} evidence={alarm} language={language}>
      {(value) => <><strong>{copy.lowDischarge}</strong><p><bdi>{value.id}</bdi></p></>}
    </EvidenceCard>
  </div>;
}

function EvidenceCard<T>({ title, evidence, children, language }: {
  title: string; evidence: Evidence<T>; children: (value: T) => ReactNode; language: PreviewLanguage;
}) {
  const copy = previewCopy[language];
  return <section className="evidence-card" aria-label={title}>
    <div className="card-heading"><h3>{title}</h3><span className={'status ' + evidence.state}>{copy.states[evidence.state]}</span></div>
    {'value' in evidence ? <>
      {children(evidence.value)}
      <p className="provenance">{copy.source} · <time dateTime={evidence.observedAt}><bdi>{formatTime(evidence.observedAt, language)} UTC</bdi></time></p>
    </> : <p>{evidence.state === 'empty' ? copy.empty : copy.unavailable}</p>}
  </section>;
}

function PressureTrend({ samples, label }: { samples: readonly number[]; label: string }) {
  const min = Math.min(...samples);
  const spread = Math.max(...samples) - min || 1;
  const points = samples.map((value, index) => [3 + 68 * index / Math.max(1, samples.length - 1), 22 - 18 * (value - min) / spread].join(',')).join(' ');
  return <svg className="trend" width="74" height="26" viewBox="0 0 74 26" role="img" aria-label={label}>
    <polyline points={points} />
  </svg>;
}
