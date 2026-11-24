#!/usr/bin/env bash
set -euo pipefail

# Use the accepted API implementation, with browser-only grants inside its test fixture.
api_sha=4dcb9e092a715d9942a2b19ad86b3dea9f6bd96f
api_repo=${1:?Pass the local HidraAPI checkout.}
web_root=$(cd "$(dirname "$0")/.." && pwd)
api_repo=$(cd "$api_repo" && pwd)
command -v java >/dev/null
command -v docker >/dev/null || { echo 'Docker is required for the disposable PostgreSQL fixture.' >&2; exit 1; }
docker info > /dev/null
git -C "$api_repo" cat-file -e "$api_sha^{commit}"

replay=$(mktemp -d)
chmod 700 "$replay"
worktree="$replay/api"
fixture="$replay/circle1-local.json"
pid=''
cleanup() {
  if [[ -f "$fixture" ]]; then rm -f "$fixture"; fi
  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
  fi
  if [[ -d "$worktree" ]]; then git -C "$api_repo" worktree remove --force "$worktree"; fi
  rm -rf "$replay"
}
trap cleanup EXIT
git -C "$api_repo" worktree add --detach "$worktree" "$api_sha"
python3 - "$worktree" <<'PY'
from pathlib import Path
import sys
fixture = Path(sys.argv[1]) / "src/test/java/dz/sh/hidra/qualification/Gz2SignedWorkflowNativeHttpPostgresIntegrationTest.java"
source = fixture.read_text()
anchor = "                if (replayDirectory != null) fixture.holdCircleReplay(replayDirectory, restarted, receipt);"
assert source.count(anchor) == 1
fixture.write_text(source.replace(anchor, """                if (replayDirectory != null) {
                    fixture.global(fixture.author, "identity:me:read", "topology:regional-map:read",
                            "topology:regional-map:search", "organization:responsibilities:read");
                    fixture.global(fixture.reader, "organization:responsibilities:read");
                    fixture.global(fixture.reviewer, "identity:me:read", "workflow:instances:read");
                    fixture.holdCircleReplay(replayDirectory, restarted, receipt);
                }"""))
PY

(
  cd "$worktree"
  export HIDRA_CIRCLE1_REPLAY_DIR="$replay"
  exec bash ./mvnw -B -q test -Dtest=Gz2SignedWorkflowNativeHttpPostgresIntegrationTest
) &
pid=$!
while ! python3 -c 'import json,sys; json.load(open(sys.argv[1]))' "$fixture" 2>/dev/null; do
  if ! kill -0 "$pid" 2>/dev/null; then wait "$pid"; exit 1; fi
  sleep 1
done

export HIDRA_UXR26_FIXTURE="$fixture"
HIDRA_UXR26_API_URL=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["baseUrl"])' "$fixture")
export HIDRA_UXR26_API_URL
cd "$web_root"
npx --no-install playwright test --config playwright.uxr26.config.ts
rm -f "$fixture"
wait "$pid"
pid=''
