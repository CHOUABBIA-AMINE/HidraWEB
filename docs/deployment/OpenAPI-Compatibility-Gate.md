# HidraAPI ↔ HidraWEB OpenAPI Compatibility Gate

Status: HWEB-015-10 production-hardening contract

## Purpose

HidraAPI remains the source of backend contract truth. HidraWEB keeps feature-specific, artifact-derived OpenAPI slices for deterministic Orval generation, and production CI must prove that every consumed slice is still compatible with one accepted full HidraAPI contract.

HWEB-015-10 adds that consumer-side gate without changing backend endpoints, DTOs, permissions, business rules, frontend routes, or generated-client ownership.

## Accepted backend baseline

The compatibility baseline is the exact deterministic artifact published by HidraAPI `main` CI:

```text
Backend repository : CHOUABBIA-AMINE/HidraAPI
Backend commit     : 725a451ae4880ccb4f2ec508709241f88cd4aea7
Workflow run       : 34764890847 — SUCCESS
Artifact id        : 10320386070
Artifact name      : hidra-api-openapi-725a451ae4880ccb4f2ec508709241f88cd4aea7
Artifact digest    : sha256:4c401ba08e3aeb897be19b5944072f6ada7e08efc85c299683def9175e8d4c38
Full contract SHA  : sha256:1d4bd8451989e5efcda453c0bf96a538040f28afad30e970a7c9d4765b9af00d
Compressed SHA     : sha256:3ae1ff18063a21576b123cf27e742b0ef353a2a1569c645034f0116ed1006152
```

`openapi/compatibility/hidra-api-baseline.json` records this provenance and the expected count of feature Orval contracts. The exact full OpenAPI JSON is deterministically gzip-compressed, base64-encoded, and split across four checked-in text-safe files:

```text
openapi/compatibility/hidra-api-725a451ae4880ccb4f2ec508709241f88cd4aea7.part1.b64
openapi/compatibility/hidra-api-725a451ae4880ccb4f2ec508709241f88cd4aea7.part2.b64
openapi/compatibility/hidra-api-725a451ae4880ccb4f2ec508709241f88cd4aea7.part3.b64
openapi/compatibility/hidra-api-725a451ae4880ccb4f2ec508709241f88cd4aea7.part4.b64
```

The compatibility checker reconstructs those parts and verifies both the compressed payload SHA-256 and the decoded full-contract SHA-256 before comparing any frontend contract.

## Gate behavior

`npm run openapi:compatibility` runs before any feature client generation in CI. `scripts/check-openapi-compatibility.mjs` discovers every feature `orval.*.config.ts` checked-in OpenAPI target and compares it with the accepted full HidraAPI baseline.

The gate fails when a consumed contract experiences any of the following relative to the accepted backend artifact:

- a consumed route or HTTP method is absent;
- an existing parameter is removed;
- the backend adds a new required parameter to an existing operation;
- a request body required by the slice disappears, or a previously body-free operation gains a required body;
- an expected response status or media type disappears;
- a referenced component schema disappears;
- a consumed schema property disappears;
- a consumed primitive type or format changes;
- an enum value used by the consumed schema is removed;
- an existing consumed property becomes newly required;
- a feature Orval config stops pointing at exactly one checked-in OpenAPI contract;
- the expected feature-contract count changes without a reviewed baseline update.

Additive backend paths, optional parameters, optional fields, and unrelated schemas do not fail the gate.

## Pipeline boundary

HidraAPI CI owns creation of the deterministic full OpenAPI artifact. HidraWEB CI owns consumer compatibility and Orval regeneration. The compatibility step runs after dependency installation and before all HWEB-003 through HWEB-014 feature generators.

HWEB-015-10 deliberately does not grant the HidraWEB `GITHUB_TOKEN` access to another repository, add a PAT, depend on a live backend endpoint during frontend CI, weaken artifact retention/security, or modify HidraAPI CI outside an authorized backend roadmap task.

Updating the accepted baseline is a reviewed frontend change: first verify a successful HidraAPI `main` run and exact artifact/digest, then replace the four pinned artifact parts and manifest together and run the complete HidraWEB lifecycle.

## Regression rule

A future change is not HWEB-015-10-safe if it bypasses `openapi:compatibility`, changes the baseline without exact backend CI/artifact evidence, silently narrows the discovered Orval contract set, or makes production verification depend on an unverified live endpoint.

HWEB-015-11 remains separate and owns backup/rollback and release artifact verification.
