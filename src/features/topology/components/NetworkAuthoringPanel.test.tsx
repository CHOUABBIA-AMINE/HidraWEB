import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NetworkAuthoringPanel } from './NetworkAuthoringPanel';
import { PipelineEditor } from './PipelineEditor';
import { HidraApiError } from '@/api/errors/HidraApiError';
import * as api from '../api/foundationTopologyApi';
const auth=vi.hoisted(()=>({allowed:true}));
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key})}));
vi.mock('@/features/permissions/usePermissions',()=>({usePermissions:()=>({can:()=>auth.allowed})}));
vi.mock('@/features/party/components/PartySelector',()=>({PartySelector:({onChange}:{onChange:(id:string)=>void})=><button onClick={()=>onChange('company')}>select-company</button>}));
vi.mock('./InstalledUnitPanel',()=>({InstalledUnitPanel:()=> <div>active-station-readers</div>}));
vi.mock('../api/foundationTopologyApi',()=>({registerFoundationFacility:vi.fn(),activateFoundationFacility:vi.fn(),discoverTopologyFoundationChoices:vi.fn(),discoverFoundationTopologyChoices:vi.fn(),readFoundationAuthoredTopology:vi.fn(),writeFoundationPipelineAndGraph:vi.fn()}));
function show(child:React.ReactNode){return render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}})}><MemoryRouter>{child}</MemoryRouter></QueryClientProvider>);}
beforeEach(()=>{vi.resetAllMocks();auth.allowed=true;});
afterEach(cleanup);
it('makes no owner query before current permission and company selection',async()=>{
 auth.allowed=false;const view=show(<NetworkAuthoringPanel/>);expect(screen.getByText('topology.editor.denied')).toBeVisible();expect(api.discoverTopologyFoundationChoices).not.toHaveBeenCalled();view.unmount();auth.allowed=true;show(<NetworkAuthoringPanel/>);expect(api.discoverTopologyFoundationChoices).not.toHaveBeenCalled();
 vi.mocked(api.discoverTopologyFoundationChoices).mockResolvedValue({items:[]});fireEvent.click(screen.getByText('select-company'));await waitFor(()=>expect(api.discoverTopologyFoundationChoices).toHaveBeenCalledWith('SYSTEMS',expect.objectContaining({companyPartyId:'company',limit:50})));
});
it('loads exact scope, saves expected versions and requires review after a rejected write',async()=>{
 const persisted={geometryStatus:'NOT_SUPPLIED',graph:{version:4,nodes:[{id:'a',kind:'JUNCTION'},{id:'b',kind:'JUNCTION'}],ports:[{id:'out',nodeId:'a',direction:'OUTLET'},{id:'in',nodeId:'b',direction:'INLET'}],branches:[{id:'pipe',kind:'PIPE',fromPortId:'out',toPortId:'in'}]},bindings:[{branchId:'pipe',pipeline:{id:'pipeline',code:'GZ2',revision:3}}]};
 vi.mocked(api.readFoundationAuthoredTopology).mockResolvedValue(persisted);vi.mocked(api.discoverFoundationTopologyChoices).mockResolvedValue({pipelines:[{id:'pipeline',code:'GZ2',pipelineTypeId:'gas',revision:3}],pipelineTypes:[{id:'gas',code:'GAS'}]});vi.mocked(api.writeFoundationPipelineAndGraph).mockRejectedValue(new HidraApiError('stale',{status:409}));
 show(<PipelineEditor company="company" system="system" draftId="draft"/>);await screen.findByText(/NOT_SUPPLIED/);expect(api.readFoundationAuthoredTopology).toHaveBeenCalledWith('draft',{companyPartyId:'company',pipelineSystemId:'system'});
 fireEvent.mouseDown(screen.getByLabelText('topology.editor.pipelineChoice'));fireEvent.click(await screen.findByRole('option',{name:/GZ2/}));
 // Editing adds a junction without modifying the loaded owner revision.
 fireEvent.click(screen.getByText('topology.editor.addJunction'));
 fireEvent.change(screen.getByLabelText('topology.editor.pipelineCode'),{target:{value:'GZ2-R'}});
 fireEvent.mouseDown(screen.getByLabelText('topology.editor.pipelineType'));fireEvent.click(await screen.findByRole('option',{name:/GAS/}));
 fireEvent.click(screen.getByText('topology.editor.saveGraph'));await waitFor(()=>expect(api.writeFoundationPipelineAndGraph).toHaveBeenCalledTimes(1));
 expect(vi.mocked(api.writeFoundationPipelineAndGraph).mock.calls[0][1].graph?.expectedVersion).toBe(4);
 await screen.findByText('topology.editor.failed');expect(screen.getByText('topology.editor.saveGraph')).toBeDisabled();expect(api.writeFoundationPipelineAndGraph).toHaveBeenCalledTimes(1);
 fireEvent.click(screen.getByText('topology.editor.reload'));await waitFor(()=>expect(api.readFoundationAuthoredTopology).toHaveBeenCalledTimes(2));expect(api.writeFoundationPipelineAndGraph).toHaveBeenCalledTimes(1);
});

it.each([true,false])('waits for committed ACTIVE status before mounting station readers (activation succeeds: %s)',async(success)=>{
 const planned={id:'station',code:'STATION',status:'PLANNED',updatedAt:'2026-11-06T12:00:00Z'};
 vi.mocked(api.discoverTopologyFoundationChoices).mockImplementation(async catalog=>({items:catalog==='FACILITY_TYPES'?[{id:'compressor',code:'COMPRESSOR',kind:'COMPRESSOR_STATION'}]:[]}));
 vi.mocked(api.registerFoundationFacility).mockResolvedValue({items:[planned]});
 if(success)vi.mocked(api.activateFoundationFacility).mockResolvedValue({items:[{...planned,status:'ACTIVE'}]});
 else vi.mocked(api.activateFoundationFacility).mockRejectedValue(new HidraApiError('refused',{status:403}));
 show(<NetworkAuthoringPanel/>);fireEvent.click(screen.getByText('select-company'));
 fireEvent.change(screen.getByLabelText('topology.editor.code'),{target:{value:'STATION'}});
 fireEvent.change(screen.getByLabelText('topology.editor.reason'),{target:{value:'synthetic operator review'}});
 fireEvent.click(screen.getByText('topology.editor.FACILITY_TYPES'));
 fireEvent.mouseDown(await screen.findByLabelText('topology.editor.facilityType'));fireEvent.click(await screen.findByRole('option',{name:/COMPRESSOR/}));
 fireEvent.click(screen.getByText('topology.editor.createFacility'));
 await waitFor(()=>expect(screen.getByText('topology.editor.activate')).toBeEnabled());
 expect(screen.queryByText('active-station-readers')).not.toBeInTheDocument();
 fireEvent.click(screen.getByText('topology.editor.activate'));
 await waitFor(()=>expect(api.activateFoundationFacility).toHaveBeenCalledWith('station',expect.objectContaining({companyPartyId:'company',expectedUpdatedAt:planned.updatedAt})));
 if(success)expect(await screen.findByText('active-station-readers')).toBeVisible();
 else {await screen.findByText('topology.editor.review');expect(screen.queryByText('active-station-readers')).not.toBeInTheDocument();}
});
