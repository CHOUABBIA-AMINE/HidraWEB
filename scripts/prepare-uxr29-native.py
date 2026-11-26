#!/usr/bin/env python3
"""Apply an exact, disposable test-only UXR-29 overlay; never edit API runtime sources."""
from pathlib import Path
import hashlib
import shutil
import subprocess
import sys

PIN = "6aad877c2681a278d141b5dc8d9deea6d18544e5"
api = Path(sys.argv[1]).resolve()
web = Path(__file__).resolve().parent.parent
root = api / "src/test/java/dz/sh/hidra/qualification"
anchors = {
    "Gz2SignedWorkflowFixture.java": "5e127551ee10429b7c4c433e4cb101d640411200",
    "Gz2IncidentLeakInvestigationNativeHttpPostgresIntegrationTest.java": "7a73790379e83a79dc940a378de51fbd56b14b14",
    "Gz2HseCapaNativeHttpPostgresIntegrationTest.java": "57e044d61e77481f1a9871f8f8bef38389ebac76",
    "Gz2PlanningNominationNativeHttpPostgresIntegrationTest.java": "76d6a9828afbb9b15325a39ec3567ee795dbadae",
}

def git(*args):
    return subprocess.check_output(["git", "-C", str(api), *args], text=True).strip()

def blob(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()

def require(condition, message):
    if not condition:
        raise SystemExit(message)

def once(source, anchor, addition, *, before=False):
    require(source.count(anchor) == 1, "Missing unique exact fixture anchor: " + anchor.splitlines()[0])
    return source.replace(anchor, addition + anchor if before else anchor + addition)

require(git("rev-parse","HEAD") == PIN, "Wrong immutable API SHA")
require(not git("status","--porcelain"), "API checkout must be pristine")
original = {}
for name, sha in anchors.items():
    raw = (root/name).read_bytes()
    require(blob(raw) == sha, "Unexpected API source blob: " + name)
    original[name] = raw.decode("utf-8")

fixture_name, response_name, hse_name, planning_name = anchors
fixture = once(original[fixture_name], "    static String id() {", '''
    String uxr29Actor(String label) { return human(label); }
    String uxr29Password() { return HUMAN_PASSWORD; }
    String uxr29RejectionReason() { return workflowType("WORKFLOW_REASON", "UXR29_SYNTHETIC_REJECTION"); }

''', before=True)
fixture = once(fixture, "        long pid() {", '''
        String uxr29Base() { return base; }

''', before=True)

fixture = once(fixture, '            launcher.environment().put("SPRING_DATASOURCE_PASSWORD", APP_PASSWORD);',
    '            launcher.command().add("--hidra.platform.security.cors.allowed-origins=http://127.0.0.1:5173");\n', before=True)

response = once(original[response_name], "            Investigations investigations;\n",
    "            Map<String,String> uxr29Actors;\n            String uxr29ManualAlarm;\n")
response = once(response, "                investigations=investigate(fixture,runtime,response,operator,reviewer);\n", '''
                uxr29Actors=Gz2Uxr29BrowserBridge.responseActors(fixture);
                uxr29ManualAlarm=Gz2Uxr29BrowserBridge.manualAlarm(fixture,runtime);
                Gz2Uxr29BrowserBridge.run(fixture,runtime,"RESPONSE_BEFORE",Map.of(
                    "actors",uxr29Actors,"alarm",response.alarm(),"candidate",response.candidate(),
                    "incident",response.incident(),"leakCase",investigations.caseId(),
                    "evaluation",response.evaluation(),"incidentReview",investigations.incidentReviewId(),
                    "leakReview",investigations.leakReviewId(),"missing",id(),"manualAlarm",uxr29ManualAlarm),null);
''')
response = once(response, "                verifyInvestigationsAfterRestart(fixture,restarted,response,investigations);\n", '''
                Gz2Uxr29BrowserBridge.run(fixture,restarted,"RESPONSE_AFTER",Map.of(
                    "actors",uxr29Actors,"alarm",response.alarm(),"candidate",response.candidate(),
                    "incident",response.incident(),"leakCase",investigations.caseId(),
                    "evaluation",response.evaluation(),"incidentReview",investigations.incidentReviewId(),
                    "leakReview",investigations.leakReviewId(),"manualAlarm",uxr29ManualAlarm),()->fixture.sql.update("""
                      UPDATE hidra_identity_user_permission_grant SET status='REVOKED',revoked_at=now()
                      WHERE user_id=? AND scope_type<>'GLOBAL' AND status='ACTIVE'
                      """,uxr29Actors.get("revocable")));
''')

# The existing fixture intentionally withdraws source review from the second
# duplicate after testing both authorized rows. Preserve all original
# assertions, prove the masked collection in the browser, then restore that
# test-only source state for the isolated positive browser witness. Finally
# restore its exact pre-callback state; no history/event/receipt is modified.
hse = once(original[hse_name], '''                assertEquals(assessmentId, restarted.json("POST", casePath + "/impact-assessments",
                        author, command, 200).path("assessmentId").asText());\n''', '''
                String browserReader=Gz2Uxr29BrowserBridge.hseReader(f);
                String originalSourceState=f.sql.queryForObject(
                    "SELECT state FROM hidra_incident_investigation WHERE incident_id=?",String.class,unreadableIncident);
                assertEquals("SUBMITTED",originalSourceState);
                try {
                    Gz2Uxr29BrowserBridge.run(f,restarted,"HSE_AFTER",java.util.Map.of(
                        "actor",browserReader,"caseNumber",caseNumber,
                        "caseId",closed.casePath().substring(closed.casePath().lastIndexOf('/')+1),
                        "capaId",closed.capaPath().substring(closed.capaPath().lastIndexOf('/')+1),
                        "closureId",closed.closureId(),"assessmentId",assessmentId,"missing",id()),
                        ()->assertEquals(1,f.sql.update("UPDATE hidra_incident_investigation SET state='APPROVED' WHERE incident_id=? AND state='SUBMITTED'",unreadableIncident)));
                } finally {
                    f.sql.update("UPDATE hidra_incident_investigation SET state=? WHERE incident_id=?",originalSourceState,unreadableIncident);
                }
''')
planning_add = '''
    @Test
    void uxr29BrowserSubmitsAndIndependentlyDecidesCurrentDrafts() throws Exception {
        try(var postgres=new PostgreSQLContainer<>("postgres:16").withDatabaseName("hidra_gz2_uxr29_planning")
                .withCommand("postgres","-c","autovacuum=off")){
            postgres.start();
            var f=new Gz2SignedWorkflowFixture(postgres);
            f.enablePlanningProductReferenceLock();
            grantPlanning(f);
            var review=f.review("planning","PLAN_REVISION","PLAN_REVISION_APPROVAL",true);
            String reject=Gz2SignedWorkflowFixture.id();
            String rejectionReason=f.uxr29RejectionReason();
            f.sql.update("""
                INSERT INTO hidra_workflow_transition(id,definition_id,from_step_id,to_step_id,decision,reason_required,comment_required,created_at,updated_at)
                SELECT ?,definition_id,from_step_id,to_step_id,'REJECT',false,false,now(),now()
                FROM hidra_workflow_transition WHERE id=?
                """,reject,review.transition());
            String targetType=f.catalog("planning","TARGET_TYPE","UXR29_SYNTHETIC_TARGET");
            f.sql.update("""
                INSERT INTO hidra_planning_target_value_policy(target_type_id,representation_kind,active)
                VALUES (?,'TEXT',true)
                """,targetType);
            for(String actor:List.of(f.author,f.reviewer)){
                Gz2Uxr29BrowserBridge.facility(f,actor,f.asset);
                f.global(actor,"planning:periods:read","workflow:definitions:read","workflow:tasks:read",
                    "monitoring:deviations:read");
                f.permit(actor,"planning:scoped-period:read","PLANNING","CUSTOM","planning-company:"+f.company);
            }
            f.global(f.author,"planning:revisions:update");
            String sibling=f.uxr29Actor("planning-sibling"), foreign=f.uxr29Actor("planning-foreign");
            String foreignFacility=Gz2Uxr29BrowserBridge.foreignFacility(f);
            for(String actor:List.of(sibling,foreign)){
                String company=actor.equals(sibling)?f.company:f.foreignCompany;
                String asset=actor.equals(sibling)?f.secondAsset:foreignFacility;
                Gz2Uxr29BrowserBridge.facility(f,actor,asset);
                f.global(actor,"planning:periods:read","planning:operational-plans:read","planning:revisions:read",
                    "planning:targets:read","planning:revisions:execute","workflow:definitions:read","workflow:tasks:read","monitoring:deviations:read","planning:nominations:read");
                f.permit(actor,"planning:scoped-period:read","PLANNING","CUSTOM","planning-company:"+company);
                f.assetGrant(actor,"planning:scoped-plan:read",company,asset);
                f.assetGrant(actor,"planning:scoped-plan:author",company,asset);
                f.assetGrant(actor,"planning:scoped-plan:review",company,asset);
            }
            Instant start=Instant.now().truncatedTo(ChronoUnit.SECONDS),end=start.plus(4,ChronoUnit.HOURS);
            try(var runtime=f.start()){
                String author=runtime.login(f.author),reviewer=runtime.login(f.reviewer);
                String plan=createPlan(f,runtime,author,start,end);
                ApprovedRevision prior=approve(f,runtime,review,plan,targetType,author,reviewer,start,end);
                String periodId=runtime.get(PLAN+"/operational-plans/"+plan,author).path("periodId").asText();
                String rejectPlan=runtime.json("POST",PLAN+"/operational-plans",author,Map.of(
                    "periodId",periodId,"code","UXR29-REJECT","nameFr","Synthetic independent rejection",
                    "planTypeId",f.catalog("planning","PLAN_TYPE","T19_PLAN"),"topologyScopeType","FACILITY","topologyScopeId",f.asset),200).path("id").asText();
                var approveDraft=uxr29Draft(f,runtime,author,plan,targetType,start,end);
                var rejectDraft=uxr29Draft(f,runtime,author,rejectPlan,targetType,start,end);
                Gz2Uxr29BrowserBridge.run(f,runtime,"PLANNING_SUBMIT_REVIEW",Map.ofEntries(
                    Map.entry("author",f.author),Map.entry("reviewer",f.reviewer),Map.entry("sibling",sibling),
                    Map.entry("foreign",foreign),Map.entry("foreignFacility",foreignFacility),
                    Map.entry("definition",review.definition()),Map.entry("type",review.type()),Map.entry("purpose",review.purpose()),
                    Map.entry("approveTransition",review.transition()),Map.entry("rejectTransition",reject),
                    Map.entry("rejectionReason",rejectionReason),
                    Map.entry("approveDraft",approveDraft),Map.entry("rejectDraft",rejectDraft),
                    Map.entry("priorRevision",prior.id()),Map.entry("priorTarget",prior.targetId())),null);
                assertEquals("APPROVED",runtime.get(PLAN+"/revisions/"+approveDraft.get("revision"),author).path("status").asText());
                assertEquals("REJECTED",runtime.get(PLAN+"/revisions/"+rejectDraft.get("revision"),author).path("status").asText());
                assertEquals("SUPERSEDED",runtime.get(PLAN+"/targets/"+prior.targetId(),author).path("status").asText());
            }
        }
    }

    private static Map<String,String> uxr29Draft(Gz2SignedWorkflowFixture f,Gz2SignedWorkflowFixture.Runtime r,
                String author,String plan,String type,Instant start,Instant end)throws Exception{
        String path=PLAN+"/operational-plans/"+plan;
        var draft=r.json("POST",path+"/revisions",author,
            Map.of("expectedPlanUpdatedAt",r.get(path,author).path("updatedAt").asText()),200);
        String revision=draft.path("id").asText();
        var result=r.json("POST",PLAN+"/revisions/"+revision+"/targets",author,Map.of(
            "expectedRevisionUpdatedAt",draft.path("updatedAt").asText(),"targetTypeId",type,
            "topologyAssetType","FACILITY","topologyAssetId",f.asset,"targetTextValue","Synthetic",
            "validFrom",start.toString(),"validTo",end.toString()),200);
        return Map.of("plan",plan,"revision",revision,"target",result.path("target").path("id").asText());
    }

'''
planning = once(original[planning_name], "    private static String draft(Gz2SignedWorkflowFixture.Runtime runtime,\n", planning_add, before=True)

modified = dict(zip(anchors,[fixture,response,hse,planning]))
# All changes are pure insertions. Prove every original source line remains in
# original order (including every original assertion).
for name, source in modified.items():
    old = iter(original[name].splitlines(keepends=True))
    expected = next(old,None)
    for line in source.splitlines(keepends=True):
        if line == expected:
            expected = next(old,None)
    require(expected is None, "Original API fixture line removed: " + name)
    (root/name).write_text(source, encoding="utf-8")
bridge = "Gz2Uxr29BrowserBridge.java"
require(not (root/bridge).exists(), "Bridge already exists in API")
shutil.copyfile(web/"scripts/uxr29-native"/bridge, root/bridge)
prefix="src/test/java/dz/sh/hidra/qualification/"
expected={prefix+name for name in [*anchors,bridge]}
changed={line[3:] for line in subprocess.check_output(["git","-C",str(api),"status","--porcelain","--untracked-files=all"],text=True).splitlines()}
require(changed == expected, "Unexpected disposable API overlay paths")
require(git("rev-parse","HEAD") == PIN, "API HEAD moved")
print("UXR29 exact API test-only overlay verified; all original lines preserved")
