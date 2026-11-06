import { cleanup,fireEvent,render,screen,waitFor } from '@testing-library/react';
import { QueryClient,QueryClientProvider } from '@tanstack/react-query';
import { afterEach,beforeEach,expect,it,vi } from 'vitest';
import { ConfigurationAdministrationPage } from './ConfigurationAdministrationPage';
import * as api from './api/configurationApi';
const authority=vi.hoisted(()=>({admin:true}));
vi.mock('@/features/permissions/usePermissions',()=>({usePermissions:()=>({status:'ready',can:()=>authority.admin})}));
vi.mock('./api/configurationApi',()=>Object.fromEntries(['namespaces','definitions','definition','activateDefinition','values','effective','flags','activateFlag','flagState','setFlagState','createConfigurationDefinition','createFeatureFlag','setConfigurationValue'].map(n=>[n,vi.fn()])));
afterEach(cleanup);
beforeEach(()=>{vi.resetAllMocks();authority.admin=true;vi.mocked(api.namespaces).mockResolvedValue([{id:'ns',label:'Synthetic'}]);vi.mocked(api.definitions).mockResolvedValue([{id:'def',key:'runtime.test'}]);vi.mocked(api.flags).mockResolvedValue([]);vi.mocked(api.values).mockResolvedValue([]);});
function show(){render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}})}><ConfigurationAdministrationPage/></QueryClientProvider>);}
async function pick(label:string,name:RegExp){fireEvent.mouseDown(screen.getByLabelText(label));fireEvent.click(await screen.findByRole('option',{name}));}
it('makes no protected choice or count query without current administrator authority',()=>{authority.admin=false;show();expect(screen.getByText(/Current Configuration administrator/)).toBeVisible();expect(api.namespaces).not.toHaveBeenCalled();expect(api.flags).not.toHaveBeenCalled();});
it('pins server versions, derives actor on the server and requires review after a refused command',async()=>{
 vi.mocked(api.definition).mockResolvedValue({id:'def',key:'runtime.test',status:'ACTIVE',valueType:'NUMBER',sensitivity:'INTERNAL',activeVersionId:'v7'});
 vi.mocked(api.effective).mockResolvedValue({value:'12.5',provenance:'DEFAULT'});
 vi.mocked(api.setConfigurationValue).mockRejectedValue(new Error('owner refusal'));
 show();await pick('Namespace',/Synthetic/);await pick('Definition',/runtime.test/);await screen.findByText(/Definition status: ACTIVE/);
 fireEvent.change(screen.getByLabelText('Override value'),{target:{value:'42.250'}});fireEvent.click(screen.getByLabelText('I confirm this contains no confidential or secret material'));
 fireEvent.click(screen.getByText('Set configuration value'));await waitFor(()=>expect(api.setConfigurationValue).toHaveBeenCalledTimes(1));
 const body=vi.mocked(api.setConfigurationValue).mock.calls[0][0];expect(body.definitionVersionId).toBe('v7');expect(body.rawValue).toBe('42.250');expect(body.createdByActorId).toBeUndefined();
 await screen.findByText('Configuration operation failed.');expect(screen.getByText('Set configuration value')).toBeDisabled();expect(api.setConfigurationValue).toHaveBeenCalledTimes(1);
});
it('renders confidential metadata without displaying values or enabling writes',async()=>{
 vi.mocked(api.definition).mockResolvedValue({id:'def',status:'ACTIVE',valueType:'STRING',sensitivity:'RESTRICTED',redacted:true,activeVersionId:'v7'});vi.mocked(api.effective).mockResolvedValue({redacted:true,provenance:'REDACTED'});
 show();await pick('Namespace',/Synthetic/);await pick('Definition',/runtime.test/);await screen.findByText('Confidential definition: metadata only.');expect(screen.getByText('Set configuration value')).toBeDisabled();expect(screen.queryByText(/secretReference|jsonValue/)).not.toBeInTheDocument();
});
