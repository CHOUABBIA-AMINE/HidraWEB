-- F16 disposable synthetic qualification only. No operational ownership claims.
\set ON_ERROR_STOP on
BEGIN;
DO $$
BEGIN
    IF current_database() <> 'hidra_alarm_f16' OR
       NOT EXISTS (SELECT 1 FROM public.flyway_schema_history WHERE success) OR
       EXISTS (SELECT 1 FROM public.hidra_alarm) OR
       EXISTS (SELECT 1 FROM public.hidra_identity_user WHERE id LIKE 'f16-%') THEN
        RAISE EXCEPTION 'F16 requires its own fresh migrated database';
    END IF;
END $$;

INSERT INTO hidra_party_type(id,code,status,created_at,updated_at)
VALUES ('f16-party-type','F16_SYNTHETIC','ACTIVE',now(),now());
INSERT INTO hidra_party_party(id,code,party_type_id,legal_name,country_code,status,created_at,updated_at)
VALUES ('f16-company-a','F16-A','f16-party-type','Synthetic company A','DZ','ACTIVE',now(),now()),
       ('f16-company-b','F16-B','f16-party-type','Synthetic company B','DZ','ACTIVE',now(),now());
INSERT INTO hidra_topology_facility_type(id,code,name,facility_kind,status,created_at,updated_at)
VALUES ('f16-facility-type','F16-STATION','Synthetic gas station','COMPRESSOR_STATION','ACTIVE',now(),now());
INSERT INTO hidra_topology_facility(id,code,name_fr,facility_type_id,facility_kind,owner_party_id,status,created_at,updated_at)
VALUES ('f16-facility-a','F16-A','Synthetic station A','f16-facility-type','COMPRESSOR_STATION','f16-company-a','ACTIVE',now(),now()),
       ('f16-facility-b','F16-B','Synthetic station B','f16-facility-type','COMPRESSOR_STATION','f16-company-a','ACTIVE',now(),now()),
       ('f16-facility-c','F16-C','Synthetic station C','f16-facility-type','COMPRESSOR_STATION','f16-company-b','ACTIVE',now(),now());

UPDATE hidra_identity_provider SET status='INACTIVE' WHERE status='ACTIVE';
INSERT INTO hidra_identity_provider(id,code,name,provider_type,status,sync_enabled,just_in_time_provisioning_enabled,created_at,updated_at)
VALUES ('f16-provider','F16_LOCAL','Synthetic F16 LOCAL','LOCAL','ACTIVE',false,false,now(),now());

INSERT INTO hidra_alarm_catalog_entry(id,catalog_name,code,active,sort_order,system_defined,created_at,updated_at)
VALUES ('f16-alarm-type','ALARM_TYPE','F16_PRESSURE',true,0,false,now(),now()),
       ('f16-severity','ALARM_SEVERITY','F16_WARNING',true,0,false,now(),now());

INSERT INTO hidra_identity_permission(id,code,permission_domain,resource_type,action,sensitive,status,created_at,updated_at)
VALUES ('f16-permission-read','alarm:alarms:read','alarm','ALARM','read',false,'ACTIVE',now(),now()),
       ('f16-permission-execute','alarm:alarms:execute','alarm','ALARM','execute',false,'ACTIVE',now(),now()),
       ('f16-permission-self','identity:me:read','identity','ME','read',false,'ACTIVE',now(),now()),
       ('f16-permission-catalog','security:permissions:read','security','PERMISSIONS','read',false,'ACTIVE',now(),now())
ON CONFLICT(code) DO NOTHING;

INSERT INTO hidra_identity_user(id,username,display_name,user_type,status,failed_login_count,created_at,updated_at,activated_at)
SELECT actor,actor,'Synthetic F16 operator','HUMAN','ACTIVE',0,now(),now(),now()
FROM (VALUES ('f16-operator-a'),('f16-operator-b'),('f16-operator-c')) AS actors(actor);
INSERT INTO hidra_identity_local_credential(id,user_id,password_hash,credential_status,created_at,updated_at)
SELECT gen_random_uuid()::text,id,:'password_hash','ACTIVE',now(),now()
FROM hidra_identity_user WHERE id IN ('f16-operator-a','f16-operator-b','f16-operator-c');

-- All three operators receive identical ordinary route permissions.
INSERT INTO hidra_identity_user_permission_grant
(id,user_id,permission_id,effect,scope_type,scope_reference_id,grant_reason,emergency_access,valid_from,valid_to,status,created_at)
SELECT gen_random_uuid()::text,u.id,p.id,'GRANT','GLOBAL',NULL,'Synthetic F16 route grant',false,now()-interval '1 hour',now()+interval '2 hours','ACTIVE',now()
FROM hidra_identity_user u CROSS JOIN hidra_identity_permission p
WHERE u.id IN ('f16-operator-a','f16-operator-b','f16-operator-c')
  AND p.code IN ('alarm:alarms:read','alarm:alarms:execute','identity:me:read','security:permissions:read');

-- Company and exact FACILITY grants are deliberately different.
INSERT INTO hidra_identity_user_permission_grant
(id,user_id,permission_id,effect,scope_type,scope_reference_id,grant_reason,emergency_access,valid_from,valid_to,status,created_at)
SELECT gen_random_uuid()::text,actors.actor,p.id,'GRANT',sc.kind,sc.ref,'Synthetic F16 paired grant',false,now()-interval '1 hour',now()+interval '2 hours','ACTIVE',now()
FROM (VALUES ('f16-operator-a','f16-company-a','f16-facility-a'),
             ('f16-operator-b','f16-company-a','f16-facility-b'),
             ('f16-operator-c','f16-company-b','f16-facility-c')) AS actors(actor,company,facility)
CROSS JOIN hidra_identity_permission p
CROSS JOIN LATERAL (VALUES ('CUSTOM','alarm-company:' || actors.company),('FACILITY',actors.facility)) AS sc(kind,ref)
WHERE p.code IN ('alarm:alarms:read','alarm:alarms:execute');
COMMIT;
