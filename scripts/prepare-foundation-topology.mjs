// Synthetic security setup only, after real administrator bootstrap. No account,
// Party, facility, position, unit, graph, installation or configuration is inserted.
import { execFileSync } from 'node:child_process';
import process from 'node:process';
if (process.env.PGDATABASE !== 'hidra_foundation_w1' || process.env.HIDRA_FOUNDATION_REQUIRE_NATIVE !== '1') throw new Error('Exact disposable native fixture required');
const permissions = [
  ...['read','write'].map(a=>[`topology:foundation:${a}`,'TOPOLOGY_FOUNDATION']),
  ...['create','read','update','validate'].map(a=>[`topology:engineering-draft:${a}`,'ENGINEERING_NETWORK_DRAFT']),
  ...['register','read'].map(a=>[`topology:installed-unit:${a}`,'INSTALLED_UNIT']),
  ...['record-installation','read-installation','read-history'].map(a=>[`topology:installed-unit:${a}`,'INSTALLED_UNIT_INSTALLATION']),
  ...['author','publish','read-current','read-history','list-history'].map(a=>[`topology:station-revision:${a}`,'STATION_GRAPH_REVISION']),
  ...['save','read','history'].map(a=>[`topology:installed-configuration:${a}`,'STATION_INSTALLED_CONFIGURATION']),
];
const sql = `BEGIN; DO $$ BEGIN IF current_database()<>'hidra_foundation_w1' THEN RAISE EXCEPTION 'Wrong fixture'; END IF; END $$;\n` + permissions.map(([code,resource],i)=>`
INSERT INTO public.hidra_identity_permission(id,code,permission_domain,resource_type,action,sensitive,status,created_at,updated_at)
VALUES ('w2-permission-${i}','${code}','topology','${resource}','${code.split(':').at(-1)}',false,'ACTIVE',now(),now()) ON CONFLICT(code) DO NOTHING;
INSERT INTO public.hidra_identity_user_permission_grant(id,user_id,permission_id,effect,scope_type,scope_reference_id,grant_reason,emergency_access,valid_from,valid_to,status,created_at)
SELECT 'w2-grant-${i}',u.id,p.id,'GRANT','GLOBAL',NULL,'Synthetic W2 native qualification',false,now()-interval '1 hour',now()+interval '4 hours','ACTIVE',now()
FROM public.hidra_identity_user u CROSS JOIN public.hidra_identity_permission p
WHERE u.username='w1-native-admin' AND p.code='${code}';`).join('\n') + '\nCOMMIT;';
execFileSync('psql',['-v','ON_ERROR_STOP=1'],{input:sql,stdio:['pipe','ignore','inherit']});
