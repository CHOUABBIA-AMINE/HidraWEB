-- W2 disposable credential/catalog fixture. No business object is created here.
\set ON_ERROR_STOP on
BEGIN;
DO $$
DECLARE r text; t text;
BEGIN
 IF current_database() <> 'hidra_foundation_w1' THEN RAISE EXCEPTION 'Disposable foundation database required'; END IF;
 REVOKE CREATE ON SCHEMA public FROM PUBLIC;
 FOREACH r IN ARRAY ARRAY['w2_app','w2_installed','w2_setup','w2_configuration'] LOOP
  EXECUTE format('CREATE ROLE %I LOGIN NOSUPERUSER NOBYPASSRLS NOCREATEROLE NOCREATEDB NOREPLICATION PASSWORD %L',r,'hidra-w1-ci');
  EXECUTE format('GRANT USAGE ON SCHEMA public TO %I',r);
  EXECUTE format('GRANT SELECT ON ALL TABLES IN SCHEMA public TO %I',r);
 END LOOP;
 -- Ordinary owner APIs used by W1 retain their existing tables. No protected
 -- Topology DML or publisher membership is inherited by the ordinary login.
 FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND (tablename LIKE 'hidra_identity_%' OR tablename LIKE 'hidra_party_%' OR tablename LIKE 'hidra_org_%' OR tablename LIKE 'hidra_audit_%') LOOP
  EXECUTE format('GRANT INSERT,UPDATE,DELETE ON public.%I TO w2_app',t);
 END LOOP;
 REVOKE INSERT,UPDATE,DELETE ON public.hidra_identity_external_mapping_generation FROM w2_app;
 -- Exact Identity lock ledger from JdbcIdentityAuthorityFence at the API pin.
 FOREACH r IN ARRAY ARRAY['w2_installed','w2_setup','w2_configuration'] LOOP
  FOREACH t IN ARRAY ARRAY['attribute_definition','authorization_policy','authorization_policy_rule','authorization_policy_version','external_group_mapping','external_identity','external_permission_mapping','external_role_mapping','group','group_role_grant','local_credential','login_session','operation_binding','permission','provider','role','role_permission_grant','subject_security_attribute','user','user_group_membership','user_permission_grant','user_role_grant','bound_source_claim_evidence'] LOOP
   EXECUTE format('GRANT UPDATE ON public.%I TO %I','hidra_identity_'||t,r);
  END LOOP;
 END LOOP;
 FOREACH t IN ARRAY ARRAY['installed_unit','installed_unit_installation','installed_unit_installation_event','installed_unit_operation_request'] LOOP
  EXECUTE format('GRANT INSERT,UPDATE ON public.%I TO w2_installed','hidra_topology_'||t);
 END LOOP;
 FOREACH t IN ARRAY ARRAY['pipeline_system','pipeline_system_type','pipeline_type','facility','facility_type','equipment','equipment_type','foundation_system_owner','foundation_request','engineering_context','installed_unit_installation','station_graph_revision','station_graph_head','station_graph_operation_event','installed_unit'] LOOP
  EXECUTE format('GRANT UPDATE ON public.%I TO w2_setup','hidra_topology_'||t);
 END LOOP;
 GRANT UPDATE ON public.hidra_party_party TO w2_setup;
 FOREACH t IN ARRAY ARRAY['pipeline_system','facility','equipment','foundation_system_owner','foundation_request','station_graph_revision','station_graph_head','station_graph_operation_event'] LOOP
  EXECUTE format('GRANT INSERT ON public.%I TO w2_setup','hidra_topology_'||t);
 END LOOP;
 FOREACH t IN ARRAY ARRAY['engineering_context','engineering_draft','engineering_draft_version','engineering_graph_snapshot','engineering_survey_snapshot','pipeline','pipeline_type','pipeline_segment','pipeline_authoring_revision','pipeline_graph_snapshot','pipeline_graph_binding'] LOOP
  EXECUTE format('GRANT SELECT,INSERT,UPDATE ON public.%I TO w2_setup','hidra_topology_'||t);
 END LOOP;
 FOREACH t IN ARRAY ARRAY['engineering_graph_snapshot','engineering_survey_snapshot','pipeline_authoring_revision','pipeline_graph_snapshot','pipeline_graph_binding','foundation_system_owner','foundation_request','station_configuration_revision'] LOOP
  EXECUTE format('REVOKE ALL ON public.%I FROM w2_app','hidra_topology_'||t);
 END LOOP;
 FOREACH t IN ARRAY ARRAY['station_configuration_revision','station_configuration_member','station_configuration_request'] LOOP
  EXECUTE format('GRANT INSERT ON public.%I TO w2_configuration','hidra_topology_'||t);
 END LOOP;
 GRANT INSERT,UPDATE ON public.hidra_topology_station_configuration_head TO w2_configuration;
 GRANT EXECUTE ON FUNCTION public.hidra_station_configuration_lock_sources() TO w2_configuration;
END $$;
CREATE ROLE w2_party_lock NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS NOCREATEROLE NOCREATEDB NOREPLICATION;
GRANT USAGE,CREATE ON SCHEMA public TO w2_party_lock;
GRANT UPDATE ON public.hidra_party_party,public.hidra_party_role,public.hidra_party_role_assignment,public.hidra_party_manufacturer_profile TO w2_party_lock;
ALTER FUNCTION public.hidra_party_lock_installed_unit_manufacturer_evidence() OWNER TO w2_party_lock;
REVOKE CREATE ON SCHEMA public FROM w2_party_lock;
GRANT EXECUTE ON FUNCTION public.hidra_party_lock_installed_unit_manufacturer_evidence() TO w2_installed;
CREATE ROLE w2_position_lock NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS NOCREATEROLE NOCREATEDB NOREPLICATION;
GRANT USAGE,CREATE ON SCHEMA public TO w2_position_lock;
GRANT UPDATE ON public.hidra_topology_equipment,public.hidra_topology_facility TO w2_position_lock;
ALTER FUNCTION public.hidra_topology_lock_installed_unit_position_ownership() OWNER TO w2_position_lock;
REVOKE CREATE ON SCHEMA public FROM w2_position_lock;
GRANT EXECUTE ON FUNCTION public.hidra_topology_lock_installed_unit_position_ownership() TO w2_installed;
INSERT INTO public.hidra_topology_pipeline_system_type(id,code,name_en,active,created_at,updated_at) VALUES('w2-gas','W2_GAS','Synthetic gas system',true,now(),now());
INSERT INTO public.hidra_topology_pipeline_type(id,code,name_en,active,created_at,updated_at) VALUES('w2-pipe','W2_PIPE','Synthetic gas Pipeline',true,now(),now());
INSERT INTO public.hidra_topology_facility_type(id,code,name,facility_kind,status,created_at,updated_at) VALUES('w2-compressor','W2_COMPRESSOR','Synthetic compressor station','COMPRESSOR_STATION','ACTIVE',now(),now());
INSERT INTO public.hidra_topology_equipment_type(id,code,name,status,created_at,updated_at) VALUES('w2-compressor-kind','W2_COMPRESSOR','Synthetic compressor','ACTIVE',now(),now());
COMMIT;
