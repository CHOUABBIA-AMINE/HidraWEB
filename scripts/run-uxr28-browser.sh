#!/usr/bin/env bash
set -euo pipefail
umask 077
: "$HIDRA_UXR28_FIXTURE_JSON"
: "$HIDRA_UXR28_PRIVATE_DIR"
: "$HIDRA_UXR26_API_URL"
case "$HIDRA_UXR28_PHASE" in regional|before-restart|after-restart) ;; *) exit 2 ;; esac
[[ "$HIDRA_UXR26_API_URL" =~ ^http://127\.0\.0\.1:[0-9]+$ ]]
[[ -d "$HIDRA_UXR28_PRIVATE_DIR" ]]
export PLAYWRIGHT_JSON_OUTPUT_NAME="$HIDRA_UXR28_PRIVATE_DIR/results.json"
result=0
npx --no-install playwright test --config playwright.uxr28.config.ts --reporter=json \
  >"$HIDRA_UXR28_PRIVATE_DIR/browser.log" 2>&1 || result=$?
python3 - "$PLAYWRIGHT_JSON_OUTPUT_NAME" "$result" "$HIDRA_UXR28_PHASE" <<'PY'
import json
from pathlib import Path
import sys
path, exit_code, phase = Path(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
print("UXR28_DIAG PHASE=" + phase, flush=True)
if not path.is_file():
    print("UXR28_DIAG REPORT_MISSING", flush=True)
    raise SystemExit(1)
report = json.loads(path.read_text())
stats = report["stats"]
keys = ("expected", "unexpected", "flaky", "skipped")
counts = {key: stats[key] for key in keys}
if any(type(value) is not int or value < 0 for value in counts.values()):
    raise SystemExit(1)
print("UXR28_DIAG COUNTS " + " ".join(f"{key.upper()}={value}" for key, value in counts.items()), flush=True)
print(f"UXR28_DIAG EXIT={exit_code}", flush=True)
required = {
    "regional": ["REGIONAL_PRIMARY","REGIONAL_SIBLING","REGIONAL_FOREIGN","REVOKE_BEFORE","REVOKE_AFTER","COMPLETE"],
    "before-restart": ["DOSSIER","LIMITS","TELEMETRY","INTEGRITY","COMPLETE"],
    "after-restart": ["DOSSIER","LIMITS","TELEMETRY","INTEGRITY","RELOAD","RTL","SESSION","COMPLETE"],
}[phase]
observed = []
def location(error):
    where = error.get("location") or {}
    line = where.get("line")
    if Path(where.get("file", "")).name == "uxr28-native.spec.ts" and type(line) is int and line > 0:
        print(f"UXR28_DIAG FAILURE_LINE={line}", flush=True)
    # Classify privately; never print raw messages, locator text or stack.
    message = str(error.get("message", ""))
    kind = "TEST_TIMEOUT" if "Test timeout of" in message else \
        "STRICT_LOCATOR" if "strict mode violation" in message else \
        "ASSERTION" if "expect(" in message else \
        "CLOSED_CONTEXT" if "has been closed" in message else \
        "OPERATION_TIMEOUT" if "Timeout" in message or "timed out" in message else "OTHER"
    print("UXR28_DIAG FAILURE_KIND=" + kind, flush=True)
def walk(suites):
    for suite in suites:
        for spec in suite.get("specs", []):
            for test in spec.get("tests", []):
                for result in test.get("results", []):
                    for entry in result.get("stdout", []):
                        value = entry if isinstance(entry, str) else entry.get("text", "")
                        for line in value.splitlines():
                            if line.startswith("UXR28_STAGE=") and line[12:] in required:
                                observed.append(line[12:])
                                print("UXR28_DIAG STAGE=" + line[12:], flush=True)
                    for error in result.get("errors", []):
                        location(error)
        walk(suite.get("suites", []))
walk(report.get("suites", []))
errors = report.get("errors", [])
for error in errors:
    location(error)
print(f"UXR28_DIAG REPORT_ERRORS={len(errors)}", flush=True)
if exit_code or errors or counts != {"expected":1,"unexpected":0,"flaky":0,"skipped":0} or observed != required:
    raise SystemExit("UXR28 browser qualification did not satisfy the exact phase gate")
print("UXR28_DIAG PASSED", flush=True)
PY
