-- F18 only. Seed catalog references before real audited LOCAL bootstrap.
\set ON_ERROR_STOP on
BEGIN;
DO $$
BEGIN
    IF current_database() <> 'hidra_local_session_f18' THEN
        RAISE EXCEPTION 'F18 requires its exact disposable database';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.flyway_schema_history WHERE success) THEN
        RAISE EXCEPTION 'Apply the pinned Flyway chain before F18 fixtures';
    END IF;
END $$;

INSERT INTO public.hidra_audit_catalog_entry
    (id,catalog_name,code,active,sort_order,system_defined,created_at,updated_at)
VALUES
    ('IDENTITY_LOCAL_ADMIN_BOOTSTRAP','EVENT_TYPE','F18_SYNTHETIC_ADMIN_BOOTSTRAP',true,0,false,now(),now()),
    ('SECURITY_ADMINISTRATION','EVENT_CATEGORY','F18_SYNTHETIC_SECURITY_ADMIN',true,0,false,now(),now());

INSERT INTO public.hidra_identity_provider
    (id,code,name,provider_type,sync_enabled,just_in_time_provisioning_enabled,status,created_at,updated_at)
SELECT 'f18-local-provider','F18_SYNTHETIC_LOCAL','Synthetic F18 LOCAL','LOCAL',false,false,'ACTIVE',now(),now()
WHERE NOT EXISTS (
    SELECT 1 FROM public.hidra_identity_provider WHERE provider_type='LOCAL' AND status='ACTIVE'
);

INSERT INTO public.hidra_identity_permission
    (id,code,permission_domain,resource_type,action,sensitive,status,created_at,updated_at)
VALUES ('f18-permission-metadata','security:permissions:read','security','PERMISSIONS','read',false,'ACTIVE',now(),now())
ON CONFLICT (code) DO NOTHING;
COMMIT;
