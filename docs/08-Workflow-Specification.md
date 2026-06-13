# 08 — Workflow Interaction Specification

## Backend evidence

Workflow module exists and exposes commands through controllers; workflow-related domain files include:

- `src/main/java/dz/sh/hidra/modules/workflow/domain/event/WorkflowActionRecordedEvent.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/event/WorkflowDomainEvent.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/event/WorkflowInstanceCompletedEvent.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/event/WorkflowInstanceStartedEvent.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/event/WorkflowTaskCreatedEvent.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/event/package-info.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/model/WorkflowStateHistory.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/value/WorkflowAssignmentStatus.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/value/WorkflowAuditOutboxStatus.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/value/WorkflowDefinitionStatus.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/value/WorkflowDelegationStatus.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/value/WorkflowInstanceStatus.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/value/WorkflowSlaStatus.java`
- `src/main/java/dz/sh/hidra/modules/workflow/domain/value/WorkflowTaskStatus.java`

## Governance rules

- Do not invent workflow states beyond backend evidence.
- Action buttons shall be generated from explicit workflow APIs or a future workflow metadata endpoint.
- Until the metadata endpoint exists, show module command actions as backend actions, not as full BPM workflow semantics.

## Standard approval pattern

- Draft / submitted / under review / approved / rejected must not be implemented as canonical states unless backend confirms them.
- UI may display generic pending/complete/error states for client-side request execution.

## Escalation behavior

Unable to determine from available evidence. No escalation API metadata was found in the frontend-facing contract beyond module-specific event names and workflow module presence.
