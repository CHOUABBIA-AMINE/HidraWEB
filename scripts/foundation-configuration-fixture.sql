-- Disposable W3 catalog/credential provisioning only. Business definitions/values/flags use APIs.
\set ON_ERROR_STOP on
BEGIN;
DO $$ DECLARE t text; BEGIN
 IF current_database()<>'hidra_foundation_w1' THEN RAISE EXCEPTION 'Exact disposable database required'; END IF;
 FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'hidra_configuration_%' LOOP
  EXECUTE format('GRANT INSERT,UPDATE ON public.%I TO w2_app',t);
 END LOOP;
END $$;
INSERT INTO public.hidra_configuration_namespace(id,code,name_fr,status,created_at,updated_at)
VALUES('w3-synthetic-namespace','W3_SYNTHETIC','W3 synthetic configuration','ACTIVE',now(),now());
COMMIT;
