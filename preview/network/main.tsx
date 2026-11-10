/* eslint-disable react-refresh/only-export-components -- Standalone entry mounted once by the static preview. */
import { useState, type CSSProperties, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

import {
  accessibleSystems, fixtureDate, fixtureVersion, roles, windows,
  type Evidence, type GasSystem, type RoleId, type Station, type SystemId, type WindowId,
} from './fixtures';
import './styles.css';

type Context = {
  role: RoleId;
  systemId: SystemId;
  assetId: string | null;
  windowId: WindowId;
};

const initialContext: Context = {
  role: 'operator', systemId: 'gz2', assetId: 'demo-gz2-atlas', windowId: 'morning',
};
const initialLayers = { pipelines: true, stations: true };
const rolesList = Object.entries(roles);
const noScope = 'No workspace is available in this demo scope.';

function Preview() {
  const [context, setContext] = useState(initialContext);
  const [layers, setLayers] = useState(initialLayers);
  const systems = accessibleSystems(context.role);
  const system = systems.find(({ id }) => id === context.systemId);
  const station = system?.stations.find(({ id }) => id === context.assetId);
  const time = windows[context.windowId];
  const alarmLinks = system?.stations.flatMap((asset) => {
    const alarm = asset.evidence[context.windowId].alarm;
    return 'value' in alarm ? [{ asset, alarm: alarm.value }] : [];
  }) ?? [];

  const selectRole = (role: RoleId) => setContext((previous) => {
    const target = accessibleSystems(role).find(({ id }) => id === previous.systemId);
    return { ...previous, role, assetId: target?.stations.some(({ id }) => id === previous.assetId) ? previous.assetId : null };
  });
  const selectAsset = (id: string) => setContext((previous) => {
    const target = accessibleSystems(previous.role).find(({ id }) => id === previous.systemId);
    return { ...previous, assetId: target?.stations.some((asset) => asset.id === id) ? id : null };
  });
  const reset = () => {
    setContext(initialContext);
    setLayers(initialLayers);
  };

  return (
    <>
      <a className="skip" href="#workspace">Skip to network workspace</a>
      <header className="topbar">
        <div className="brand"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>HyFlo</div>
        <span className="topbar-divider" aria-hidden="true" />
        <span className="topbar-name">Network intelligence</span>
        <span className="preview-tag">Synthetic client preview</span>
      </header>

      <main id="workspace" tabIndex={-1}>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Operations / Network</p>
            <h1>Network workspace</h1>
            <p className="subheading">Explore a gas corridor and its station evidence in one view.</p>
          </div>
          <button className="secondary-button" onClick={reset}>Reset preview</button>
        </div>

        <section className="control-bar" aria-label="Workspace context">
          <label>
            <span>Demo role</span>
            <select value={context.role} onChange={(event) => selectRole(event.target.value as RoleId)}>
              {rolesList.map(([id, role]) => <option value={id} key={id}>{role.label}</option>)}
            </select>
          </label>
          <label>
            <span>Pipeline system</span>
            <select disabled={!system} value={system?.id ?? ''} onChange={(event) => {
              const systemId = event.target.value as SystemId;
              if (systems.some(({ id }) => id === systemId)) setContext({ ...context, systemId, assetId: null });
            }}>
              {!system && <option value="">No system available</option>}
              {systems.map(({ id, name }) => <option value={id} key={id}>{name}</option>)}
            </select>
          </label>
          <label>
            <span>Time window · {fixtureDate}</span>
            <select disabled={!system} value={context.windowId} onChange={(event) => {
              const windowId = event.target.value as WindowId;
              setContext({ ...context, windowId });
            }}>
              {Object.entries(windows).map(([id, window]) => <option value={id} key={id}>{window.label}</option>)}
            </select>
          </label>
          <div className="scope" aria-live="polite">
            <span>Company and organization</span>
            <strong>{system ? system.organization : 'Scope unavailable'}</strong>
            {system && <small>{system.company}</small>}
          </div>
        </section>

        {!system ? <section className="panel restricted" aria-label="Scope status">
          <h2>Workspace unavailable</h2>
          <p role="status">{noScope}</p>
        </section> : <div className="workspace-grid">
          <section className="panel asset-panel" aria-labelledby="assets-heading">
            <div className="panel-heading">
              <p className="eyebrow">Topology</p>
              <h2 id="assets-heading">Asset tree</h2>
            </div>
            <ul className="tree">
              <li>
                <span className="tree-root"><span aria-hidden="true">◆</span> {system.name}</span>
                <ul aria-label="Stations">
                  {system.stations.map((asset) => (
                    <li key={asset.id}><button aria-pressed={station?.id === asset.id} onClick={() => selectAsset(asset.id)}>
                      <span className="tree-dot" aria-hidden="true" />
                      <span><strong>{asset.name}</strong><small>{asset.kind}</small></span>
                    </button></li>
                  ))}
                </ul>
              </li>
            </ul>
            <div className="alarm-links" aria-labelledby="linked-alarms">
              <h3 id="linked-alarms">Linked alarms</h3>
              {alarmLinks.length === 0 ? <p className="muted">No linked alarm records in this window.</p> :
                alarmLinks.map(({ asset, alarm }) => (
                  <button key={alarm.id} onClick={() => selectAsset(asset.id)}>
                    <span className="alarm-dot" aria-hidden="true" />
                    <span><strong>{alarm.title}</strong><small>{asset.name} · {alarm.id}</small></span>
                  </button>
                ))}
            </div>
          </section>

          <section className="panel map-panel" aria-labelledby="map-heading">
            <div className="panel-heading map-heading">
              <div><p className="eyebrow">Network schematic</p><h2 id="map-heading">{system.name}</h2></div>
              <span className="read-only">Read only</span>
            </div>
            <fieldset className="layers">
              <legend>Map layers</legend>
              <label><input type="checkbox" checked={layers.pipelines} onChange={(event) => setLayers({ ...layers, pipelines: event.target.checked })} /> Pipelines</label>
              <label><input type="checkbox" checked={layers.stations} onChange={(event) => setLayers({ ...layers, stations: event.target.checked })} /> Stations</label>
            </fieldset>
            <Schematic system={system} selected={station} layers={layers} onSelect={selectAsset} />
            <div className="map-caption"><span><i aria-hidden="true" /> Gas corridor</span><span>Fictional geometry · diagram only</span></div>
          </section>

          <section className="panel evidence-panel" aria-labelledby="evidence-heading">
            <div className="panel-heading">
              <p className="eyebrow">Station evidence</p>
              <h2 id="evidence-heading">{station?.name ?? 'Select a station'}</h2>
              <p className="selection" aria-live="polite">
                {station ? <><span>{station.id}</span><span>{time.label}</span></> : 'Use the map, asset tree or linked alarms.'}
              </p>
            </div>
            {station && <EvidenceCards station={station} windowId={context.windowId} />}
          </section>
        </div>}

        <footer>
          <span>All assets, measurements and access scenarios are synthetic.</span>
          <span>Fixture <code>{fixtureVersion}</code></span>
        </footer>
      </main>
    </>
  );
}

function Schematic({ system, selected, layers, onSelect }: {
  system: GasSystem;
  selected: Station | undefined;
  layers: typeof initialLayers;
  onSelect: (id: string) => void;
}) {
  const points = system.stations.map(({ point }) => point.join(',')).join(' ');
  return <div className="schematic" role="group" aria-label="Station map">
    <div className="schematic-key" aria-hidden="true"><span>N</span><span>↑</span></div>
    <span className="schematic-label" aria-hidden="true">{system.code} / GAS</span>
    <svg className="diagram" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path className="contour" d="M-5 25 Q20 6 40 17 T76 21 T105 4 M-7 35 Q20 12 40 25 T77 29 T107 12 M-10 46 Q20 20 41 32 T78 36 T108 21 M-7 85 Q22 67 40 80 T76 83 T110 65 M-6 95 Q22 75 40 88 T76 91 T110 76" />
      {layers.pipelines && <polyline className="corridor" points={points} />}
    </svg>
    {layers.stations && system.stations.map((asset) => {
      const [x, y] = asset.point;
      return <button
        key={asset.id}
        className="station-marker"
        style={{ '--x': x + '%', '--y': y + '%' } as CSSProperties}
        aria-label={'Select ' + asset.name + ' on map'}
        aria-pressed={selected?.id === asset.id}
        onClick={() => onSelect(asset.id)}
      ><span className="marker-pin" aria-hidden="true" /><span className="marker-name">{asset.name}</span></button>;
    })}
  </div>;
}

function EvidenceCards({ station, windowId }: { station: Station; windowId: WindowId }) {
  const { technical, pressure, alarm } = station.evidence[windowId];
  return <div className="cards">
    <EvidenceCard title="Technical revision" evidence={technical}>
      {(value) => <><strong>{value.revision}</strong><p>{value.description}</p></>}
    </EvidenceCard>
    <EvidenceCard title="Telemetry" evidence={pressure}>
      {(value) => <>
        <p>Station outlet pressure</p>
        <div className="measurement">
          <strong>{value.samples.at(-1)?.toFixed(1)} <small>bar(g)</small></strong>
          <PressureTrend samples={value.samples} />
        </div>
      </>}
    </EvidenceCard>
    <EvidenceCard title="Alarm" evidence={alarm}>
      {(value) => <><strong>{value.title}</strong><p>{value.id}</p></>}
    </EvidenceCard>
  </div>;
}

function EvidenceCard<T>({ title, evidence, children }: {
  title: string; evidence: Evidence<T>; children: (value: T) => ReactNode;
}) {
  const labels = { available: 'Available', stale: 'Stale', empty: 'Empty', unavailable: 'Unavailable' };
  return <section className="evidence-card" aria-label={title}>
    <div className="card-heading"><h3>{title}</h3><span className={'status ' + evidence.state}>{labels[evidence.state]}</span></div>
    {'value' in evidence ? <>
      {children(evidence.value)}
      <p className="provenance">Fixture evidence · <time dateTime={evidence.observedAt}>{evidence.observedAt.slice(11, 16)} UTC</time></p>
    </> : <p>{evidence.state === 'empty' ? 'No records in this window.' : 'Evidence source unavailable.'}</p>}
  </section>;
}

function PressureTrend({ samples }: { samples: readonly number[] }) {
  const min = Math.min(...samples);
  const spread = Math.max(...samples) - min || 1;
  const points = samples.map((value, index) => [3 + 68 * index / Math.max(1, samples.length - 1), 22 - 18 * (value - min) / spread].join(',')).join(' ');
  return <svg className="trend" width="74" height="26" viewBox="0 0 74 26" role="img" aria-label={'Pressure samples in bar gauge: ' + samples.map((value) => value.toFixed(1)).join(', ')}>
    <polyline points={points} />
  </svg>;
}

createRoot(document.getElementById('root')!).render(<Preview />);
