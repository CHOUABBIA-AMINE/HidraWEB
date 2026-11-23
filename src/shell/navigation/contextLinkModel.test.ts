import { describe, expect, it } from 'vitest';
import {
  contextReturnState, contextScopeFingerprint, contextTargetPath,
  validContextReturn,
} from '@/shell/navigation/contextLinkModel';

describe('UXR-16 typed ContextLink routing', () => {
  it('only builds exact supported source-ID routes, with no company or authority token', () => {
    expect(contextTargetPath({ kind: 'regional-feature', layer: 'facilities', entityId: 'FAC-1' }))
      .toBe('/network?regionalLayer=facilities&regionalEntityId=FAC-1');
    expect(contextTargetPath({ kind: 'regional-feature', layer: 'pipeline-segments', entityId: 'SEG-7' }))
      .toContain('regionalEntityId=SEG-7');
    expect(contextTargetPath({ kind: 'workflow-task', taskId: 'task-1' })).toBe('/work/tasks?taskId=task-1');
    expect(contextTargetPath({ kind: 'workflow-instance', instanceId: 'instance-1' }))
      .toBe('/work/tasks?instanceId=instance-1');
    expect(contextTargetPath({ kind: 'regional-feature', layer: 'unknown', entityId: 'f-1' })).toBeUndefined();
    expect(contextTargetPath({ kind: 'regional-feature', layer: 'facilities', entityId: 'facilities:f-1' })).toBeUndefined();
    expect(contextTargetPath({ kind: 'workflow-task', taskId: '../admin' })).toBeUndefined();
    expect(contextTargetPath({ kind: 'workflow-instance', instanceId: 'https://unsafe.invalid' })).toBeUndefined();
  });

  it('only offers return to known workspace for the same principal and scope', () => {
    const scope = contextScopeFingerprint({ scopeId: 9, companyPartyId: 'company-1', principalId: 'actor-1', type: 'PIPELINE_SYSTEM', targetId: 'gz2' });
    const state = contextReturnState('/network', 'actor-1', scope);
    expect(validContextReturn(state, 'actor-1', scope)).toBe('/network');
    expect(validContextReturn(state, 'actor-2', scope)).toBeUndefined();
    expect(validContextReturn(state, 'actor-1', contextScopeFingerprint(undefined))).toBeUndefined();
    expect(contextReturnState('/administration/audit', 'actor-1', scope)).toBeUndefined();
    expect(contextReturnState('/network', undefined, scope)).toBeUndefined();
    expect(validContextReturn({ contextReturn: { pathname: '//evil.invalid', principalId: 'actor-1', scopeFingerprint: scope } }, 'actor-1', scope)).toBeUndefined();
    expect(JSON.stringify(state)).not.toContain('regionalEntityId');
  });
});
