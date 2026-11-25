#!/usr/bin/env bash
set -euo pipefail
umask 077
: "${HIDRA_UXR29_PRIVATE_DIR:?}"
: "${HIDRA_UXR29_FIXTURE:?}"
: "${HIDRA_UXR26_API_URL:?}"
: "${HIDRA_UXR29_PHASE:?}"
[[ "$HIDRA_UXR26_API_URL" =~ ^http://127\.0\.0\.1:[0-9]+$ ]]
[[ -d "$HIDRA_UXR29_PRIVATE_DIR" && -f "$HIDRA_UXR29_FIXTURE" ]]
case "$HIDRA_UXR29_PHASE" in RESPONSE_BEFORE|RESPONSE_AFTER|HSE_AFTER|PLANNING_SUBMIT_REVIEW) ;; *) exit 2 ;; esac
export HIDRA_E2E_AUTH_MOCK=0
export PLAYWRIGHT_JSON_OUTPUT_NAME="$HIDRA_UXR29_PRIVATE_DIR/results.json"
status=0
npx --no-install playwright test --config playwright.uxr29.config.ts --reporter=json >"$HIDRA_UXR29_PRIVATE_DIR/browser.log" 2>&1 || status=$?
python3 - "$HIDRA_UXR29_PRIVATE_DIR" "$HIDRA_UXR29_PHASE" "$status" <<'PY'
import json
from pathlib import Path
import sys
root, phase, status = Path(sys.argv[1]), sys.argv[2], int(sys.argv[3])
required = {
    "RESPONSE_BEFORE": ["SIGNED_READS","ALARM_EVIDENCE","INCIDENT_HISTORY","LEAK_HISTORY","SIBLING_DENIAL","FOREIGN_DENIAL","MISSING_SOURCE","COMPLETE"],
    "RESPONSE_AFTER": ["SIGNED_READS","ALARM_EVIDENCE","INCIDENT_HISTORY","LEAK_HISTORY","SIBLING_DENIAL","FOREIGN_DENIAL","SCOPE_CHANGE","REVOCATION_BEFORE","REVOCATION_AFTER","COMPLETE"],
    "HSE_AFTER": ["MASKED_COLLECTION","DUPLICATE_DISCOVERY","SCOPED_CASE","CAPA_HISTORY","WRONG_SCOPE","LEGACY_MASKED","SCOPE_CHANGE","COMPLETE"],
    "PLANNING_SUBMIT_REVIEW": ["DRAFT_DISCOVERY","STALE_SUBMIT","SIGNED_SUBMIT","SELF_DENIED","INDEPENDENT_APPROVE","INDEPENDENT_REJECT","WRONG_SCOPE","HISTORICAL_REVISION","FRESH_LOGIN","COMPLETE"],
}[phase]
report_file = root / "results.json"
print("UXR29_DIAG PHASE=" + phase, flush=True)
if not report_file.is_file():
    print("UXR29_DIAG REPORT_MISSING", flush=True)
    raise SystemExit(1)
report = json.loads(report_file.read_text())
counts = {k: report["stats"][k] for k in ("expected","unexpected","flaky","skipped")}
print("UXR29_DIAG COUNTS " + " ".join(f"{k.upper()}={v}" for k,v in counts.items()), flush=True)
observed = []
tests = []
def walk(suites):
    for suite in suites:
        for spec in suite.get("specs", []):
            for test in spec.get("tests", []):
                tests.append((Path(spec["file"]).name, spec["title"], test))
                for result in test.get("results", []):
                    for entry in result.get("stdout", []):
                        value = entry if isinstance(entry,str) else entry.get("text","")
                        for line in value.splitlines():
                            if line.startswith("UXR29_CHECKPOINT="):
                                code = line.split("=",1)[1]
                                observed.append(code)
                                if code in required: print("UXR29_DIAG CHECKPOINT=" + code, flush=True)
                    for error in result.get("errors", []):
                        location = error.get("location") or {}
                        if Path(location.get("file","")).name == "uxr29-native.spec.ts" and type(location.get("line")) is int:
                            print("UXR29_DIAG FAILURE_LINE=" + str(location["line"]), flush=True)
        walk(suite.get("suites", []))
walk(report.get("suites", []))
if (status != 0 or report.get("errors") or counts != dict(expected=1,unexpected=0,flaky=0,skipped=0)
    or len(tests) != 1 or tests[0][0] != "uxr29-native.spec.ts" or tests[0][1] != "UXR-29 " + phase
    or len(tests[0][2].get("results", [])) != 1 or tests[0][2]["results"][0].get("status") != "passed"
    or observed != required):
    raise SystemExit("UXR29 phase gate failed; raw private output is not published")
(root/"safe.json").write_text(json.dumps({"phase": phase, "counts": counts, "checkpoints": observed}, sort_keys=True)+"\n")
print("UXR29_DIAG PASSED", flush=True)
PY
