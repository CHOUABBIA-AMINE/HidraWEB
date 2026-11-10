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
            <polyline points={model.system.stations.map((s, i) => drawX(i, model.system.stations.length) + ',' + (177 - i % 2 * 55)).join(' ')}
              fill="none" stroke="#586b75" strokeWidth="8" strokeLinecap="round" />
            {model.system.stations.map((s, i) => <g key={s.id}>
              <circle cx={drawX(i, model.system.stations.length)} cy={177 - i % 2 * 55} r={model.station?.id === s.id ? 16 : 11}
                stroke="#283946" strokeWidth="3" fill={model.station?.id === s.id ? '#fff' : '#899ba4'} />
              <text x={drawX(i, model.system.stations.length)} y={210 - i % 2 * 55} textAnchor="middle" fontSize="17" fill="#22333d">{i + 1}</text>
            </g>)}
          </svg>
          <p className="six-view-warning">{t.anomaly}{model.alarmId ? ': ' + model.alarmId : ''}</p>
          <div className="six-view-actions" aria-label={t.stationSelect}>
            {model.system.stations.map((s) =>
              <button className="secondary-button" type="button" key={s.id} aria-pressed={model.station?.id === s.id}
                onClick={() => onSelect(s.id)}>{copy.stations[s.id]} · <bdi>{s.coordinates[0].toFixed(2)}, {s.coordinates[1].toFixed(2)}</bdi></button>)}
          </div>
        </div>}

        {tab === 'hydraulics' && <div className="six-view-inner">
          <h3>{t.terrain}</h3>
          <svg viewBox="0 0 800 320" role="img" aria-label={t.elevation + ' / ' + t.pressure} className="six-view-figure">
            <title>{t.elevation} / {t.pressure}</title>
            <line x1="60" y1="25" x2="60" y2="145" stroke="#596b76" strokeWidth="2" />
            <line x1="60" y1="145" x2="744" y2="145" stroke="#596b76" strokeWidth="2" />
            <line x1="60" y1="279" x2="744" y2="279" stroke="#596b76" strokeWidth="2" />
            <text x="64" y="22" fontSize="16" fill="#263c4b">{t.elevation}</text>
            <text x="64" y="175" fontSize="16" fill="#263c4b">{t.pressure}</text>
            <text x="580" y="313" fontSize="16" fill="#263c4b">{t.chainage}</text>
            <polyline fill="none" stroke="#6b7870" strokeWidth="5"
              points={model.points.map((p, i) => drawX(i, model.points.length) + ',' + (143 - p.elevationM * .27)).join(' ')} />
            {model.points.map((p, i) => <g key={p.id}>
              <circle cx={drawX(i, model.points.length)} cy={143 - p.elevationM * .27} r="7" fill="#5e6f61" />
              <text x={drawX(i, model.points.length)} y="158" textAnchor="middle" fontSize="13" fill="#304657">{p.chainageKm}</text>
              <text x={drawX(i, model.points.length)} y={132 - p.elevationM * .27} textAnchor="middle" fontSize="13" fill="#304657">{p.elevationM} m</text>
              {p.pressureBarG !== undefined && <>
                <circle cx={drawX(i, model.points.length)} cy={267 - (p.pressureBarG - 40) * 2.1} r="7" fill="#234f68" />
                <text x={drawX(i, model.points.length)} y={252 - (p.pressureBarG - 40) * 2.1} textAnchor="middle" fontSize="13" fill="#234f68">{p.pressureBarG.toFixed(1)}</text>
              </>}
            </g>)}
          </svg>
          <p className="six-view-warning">{t.physics}</p>
          <div className="six-view-table-scroll"><table className="digital-twin-table">
            <caption>{t.flow}</caption>
            <thead><tr><th scope="col">{t.chainage}</th><th scope="col">{t.elevation}</th><th scope="col">{t.flow}</th><th scope="col">{t.quality}</th></tr></thead>
            <tbody>{model.points.map((p) => <tr key={p.id}><td>{p.chainageKm}</td><td>{p.elevationM}</td><td>{p.authoredFlowKgS.toFixed(1)}</td><td>{p.pressureState}</td></tr>)}</tbody>
          </table></div>
        </div>}

        {tab === 'schematic' && <div className="six-view-inner">
          <h3>{t.schematic}</h3>
          <svg viewBox="0 0 800 230" role="img" aria-label={t.schematic} className="six-view-figure">
            <title>{t.schematic}</title>
            <line x1="44" y1="110" x2="755" y2="110" stroke="#62696d" strokeWidth="8" />
            {model.system.stations.map((s, i) => {
              const x = drawX(i, model.system.stations.length);
              const alarm = s.evidence[context.windowId].alarm;
              const alerted = 'value' in alarm;
              return <g key={s.id}>
                <rect x={x - 42} y="75" width="84" height="70" rx="6" fill={alerted ? '#f6eee4' : '#dde1e3'} stroke={alerted ? '#ae5426' : '#46525a'} strokeWidth={alerted ? 5 : 3} />
                <circle cx={x} cy="110" r="16" fill={alerted ? '#bb6331' : '#a1aaae'} stroke="#4c565c" strokeWidth="3" />
                <text x={x} y="48" fontSize="17" textAnchor="middle" fill="#29383d">{i + 1}</text>
                <text x={x} y="183" textAnchor="middle" fontSize="15" fill="#29383d">{s.kind.toUpperCase()}</text>
                <path d={'M ' + (x + 49) + ' 96 l 10 14 -10 14 -10 -14 Z'} fill="#d0d4d6" stroke="#59646b" strokeWidth="2" />
              </g>;
            })}
          </svg>
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
            <svg viewBox="0 0 800 300" role="img" aria-label={t.facility} className="six-view-figure">
              <title>{t.facility}</title>
              <rect x="32" y="46" width="736" height="207" rx="12" fill="#ebeff0" stroke="#9eaaaf" strokeWidth="2" />
              <line x1="55" y1="130" x2="744" y2="130" stroke="#627078" strokeWidth="13" />
              <path d="M 265 130 V 206 H 560 V 130" stroke="#8d969b" strokeWidth="9" fill="none" />
              <rect x="340" y="94" width="135" height="74" rx="7" fill="#b6bdc1" stroke="#4e5e67" strokeWidth="3" />
              <circle cx="407" cy="130" r="24" fill="#e2e6e7" stroke="#53616a" strokeWidth="4" />
              <path d="M 405 109 L 423 133 L 393 141 Z" fill="#737f85" />
              {[174, 612].map(x => <g key={x}>
                <path d={'M ' + (x - 16) + ' 111 L ' + (x + 16) + ' 149 M ' + (x + 16) + ' 111 L ' + (x - 16) + ' 149'}
                  stroke="#3f4d55" strokeWidth="7" />
              </g>)}
              <text x="63" y="82" fontSize="17" fill="#354650">{t.inlet}</text>
              <text x="355" y="78" fontSize="17" fill="#354650">{t.train}</text>
              <text x="588" y="82" fontSize="17" fill="#354650">{t.outlet}</text>
              <text x="375" y="236" fontSize="17" fill="#354650">{t.bypass}</text>
            </svg>
            <p className="six-view-warning">{t.noControl}</p>
          </>}
        </div>}
      </div>
      <p className="six-view-source">{t.local} · {t.source}: <bdi>{sixViewFixtureVersion}</bdi> · {activeIndex + 1}/6</p>
    </section>
  );
}
