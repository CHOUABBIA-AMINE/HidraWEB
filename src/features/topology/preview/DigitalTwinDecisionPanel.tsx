import { useEffect, useRef, useState } from 'react';

import { digitalTwinCopy } from './digitalTwinCopy';
import {
  decisionActors, decisionOptions, inputSelections,
  type DecisionActor, type DecisionCommand, type InputSelection, type decisionView,
} from './digitalTwinDecision';
import { formatTime, previewCopy, windowLabel, type PreviewLanguage } from './previewCopy';
import type { InvestigationContext } from './stationInvestigation';

type Props = {
  view: NonNullable<ReturnType<typeof decisionView>>;
  context: InvestigationContext;
  language: PreviewLanguage;
  input: InputSelection;
  actor: DecisionActor;
  onInput: (input: InputSelection) => void;
  onActor: (actor: DecisionActor) => void;
  onCommand: (command: DecisionCommand) => void;
  onClose: () => void;
};

export function DigitalTwinDecisionPanel({
  view, context, language, input, actor, onInput, onActor, onCommand, onClose,
}: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [rationale, setRationale] = useState('');
  useEffect(() => heading.current?.focus(), []);
  const labels = digitalTwinCopy[language];
  const copy = previewCopy[language];
  const time = (iso: string) => <time dateTime={iso}><bdi>{formatTime(iso, language)} UTC</bdi></time>;
  const number = new Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const { source, comparison, history, proposal } = view;
  const status = view.notice ?? view.blocked;

  return (
    <section id="digital-twin-decision" className="panel investigation-panel digital-twin-panel" aria-labelledby="digital-twin-heading">
      <div className="panel-heading investigation-heading">
        <div>
          <p className="eyebrow">{labels.disclosure}</p>
          <h2 id="digital-twin-heading" ref={heading} tabIndex={-1}>{labels.title}</h2>
        </div>
        <button className="secondary-button" onClick={onClose}>{labels.close}</button>
      </div>
      <div className="investigation-body digital-twin-body">
        <p className="investigation-scope">
          <strong>{copy.stations[view.station]}</strong>
          <span>{copy.company} · {copy.organizations[view.organization]} · {copy.systems[context.systemId]}</span>
          <bdi>{windowLabel(context.windowId, language)}</bdi>
          <a href="#station-investigation">{labels.evidence}</a>
        </p>
        {view.canAct && (
          <div className="digital-twin-controls">
            <label>{labels.actor}
              <select value={actor} onChange={(event) => onActor(event.target.value as DecisionActor)}>
                {decisionActors.map((id) => <option key={id} value={id}>{labels.actors[id]}</option>)}
              </select>
            </label>
            <label>{labels.input}
              <select value={input} onChange={(event) => onInput(event.target.value as InputSelection)}>
                {inputSelections.map((id) => <option key={id} value={id}>{labels.inputs[id]}</option>)}
              </select>
            </label>
          </div>
        )}
        <p className="investigation-notice" role="status">{status ? labels.notices[status] : null}</p>
        {source && (
          <section aria-label={labels.manifest}>
            <h3>{labels.manifest}</h3>
            <dl className="investigation-evidence">
              <div>
                <dt>{copy.fixture}</dt>
                <dd><bdi>{source.manifest.id}</bdi> · <bdi>{source.manifest.fixture}</bdi> · {labels.gas}</dd>
              </div>
              <div>
                <dt>{copy.technical}</dt>
                <dd><bdi>{source.manifest.technicalRevision}</bdi> · <bdi>{source.manifest.station}</bdi></dd>
              </div>
              <div>
                <dt>{labels.observed}</dt>
                <dd><bdi>{number.format(source.observation)} {source.manifest.unit}</bdi> · {time(source.manifest.observationAt)} · <bdi>{source.manifest.alarm}</bdi></dd>
              </div>
            </dl>
          </section>
        )}
        {view.canAct && actor === 'operator' && history.length === 0 &&
          <button className="secondary-button" onClick={() => onCommand({ type: 'compare' })}>{labels.compare}</button>}

        {comparison && (
          <section aria-label={labels.comparison}>
            <h3>{labels.comparison} · <bdi>{comparison.run.id}</bdi></h3>
            <table className="digital-twin-table" aria-label={labels.comparison}>
              <thead><tr><th scope="col">{labels.source}</th><th scope="col">{copy.pressure}</th></tr></thead>
              <tbody>
                <tr><th scope="row">{labels.observed}</th><td><bdi>{number.format(comparison.observation)} {comparison.manifest.unit}</bdi></td></tr>
                <tr><th scope="row">{labels.baseline}</th><td><bdi>{number.format(comparison.run.baseline)} {comparison.manifest.unit}</bdi></td></tr>
                <tr><th scope="row">{labels.alternative}</th><td><bdi>{number.format(comparison.run.alternative)} {comparison.manifest.unit}</bdi></td></tr>
              </tbody>
            </table>
            <p className="digital-twin-tradeoff">{labels.tradeoff}</p>
          </section>
        )}
        {view.canAct && actor === 'engineer' && view.canPropose &&
          <button className="secondary-button" onClick={() => onCommand({ type: 'propose' })}>{labels.propose}</button>}
        {view.canAct && actor === 'reviewer' && (proposal || view.hasReview) && (
          <div>
            {proposal && (
              <button className="secondary-button" onClick={() => onCommand({ type: 'review' })}>
                {labels.review} · <bdi>{proposal.proposalId}</bdi>
              </button>
            )}
            {view.hasReview && (
              <div className="digital-twin-rationale">
                <label>{labels.rationale}
                  <textarea rows={3} maxLength={240} value={rationale} onChange={(event) => setRationale(event.target.value)} />
                </label>
                <div className="investigation-actions">
                  {decisionOptions.map((decision) => (
                    <button key={decision} className="secondary-button" onClick={() => onCommand({ type: 'decide', decision, rationale })}>
                      {labels.decisions[decision]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <section aria-label={labels.history}>
          <h3>{labels.history}</h3>
          {history.length === 0 ? <p className="muted">{labels.noHistory}</p> : (
            <ol className="investigation-timeline">
              {history.map((event) => (
                <li key={event.at}>
                  <strong>{labels.events[event.kind]} {'proposalId' in event && <bdi>{event.proposalId}</bdi>}</strong>
                  <p>{labels.actors[event.actor]} · {time(event.at)}</p>
                  <p>
                    <bdi>{event.source.manifest.id}</bdi> · <bdi>{event.source.manifest.technicalRevision}</bdi> ·
                    {' '}<bdi>{event.source.run.id}</bdi> · <bdi>{event.source.run.fixture}</bdi> · {labels.observed} {time(event.source.manifest.observationAt)}
                  </p>
                  {'rationale' in event && <p>{labels.rationale} · <bdi>{event.rationale}</bdi></p>}
                </li>
              ))}
            </ol>
          )}
        </section>
        {view.outcomeUnresolved && <p className="investigation-condition">{labels.outcome} · {labels.unresolved}</p>}
      </div>
    </section>
  );
}
