import { useEffect, useRef } from 'react';

import { formatTime, investigationCopy, previewCopy, windowLabel, type PreviewLanguage } from './previewCopy';
import type { InvestigationAction, InvestigationContext, investigationView } from './stationInvestigation';

type Props = {
  view: NonNullable<ReturnType<typeof investigationView>>;
  context: InvestigationContext;
  language: PreviewLanguage;
  onCommand: (command: 'review' | InvestigationAction) => void;
  onClose: () => void;
};

export function StationInvestigationPanel({ view, context, language, onCommand, onClose }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  const copy = previewCopy[language];
  const labels = investigationCopy[language];
  const { evidence, history, nextAction } = view;
  const number = new Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const time = (iso: string) => <time dateTime={iso}><bdi>{formatTime(iso, language)} UTC</bdi></time>;

  return (
    <section id="station-investigation" className="panel investigation-panel" aria-labelledby="investigation-heading">
      <div className="panel-heading investigation-heading">
        <div>
          <p className="eyebrow">{labels.provenance}</p>
          <h2 id="investigation-heading" ref={heading} tabIndex={-1}>{labels.heading}</h2>
        </div>
        <button className="secondary-button" onClick={onClose}>{labels.close}</button>
      </div>

      <div className="investigation-body">
        <p className="investigation-scope">
          <strong>{copy.stations[view.stationId]}</strong>
          <span>{copy.systems[context.systemId]} · {copy.company} · {copy.organizations[view.organization]}</span>
          <span><bdi>{view.stationId}</bdi> · <bdi>{windowLabel(context.windowId, language)}</bdi></span>
        </p>
        <dl className="investigation-evidence">
          <div>
            <dt>{copy.technical}</dt>
            <dd>
              {'value' in evidence.technical && <><bdi>{evidence.technical.value.revision}</bdi> · {time(evidence.technical.observedAt)} · </>}
              {copy.states[evidence.technical.state]}
            </dd>
          </div>
          <div>
            <dt>{copy.pressure}</dt>
            <dd>
              {'value' in evidence.pressure && <>
                <bdi>{number.format(evidence.pressure.value.samples.at(-1)!)} bar(g)</bdi> · {time(evidence.pressure.observedAt)} ·
                {' '}
              </>}
              {copy.states[evidence.pressure.state]}
            </dd>
          </div>
          <div>
            <dt>{copy.alarm}</dt>
            <dd>
              {'value' in evidence.alarm && <><bdi>{evidence.alarm.value.id}</bdi> · {time(evidence.alarm.observedAt)} · </>}
              {copy.states[evidence.alarm.state]}
            </dd>
          </div>
        </dl>

        {view.canReview && <p className="investigation-condition">{nextAction ? labels.active : labels.resolved}</p>}
        {view.canAct && nextAction && (
          <div className="investigation-actions">
            <button className="secondary-button" onClick={() => onCommand('review')}>{labels.review}</button>
            <button className="secondary-button" onClick={() => onCommand(nextAction)}>{labels.buttons[nextAction]}</button>
          </div>
        )}
        <p className="investigation-notice" role="status">{view.notice ? labels.notices[view.notice] : null}</p>

        <section aria-label={labels.timeline}>
          <h3>{labels.timeline}</h3>
          {history.length === 0 ? <p className="muted">{labels.noHistory}</p> : (
            <ol className="investigation-timeline">
              {history.map((event) => (
                <li key={event.action}>
                  <strong>{labels.events[event.action]}</strong>
                  <p>
                    {labels.actorTime} · {event.actor === 'fixture' ? labels.fixtureActor : copy.roles.operator} · {time(event.time)}
                  </p>
                  <p>
                    {labels.original} · <bdi>{event.evidence.fixture}</bdi> · <bdi>{event.evidence.revision}</bdi> ·
                    {' '}<bdi>{event.evidence.alarmId}</bdi> · {copy.telemetry} {time(event.evidence.observationAt)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </section>
  );
}
