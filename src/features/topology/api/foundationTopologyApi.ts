// Source-pinned generated transport only. Every protected owner operation uses
// NOWAIT over the same Identity ledger: serialize panel requests, never retry.
import * as generated from '@/api/generated/topology/topology';
let tail: Promise<void> = Promise.resolve();
function serialized<A extends unknown[], R>(call: (...args: A) => Promise<R>) {
  return (...args: A): Promise<R> => {
    const result = tail.then(() => call(...args));
    tail = result.then(() => undefined, () => undefined);
    return result;
  };
}
export const activateFoundationFacility = serialized(generated.activateFoundationFacility);
export const authorProtectedStationGraphRevision = serialized(generated.authorProtectedStationGraphRevision);
export const createEngineeringNetworkDraft = serialized(generated.createEngineeringNetworkDraft);
export const discoverFoundationTopologyChoices = serialized(generated.discoverFoundationTopologyChoices);
export const discoverTopologyCurrentInstallations = serialized(generated.discoverTopologyCurrentInstallations);
export const discoverTopologyEquipmentPositions = serialized(generated.discoverTopologyEquipmentPositions);
export const discoverTopologyFoundationChoices = serialized(generated.discoverTopologyFoundationChoices);
export const listInstalledStationConfigurationHistory = serialized(generated.listInstalledStationConfigurationHistory);
export const publishProtectedStationGraphRevision = serialized(generated.publishProtectedStationGraphRevision);
export const readCurrentInstalledStationConfiguration = serialized(generated.readCurrentInstalledStationConfiguration);
export const readCurrentProtectedStationGraphRevision = serialized(generated.readCurrentProtectedStationGraphRevision);
export const readEngineeringNetworkDraft = serialized(generated.readEngineeringNetworkDraft);
export const readFoundationAuthoredTopology = serialized(generated.readFoundationAuthoredTopology);
export const readInstalledUnit = serialized(generated.readInstalledUnit);
export const recordInstalledUnitInstallation = serialized(generated.recordInstalledUnitInstallation);
export const registerFoundationFacility = serialized(generated.registerFoundationFacility);
export const registerFoundationPipelineSystem = serialized(generated.registerFoundationPipelineSystem);
export const registerInstalledUnit = serialized(generated.registerInstalledUnit);
export const registerTopologyEquipmentPosition = serialized(generated.registerTopologyEquipmentPosition);
export const saveInstalledStationConfiguration = serialized(generated.saveInstalledStationConfiguration);
export const writeFoundationPipelineAndGraph = serialized(generated.writeFoundationPipelineAndGraph);
