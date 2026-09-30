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
| ROADMAP-001 | Define HidraWEB vNext product roadmap from live HidraAPI capabilities plus actual UAT findings. | Prioritized capability/gap roadmap with backend prerequisites, task boundaries, exact commit messages, and no invented contracts. | **Next** |

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

## Next authorized task

```text
ROADMAP-001 — define HidraWEB vNext product roadmap from current HidraAPI capabilities and UAT gaps
```

Do not execute ROADMAP-001 in the same task.
