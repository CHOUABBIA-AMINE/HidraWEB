-- Synthetic W4 security/reference setup, invoked only AFTER the seven W1-W3 cases.
\set ON_ERROR_STOP on
BEGIN;
DO $$
DECLARE t text; item record;
BEGIN
 IF current_database()<>'hidra_foundation_w1' THEN RAISE EXCEPTION 'Exact disposable database required'; END IF;
 FOREACH t IN ARRAY ARRAY['hidra_workflow_instance','hidra_workflow_task'] LOOP
  EXECUTE format('GRANT INSERT,UPDATE ON public.%I TO w2_app',t);
 END LOOP;
 GRANT INSERT ON public.hidra_workflow_action,public.hidra_workflow_state_history TO w2_app;
 REVOKE SELECT ON public.hidra_topology_installed_characteristic_revision FROM w2_app;
 FOREACH t IN ARRAY ARRAY['hidra_workflow_action','hidra_workflow_definition','hidra_workflow_definition_target_binding','hidra_workflow_instance','hidra_workflow_state_history','hidra_workflow_step','hidra_workflow_task','hidra_workflow_transition','hidra_workflow_type_catalog','hidra_party_eligibility_generation','hidra_party_manufacturer_source_authorization'] LOOP
  EXECUTE format('GRANT UPDATE ON public.%I TO w2_installed',t);
 END LOOP;
 GRANT INSERT ON public.hidra_topology_installed_characteristic_revision,public.hidra_topology_installed_characteristic_request,public.hidra_topology_installed_characteristic_approval,public.hidra_topology_installed_characteristic_approval_request TO w2_installed;
 GRANT INSERT,UPDATE ON public.hidra_topology_installed_characteristic_head TO w2_installed;
 -- Temporary source publication capability: prepare script revokes before link writes.
 GRANT INSERT ON public.hidra_simulation_manufacturer_characteristic_revision,public.hidra_simulation_manufacturer_characteristic_qualification TO w2_installed;
 FOR item IN SELECT * FROM (VALUES
  ('w4_party_lock','hidra_party_manufacturer_authorization_lock',ARRAY['hidra_party_party','hidra_party_eligibility_generation','hidra_party_role','hidra_party_role_assignment','hidra_party_manufacturer_profile','hidra_party_manufacturer_source_authorization']),
  ('w4_manufacturer_lock','hidra_simulation_manufacturer_lock_sources',ARRAY['hidra_simulation_manufacturer_characteristic_revision','hidra_simulation_manufacturer_characteristic_qualification']),
  ('w4_link_lock','hidra_topology_characteristic_lock_sources',ARRAY['hidra_simulation_manufacturer_characteristic_revision','hidra_topology_installed_unit','hidra_topology_installed_characteristic_revision','hidra_topology_installed_characteristic_head','hidra_topology_installed_characteristic_request']),
  ('w4_approval_lock','hidra_topology_characteristic_lock_approval_sources',ARRAY['hidra_simulation_manufacturer_characteristic_revision','hidra_topology_installed_unit','hidra_topology_installed_unit_installation','hidra_topology_installed_characteristic_revision','hidra_topology_installed_characteristic_head','hidra_topology_installed_characteristic_request','hidra_topology_installed_characteristic_approval','hidra_topology_installed_characteristic_approval_request'])
 ) AS x(role_name,function_name,relations) LOOP
  EXECUTE format('CREATE ROLE %I NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS NOCREATEROLE NOCREATEDB NOREPLICATION',item.role_name);
  EXECUTE format('GRANT USAGE,CREATE ON SCHEMA public TO %I',item.role_name);
  FOREACH t IN ARRAY item.relations LOOP EXECUTE format('GRANT UPDATE ON public.%I TO %I',t,item.role_name); END LOOP;
  EXECUTE format('ALTER FUNCTION public.%I() OWNER TO %I',item.function_name,item.role_name);
  EXECUTE format('REVOKE CREATE ON SCHEMA public FROM %I',item.role_name);
  EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I() TO w2_installed',item.function_name);
 END LOOP;
END $$;
COMMIT;
