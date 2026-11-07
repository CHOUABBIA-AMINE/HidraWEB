# HWEB-F15/A1 six-module development acceptance

Run the `foundation-native` job of **HidraWEB Code CI** on the candidate WEB
commit. It builds immutable HidraAPI
`5817406923e53761577ac41bbc3f318b517c3977`, applies Flyway to a fresh PostgreSQL
16 database, and runs HidraWEB against the native API using synthetic data and
LOCAL JWT authentication. The explicit HTTPS issuer is
`https://foundation.synthetic.invalid`. Use the pinned API
[Full CI #1140](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42299943400)
and the [owner-approved A1 revision](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/1e5e18f7f13d10f21e1cdf95cb0568dfe49cc383/doc/roadmap/FOUNDATION_PRODUCTION_ROADMAP.md#owner-approved-a1-journey-b-acceptance-revision--2026-11-07)
when reviewing the run.

| Journey | Required evidence from the native job |
| --- | --- |
| A — Identity | Browser creates, credentials and activates a LOCAL user. The user authenticates with native JWT and a protected Party route denies access. |
| B — Organization and Party | Browser creates parent and child from the Organization catalog, registers and activates an employee, and submits one initial appointment. The owner API proves hierarchy and lifecycle after reload, plus exact appointment ID, employee, unit, position and start. Browser creates and activates the Party and assigns its catalog role. Owner API proves lifecycle, role history and eligible lookup. A separate authenticated LOCAL actor receives denial on the same directory, employee history, appointment, Party detail and history reads. |
| C — Topology | Browser uses the exact Party ID from B in the native system write, then reads back the new system in that Party scope. The W2 replay separately proves station, installed equipment and configuration, persisted Pipeline graph and history, stale write and denied access. |
| D — Configuration | Typed setting, effective override, flag state, stale/conflict and unauthorized behavior run through the native Configuration APIs. |
| E — Workflow | Deliberate process configuration, native task assignment, independent human approval and rejection, persisted history, stale replay and unauthorized access. |

Use fresh PostgreSQL for each run. The fixture supplies catalogs, scoped grants,
Organization binding and policy, and Workflow process definitions. Browser
requests create the Organization units, employee, appointment, Party, role
assignment and the corresponding Topology system. The configuration login,
proof-key administrator and runtime logins have separate roles. Appointment
and installed-unit publication share a connection credential in this API pin,
so A1 grants the Party row-lock privilege only during the appointment phase and
revokes it before Topology. This exercises the separate native guards in their
supported privilege states. Simultaneous use under a single deployment role
layout is outside this evidence.

Expect one A1 case, seven W1–W3 cases and two W4 cases, all passed with zero
failed, flaky or skipped. Check the artifact
`hidraweb-foundation-a1-<web-sha>` for both exact source SHAs, run/attempt,
Flyway history and checksums, runtime OpenAPI and SHA-256, and the three
Playwright result files. A missing artifact or any failed, flaky or skipped
case leaves A1 open. Review exact-SHA Code CI and Documentation Validation
before recording engineering acceptance. The earlier W1–W4 runs remain
evidence for their bounded scopes.

Appointment transfer/end and Workflow-approved Organization responsibility
assignment/revocation remain outside the revised gate. This procedure qualifies
synthetic development software. Industrial calibration, SITE acceptance,
live OT/SCADA, release and deployment require separate authorization and evidence.
