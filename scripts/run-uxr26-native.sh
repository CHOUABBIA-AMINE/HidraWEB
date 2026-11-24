#!/usr/bin/env bash
set -euo pipefail
umask 077

# A CI-owned child process runs Chromium while the pinned test owns its JVM and
# fresh PostgreSQL. Never opt in to the API's deliberately local-only replay.
if [[ "$#" -eq 1 && "$1" == "--browser" ]]; then
  : "$HIDRA_UXR26_FIXTURE_JSON"
  : "$HIDRA_UXR26_API_URL"
  [[ "$HIDRA_UXR26_API_URL" =~ ^http://127\.0\.0\.1:[0-9]+$ ]]
  private=$(mktemp -d)
  trap 'rm -rf "$private"' EXIT
  export PLAYWRIGHT_JSON_OUTPUT_NAME="$private/results.json"
  # The raw JSON and diagnostics can include synthetic authentication material.
  # Keep them private; emit only counts and failing source locations.
  result=0
  npx --no-install playwright test --config playwright.uxr26.config.ts --reporter=json \
    >"$private/browser.log" 2>&1 || result=$?
  python3 - "$PLAYWRIGHT_JSON_OUTPUT_NAME" "$result" <<'PY'
import json
import sys
from pathlib import Path

path, exit_code = Path(sys.argv[1]), int(sys.argv[2])
if not path.is_file():
    print("UXR26_DIAG REPORT_MISSING", flush=True)
    raise SystemExit("UXR26 Chromium did not produce its private result report")
report = json.loads(path.read_text())
stats = report["stats"]
counts = {name: stats[name] for name in ("expected", "unexpected", "flaky", "skipped")}
if any(type(value) is not int or value < 0 for value in counts.values()):
    raise SystemExit("Invalid private Chromium result counts")
print("UXR26_DIAG COUNTS " + " ".join(f"{key.upper()}={value}" for key, value in counts.items()), flush=True)
print(f"UXR26_DIAG EXIT={exit_code}", flush=True)

# Do not echo raw Playwright errors, locators, HTTP bodies, or worker output.
# Emit only fixed stage identifiers and native-spec line numbers.
stages = {
    "AUTHOR_LOGIN", "AUTHOR_SCOPE", "AUTHOR_STREAM", "AUTHOR_SUBMIT",
    "REVIEW_1_ASSIGN", "REVIEW_1_LOGIN", "REVIEW_1_DECISION",
    "REVIEW_2_ASSIGN", "REVIEW_2_LOGIN", "REVIEW_2_DECISION",
    "PUBLISHER_LOGIN", "PUBLISHER_SCOPE", "PUBLISHER_PUBLISH",
    "READBACK_LOGIN", "READBACK_SCOPE", "READBACK_LIMIT",
    "AUDIT_READBACK", "STALE_CONFLICT", "MASKED_DENIAL", "COMPLETE",
}

def failure_location(error):
    location = error.get("location") or {}
    line = location.get("line")
    if Path(location.get("file", "")).name == "uxr26-native.spec.ts" and type(line) is int and line > 0:
        print(f"UXR26_DIAG FAILURE_LINE={line}", flush=True)

def diagnostics(suites):
    for suite in suites:
        for spec in suite.get("specs", []):
            for test in spec.get("tests", []):
                for result in test.get("results", []):
                    for entry in result.get("stdout", []):
                        value = entry if isinstance(entry, str) else entry.get("text", "")
                        for line in value.splitlines():
                            if line.startswith("UXR26_STAGE=") and line[12:] in stages:
                                print("UXR26_DIAG STAGE=" + line[12:], flush=True)
                    if result.get("status") != "passed":
                        for error in result.get("errors", []):
                            failure_location(error)
                        if isinstance(result.get("error"), dict):
                            failure_location(result["error"])
        diagnostics(suite.get("suites", []))

diagnostics(report.get("suites", []))
for error in report.get("errors", []):
    failure_location(error)
print(f"UXR26_DIAG REPORT_ERRORS={len(report.get('errors', []))}", flush=True)
if exit_code != 0 or counts != dict(expected=1, unexpected=0, flaky=0, skipped=0) or report.get("errors"):
    raise SystemExit("UXR26 Chromium qualification did not pass exactly once without retries or skips")
print("UXR26_DIAG PASSED", flush=True)
PY
  exit 0
fi

if [[ "$#" -ne 1 ]]; then
  echo 'Pass the local HidraAPI checkout.' >&2
  exit 2
fi
if [[ -v HIDRA_CIRCLE1_REPLAY_DIR && -n "$HIDRA_CIRCLE1_REPLAY_DIR" ]]; then
  echo 'The native qualification must not opt in to the local-only API replay.' >&2
  exit 2
fi
api_sha=4dcb9e092a715d9942a2b19ad86b3dea9f6bd96f
web_root=$(cd "$(dirname "$0")/.." && pwd)
api_repo=$(cd "$1" && pwd)
command -v java >/dev/null
command -v docker >/dev/null || { echo 'Docker is required for the disposable PostgreSQL fixture.' >&2; exit 1; }
docker info >/dev/null
git -C "$api_repo" cat-file -e "$api_sha^{commit}"

replay=$(mktemp -d)
chmod 700 "$replay"
worktree="$replay/api"
cleanup() {
  if [[ -d "$worktree" ]]; then git -C "$api_repo" worktree remove --force "$worktree"; fi
  rm -rf "$replay"
}
trap cleanup EXIT
git -C "$api_repo" worktree add --detach "$worktree" "$api_sha"
test "$(git -C "$worktree" rev-parse HEAD)" = "$api_sha"

# Add only a consumer-side test callback in the disposable checkout. Preserve the
# existing local-only replay method, its CI guard, and every original assertion.
python3 - "$worktree" <<'PY'
from pathlib import Path
import sys

root = Path(sys.argv[1]) / "src/test/java/dz/sh/hidra/qualification"
test = root / "Gz2SignedWorkflowNativeHttpPostgresIntegrationTest.java"
fixture = root / "Gz2SignedWorkflowFixture.java"

def insert_once(path, anchor, insertion):
    original = path.read_text()
    if original.count(anchor) != 1:
        raise SystemExit(f"Unexpected pinned fixture anchor in {path.name}")
    path.write_text(original.replace(anchor, insertion))

test_anchor = "                if (replayDirectory != null) fixture.holdCircleReplay(replayDirectory, restarted, receipt);"
insert_once(test, test_anchor, test_anchor + """
                fixture.global(fixture.author, "identity:me:read", "topology:regional-map:read",
                        "topology:regional-map:search", "organization:responsibilities:read");
                fixture.global(fixture.reader, "organization:responsibilities:read");
                fixture.global(fixture.reviewer, "identity:me:read", "workflow:instances:read");
                fixture.runUxr26Browser(restarted, receipt);
""".rstrip())

fixture_anchor = "    void holdCircleReplay(Path directory, Runtime runtime, Map<String, Object> receipt) throws Exception {"
method = """
    // Consumer qualification only: the browser is a bounded child of this test.
    // No local replay opt-in, credential file, listener exposure, or artifact export.
    void runUxr26Browser(Runtime runtime, Map<String, Object> receipt) throws Exception {
        var root = Path.of(System.getenv("HIDRA_UXR26_WEB_ROOT"));
        assertTrue(root.isAbsolute() && Files.isRegularFile(root.resolve("scripts/run-uxr26-native.sh")));
        assertTrue(runtime.child.isAlive());
        var scopeId = sql.queryForObject(
                "SELECT id FROM hidra_org_operational_scope WHERE scope_type='PIPELINE_SYSTEM' AND target_id=?",
                Long.class, pipeline);
        assertNotNull(scopeId);
        var builder = new ProcessBuilder("bash", "scripts/run-uxr26-native.sh", "--browser")
                .directory(root.toFile());
        builder.environment().put("HIDRA_UXR26_API_URL", runtime.base);
        builder.environment().put("HIDRA_UXR26_FIXTURE_JSON", JSON.writeValueAsString(Map.of(
                "baseUrl", runtime.base, "password", HUMAN_PASSWORD, "receipt", receipt,
                "scopeRegistryId", scopeId.toString())));
        // Never inherit Surefire's fork communication streams. Retain the
        // private child output only until its fixed diagnostic records are copied
        // through the JVM's captured System.out.
        var log = Files.createTempFile("uxr26-browser-", ".log",
                java.nio.file.attribute.PosixFilePermissions.asFileAttribute(
                        java.nio.file.attribute.PosixFilePermissions.fromString("rw-------")));
        try {
            builder.redirectErrorStream(true).redirectOutput(log.toFile());
            var browser = builder.start();
            try {
                assertTrue(browser.waitFor(5, java.util.concurrent.TimeUnit.MINUTES),
                        "UXR26 Chromium exceeded the bounded child lifetime");
                assertEquals(0, browser.exitValue(), "UXR26 Chromium qualification failed");
                assertTrue(runtime.child.isAlive(), "The signed API must remain alive throughout Chromium");
            } finally {
                browser.descendants().forEach(ProcessHandle::destroyForcibly);
                if (browser.isAlive()) {
                    browser.destroyForcibly();
                    browser.waitFor();
                }
            }
        } finally {
            try {
                for (String line : Files.readAllLines(log)) {
                    if (line.matches("UXR26_DIAG (COUNTS EXPECTED=[0-9]+ UNEXPECTED=[0-9]+ FLAKY=[0-9]+ SKIPPED=[0-9]+|EXIT=[0-9]+|STAGE=[A-Z_0-9]+|FAILURE_LINE=[0-9]+|REPORT_ERRORS=[0-9]+|REPORT_MISSING|PASSED)")) {
                        System.out.println(line);
                    }
                }
            } finally {
                Files.deleteIfExists(log);
            }
        }
    }

"""
original = fixture.read_text()
guard = 'throw new IllegalStateException("Circle 1 replay is local-only");'
if original.count(guard) != 1:
    raise SystemExit("The pinned local-only security guard was not found")
insert_once(fixture, fixture_anchor, method + fixture_anchor)
if fixture.read_text().count(guard) != 1:
    raise SystemExit("Local-only security guard must remain intact")
PY

# Confirm the accepted production source, migrations and contract files are intact.
expected=$(printf '%s\n' \
  src/test/java/dz/sh/hidra/qualification/Gz2SignedWorkflowFixture.java \
  src/test/java/dz/sh/hidra/qualification/Gz2SignedWorkflowNativeHttpPostgresIntegrationTest.java)
test "$(git -C "$worktree" diff --name-only)" = "$expected"
git -C "$worktree" diff --check
(
  cd "$worktree"
  export HIDRA_UXR26_WEB_ROOT="$web_root"
  bash ./mvnw -B -q test -Dtest=Gz2SignedWorkflowNativeHttpPostgresIntegrationTest -DfailIfNoTests=true
)
python3 - "$worktree" <<'PY'
from pathlib import Path
from xml.etree import ElementTree as ET
import sys
report = Path(sys.argv[1]) / "target/surefire-reports/TEST-dz.sh.hidra.qualification.Gz2SignedWorkflowNativeHttpPostgresIntegrationTest.xml"
root = ET.parse(report).getroot()
expected = {"tests": "1", "failures": "0", "errors": "0", "skipped": "0"}
if any(root.get(k) != v for k, v in expected.items()):
    raise SystemExit("UXR26 backend fixture report did not pass exactly once")
print("UXR26_BACKEND=PASSED tests=1 failures=0 errors=0 skipped=0")
PY
