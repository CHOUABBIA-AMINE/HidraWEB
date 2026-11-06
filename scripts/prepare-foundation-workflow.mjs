// Deliberate synthetic reference/process configuration; all new business revisions
// and actual Workflow instances/tasks/actions are created by the real owner APIs.
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import crypto from 'node:crypto';
import process from 'node:process';
import { URLSearchParams } from 'node:url';
if(process.env.PGDATABASE!=='hidra_foundation_w1'||process.env.HIDRA_FOUNDATION_REQUIRE_NATIVE!=='1')throw new Error('Exact disposable W4 database required');
const api=process.env.HIDRA_FOUNDATION_API_URL;
const principal=process.env.HIDRA_FOUNDATION_ADMIN;
const password=process.env.HIDRA_FOUNDATION_PASSWORD;
const userPassword=process.env.HIDRA_FOUNDATION_USER_PASSWORD;
if(!api||!principal||!password||!userPassword||!process.env.GITHUB_ENV)throw new Error('Native W4 setup environment required');
const id=()=>crypto.randomUUID();
const quote=s=>`'${String(s).replaceAll("'","''")}'`;
const sql=s=>execFileSync('psql',['-v','ON_ERROR_STOP=1'],{input:`BEGIN; DO $$ BEGIN IF current_database()<>'hidra_foundation_w1' THEN RAISE EXCEPTION 'Wrong fixture'; END IF; END $$;\n${s}\nCOMMIT;`,stdio:['pipe','ignore','inherit']});
let token;
async function call(path,method='GET',data){const r=await globalThis.fetch(`${api}/api/v1${path}`,{method,headers:{...(token?{Authorization:`Bearer ${token}`} : {}),'Content-Type':'application/json'},...(data?{body:JSON.stringify(data)}:{})});if(!r.ok)throw new Error(`Native W4 setup ${method} ${path.split('/')[1]} refused: ${r.status}`);return r.status===204?undefined:r.json();}
token=(await call('/identity/authentication/login','POST',{providerType:'LOCAL',principal,credentials:password})).accessToken;
const me=await call('/identity/me');const starter=me.userId;
async function party(code){const p=await call('/party/parties','POST',{code,legalName:`Synthetic ${code}`,partyTypeId:'w1-synthetic-party-type',countryCode:'DZ'});const current=await call(`/party/parties/${p.id}`);await call(`/party/parties/${p.id}/activate`,'POST',{expectedUpdatedAt:current.updatedAt,reason:'Synthetic W4 reference'});return p.id;}
const company=await party('W4-COMPANY'),manufacturer=await party('W4-MANUFACTURER');
const reviewerName='w4-native-reviewer';
const reviewer=await call('/identity/users','POST',{userType:'HUMAN',username:reviewerName,emailAddress:'w4@synthetic.invalid',displayName:'Synthetic W4 independent reviewer'});
const credential=await call(`/identity/users/${reviewer.id}/local-credential/state`);
await call(`/identity/users/${reviewer.id}/local-credential`,'PUT',{expectedSecurityVersion:credential.securityVersion,password:userPassword,reason:'Synthetic W4 native human'});
const lifecycle=await call(`/identity/users/${reviewer.id}/lifecycle`);await call(`/identity/users/${reviewer.id}/activate`,'POST',{expectedUpdatedAt:lifecycle.updatedAt,reason:'Synthetic W4 native human'});
const source=id(),unit=id(),link=id(),definition=id(),first=id(),last=id(),approve=id(),reject=id(),reason=id(),mode=id();
// Reference policy has no supported manufacturer qualification authoring in W4.
// Seed it explicitly as synthetic reference data, never claim a qualified OEM result.
sql(`
INSERT INTO public.hidra_party_role(id,code,qualification_required_by_default,status,created_at,updated_at) VALUES('w4-manufacturer-role','MANUFACTURER',true,'ACTIVE',now(),now()) ON CONFLICT(code) DO NOTHING;
INSERT INTO public.hidra_party_role_assignment(id,party_id,role_id,valid_from,status,qualification_required,created_at,updated_at) SELECT ${quote(id())},${quote(manufacturer)},id,now()-interval '1 hour','ACTIVE',true,now(),now() FROM public.hidra_party_role WHERE code='MANUFACTURER';
INSERT INTO public.hidra_party_manufacturer_profile(id,party_id,capability_type,qualification_status,created_at,updated_at) VALUES(${quote(id())},${quote(manufacturer)},'EQUIPMENT','QUALIFIED',now(),now());
INSERT INTO public.hidra_party_manufacturer_source_authorization(authorization_id,company_party_id,manufacturer_party_id,manufacturer_model_reference,authorization_status,valid_from,generation,created_at,updated_at) VALUES(${quote(id())},${quote(company)},${quote(manufacturer)},'synthetic-model','ACTIVE',now()-interval '1 hour',1,now(),now());
`);
const sourceScope=crypto.createHash('sha256').update(`HIDRA_MANUFACTURER_NATIVE_SCOPE_V1|${company.length}:${company}|${source.length}:${source}|2:v1`).digest('hex');
function grant(user,code,resource,scope){sql(`INSERT INTO public.hidra_identity_permission(id,code,permission_domain,resource_type,action,sensitive,status,created_at,updated_at) VALUES(${quote(id())},${quote(code)},${quote(code.split(':')[0])},${quote(resource)},${quote(code.split(':').at(-1))},false,'ACTIVE',now(),now()) ON CONFLICT(code) DO NOTHING;
INSERT INTO public.hidra_identity_user_permission_grant(id,user_id,permission_id,effect,scope_type,scope_reference_id,grant_reason,emergency_access,valid_from,valid_to,status,created_at) SELECT ${quote(id())},${quote(user)},id,'GRANT',${scope?'\'CUSTOM\'':'\'GLOBAL\''},${scope?quote(scope):'NULL'},'Synthetic W4 native qualification',false,now()-interval '1 hour',now()+interval '4 hours','ACTIVE',now() FROM public.hidra_identity_permission WHERE code=${quote(code)};`);}
for(const actor of [starter,reviewer.id]){
 for(const op of ['read','history'])grant(actor,`topology:installed-characteristic:${op}`,'INSTALLED_CHARACTERISTIC_LINK',`topology-company:${company}`);
 grant(actor,'topology:installed-unit:read','INSTALLED_UNIT',`topology-company:${company}`);
 for(const scope of [`simulation-company:${company}`,`simulation-source:${sourceScope}`])grant(actor,'simulation:manufacturer-characteristic:read','MANUFACTURER_CHARACTERISTIC_REVISION',scope);
 for(const code of ['workflow:tasks:read','workflow:instances:read','workflow:tasks:execute'])grant(actor,code,'WORKFLOW_INSTANCE',null);
}
grant(starter,'topology:installed-characteristic:save','INSTALLED_CHARACTERISTIC_LINK',`topology-company:${company}`);
for(const scope of [`simulation-company:${company}`,`simulation-source:${sourceScope}`])grant(starter,'simulation:manufacturer-characteristic:save','MANUFACTURER_CHARACTERISTIC_REVISION',scope);
await call(`/topology/installed-units/${unit}`,'PUT',{companyPartyId:company,requestId:id(),equipmentKindId:'w2-compressor-kind',manufacturerParty:{verification:'UNKNOWN'},manufacturerModel:{verification:'UNKNOWN'},serialNumber:{verification:'UNKNOWN'}});
const sourceReceipt=await call(`/simulation/manufacturer-characteristics/${source}/revisions/v1`,'PUT',{companyPartyId:company,revision:{sourceId:source,revisionId:'v1',recordedAt:'2026-10-01T10:00:00Z',effectiveFrom:'2026-10-01T10:00:00Z',origin:'SYNTHETIC',manufacturerPartyId:manufacturer,manufacturerModelReference:'synthetic-model',documentReference:'synthetic W4 reference bounds',documentSha256:'a'.repeat(64),referenceConditions:{pressurePascalsAbsolute:180000,temperatureKelvin:298.15,methodReference:'synthetic'},family:{kind:'OPERATING_LIMITS',limits:[{axis:{quantity:'MASS_FLOW',unit:'KILOGRAM_PER_SECOND'},minimumInclusive:0,maximumInclusive:2,evidenceReference:'synthetic'}]}}});
// Switch from unit/source preparation to the independently guarded consumer capability.
// This happens after W1-W3, so their original credential requirements are preserved.
sql(`REVOKE INSERT,UPDATE,DELETE ON public.hidra_topology_installed_unit FROM w2_installed;
REVOKE INSERT,UPDATE,DELETE ON public.hidra_simulation_manufacturer_characteristic_revision,public.hidra_simulation_manufacturer_characteristic_qualification FROM w2_installed;`);
await call(`/topology/installed-units/${unit}/characteristic-links/${link}`,'PUT',{companyPartyId:company,requestId:id(),expectedEpoch:0,linkRevision:1,sourceId:source,sourceRevisionId:'v1',sourceSha256:sourceReceipt.payloadSha256,kind:'OPERATING_LIMITS',effectiveFrom:'2026-10-01T10:00:00Z',recordedAt:'2026-10-01T10:00:00Z',evidenceReference:'synthetic W4 review'});
sql(`
INSERT INTO public.hidra_workflow_type_catalog(id,catalog_name,code,active,sort_order,system_defined,created_at,updated_at) VALUES(${quote(mode)},'WORKFLOW_ASSIGNMENT_MODE','W4_MANUAL',true,0,false,now(),now()),(${quote(reason)},'WORKFLOW_REASON','W4_NATIVE_REJECTION',true,0,false,now(),now());
INSERT INTO public.hidra_workflow_definition(id,code,name_fr,type_id,status,version,created_at,updated_at) SELECT ${quote(definition)},'W4_NATIVE_REVIEW','Synthetic W4 link review',id,'ACTIVE',1,now(),now() FROM public.hidra_workflow_type_catalog WHERE catalog_name='WORKFLOW_TARGET_TYPE' AND code='INSTALLED_CHARACTERISTIC_LINK_REVISION';
INSERT INTO public.hidra_workflow_step(id,definition_id,code,name_fr,step_order,mandatory,allow_claim,allow_delegation,allow_escalation,created_at,updated_at) VALUES(${quote(first)},${quote(definition)},'W4_REVIEW','Synthetic review',1,true,true,false,false,now(),now()),(${quote(last)},${quote(definition)},'W4_END','Synthetic end',2,true,true,false,false,now(),now());
INSERT INTO public.hidra_workflow_definition_target_binding(id,definition_id,target_module,target_type_id,workflow_purpose_id,active,created_at,updated_at) SELECT ${quote(id())},${quote(definition)},'topology',t.id,p.id,true,now(),now() FROM public.hidra_workflow_type_catalog t CROSS JOIN public.hidra_workflow_type_catalog p WHERE t.catalog_name='WORKFLOW_TARGET_TYPE' AND t.code='INSTALLED_CHARACTERISTIC_LINK_REVISION' AND p.catalog_name='WORKFLOW_PURPOSE' AND p.code='INSTALLED_CHARACTERISTIC_LINK_APPROVAL';
INSERT INTO public.hidra_workflow_transition(id,definition_id,from_step_id,to_step_id,decision,reason_required,comment_required,created_at,updated_at) VALUES(${quote(approve)},${quote(definition)},${quote(first)},${quote(last)},'APPROVE',false,true,now(),now()),(${quote(reject)},${quote(definition)},${quote(first)},${quote(last)},'REJECT',true,false,now(),now());
INSERT INTO public.hidra_workflow_step_assignment_rule(id,definition_id,step_id,assignment_mode_id,actor_id,active,created_at,updated_at) VALUES(${quote(id())},${quote(definition)},${quote(first)},${quote(mode)},${quote(reviewer.id)},true,now(),now());
`);
for(const [k,v] of Object.entries({HIDRA_W4_COMPANY:company,HIDRA_W4_UNIT:unit,HIDRA_W4_LINK:link,HIDRA_W4_REVIEWER:reviewerName,HIDRA_W4_REASON:reason}))appendFileSync(process.env.GITHUB_ENV,`${k}=${v}\n`);
// Assert actual handoff/choice admission before browser qualification; not a replacement for it.
const h=await call(`/workflow/definitions/installed-characteristic-link-target?companyPartyId=${company}&installedUnitId=${unit}&linkId=${link}&revisionId=1`);
const choices=await call(`/workflow/definitions?${new URLSearchParams({targetModule:h.targetModule,targetTypeId:h.targetTypeId,workflowPurposeId:h.workflowPurposeId,targetId:h.targetId,targetLocator:h.targetLocator})}`);
if(!choices.some(d=>d.id===definition&&d.assignmentChoices?.some(a=>a.actorId===reviewer.id)))throw new Error('Configured native W4 process unavailable');
