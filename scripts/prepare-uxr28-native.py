#!/usr/bin/env python3
"""Extend the private T61 test fixture, never the API repository or runtime source."""
from pathlib import Path
import sys

root = Path(sys.argv[1]) / "src/test/java/dz/sh/hidra/qualification"
test = root / "Gz2SignedWorkflowNativeHttpPostgresIntegrationTest.java"
fixture = root / "Gz2SignedWorkflowFixture.java"
t18 = root / "Gz2IntegrityMaintenanceHandoffNativeHttpPostgresIntegrationTest.java"

def replace_once(source, old, new):
    if source.count(old) != 1:
        raise SystemExit("Unexpected exact T61 fixture anchor: " + old.splitlines()[0])
    return source.replace(old, new)

source = test.read_text()
original = fixture.read_text()
guard = 'throw new IllegalStateException("Circle 1 replay is local-only");'
if original.count(guard) != 1:
    raise SystemExit("Missing local-only replay guard")

# The backend's exact existing revocation statement is retained and executed
# only after the signed browser has demonstrated visibility with its own bearer.
begin = '        r.get(feature, revokedToken);\n'
end = '        assertEquals(0, r.get(query(CIRCLE_PIPELINES, "companyPartyId", company), revokedToken)'
if source.count(begin) != 1 or source.count(end) != 1:
    raise SystemExit("Unexpected revocation anchors")
start = source.index(begin) + len(begin)
finish = source.index(end, start)
revocation = source[start:finish]
if 'UPDATE hidra_identity_user_permission_grant' not in revocation or \
        'fixture.revokedReader(), f.pipeline' not in revocation:
    raise SystemExit("Unexpected native revocation statement")
source = source[:start] + '''
        f.runUxr28Regional(r, fixture, pipeline, section, facility, () -> {
''' + revocation + '''        });
''' + source[finish:]

source = replace_once(source, "            long firstPid;\n", """            long firstPid;
            Map<String, String> circleIntegrity;
            String circleEmptyPoint;
            Map<String, Object> circleExpectedLimit;
""")
before = '                System.out.printf("GZ2 phase=committed pid=%d baseline=%s successor=%s target=%s trusted=%s evaluation=%s incident=%s%n",'
source = replace_once(source, before, '''
                // Original T37/T38 assertions have already run. Commission a
                // synthetic point with a valid binding and no observations.
                var emptyPoint = commission(fixture, runtime, runtime.login(fixture.producer),
                        start, id(), "GZ2-UXR28-EMPTY");
                circleEmptyPoint = field(emptyPoint, "pointId");
                fixture.permit(fixture.reader, "telemetry:trusted-reading:read", "TRUSTED_READING",
                        "CUSTOM", "telemetry-source-point:" + field(emptyPoint, "sourceId") + ":" + circleEmptyPoint);
                circleIntegrity = fixture.seedUxr28Integrity(runtime);
                String browserReader = runtime.login(fixture.reader);
                var stationFeatures = runtime.get(query(CIRCLE_MAP + "/layers/facilities/features",
                        "companyPartyId", fixture.company, "page", "0", "size", "20"), browserReader).path("features");
                assertTrue(stationFeatures.isArray(), "UXR28 regional station discovery must return features");
                int stationMatches = 0;
                for (var station : stationFeatures) {
                    if (("facilities:" + circleSelection.facilityId()).equals(field(station, "id"))
                            && "facilities".equals(field(station.path("properties"), "layer"))
                            && circleSelection.facilityId().equals(field(station.path("properties"), "entityId"))) {
                        stationMatches++;
                    }
                }
                assertEquals(1, stationMatches, "UXR28 synthetic station must be discoverable under its signed scope");
                var priorLimit = runtime.get(circleConstraint, browserReader);
                assertEquals("QUALIFIED", field(priorLimit, "status"));
                assertEquals("UNAVAILABLE", field(runtime.get(circleSectionLimit, browserReader), "status"));
                circleExpectedLimit = Map.of("upperPressure", priorLimit.path("upperPressure").decimalValue(),
                        "revisionId", field(priorLimit, "revisionId"),
                        "sourceBaselineReceiptId", field(priorLimit, "sourceBaselineReceiptId"));
                var beforeReceipt = circleReceipt(fixture, circle, circleSelection, t37.circleObservation(), t38,
                        circleConstraint, circleSectionLimit, field(baselines.original(), "receiptId"),
                        field(baselines.successor(), "receiptId"));
                fixture.runUxr28Browser(runtime, "before-restart", beforeReceipt, circleEmptyPoint,
                        circleIntegrity, circleExpectedLimit, null);
''' + before)
after = '                if (replayDirectory != null) fixture.holdCircleReplay(replayDirectory, restarted, receipt);'
source = replace_once(source, after, after + '''
                fixture.runUxr28Browser(restarted, "after-restart", receipt, circleEmptyPoint,
                        circleIntegrity, circleExpectedLimit, null);
'''.rstrip())
# Retain the exact two T37 evidence identities in the private receipt.
source = replace_once(source,
    '                "trustedId", original.trusted(), "sourceId", field(primary, "sourceId"));',
    '                "trustedId", original.trusted(), "sourceId", field(primary, "sourceId"),\n'
    '                "staleTrustedId", stale.trusted());')

# The original UXR26 callback needs the same metadata grants. Primary already
# received its exact grant in the regional browser callback; don't duplicate it.
source = replace_once(source, "java.util.List.of(fixture.author, fixture.reviewer, fixture.reader)",
                      "java.util.List.of(fixture.author, fixture.reviewer)")

# The regional map intentionally excludes non-geocoded facilities. Give only
# the primary disposable Circle 1 station a synthetic point on its seeded section.
# Do not change owner relationships, regional authorization, or the API source.
anchor = '        CircleRegion primary = seedCircleSection(primaryPipeline, "PRIMARY", 1);'
original = replace_once(original, anchor, anchor + '''
        assertEquals(1, sql.update("""
                UPDATE hidra_topology_facility SET longitude=1.5, latitude=35
                WHERE id=? AND longitude IS NULL AND latitude IS NULL
                """, asset));
'''.rstrip())

# The generic Workbench is fail-closed by default. Restrict this test-only
# exposure to a single synthetic Integrity resource; it is NOT a deployment
# approval, and no C1 regional actor receives a generic Workbench grant.
anchor = '            launcher.environment().put("SPRING_DATASOURCE_PASSWORD", APP_PASSWORD);'
original = replace_once(original, anchor,
    '            launcher.command().add("--hidra.platform.workbench.exposure=integrity/inspection-findings=id,findingNumber,severity,topologyAssetTypeCode,topologyAssetId,observedAt");\n'
    # Both disposable JVMs must exercise the registered LOCAL rotation contract.
    # The production default remains disabled; no API repository change.
    '            launcher.command().add("--hidra.identity.refresh.enabled=true");\n' + anchor)

# Reuse the accepted T18 fixture code at the exact T61 pin rather than invent
# persistence rows or a Pipeline-to-Integrity association.
t18_source = t18.read_text()
t18_start = "    private static void grant(Gz2SignedWorkflowFixture f,String actor,String permission,String equipment) {"
if t18_source.count(t18_start) != 1:
    raise SystemExit("Missing T18 fixture helper")
helpers = t18_source[t18_source.index(t18_start):t18_source.rindex("\n}")]
helpers = replace_once(helpers, "private static void grant(", "private static void uxr28IntegrityGrant(")
helpers = replace_once(helpers, "private static void seed(", "private static void uxr28IntegritySeed(")
method = r'''
    Map<String, String> seedUxr28Integrity(Runtime runtime) throws Exception {
        String actor = human("Circle 1 independent Integrity reader");
        String equipment = id(), maintainableAsset = id(), run = id(), finding = id();
        String defect = id(), integrityCase = id(), recommendation = id();
        uxr28IntegritySeed(this, equipment, maintainableAsset, run, finding, defect, integrityCase, recommendation);
        uxr28IntegrityGrant(this, author, "integrity:maintenance:approve", equipment);
        uxr28IntegrityGrant(this, actor, "integrity:maintenance:read", equipment);
        // Actual route codes from HidraRoutePermissionNaming, not mocked labels.
        global(actor, "identity:me:read", "security:permissions:read",
                "dynamic-module:resources:read", "dynamic-module:dynamic-resource:read", "integrity:findings:read");
        var approval = runtime.json("POST", "/api/v1/integrity/findings/" + finding + "/maintenance-approvals",
                runtime.login(author), Map.of("commandId", id(), "recommendationId", recommendation,
                        "caseId", integrityCase, "reason", "Synthetic Circle 1 independent owner evidence"), 200);
        String approvalId = approval.path("approvalId").asText();
        assertFalse(approvalId.isBlank());
        assertEquals(200, runtime.send("GET", "/api/v1/integrity/findings/" + finding + "/maintenance-handoffs/" + approvalId,
                runtime.login(actor), null).statusCode());
        return Map.of("actor", actor, "findingId", finding, "approvalId", approvalId,
                "equipmentId", equipment, "recommendationId", recommendation);
    }

    void runUxr28Regional(Runtime runtime, CircleFixture circle, String pipe, String section, String facility,
                         Runnable revoke) throws Exception {
        for (String actor : List.of(reader, circle.siblingReader(), foreign, circle.revokedReader()))
            global(actor, "security:permissions:read");
        String siblingSystem = sql.queryForObject("SELECT pipeline_system_id FROM hidra_topology_pipeline WHERE id=?",
                String.class, circle.sibling().pipelineId());
        String foreignSystem = sql.queryForObject("SELECT pipeline_system_id FROM hidra_topology_pipeline WHERE id=?",
                String.class, circle.foreignRegion().pipelineId());
        assertNotNull(siblingSystem);
        assertNotNull(foreignSystem);
        var regionalReceipt = Map.<String, Object>of("roles", Map.of("primary", reader, "sibling", circle.siblingReader(),
                    "foreign", foreign, "revoked", circle.revokedReader()),
                "scope", Map.of("companyPartyId", company, "foreignCompanyPartyId", foreignCompany,
                        "pipelineId", pipe, "sectionId", section, "facilityId", facility,
                        "siblingPipelineId", circle.sibling().pipelineId(), "foreignPipelineId", circle.foreignRegion().pipelineId()),
                "systems", Map.of("primary", pipeline, "sibling", siblingSystem, "foreign", foreignSystem));
        runUxr28Browser(runtime, "regional", regionalReceipt, "", Map.of(), Map.of(), revoke);
    }


    // The browser's native minute-granularity input must never submit an
    // upper bound later than the API's current instant. Derive a fixed
    // half-open interval from the original T37 observation, not the wall-clock
    // time at which the receipt was assembled. Reuse it on both JVMs.
    Map<String, String> uxr28Preflight(Runtime runtime, String phase, Map<String, Object> receipt,
            String emptyPoint, Map<String, String> integrity) throws Exception {
        var observation = (Map<?, ?>) receipt.get("observation");
        var scope = (Map<?, ?>) receipt.get("scope");
        String facility = (String) scope.get("facilityId");
        String point = (String) observation.get("pointId");
        String latestId = (String) observation.get("trustedId");
        String staleId = (String) observation.get("staleTrustedId");
        String binding = (String) observation.get("bindingId");
        assertNotNull(staleId, "UXR28 T37 second trusted identity required");
        assertNotEquals(latestId, staleId);
        String originalFrom = java.util.Arrays.stream(URI.create((String) observation.get("history")).getQuery().split("&"))
                .filter(value -> value.startsWith("from=")).map(value -> value.substring(5)).findFirst().orElseThrow();
        Instant from = Instant.parse(originalFrom).truncatedTo(java.time.temporal.ChronoUnit.MINUTES);
        Instant observedAt = Instant.parse((String) observation.get("observedAt"));
        Instant until = observedAt.truncatedTo(java.time.temporal.ChronoUnit.MINUTES).plusSeconds(60);
        assertTrue(from.isBefore(observedAt) && observedAt.isBefore(until));
        // At most the remaining portion of the observation's minute, normally
        // already elapsed by the time the existing T37/T38 checks finish.
        long remaining = Duration.between(Instant.now(), until).toMillis();
        assertTrue(remaining < 60_000, "UXR28 observation minute must be bounded");
        if (remaining >= 0) Thread.sleep(remaining + 2);
        assertFalse(until.isAfter(Instant.now()), "UXR28 upper bound must be historical");
        String root = "/api/v1/telemetry/assets/FACILITY/" + facility + "/points";
        String bearer = runtime.login(reader);
        String historyPath = root + "/" + point + "/trusted-readings/history?companyPartyId=" + company
                + "&from=" + from + "&until=" + until + "&maxAgeSeconds=1&limit=20";
        var history = uxr28Read(runtime, historyPath, bearer, "HISTORY");
        var rows = history.path("observations");
        assertEquals(2, rows.size(), "UXR28 exact T37 history count");
        assertTrue(latestId.equals(rows.get(0).path("trustedId").asText())
                && staleId.equals(rows.get(1).path("trustedId").asText())
                && binding.equals(rows.get(0).path("binding").path("id").asText())
                && binding.equals(rows.get(1).path("binding").path("id").asText()), "UXR28 exact T37 history lineage");
        var empty = uxr28Read(runtime, root + "/" + emptyPoint + "/trusted-readings/latest?companyPartyId="
                + company + "&maxAgeSeconds=3600", bearer, "EMPTY_POINT");
        assertEquals("UNAVAILABLE", empty.path("status").asText());
        assertFalse(empty.hasNonNull("observation"));

        String inspector = runtime.login(integrity.get("actor"));
        String resource = "/api/v1/workbench/integrity/inspection-findings";
        var resources = uxr28Read(runtime, "/api/v1/workbench/integrity/resources", inspector, "INTEGRITY_RESOURCE");
        assertEquals(1, resources.size(), "UXR28 only the approved test Workbench resource");
        assertTrue("inspection-findings".equals(resources.get(0).path("resource").asText())
                && resources.get(0).path("javaType").asText().endsWith("InspectionFindingJpaEntity"));
        var list = uxr28Read(runtime, resource + "?page=0&size=25", inspector, "INTEGRITY_LIST").path("items");
        assertTrue(java.util.stream.StreamSupport.stream(list.spliterator(), false)
                .anyMatch(row -> integrity.get("findingId").equals(row.path("id").asText())), "UXR28 seeded finding in first page");
        var detail = uxr28Read(runtime, resource + "/" + integrity.get("findingId"), inspector, "INTEGRITY_DETAIL");
        assertTrue(integrity.get("findingId").equals(detail.path("id").asText())
                && integrity.get("equipmentId").equals(detail.path("attributes").path("topologyAssetId").asText()));
        var handoff = uxr28Read(runtime, "/api/v1/integrity/findings/" + integrity.get("findingId")
                + "/maintenance-handoffs/" + integrity.get("approvalId"), inspector, "INTEGRITY_RECEIPT");
        assertTrue(integrity.get("approvalId").equals(handoff.path("approvalId").asText())
                && integrity.get("recommendationId").equals(handoff.path("recommendationId").asText()));
        assertEquals(403, runtime.send("GET", root + "?companyPartyId=" + company, inspector, null).statusCode(),
                "UXR28 inspector must not acquire Telemetry route access");

        // Independent disposable session; no browser token is consumed here.
        // Prove both runtime configurations issue and rotate actual LOCAL proof.
        String identity = "/api/v1/identity";
        var login = runtime.send("POST", identity + "/authentication/login", null,
                Map.of("providerType", "LOCAL", "principal", reader, "credentials", HUMAN_PASSWORD));
        assertEquals(200, login.statusCode(), "UXR28 preflight LOCAL login");
        var initial = JSON.readTree(login.body());
        String oldAccess = initial.path("accessToken").asText();
        String oldProof = initial.path("refreshToken").asText();
        assertTrue(!oldAccess.isBlank() && oldProof.length() == 80 && initial.hasNonNull("refreshExpiresAt"),
                "UXR28 fixture must enable renewable LOCAL sessions");
        var rotation = runtime.send("POST", identity + "/authentication/refresh", null, Map.of("refreshToken", oldProof));
        assertEquals(200, rotation.statusCode(), "UXR28 preflight LOCAL rotation");
        var renewed = JSON.readTree(rotation.body());
        String newAccess = renewed.path("accessToken").asText();
        String newProof = renewed.path("refreshToken").asText();
        assertTrue(!newAccess.isBlank() && !newAccess.equals(oldAccess)
                && newProof.length() == 80 && !newProof.equals(oldProof));
        assertTrue(List.of(401, 403).contains(runtime.send("GET", identity + "/me", oldAccess, null).statusCode()),
                "UXR28 preflight old bearer denial");
        assertEquals(200, runtime.send("GET", identity + "/me", newAccess, null).statusCode());
        assertEquals(204, runtime.send("POST", identity + "/authentication/logout", null,
                Map.of("refreshToken", newProof)).statusCode());
        assertTrue(List.of(401, 403).contains(runtime.send("GET", identity + "/me", newAccess, null).statusCode()),
                "UXR28 preflight logged-out bearer denial");
        System.out.println("UXR28_PREFLIGHT " + phase + " HISTORY_EMPTY_INTEGRITY_SESSION=PASSED");
        return Map.of("from", from.toString(), "until", until.toString());
    }

    private JsonNode uxr28Read(Runtime runtime, String path, String bearer, String operation) throws Exception {
        var response = runtime.send("GET", path, bearer, null);
        assertEquals(200, response.statusCode(), "UXR28 preflight " + operation);
        return JSON.readTree(response.body());
    }

    void runUxr28Browser(Runtime runtime, String phase, Map<String, Object> receipt, String emptyPoint,
                         Map<String, String> integrity, Map<String, Object> expectedLimit, Runnable revoke) throws Exception {
        assertTrue(List.of("regional", "before-restart", "after-restart").contains(phase));
        assertTrue(runtime.child.isAlive());
        Map<String, String> historyWindow = "regional".equals(phase) ? Map.of()
                : uxr28Preflight(runtime, phase, receipt, emptyPoint, integrity);
        var root = Path.of(System.getenv("HIDRA_UXR26_WEB_ROOT"));
        assertTrue(root.isAbsolute() && Files.isRegularFile(root.resolve("scripts/run-uxr28-browser.sh")));
        var privateDir = Files.createTempDirectory("uxr28-browser-",
                java.nio.file.attribute.PosixFilePermissions.asFileAttribute(
                        java.nio.file.attribute.PosixFilePermissions.fromString("rwx------")));
        var log = privateDir.resolve("child.log");
        try {
            var builder = new ProcessBuilder("bash", "scripts/run-uxr28-browser.sh")
                    .directory(root.toFile()).redirectErrorStream(true).redirectOutput(log.toFile());
            builder.environment().put("HIDRA_UXR26_API_URL", runtime.base);
            builder.environment().put("HIDRA_UXR28_PHASE", phase);
            builder.environment().put("HIDRA_UXR28_PRIVATE_DIR", privateDir.toString());
            builder.environment().put("HIDRA_UXR28_FIXTURE_JSON", JSON.writeValueAsString(Map.of(
                    "baseUrl", runtime.base, "password", HUMAN_PASSWORD, "receipt", receipt,
                    "primarySystemId", pipeline, "emptyPointId", emptyPoint, "integrity", integrity,
                    "expectedLimit", expectedLimit, "historyWindow", historyWindow)));
            var browser = builder.start();
            try {
                if (revoke != null) {
                    long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(240);
                    while (browser.isAlive() && !Files.isRegularFile(privateDir.resolve("ready"))
                            && System.nanoTime() < deadline) Thread.sleep(100);
                    assertTrue(browser.isAlive() && Files.isRegularFile(privateDir.resolve("ready")),
                            "UXR28 same-session revocation browser did not reach its authorized witness");
                    revoke.run();
                    Files.createFile(privateDir.resolve("released"));
                }
                assertTrue(browser.waitFor(12, TimeUnit.MINUTES), "UXR28 native browser exceeded its phase bound");
                assertEquals(0, browser.exitValue(), "UXR28 native browser phase failed: " + phase);
                assertTrue(runtime.child.isAlive(), "Native API must remain alive during UXR28");
            } finally {
                browser.descendants().forEach(ProcessHandle::destroyForcibly);
                if (browser.isAlive()) {
                    browser.destroyForcibly();
                    browser.waitFor();
                }
            }
        } finally {
            try {
                if (Files.isRegularFile(log)) for (String line : Files.readAllLines(log)) {
                    if (line.matches("UXR28_DIAG (PHASE=(regional|before-restart|after-restart)|COUNTS EXPECTED=[0-9]+ UNEXPECTED=[0-9]+ FLAKY=[0-9]+ SKIPPED=[0-9]+|EXIT=[0-9]+|STAGE=(REGIONAL_PRIMARY|REGIONAL_SIBLING|REGIONAL_FOREIGN|REVOKE_BEFORE|REVOKE_AFTER|DOSSIER|LIMITS|TELEMETRY|INTEGRITY|RELOAD|SESSION|RTL|COMPLETE)|CHECKPOINT=(STATION_DISCOVERY|STATION_SELECT|POINT_DISCOVERY|POINT_SELECT|FRESH|STALE|HISTORY|EMPTY_POINT|UNAVAILABLE|INTEGRITY_RESOURCE|INTEGRITY_DETAIL|INTEGRITY_RECEIPT|HISTORY_HTTP|HISTORY_RENDER|RELOAD_LOGIN|RELOAD_SCOPE|RTL_AR|RTL_EN|SESSION_ROTATE|SESSION_LOGOUT)|HTTP_STATUS=[1-5][0-9]{2}|FAILURE_KIND=(TEST_TIMEOUT|STRICT_LOCATOR|ASSERTION|CLOSED_CONTEXT|OPERATION_TIMEOUT|OTHER)|FAILURE_LINE=[0-9]+|REPORT_ERRORS=[0-9]+|REPORT_MISSING|PASSED)"))
                        System.out.println(line);
                }
            } finally {
                try (var files = Files.walk(privateDir)) {
                    for (Path path : files.sorted(java.util.Comparator.reverseOrder()).toList()) Files.deleteIfExists(path);
                }
                Files.deleteIfExists(privateDir);
            }
        }
    }

'''
anchor = "    void holdCircleReplay(Path directory, Runtime runtime, Map<String, Object> receipt) throws Exception {"
original = replace_once(original, anchor, helpers + "\n\n" + method + anchor)
if original.count(guard) != 1:
    raise SystemExit("Local-only guard changed")
fixture.write_text(original)
test.write_text(source)
