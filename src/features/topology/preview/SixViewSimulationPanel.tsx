import { useState } from 'react';

import { sixViewCopy } from './sixViewCopy';
import { sixViewFixtureVersion, sixViewModel, type SixViewContext } from './sixViewFixture';
import { previewCopy, type PreviewLanguage } from './previewCopy';

const tabs = ['geography', 'hydraulics', 'schematic', 'telemetry', 'integrity', 'station'] as const;
type Tab = typeof tabs[number];

type Props = {
  context: SixViewContext;
  language: PreviewLanguage;
  onSelect: (id: string) => void;
};

const drawX = (index: number, total: number) => 65 + 660 * index / Math.max(1, total - 1);

function chartPoints(values: readonly number[], x0: number, xSpan: number, y0: number, ySpan: number, extent: readonly number[]): string {
  const min = Math.min(...extent);
  const max = Math.max(...extent);
  const range = max - min || 1;
  return values.map((v, index) =>
    (x0 + xSpan * index / Math.max(1, values.length - 1)).toFixed(1) + ',' +
    (y0 + ySpan * (max - v) / range).toFixed(1)).join(' ');
}

/** Conventional independently drawn process symbols, not a certified P&ID library.
 * A project-approved ISO/ISA symbol catalog and actual asset tags are still required.
 */
type ProcessGlyphKind = 'gate-valve' | 'compressor' | 'flow-transmitter';

function ProcessGlyph({ kind, x, y, tag }: { kind: ProcessGlyphKind; x: number; y: number; tag: string }) {
  return <g data-pid-symbol={kind} transform={'translate(' + x + ',' + y + ')'} stroke="#34434d" strokeWidth="2.8" fill="#f6f7f8">
    <title>{tag + ' · ' + kind}</title>
    {kind === 'gate-valve' ? <>
      <path d="M -17 -12 L 0 0 L -17 12 Z M 17 -12 L 0 0 L 17 12 Z" />
      <line x1="0" y1="-14" x2="0" y2="-23" />
      <line x1="-9" y1="-23" x2="9" y2="-23" />
    </> : kind === 'compressor' ? <>
      <circle cx="0" cy="0" r="23" />
      <path d="M -8 -16 L 15 0 L -8 16 Z" fill="#ccd5d9" />
    </> : <>
      <circle cx="0" cy="0" r="22" />
      <text x="0" y="5" textAnchor="middle" fontSize="15" stroke="none" fill="#34434d" fontWeight="bold">FT</text>
    </>}
    <text x="0" y="42" textAnchor="middle" fontSize="12" stroke="none" fill="#34434d">{tag}</text>
  </g>;
}

function SymbolLegend({ copy }: { copy: {
  symbolLegend: string; stationSymbol: string; gateValve: string; compressorSymbol: string;
  flowTransmitter: string; symbolsCaveat: string;
} }) {
  const entries = [
    { kind: 'gate-valve', label: copy.gateValve, tag: 'XV' },
    { kind: 'compressor', label: copy.compressorSymbol, tag: 'K' },
    { kind: 'flow-transmitter', label: copy.flowTransmitter, tag: 'FT' },
  ] as const;
  return <div className="six-view-symbol-legend" aria-label={copy.symbolLegend}>
    <p><strong>{copy.symbolLegend}:</strong> {copy.stationSymbol} · ST</p>
    <div className="six-view-symbols">
      {entries.map((entry) => <span key={entry.kind}>
        <svg viewBox="0 0 74 85" role="img" aria-label={entry.label} className="six-view-legend-icon">
          <ProcessGlyph kind={entry.kind} x={37} y={33} tag={entry.tag} />
        </svg>{entry.label}
      </span>)}
    </div>
    <p className="six-view-warning">{copy.symbolsCaveat}</p>
  </div>;
}

const elevationX = (chainage: number, lastChainage: number) => 65 + 660 * chainage / Math.max(lastChainage, 1);
const elevationY = (elevation: number, min: number, max: number) => 155 - 110 * (elevation - min) / Math.max(max - min, 1);

export function SixViewSimulationPanel({ context, language, onSelect }: Props) {
  const [tab, setTab] = useState<Tab>('geography');
  const [showHca, setShowHca] = useState(false);
  const [showWater, setShowWater] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const model = sixViewModel(context);
  if (!model) return null;

  const t = sixViewCopy[language];
  const copy = previewCopy[language];
  const activeIndex = tabs.indexOf(tab);
  const evidence = model.station?.evidence[context.windowId];
  const previousWindow = context.windowId === 'morning' ? 'afternoon' : 'morning';
  const archive = model.station?.evidence[previousWindow].pressure;
  const current = evidence?.pressure;
  const currentSamples = current?.state === 'available' && 'value' in current ? current.value.samples : undefined;
  const archiveSamples = archive?.state === 'available' && 'value' in archive ? archive.value.samples : undefined;

  return (
    <section className="panel six-view-workspace" aria-labelledby="six-view-heading">
      <div className="panel-heading">
        <p className="eyebrow">{t.notice}</p>
        <h2 id="six-view-heading">{t.title}</h2>
        <p className="six-view-source"><bdi>{sixViewFixtureVersion}</bdi> · <bdi>{copy.systems[model.system.id]}</bdi> · <bdi>{context.windowId}</bdi> UTC · {t.revision}: <bdi>{model.revision ?? t.unknown}</bdi></p>
      </div>
      <div className="six-view-tabs" role="tablist" aria-label={t.title} onKeyDown={(event) => {
        const index = tabs.indexOf(tab);
        const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
          : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
          : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
        if (next < 0) return;
        event.preventDefault();
        setTab(tabs[next]);
        const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]');
        buttons[next]?.focus();
      }}>
        {tabs.map((id, index) => <button type="button" role="tab" id={'six-tab-' + id}
          key={id} aria-selected={tab === id} aria-controls="six-view-content"
          tabIndex={tab === id ? 0 : -1} onClick={() => setTab(id)}
        >{index + 1}. {t.views[index]}</button>)}
      </div>
      <div className="six-view-content" id="six-view-content" role="tabpanel" tabIndex={0}
        aria-labelledby={'six-tab-' + tab} key={tab}>
        {tab === 'geography' && <div className="six-view-inner">
          <h3>{t.location}</h3>
          <p>{t.terrain}</p>
          <fieldset className="six-view-options">
            <legend>{t.layers}</legend>
            <label><input type="checkbox" checked={showHca} onChange={(e) => setShowHca(e.target.checked)} /> {t.hca}</label>
            <label><input type="checkbox" checked={showWater} onChange={(e) => setShowWater(e.target.checked)} /> {t.water}</label>
          </fieldset>
          <svg viewBox="0 0 800 280" role="img" aria-label={t.route} className="six-view-figure">
            <title>{t.route}</title>
            <rect x="0" y="0" width="800" height="280" fill="#e4e9e8" />
            <path d="M 0 220 Q 170 180 310 236 T 800 218" stroke="#ccd7cb" strokeWidth="55" fill="none" />
            <path d="M 0 42 Q 260 88 470 37 T 800 91" stroke="#c4d2da" strokeWidth="26" fill="none" />
            {showHca && <polygon points="265,65 530,45 618,200 380,238" fill="#d7b6a0" stroke="#8d4825" strokeDasharray="8 5" strokeWidth="3" opacity=".7" />}
            {showWater && <path d="M 425 0 Q 345 105 498 280" fill="none" stroke="#658e9d" strokeWidth="15" opacity=".7" />}
            <polyline points={model.system.stations.map((_, i) => drawX(i, model.system.stations.length) + ',' + (177 - i % 2 * 55)).join(' ')}
              fill="none" stroke="#586b75" strokeWidth="8" strokeLinecap="round" />
            {model.system.stations.map((s, i) => {
              const x = drawX(i, model.system.stations.length);
              const y = 177 - i % 2 * 55;
              return <g key={s.id}>
                <title>{copy.stations[s.id]}</title>
                <rect data-pid-symbol="station-marker" x={x - 14} y={y - 14} width="28" height="28"
                  stroke="#283946" strokeWidth="3" fill={model.station?.id === s.id ? '#fff' : '#b6c1c7'} />
                <path d={'M ' + (x - 8) + ' ' + (y - 6) + ' L ' + x + ' ' + y + ' L ' + (x - 8) + ' ' + (y + 6) +
                  ' Z M ' + (x + 8) + ' ' + (y - 6) + ' L ' + x + ' ' + y + ' L ' + (x + 8) + ' ' + (y + 6) + ' Z'}
                  stroke="#354954" strokeWidth="1.8" fill="none" />
                <text x={x} y={y + 34} textAnchor="middle" fontSize="17" fill="#22333d">ST-{i + 1}</text>
              </g>;
            })}
          </svg>
          <p className="six-view-warning">{t.anomaly}{model.alarmId ? ': ' + model.alarmId : ''}</p>
          <div className="six-view-actions" aria-label={t.stationSelect}>
            {model.system.stations.map((s) =>
              <button className="secondary-button" type="button" key={s.id} aria-pressed={model.station?.id === s.id}
                onClick={() => onSelect(s.id)}>{copy.stations[s.id]} · <bdi>{s.coordinates[0].toFixed(2)}, {s.coordinates[1].toFixed(2)}</bdi></button>)}
          </div>
        </div>}

        {tab === 'hydraulics' && <div className="six-view-inner">
          <h3>{t.profile}</h3>
          <p className="six-view-warning">{t.profileSource}</p>
          <svg viewBox="0 0 800 335" role="img" aria-label={t.elevation + ' / ' + t.pressure} className="six-view-figure">
            <title>{t.profileSource}</title>
            <line x1="60" y1="27" x2="60" y2="170" stroke="#596b76" strokeWidth="2" />
            <line x1="60" y1="170" x2="744" y2="170" stroke="#596b76" strokeWidth="2" />
            <line x1="60" y1="289" x2="744" y2="289" stroke="#596b76" strokeWidth="2" />
            <text x="65" y="22" fontSize="16" fill="#263c4b">{t.elevation}</text>
            <text x="65" y="207" fontSize="16" fill="#263c4b">{t.pressure}</text>
            <text x="555" y="327" fontSize="16" fill="#263c4b">{t.chainage}</text>
            {(() => {
              const samples = model.elevationSamples;
              const last = samples[samples.length - 1].chainageKm;
              const values = samples.map((p) => p.elevationM);
              const lo = Math.min(...values) - 20;
              const hi = Math.max(...values) + 20;
              const pressures = model.points.flatMap((p) => p.pressureBarG === undefined ? [] : [p.pressureBarG]);
              const pmin = Math.min(...pressures);
              const pmax = Math.max(...pressures);
              const pressureY = (value: number) => 257 - 37 * (value - pmin) / Math.max(pmax - pmin, 1);
              return <>
                <polyline data-elevation-profile="synthetic" fill="none" stroke="#617f70" strokeWidth="3.5"
                  points={samples.map((p) => elevationX(p.chainageKm, last) + ',' + elevationY(p.elevationM, lo, hi)).join(' ')} />
                {samples.map((p) => <g key={p.chainageKm}>
                  <title>{t.chainage + ': ' + p.chainageKm + ' · ' + t.elevation + ': ' + p.elevationM}</title>
                  <circle data-elevation-point="synthetic" cx={elevationX(p.chainageKm, last)}
                    cy={elevationY(p.elevationM, lo, hi)} r="3.8" fill="#f9fbfc" stroke="#456555" strokeWidth="2" />
                </g>)}
                {model.points.map((p, i) => {
                  const x = elevationX(p.chainageKm, last);
                  const y = elevationY(p.elevationM, lo, hi);
                  return <g key={p.id}>
                    <rect data-station-elevation={p.id} x={x - 6} y={y - 6} width="12" height="12" fill="#d1d7dc" stroke="#2b414c" strokeWidth="2" />
                    <text x={x} y="186" textAnchor="middle" fontSize="13" fill="#304657">ST-{i + 1}</text>
                    {p.pressureBarG !== undefined && <>
                      <circle cx={x} cy={pressureY(p.pressureBarG)} r="6.5" fill="#265c78" stroke="#fff" strokeWidth="1.5" />
                      <text x={x} y={pressureY(p.pressureBarG) - 12} textAnchor="middle" fontSize="14" fill="#234f68">{p.pressureBarG.toFixed(1)}</text>
                    </>}
                    <text x={x} y="308" textAnchor="middle" fontSize="13" fill="#304657">{p.chainageKm}</text>
                  </g>;
                })}
              </>;
            })()}
          </svg>
          <p className="six-view-warning">{t.physics}</p>
          <div className="six-view-table-scroll"><table className="digital-twin-table">
            <caption>{t.profileSource} · {t.flow}</caption>
            <thead><tr>
              <th scope="col">{t.chainage}</th><th scope="col">{t.elevation}</th>
              <th scope="col">{t.pointType}</th><th scope="col">{t.flow}</th><th scope="col">{t.pressure}</th>
            </tr></thead>
            <tbody>{model.elevationSamples.map((sample) => {
              const node = model.points.find((p) => p.chainageKm === sample.chainageKm);
              return <tr key={sample.chainageKm} data-profile-chainage={sample.chainageKm}>
                <td>{sample.chainageKm}</td><td>{sample.elevationM}</td>
                <td>{node ? copy.stations[node.id] : t.terrainSample}</td>
                <td>{node ? node.authoredFlowKgS.toFixed(1) : '—'}</td>
                <td>{node?.pressureBarG?.toFixed(1) ?? '—'}</td>
              </tr>;
            })}</tbody>
          </table></div>
        </div>}

        {tab === 'schematic' && <div className="six-view-inner">
          <h3>{t.schematic}</h3>
          <svg viewBox="0 0 800 250" role="img" aria-label={t.schematic} className="six-view-figure">
            <title>{t.schematic}</title>
            <line x1="12" y1="118" x2="788" y2="118" stroke="#58656c" strokeWidth="5" />
            {model.system.stations.map((s, i) => {
              const x = drawX(i, model.system.stations.length);
              const alarm = s.evidence[context.windowId].alarm;
              const alerted = 'value' in alarm;
              return <g key={s.id}>
                <title>{copy.stations[s.id] + ' · ST-' + (i + 1)}</title>
                <rect data-pid-symbol="station-boundary" x={x - 62} y="57" width="124" height="124"
                  fill="none" stroke={alerted ? '#ac5829' : '#667580'} strokeWidth={alerted ? 4 : 2}
                  strokeDasharray="7 5" />
                <text x={x} y="43" fontSize="16" textAnchor="middle" fill="#263c4b">ST-{i + 1}</text>
                <ProcessGlyph kind="gate-valve" x={x - 37} y={118} tag={'XV-' + (i + 1)} />
                <ProcessGlyph kind={s.kind === 'compressor' ? 'compressor' : 'flow-transmitter'}
                  x={x + 24} y={118} tag={(s.kind === 'compressor' ? 'K-' : 'FT-') + (i + 1)} />
                <text x={x} y="209" fontSize="15" textAnchor="middle" fill="#29383d">{s.kind.toUpperCase()}</text>
              </g>;
            })}
          </svg>
          <SymbolLegend copy={t} />
          <p>{t.normal} · <span className="six-view-alarm-key">{t.activeAlarm}</span></p>
          <p className="six-view-warning">{t.noControl}</p>
          <div className="six-view-actions">{model.system.stations.map(s => <button key={s.id} type="button" className="secondary-button" aria-pressed={model.station?.id === s.id} onClick={() => onSelect(s.id)}>{copy.stations[s.id]}</button>)}</div>
        </div>}

        {tab === 'telemetry' && <div className="six-view-inner">
          <h3>{t.telemetry}</h3>
          {!model.station ? <p role="status">{t.noStation}</p> : <>
            <p>{copy.stations[model.station.id]} · {t.quality}: <strong>{current?.state ?? t.unknown}</strong> · {t.asOf}: <bdi>{model.pressureTime ?? t.unknown}</bdi></p>
            {!currentSamples && <p role="status">{current?.state === 'stale' ? t.stale : t.noReading}</p>}
            {currentSamples && <>
              <div className="six-view-actions">
                <button type="button" className="secondary-button" draggable={!!archiveSamples}
                  disabled={!archiveSamples}
                  onDragStart={(event) => event.dataTransfer.setData('text/plain', 'six-view-archive')}
                  onClick={() => setOverlay((value) => !value)}>{overlay ? t.removeArchive : t.addArchive} · {t.drag}</button>
              </div>
              <div className="six-view-drop" onDragOver={(event) => { if (archiveSamples) event.preventDefault(); }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (archiveSamples && event.dataTransfer.getData('text/plain') === 'six-view-archive') setOverlay(true);
                }}>
                <p>{t.drop}</p>
                <svg viewBox="0 0 800 250" role="img" aria-label={t.telemetry} className="six-view-figure">
                  <title>{t.telemetry}</title>
                  <line x1="45" y1="20" x2="45" y2="214" stroke="#61717a" strokeWidth="2" />
                  <line x1="45" y1="214" x2="755" y2="214" stroke="#61717a" strokeWidth="2" />
                  <polyline points={chartPoints(currentSamples, 70, 650, 45, 140, overlay && archiveSamples ? [...currentSamples, ...archiveSamples] : currentSamples)} stroke="#255872" strokeWidth="5" fill="none" />
                  {overlay && archiveSamples && <polyline points={chartPoints(archiveSamples, 70, 650, 45, 140, [...currentSamples, ...archiveSamples])}
                    stroke="#9d6a47" strokeWidth="4" strokeDasharray="10 6" fill="none" />}
                  <text x="65" y="242" fontSize="16" fill="#3b4f5b">{t.pressure}</text>
                </svg>
                <p>{t.current}: {currentSamples.join(' · ')} bar(g)</p>
                {overlay && archiveSamples && <p>{t.baseline}: {archiveSamples.join(' · ')} bar(g)</p>}
              </div>
            </>}
          </>}
        </div>}

        {tab === 'integrity' && <div className="six-view-inner">
          <h3>{t.integrity}</h3>
          <p className="six-view-warning">{t.noIli}</p>
          <svg viewBox="0 0 800 100" role="img" aria-label={t.strip} className="six-view-figure">
            <title>{t.strip}</title>
            <rect x="55" y="30" width="690" height="40" rx="7" fill="#b1b7ba" stroke="#52616a" strokeWidth="3" />
            {[165, 340, 515, 690].map(x => <line key={x} x1={x} y1="30" x2={x} y2="70" stroke="#4a5962" strokeWidth="4" />)}
          </svg>
          <div className="six-view-table-scroll"><table className="digital-twin-table">
            <caption>{t.table}</caption>
            <thead><tr><th scope="col">{t.chainage}</th><th scope="col">{t.material}</th><th scope="col">{t.thickness} (mm)</th><th scope="col">{t.weld}</th><th scope="col">{t.ili}</th></tr></thead>
            <tbody>{model.points.map((p, i) => <tr key={p.id}>
              <td>{p.chainageKm}</td><td>L485 (synthetic)</td><td>{(15.9 - i * .3).toFixed(1)}</td><td>DEMO-W-{i + 1}</td><td>{t.unknown}</td>
            </tr>)}</tbody>
          </table></div>
        </div>}

        {tab === 'station' && <div className="six-view-inner">
          <h3>{t.facility}</h3>
          {!model.station ? <p role="status">{t.noStation}</p> : <>
            <p><strong>{copy.stations[model.station.id]}</strong> · {t.revision}: <bdi>{model.revision ?? t.unknown}</bdi></p>
            <svg viewBox="0 0 800 320" role="img" aria-label={t.facility} className="six-view-figure">
              <title>{t.facility}</title>
              <rect data-pid-symbol="station-boundary" x="24" y="36" width="752" height="251" rx="5"
                fill="#edf1f2" stroke="#7f929d" strokeDasharray="9 6" strokeWidth="2.5" />
              <line x1="52" y1="135" x2="748" y2="135" stroke="#626f77" strokeWidth="6" />
              <path d="M 270 135 V 227 H 557 V 135" stroke="#8d969b" strokeWidth="5" fill="none" />
              <ProcessGlyph kind="gate-valve" x={175} y={135} tag="XV-01" />
              <ProcessGlyph kind={model.station.kind === 'compressor' ? 'compressor' : 'flow-transmitter'}
                x={408} y={135} tag={model.station.kind === 'compressor' ? 'K-01' : 'FT-01'} />
              <ProcessGlyph kind="gate-valve" x={621} y={135} tag="XV-02" />
              <ProcessGlyph kind="gate-valve" x={408} y={227} tag="XV-03" />
              <text x="64" y="89" fontSize="17" fill="#354650">{t.inlet}</text>
              <text x="339" y="81" fontSize="17" fill="#354650">{t.train}</text>
              <text x="610" y="89" fontSize="17" fill="#354650">{t.outlet}</text>
              <text x="280" y="257" fontSize="17" fill="#354650">{t.bypass}</text>
              <text x="52" y="311" fontSize="15" fill="#354650">ST · {model.station.kind.toUpperCase()}</text>
            </svg>
            <SymbolLegend copy={t} />
            <p className="six-view-warning">{t.noControl}</p>
          </>}
        </div>}
      </div>
      <p className="six-view-source">{t.local} · {t.source}: <bdi>{sixViewFixtureVersion}</bdi> · {activeIndex + 1}/6</p>
    </section>
  );
}
