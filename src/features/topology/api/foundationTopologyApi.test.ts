import { expect, it, vi } from 'vitest';
const native=vi.hoisted(()=>({choices:vi.fn(),write:vi.fn()}));
vi.mock('@/api/generated/topology/topology',()=>({discoverTopologyFoundationChoices:native.choices,registerFoundationPipelineSystem:native.write,
 activateFoundationFacility:vi.fn(),authorProtectedStationGraphRevision:vi.fn(),createEngineeringNetworkDraft:vi.fn(),discoverFoundationTopologyChoices:vi.fn(),discoverTopologyCurrentInstallations:vi.fn(),discoverTopologyEquipmentPositions:vi.fn(),listInstalledStationConfigurationHistory:vi.fn(),publishProtectedStationGraphRevision:vi.fn(),readCurrentInstalledStationConfiguration:vi.fn(),readCurrentProtectedStationGraphRevision:vi.fn(),readEngineeringNetworkDraft:vi.fn(),readFoundationAuthoredTopology:vi.fn(),readInstalledUnit:vi.fn(),recordInstalledUnitInstallation:vi.fn(),registerFoundationFacility:vi.fn(),registerInstalledUnit:vi.fn(),registerTopologyEquipmentPosition:vi.fn(),saveInstalledStationConfiguration:vi.fn(),writeFoundationPipelineAndGraph:vi.fn()}));
import { discoverTopologyFoundationChoices, registerFoundationPipelineSystem } from './foundationTopologyApi';
it('serializes mounted-panel native calls, propagates refusal and never retries a failed command',async()=>{
 let release:()=>void=()=>{};
 native.choices.mockImplementationOnce(()=>new Promise(resolve=>{release=()=>resolve({items:[]});})).mockResolvedValue({items:[]});
 const refused=new Error('owner refusal');native.write.mockRejectedValueOnce(refused);
 const first=discoverTopologyFoundationChoices('SYSTEMS',{companyPartyId:'company'});
 const second=registerFoundationPipelineSystem({companyPartyId:'company',requestId:'synthetic'});const rejected=expect(second).rejects.toBe(refused);
 const third=discoverTopologyFoundationChoices('FACILITIES',{companyPartyId:'company'});
 await vi.waitFor(()=>expect(native.choices).toHaveBeenCalledTimes(1));expect(native.write).not.toHaveBeenCalled();
 release();await first;await rejected;await third;
 expect(native.choices).toHaveBeenCalledTimes(2);expect(native.write).toHaveBeenCalledTimes(1);
});
