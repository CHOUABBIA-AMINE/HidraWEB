import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type {
  PartyAdministrationPage, PartyAdministrationView, PartyAdministrationChoice,
  PartyAdministrationHistory, PartyAdministrationTransition, PartyAdministrationMetadata,
  RegisterPartyRequest, PartyResponse, AssignPartyRoleRequest,
} from '@/api/generated/party/model';
const path = (id: string) => `/api/v1/party/parties/${encodeURIComponent(id)}`;
export function searchParties(q = '', roleId = '', eligibleOnly = false, offset = 0, typeId = '') {
  return hidraHttpClient<PartyAdministrationPage>({ method: 'GET', url: '/api/v1/party/parties', params: { q: q || undefined, roleId: roleId || undefined, typeId: typeId || undefined, eligibleOnly, offset, limit: 20 } });
}
export const fetchParty = (id: string) => hidraHttpClient<PartyAdministrationView>({ method: 'GET', url: path(id) });
export const fetchPartyTypes = (language: string) => hidraHttpClient<PartyAdministrationChoice[]>({ method: 'GET', url: '/api/v1/party/reference/party-types', params: { language } });
export const fetchPartyRoles = (language: string) => hidraHttpClient<PartyAdministrationChoice[]>({ method: 'GET', url: '/api/v1/party/reference/party-roles', params: { language } });
export const registerParty = (data: RegisterPartyRequest) => hidraHttpClient<PartyResponse>({ method: 'POST', url: '/api/v1/party/parties', data });
export const assignPartyRole = (data: AssignPartyRoleRequest) => hidraHttpClient<string>({ method: 'POST', url: '/api/v1/party/roles/assignments', data });
export const editParty = (id: string, data: PartyAdministrationMetadata) => hidraHttpClient<PartyAdministrationView>({ method: 'PUT', url: path(id), data });
export const transitionParty = (id: string, activate: boolean, data: PartyAdministrationTransition) => hidraHttpClient<PartyAdministrationView>({ method: 'POST', url: `${path(id)}/${activate ? 'activate' : 'deactivate'}`, data });
export const fetchPartyHistory = (id: string, offset = 0) => hidraHttpClient<PartyAdministrationHistory[]>({ method: 'GET', url: `${path(id)}/history`, params: { offset, limit: 20 } });
