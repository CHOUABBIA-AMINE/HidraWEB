import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifactName = 'hidra-workflow-5817406923e53761577ac41bbc3f318b517c3977.json';
const artifactPath = path.join(root, 'openapi/candidates', artifactName);
const legacyPath = path.join(root, 'openapi/hidra-workflow-63f3f60974ce57eb8cd5e42910397615195624fb.json');
const artifact = fs.readFileSync(artifactPath);
const current = JSON.parse(artifact.toString('utf8'));
const legacy = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));

test('Workflow source exactly matches the verified backend OpenAPI artifact slice', () => {
  assert.equal(crypto.createHash('sha256').update(artifact).digest('hex'),
    '44bd9f9f21b6a3f757a44ec5fc36ddf2228fb8047244bc38d65f6e00ee6ca28e');
  assert.equal(current.openapi, '3.1.0');
  assert.equal(Object.keys(current.paths).length, 14);
  assert.equal(Object.keys(current.components.schemas).length, 17);
  assert.equal(current.servers, undefined);
  assert.ok(Object.keys(current.paths).every((name) => name.startsWith('/api/v1/workflow/')));
});

test('Workflow task and instance creation schemas retain typed backend inputs', () => {
  for (const [route, request, response] of [
    ['/api/v1/workflow/tasks', 'CreateWorkflowTaskRequest', 'WorkflowTaskResponse'],
    ['/api/v1/workflow/instances', 'StartWorkflowInstanceRequest', 'WorkflowInstanceResponse'],
  ]) {
    const operation = current.paths[route].post;
    assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
    assert.equal(operation.requestBody.required, true);
    assert.equal(operation.requestBody.content['application/json'].schema.$ref,
      `#/components/schemas/${request}`);
    assert.equal(operation.responses['200'].content['*/*'].schema.$ref,
      `#/components/schemas/${response}`);
  }
  assert.equal(current.components.schemas.CreateWorkflowTaskRequest.properties.dueAt.format, 'date-time');
  assert.equal(current.components.schemas.StartWorkflowInstanceRequest.properties.definitionVersion.format, 'int32');
  assert.ok(current.components.schemas.WorkflowTaskResponse.properties.status.enum.includes('CLAIMED'));
  assert.ok(current.components.schemas.WorkflowInstanceResponse.properties.status.enum.includes('COMPLETED'));
});

test('existing task inbox, available actions and optimistic transition contract remain intact', () => {
  for (const [route, operations] of Object.entries(legacy.paths)) {
    for (const method of Object.keys(operations)) {
      assert.ok(current.paths[route]?.[method], `missing existing ${method.toUpperCase()} ${route}`);
    }
  }
  const delta = compareContractSlice('workflow', legacy, current);
  assert.ok(!delta.some((item) => ['path_removed', 'method_removed', 'field_removed', 'response_removed'].includes(item.kind)));
  assert.equal(current.components.schemas.ExecuteWorkflowTransitionRequest.properties.expectedTaskUpdatedAt.format, 'date-time');
  assert.deepEqual(current.components.schemas.ExecuteWorkflowTransitionRequest.required, ['expectedTaskUpdatedAt']);
  assert.deepEqual(current.paths['/api/v1/workflow/tasks/{taskId}/transitions/{transitionId}/execute'].post.security,
    [{ hidraBearerJwt: [] }]);
});

test('active Workflow Orval pin requires source digest and retains historical compatibility checks', () => {
  const config = fs.readFileSync(path.join(root, 'orval.workflow.config.ts'), 'utf8');
  assert.ok(config.includes(`./openapi/candidates/${artifactName}`));
  assert.ok(!config.includes('hidra-workflow-63f3f60974ce57eb8cd5e42910397615195624fb.json'));
  const checker = fs.readFileSync(path.join(root, 'scripts/check-openapi-compatibility.mjs'), 'utf8');
  assert.ok(checker.includes('WORKFLOW_CURRENT_PROOF'));
  assert.ok(checker.includes('source-backed Workflow contract digest mismatch'));
  for (const token of ['RISK_CURRENT_PROOF', 'TOPOLOGY_CURRENT_PROOF', 'TELEMETRY_CURRENT_PROOF', 'compareSlice(config, slice);']) {
    assert.ok(checker.includes(token));
  }
});

test('W4 discovery/target addressing are source-stamped and expose no browser encoding authority', () => {
  assert.equal(current['x-hidra-ci-source-sha'], '5817406923e53761577ac41bbc3f318b517c3977');
  const handoff = current.paths['/api/v1/workflow/definitions/installed-characteristic-link-target'].get;
  assert.equal(handoff.operationId, 'readInstalledCharacteristicLinkWorkflowTarget');
  assert.deepEqual(handoff.parameters.map(p => p.name).sort(), ['companyPartyId', 'installedUnitId', 'linkId', 'revisionId']);
  assert.ok(current.components.schemas.Definition.properties.assignmentChoices);
  assert.ok(current.components.schemas.TargetHandoff.properties.targetLocator);
  assert.equal(current.paths['/api/v1/workflow/definitions'].get.parameters.length, 5);
});
