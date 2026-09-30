# HidraWEB Post-Reconciliation Roadmap

```text
Repository       : CHOUABBIA-AMINE/HidraWEB
Reconciled head  : 8ea633123839abd810b7f0617a8190006baff0b5
Backend truth    : CHOUABBIA-AMINE/HidraAPI
Backend head     : 260295c6eebc4b01922d2d488810a671305860a6
Release candidate: hidraweb-v0.1.0-rc1
Execution model  : one explicitly authorized task at a time
```

## Governance

The HWEB-R01..R17 reconciliation roadmap is complete and remains historical acceptance evidence.

All new work must be classified as one of:

- **REL-xxx** — release/staging/UAT/deployment acceptance;
- **HWEB-Mxxx** — bounded maintenance/defect remediation;
- **ROADMAP-xxx** — planning/governance for a new product-development phase;
- a newly approved feature roadmap with its own identifiers.

Do not silently reopen an HWEB-R task.

## Queue

| Code | Scope | Exit criterion | Status |
| --- | --- | --- | --- |
| REL-001 | Freeze the R17 candidate and prepare staging/UAT deployment, smoke, acceptance, finding, and rollback evidence. | Exact artifact/SHA identified; staging inputs and UAT matrix documented; no claim of environment execution without evidence. | **Completed** |
| ROADMAP-001 | Define the post-reconciliation HidraWEB product roadmap from live HidraAPI capabilities plus actual UAT findings. | Prioritized capability/gap roadmap with backend prerequisites, task boundaries, exact commit messages, and no invented contracts. | **Completed** |

## REL-001 evidence

- HidraWEB candidate SHA: `8ea633123839abd810b7f0617a8190006baff0b5`;
- CI #929 / run `36718246071`: SUCCESS;
- release artifact ID: `11096704699`;
- artifact name: `hidraweb-release-8ea633123839abd810b7f0617a8190006baff0b5`;
- artifact SHA-256: `c4dda38e4e3003d8e7a5e0acab5bd3b841d98dc5475f188903ed54ad1f5af9e9`;
- artifact size: `674689` bytes;
- candidate label: `hidraweb-v0.1.0-rc1`;
- full deployment/UAT procedure: `docs/deployment/HidraWEB-Staging-UAT-RC1.md`.

No environment-specific staging URL, OIDC tenant, certificate, upstream, secret, or UAT outcome is invented by REL-001.

## ROADMAP-001 evidence

- REL-001 CI #930 / run `36760874530`: SUCCESS;
- HidraAPI main at roadmap creation: `260295c6eebc4b01922d2d488810a671305860a6`;
- HidraWEB main at roadmap creation: `0f8992ce6635b6e1801331ebc0d7ecfd002bd3b1`;
- verified OpenAPI evidence remains `63f3f60974ce57eb8cd5e42910397615195624fb`;
- detailed product roadmap: `docs/roadmap/HidraWEB-Post-Reconciliation-Product-Roadmap.md`;
- actual staging/UAT findings remain pending; BLOCKER/MAJOR findings take precedence through the HWEB-M maintenance lane.

## Next authorized task

```text
HWEB-P01 — feat(identity): add first-class access administration workspace
```

Do not execute HWEB-P01 in the same task.
