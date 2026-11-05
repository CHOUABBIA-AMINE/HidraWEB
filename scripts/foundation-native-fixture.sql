-- W1-only synthetic catalogs. Never run against an existing or production database.
\set ON_ERROR_STOP on
BEGIN;
DO $$
BEGIN
    IF current_database() <> 'hidra_foundation_w1' THEN
        RAISE EXCEPTION 'W1 fixture requires its exact disposable database';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.flyway_schema_history WHERE success) THEN
        RAISE EXCEPTION 'Run the pinned API Flyway chain before W1 catalogs';
    END IF;
END $$;

-- The real audited bootstrap requires these exact reference IDs/families. Seed
-- catalogs only; the bootstrap itself must create the committed audit event.
INSERT INTO public.hidra_audit_catalog_entry
(id,catalog_name,code,active,sort_order,system_defined,created_at,updated_at)
VALUES
('IDENTITY_LOCAL_ADMIN_BOOTSTRAP','EVENT_TYPE','W1_SYNTHETIC_ADMIN_BOOTSTRAP',true,0,false,now(),now()),
('SECURITY_ADMINISTRATION','EVENT_CATEGORY','W1_SYNTHETIC_SECURITY_ADMIN',true,0,false,now(),now());

-- The real bootstrap provisions its administrator/credential/grant; only provide
-- the active LOCAL provider needed for actual native authentication routing.
INSERT INTO public.hidra_identity_provider
(id,code,name,provider_type,sync_enabled,just_in_time_provisioning_enabled,status,created_at,updated_at)
SELECT 'w1-native-local-provider','W1_SYNTHETIC_LOCAL','Synthetic W1 LOCAL','LOCAL',false,false,'ACTIVE',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM public.hidra_identity_provider WHERE provider_type='LOCAL' AND status='ACTIVE');

INSERT INTO public.hidra_party_type(id,code,status,created_at,updated_at)
VALUES ('w1-synthetic-party-type','W1_SYNTHETIC','ACTIVE',now(),now());
INSERT INTO public.hidra_party_type_translation(id,party_type_id,language_code,label,created_at,updated_at)
VALUES ('w1-synthetic-party-type-fr','w1-synthetic-party-type','fr','Entité synthétique W1',now(),now());
INSERT INTO public.hidra_party_role(id,code,qualification_required_by_default,status,created_at,updated_at)
VALUES ('w1-synthetic-party-role','W1_SYNTHETIC_OWNER',false,'ACTIVE',now(),now());
INSERT INTO public.hidra_org_unit_type(id,code,kind,name_en,name_fr,active,created_at,updated_at)
VALUES ('w1-synthetic-unit-type','W1_SYNTHETIC_STATION','STATION_UNIT','Synthetic W1 station','Station synthétique W1',true,now(),now());
INSERT INTO public.hidra_org_position(id,code,level,title_en,status,created_at,updated_at)
VALUES ('w1-synthetic-position','W1_SYNTHETIC_ENGINEER','ENGINEER','Synthetic W1 engineer','ACTIVE',now(),now());
COMMIT;
