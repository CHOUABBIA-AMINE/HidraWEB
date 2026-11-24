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
    '            launcher.command().add("--hidra.platform.workbench.exposure=integrity/inspection-findings=id,findingNumber,severity,topologyAssetTypeCode,topologyAssetId,observedAt");\n' + anchor)

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

    void runUxr28Browser(Runtime runtime, String phase, Map<String, Object> receipt, String emptyPoint,
                         Map<String, String> integrity, Map<String, Object> expectedLimit, Runnable revoke) throws Exception {
        assertTrue(List.of("regional", "before-restart", "after-restart").contains(phase));
        assertTrue(runtime.child.isAlive());
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
                    "expectedLimit", expectedLimit)));
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
                    if (line.matches("UXR28_DIAG (PHASE=(regional|before-restart|after-restart)|COUNTS EXPECTED=[0-9]+ UNEXPECTED=[0-9]+ FLAKY=[0-9]+ SKIPPED=[0-9]+|EXIT=[0-9]+|STAGE=(REGIONAL_PRIMARY|REGIONAL_SIBLING|REGIONAL_FOREIGN|REVOKE_BEFORE|REVOKE_AFTER|DOSSIER|LIMITS|TELEMETRY|INTEGRITY|RELOAD|SESSION|RTL|COMPLETE)|CHECKPOINT=(STATION_DISCOVERY|STATION_SELECT|POINT_DISCOVERY|POINT_SELECT|FRESH|STALE|HISTORY|EMPTY_POINT|UNAVAILABLE|INTEGRITY_RESOURCE|INTEGRITY_DETAIL|INTEGRITY_RECEIPT)|FAILURE_KIND=(TEST_TIMEOUT|STRICT_LOCATOR|ASSERTION|CLOSED_CONTEXT|OPERATION_TIMEOUT|OTHER)|FAILURE_LINE=[0-9]+|REPORT_ERRORS=[0-9]+|REPORT_MISSING|PASSED)"))
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
