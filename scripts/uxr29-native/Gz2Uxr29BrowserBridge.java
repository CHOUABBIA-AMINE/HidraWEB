package dz.sh.hidra.qualification;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFilePermissions;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import static dz.sh.hidra.qualification.Gz2SignedWorkflowFixture.id;
import static org.junit.jupiter.api.Assertions.*;

/** Disposable test-only bridge. It never supplies authority to the browser:
 * the browser authenticates through the actual LOCAL endpoint. */
final class Gz2Uxr29BrowserBridge {
    private static final ObjectMapper JSON = new ObjectMapper();
    static final String PIN = "b451302179eb3a5877aefcb105dab0f3ccb47897";
    private static final List<String> PHASES = List.of("RESPONSE_BEFORE","RESPONSE_AFTER","HSE_AFTER","PLANNING_SUBMIT_REVIEW");
    private static final List<String> SLICES = List.of("alarm","incident","leak","hse","planning");
    private Gz2Uxr29BrowserBridge() {}

    static void shellGrants(Gz2SignedWorkflowFixture f, String actor) {
        f.global(actor, "identity:me:read", "security:permissions:read");
    }
    static void facility(Gz2SignedWorkflowFixture f, String actor, String station) {
        // Same synthetic employee/assignment shape as the existing Circle fixture.
        String employee = f.sql.queryForObject("SELECT employee_reference_id FROM hidra_identity_user WHERE id=?", String.class, actor);
        if (employee == null) {
            employee = id();
            f.sql.update("""
                INSERT INTO hidra_org_employee
                (id,employee_number,employee_type,status,identity_user_reference,created_at,updated_at)
                VALUES (?,?,'PERMANENT','ACTIVE',?,now(),now())
                """, employee, "UXR29-" + employee, actor);
            f.sql.update("UPDATE hidra_identity_user SET employee_reference_id=? WHERE id=?", employee, actor);
            shellGrants(f, actor);
        }
        f.sql.update("""
                INSERT INTO hidra_org_operational_scope(scope_type,target_id)
                SELECT 'FACILITY',? WHERE NOT EXISTS
                  (SELECT 1 FROM hidra_org_operational_scope WHERE scope_type='FACILITY' AND target_id=?)
                """, station, station);
        f.sql.update("""
                INSERT INTO hidra_org_responsibility_assignment
                (id,responsibility_type,assignee_type,assignee_id,scope_id,valid_from,valid_to,status,created_at,updated_at)
                SELECT ?,'RESPONSIBLE','EMPLOYEE',?,id,now()-interval '2 hours',now()+interval '2 hours','ACTIVE',now(),now()
                FROM hidra_org_operational_scope WHERE scope_type='FACILITY' AND target_id=?
                """, id(), employee, station);
        f.permit(actor, "topology:regional-resource:read", "TOPOLOGY_REGIONAL_RESOURCE", "FACILITY", station);
    }
    static String foreignFacility(Gz2SignedWorkflowFixture f) {
        String station = id();
        f.sql.update("""
            INSERT INTO hidra_topology_facility(id,code,name_fr,facility_type_id,facility_kind,owner_party_id,status,created_at,updated_at)
            SELECT ?,?,'Synthetic foreign station',facility_type_id,facility_kind,?,'ACTIVE',now(),now()
            FROM hidra_topology_facility WHERE id=?
            """, station, station, f.foreignCompany, f.asset);
        return station;
    }
    static Map<String,String> responseActors(Gz2SignedWorkflowFixture f) {
        String foreignStation = foreignFacility(f);
        var roles = new LinkedHashMap<String,String>();
        for (String role : List.of("primary","sibling","foreign","revocable")) {
            String actor = f.uxr29Actor(role);
            roles.put(role, actor);
            String company = role.equals("foreign") ? f.foreignCompany : f.company;
            String asset = role.equals("foreign") ? foreignStation : role.equals("sibling") ? f.secondAsset : f.asset;
            facility(f, actor, asset);
            for (String grant : List.of("alarm:alarms:read","leakdetection:candidates:read","leakdetection:cases:read","incident:incidents:read")) {
                f.global(actor, grant);
                f.assetGrant(actor, grant, company, asset);
            }
            f.assetGrant(actor,"monitoring:rule:read",company,asset);
        }
        facility(f, roles.get("primary"), f.secondAsset);
        roles.put("foreignFacility",foreignStation);
        return roles;
    }
    static String manualAlarm(Gz2SignedWorkflowFixture f, Gz2SignedWorkflowFixture.Runtime r) throws Exception {
        String actor=f.uxr29Actor("manual-alarm-author");
        for(String code:List.of("alarm:alarms:read","alarm:alarms:execute")){
            f.global(actor,code); f.assetGrant(actor,code,f.company,f.asset);
        }
        String alarmType=f.catalog("alarm","ALARM_TYPE","GZ2_DEVIATION");
        String severity=f.catalog("alarm","ALARM_SEVERITY","GZ2_REVIEW");
        String token=r.login(actor);
        var created=r.json("POST","/api/v1/alarm/alarms",token,Map.of(
            "alarmNumber","UXR29-MANUAL-"+id(),"alarmTypeId",alarmType,"severityId",severity,
            "titleFr","UXR29 synthetic unlinked manual alarm","titleEn","UXR29 synthetic unlinked manual alarm",
            "sourceType","MANUAL","topologyAssetTypeCode","FACILITY","topologyAssetId",f.asset,"topologyAssetCode",f.asset),200);
        String alarm=created.path("id").asText();
        assertFalse(alarm.isBlank());
        assertEquals("MANUAL",r.get("/api/v1/alarm/alarms/"+alarm,token).path("sourceType").asText());
        assertEquals(404,r.send("GET","/api/v1/alarm/alarms/"+alarm+"/evidence",token,null).statusCode());
        return alarm;
    }
    static String hseReader(Gz2SignedWorkflowFixture f) {
        String actor = f.uxr29Actor("hse-browser-reader");
        facility(f, actor, f.asset);
        facility(f, actor, f.secondAsset);
        f.global(actor,"hse:cases:read","hse:capas:read","hse:companies:read");
        f.grantScopedHse(actor,"read");
        for (String code : List.of("incident:incidents:read","alarm:alarms:read","monitoring:rule:read"))
            f.assetGrant(actor,code,f.company,f.asset);
        return actor;
    }
    static void verifyContracts(Gz2SignedWorkflowFixture.Runtime r, Path web) throws Exception {
        JsonNode runtime = r.get("/v3/api-docs", null);
        for (String name : SLICES) {
            Path file = web.resolve("openapi/candidates/hidra-" + name + "-" + PIN + ".json");
            JsonNode pin = JSON.readTree(file.toFile());
            var paths = pin.path("paths").fields();
            while (paths.hasNext()) {
                var path = paths.next();
                var methods = path.getValue().fields();
                while (methods.hasNext()) {
                    var method = methods.next();
                    assertEquals(method.getValue(), runtime.path("paths").path(path.getKey()).path(method.getKey()),
                        "UXR29 runtime operation differs from exact pin: " + name + " " + method.getKey() + " " + path.getKey());
                }
            }
            var schemas = pin.path("components").path("schemas").fields();
            while (schemas.hasNext()) {
                var schema = schemas.next();
                assertEquals(schema.getValue(), runtime.path("components").path("schemas").path(schema.getKey()),
                    "UXR29 runtime schema differs from exact pin: " + name + " " + schema.getKey());
            }
            assertEquals(pin.path("components").path("securitySchemes").path("hidraBearerJwt"), runtime.path("components").path("securitySchemes").path("hidraBearerJwt"));
        }
    }
    static void run(Gz2SignedWorkflowFixture f, Gz2SignedWorkflowFixture.Runtime r,
                    String phase, Map<String,?> data, Runnable between) throws Exception {
        assertTrue(PHASES.contains(phase));
        Path web = Path.of(System.getenv("HIDRA_UXR29_WEB_ROOT")).toAbsolutePath().normalize();
        Path evidence = Path.of(System.getenv("HIDRA_UXR29_EVIDENCE_DIR")).toAbsolutePath().normalize();
        assertTrue(Files.isRegularFile(web.resolve("scripts/run-uxr29-browser.sh")));
        assertTrue(r.uxr29Base().matches("http://127\\.0\\.0\\.1:[0-9]+"));
        verifyContracts(r,web);
        Path dir = Files.createTempDirectory("uxr29-browser-", PosixFilePermissions.asFileAttribute(PosixFilePermissions.fromString("rwx------")));
        Path log = dir.resolve("runner.log");
        Process browser = null;
        try {
            Map<String,Object> fixture = new LinkedHashMap<>(data);
            fixture.put("phase",phase); fixture.put("company",f.company); fixture.put("facility",f.asset);
            fixture.put("siblingFacility",f.secondAsset); fixture.put("foreignCompany",f.foreignCompany);
            fixture.put("password",f.uxr29Password());
            Path manifest = dir.resolve("fixture.json");
            Files.writeString(manifest,JSON.writeValueAsString(fixture));
            var builder = new ProcessBuilder("bash","scripts/run-uxr29-browser.sh").directory(web.toFile())
                .redirectErrorStream(true).redirectOutput(log.toFile());
            builder.environment().put("HIDRA_UXR29_PRIVATE_DIR",dir.toString());
            builder.environment().put("HIDRA_UXR29_FIXTURE",manifest.toString());
            builder.environment().put("HIDRA_UXR29_PHASE",phase);
            builder.environment().put("HIDRA_UXR26_API_URL",r.uxr29Base());
            builder.environment().put("HIDRA_E2E_AUTH_MOCK","0");
            browser=builder.start();
            if (between != null) {
                long deadline=System.nanoTime()+TimeUnit.MINUTES.toNanos(8);
                while(browser.isAlive() && !Files.exists(dir.resolve("ready")) && System.nanoTime()<deadline) Thread.sleep(100);
                assertTrue(browser.isAlive() && Files.isRegularFile(dir.resolve("ready")), "UXR29 native handshake not reached");
                between.run();
                Files.createFile(dir.resolve("released"));
            }
            assertTrue(browser.waitFor(12,TimeUnit.MINUTES),"UXR29 browser phase timed out");
            assertEquals(0,browser.exitValue(),"UXR29 browser phase failed: "+phase);
            JsonNode safe=JSON.readTree(dir.resolve("safe.json").toFile());
            assertEquals(phase,safe.path("phase").asText());
            Files.createDirectories(evidence);
            var summary=JSON.createObjectNode();
            summary.set("browser",safe);
            summary.put("api_sha",PIN);
            summary.put("web_sha",System.getenv("GITHUB_SHA"));
            summary.put("run_id",System.getenv("GITHUB_RUN_ID"));
            summary.put("run_attempt",System.getenv("GITHUB_RUN_ATTEMPT"));
            summary.set("migrations",JSON.valueToTree(f.sql.queryForList(
                "SELECT installed_rank,version,script,checksum,success FROM public.flyway_schema_history ORDER BY installed_rank")));
            var contractDigests = summary.putObject("contracts");
            for (String name : SLICES) {
                byte[] bytes=Files.readAllBytes(web.resolve("openapi/candidates/hidra-"+name+"-"+PIN+".json"));
                contractDigests.put(name,java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(bytes)));
            }
            Path output=evidence.resolve(phase+".json");
            assertFalse(Files.exists(output),"UXR29 duplicate native phase");
            Files.writeString(output,JSON.writeValueAsString(summary)+"\n",java.nio.file.StandardOpenOption.CREATE_NEW);
        } finally {
            if(browser!=null) {
                browser.descendants().forEach(ProcessHandle::destroyForcibly);
                if(browser.isAlive()){browser.destroyForcibly(); browser.waitFor();}
            }
            if(Files.isRegularFile(log)) for(String line:Files.readAllLines(log))
                if(line.matches("UXR29_DIAG (PHASE=(RESPONSE_BEFORE|RESPONSE_AFTER|HSE_AFTER|PLANNING_SUBMIT_REVIEW)|COUNTS EXPECTED=[0-9]+ UNEXPECTED=[0-9]+ FLAKY=[0-9]+ SKIPPED=[0-9]+|CHECKPOINT=[A-Z_]+|FAILURE_LINE=[0-9]+|REPORT_MISSING|PASSED)"))
                    System.out.println(line);
            try(var files=Files.walk(dir)){
                for(Path file:files.sorted(Comparator.reverseOrder()).toList())Files.deleteIfExists(file);
            }
        }
    }
}
