import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Browser, type Page, type Request, type Response } from '@playwright/test';

type Phase = 'RESPONSE_BEFORE' | 'RESPONSE_AFTER' | 'HSE_AFTER' | 'PLANNING_SUBMIT_REVIEW';
type Draft = { plan: string; revision: string; target: string };
type Row = { [key: string]: unknown; id: string };
type OwnerPage = { content: Row[]; totalElements: number };
type ScopedPage = { items: Row[]; total: number; page: number; size: number };
type Definition = { id: string; version: number; nameFr: string; assignmentChoices: { actorId: string; displayName?: string }[] };
type Fixture = {
  phase: Phase; password: string; company: string; facility: string; siblingFacility: string; foreignCompany: string;
  actors: Record<'primary' | 'sibling' | 'foreign' | 'revocable' | 'foreignFacility', string>;
  alarm: string; manualAlarm: string; candidate: string; incident: string; leakCase: string; evaluation: string; incidentReview: string; leakReview: string; missing: string;
  actor: string; caseNumber: string; caseId: string; capaId: string; closureId: string; assessmentId: string;
  author: string; reviewer: string; sibling: string; foreign: string; foreignFacility: string;
  definition: string; type: string; purpose: string; approveTransition: string; rejectTransition: string; rejectionReason: string;
  approveDraft: Draft; rejectDraft: Draft; priorRevision: string; priorTarget: string;
};
type Session = { page: Page; token: string; grants: string[]; close: () => Promise<void> };
const phase = process.env.HIDRA_UXR29_PHASE as Phase;
const fixturePath = process.env.HIDRA_UXR29_FIXTURE;
const privateDir = process.env.HIDRA_UXR29_PRIVATE_DIR;
if (!fixturePath || !privateDir || !['RESPONSE_BEFORE','RESPONSE_AFTER','HSE_AFTER','PLANNING_SUBMIT_REVIEW'].includes(phase)) throw new Error('Invalid native phase');
const f = JSON.parse(readFileSync(fixturePath, 'utf8')) as Fixture;
if (f.phase !== phase || process.env.HIDRA_E2E_AUTH_MOCK !== '0') throw new Error('Native fixture mismatch');
const origin = 'http://127.0.0.1:5173';
const api = '/api/v1';
const planning = api + '/planning';
const alarm = api + '/alarm/alarms';
const incident = api + '/incident/incidents';
const candidates = api + '/leakdetection/candidates';
const cases = api + '/leakdetection/cases';
const checkpoint = (name: string) => process.stdout.write('UXR29_CHECKPOINT=' + name + '\n');
const enc = encodeURIComponent;
const field = (row: Record<string, unknown>, name: string) => String(row[name] ?? '');

// Only fixed operation labels and numeric HTTP status are exported. Never log
// URLs, IDs, query values, payloads, credentials, headers or error messages.
type DiagnosticOperation = 'ALARM_MANUAL_DETAIL' | 'ALARM_MANUAL_EVIDENCE' | 'INCIDENT_TIMELINE' | 'INCIDENT_INVESTIGATION' | 'INCIDENT_ESCALATION' | 'HSE_CAPA_LIST' | 'HSE_HISTORY' | 'HSE_CAPA_DETAIL' | 'SIGNED_ALARM_MANUAL_EVIDENCE' | 'SIGNED_INCIDENT_TIMELINE' | 'SIGNED_INCIDENT_INVESTIGATION' | 'SIGNED_INCIDENT_ESCALATION' | 'SIGNED_HSE_CAPA_LIST' | 'SIGNED_HSE_HISTORY' | 'SIGNED_HSE_CAPA_DETAIL';
function diagnostic(operation: DiagnosticOperation, result: number | 'WAIT_FAILED') {
  process.stdout.write('UXR29_REQUEST=' + operation + ':' + result + '\n');
}
function at(page: Page, path: string, method = 'GET', params: Record<string,string> = {}, operation?: DiagnosticOperation) {
  const pending = page.waitForResponse(response => {
    const url = new URL(response.url());
    return url.pathname === path && response.request().method() === method &&
      Object.entries(params).every(([key,value]) => url.searchParams.get(key) === value);
  }, { timeout: 30_000 }).then(response => {
    if (operation) diagnostic(operation, response.status());
    return response;
  }, (error: unknown) => {
    if (operation) diagnostic(operation, 'WAIT_FAILED');
    throw error;
  });
  // Parallel waiters are armed before clicks. Handle early rejection until the
  // actual assertion awaits the original promise; never convert failure to success.
  void pending.catch(() => undefined);
  return pending;
}
function read<T>(promise: Promise<Response>): Promise<T> {
  const pending = promise.then(async result => {
    expect(result.status()).toBe(200);
    return await result.json() as T;
  });
  void pending.catch(() => undefined);
  return pending;
}
async function session(browser: Browser, actor: string): Promise<Session> {
  const ctx = await browser.newContext({ locale: 'en-US' });
  const page = await ctx.newPage();
  try {
    await page.goto(origin + '/overview');
    await page.getByLabel(/^Username(?:\s*\*)?$/).fill(actor);
    await page.getByLabel(/^Password(?:\s*\*)?$/).fill(f.password);
    const [login, principal, permissions] = await Promise.all([
      read<{ userId: string; accessToken: string; authenticationType: string }>(at(page, api+'/identity/authentication/login','POST')),
      read<{ userId: string; employeeReferenceId?: string }>(at(page,api+'/identity/me')),
      read<string[]>(at(page,api+'/identity/me/permissions')),
      read<unknown>(at(page,api+'/security/permissions/catalog')),
      read<unknown>(at(page,api+'/security/permissions/routes')),
      page.getByRole('button',{ name:'Sign in',exact:true }).click(),
    ]);
    expect(login.userId === actor && login.authenticationType === 'LOCAL' && Boolean(login.accessToken)).toBe(true);
    expect(principal.userId === actor && Boolean(principal.employeeReferenceId)).toBe(true);
    expect(permissions.includes('security:permissions:read') && !permissions.includes('*')).toBe(true);
    await expect(page).toHaveURL(origin+'/overview');
    return { page, token:login.accessToken, grants: [...permissions].sort(), close:()=>ctx.close() };
  } catch(error) { await ctx.close(); throw error; }
}
async function get<T>(s: Session, path: string, operation?: DiagnosticOperation): Promise<T> {
  const result = await s.page.request.get(origin+path,{ headers:{ Authorization:'Bearer '+s.token } });
  if (operation) diagnostic(operation, result.status());
  expect(result.status()).toBe(200);
  return await result.json() as T;
}
async function deny(s: Session, path: string, protectedIds: string[], method = 'GET', data?: object) {
  const result = await s.page.request.fetch(origin+path,{ method, headers:{ Authorization:'Bearer '+s.token }, ...(data?{data}:{}) });
  expect([403,404]).toContain(result.status());
  // Spring ProblemDetail can repeat the path that the caller already supplied.
  // Strip only this exact echo; never remove any actual returned identifiers.
  let body = await result.text();
  if (body) {
    const payload = JSON.parse(body) as Record<string,unknown>;
    const pathname = new URL(origin+path).pathname;
    for (const key of ['instance','path']) if (payload[key] === pathname) delete payload[key];
    body = JSON.stringify(payload);
  }
  expect(protectedIds.every(id=>!body.includes(id))).toBe(true);
  expect(body.includes('"totalElements"') || body.includes('"total"')).toBe(false);
}
async function maskedList(s: Session, path: string, ids: string[]) {
  const result = await s.page.request.get(origin+path,{headers:{Authorization:'Bearer '+s.token}});
  const body = await result.text();
  expect(ids.every(id=>!body.includes(id))).toBe(true);
  if(result.status()===200) {
    const value=JSON.parse(body) as OwnerPage;
    expect(value.content).toHaveLength(0);
    expect(value.totalElements).toBe(0);
  } else expect([403,404]).toContain(result.status());
}
async function choose(page: Page, label: string, value: string) {
  const control=page.getByRole('combobox',{name:label,exact:true});
  await expect(control).toBeEnabled();
  await control.click();
  await page.getByRole('option').and(page.locator('[data-value='+JSON.stringify(value)+']')).click();
}
async function selectScope(page: Page, company: string, facility: string) {
  await page.getByRole('button',{name:/Operational context/}).click();
  const dialog=page.getByRole('dialog');
  await dialog.getByRole('textbox',{name:'Company ID'}).fill(company);
  const scopes=read<{id:number;type:string;targetId:string}[]>(at(page,api+'/identity/me/regional-access/scopes','GET',{companyPartyId:company}));
  await dialog.getByRole('button',{name:'Discover authorized resources'}).click();
  const found=(await scopes).find(row=>row.type==='FACILITY'&&row.targetId===facility);
  expect(Boolean(found)).toBe(true);
  await choose(page,'Assigned resource',String(found!.id));
  const decision=read<Record<string,unknown>>(at(page,api+'/identity/me/regional-access/FACILITY/'+enc(facility),'GET',{companyPartyId:company}));
  await dialog.getByRole('button',{name:'Verify and apply'}).click();
  expect(await decision).toMatchObject({permitted:true,companyPartyId:company,resourceKind:'FACILITY',resourceId:facility});
  await expect(dialog).toHaveCount(0);
}
async function openRow(page:Page, label:string, button='Open') {
  const row=page.getByRole('row').filter({has:page.getByRole('cell',{name:label,exact:true})});
  await expect(row).toHaveCount(1);
  await row.getByRole('button',{name:button,exact:true}).click();
}
async function handshake() {
  writeFileSync(join(privateDir!,'ready'),'ready\n',{flag:'wx',mode:0o600});
  await expect.poll(()=>existsSync(join(privateDir!,'released')),{timeout:120_000}).toBe(true);
}
function alarmLabel(row:Row) {return field(row,'titleEn')||field(row,'titleFr')||field(row,'titleAr')||field(row,'alarmNumber')||row.id;}
async function responseReads(s:Session) {
  const a=await get<Row>(s,alarm+'/'+enc(f.alarm));
  const i=await get<Row>(s,incident+'/'+enc(f.incident));
  const c=await get<Row>(s,candidates+'/'+enc(f.candidate));
  const l=await get<Row>(s,cases+'/'+enc(f.leakCase));
  for(const [path,id] of [[alarm,f.alarm],[incident,f.incident],[candidates,f.candidate],[cases,f.leakCase]]) {
    const list=await get<OwnerPage>(s,path+'?page=0&size=50');
    expect(list.content.some(row=>row.id===id)).toBe(true);
    expect(list.totalElements).toBe(path === alarm ? 2 : 1);
  }
  expect(a.id===f.alarm&&i.id===f.incident&&c.id===f.candidate&&l.id===f.leakCase).toBe(true);
  checkpoint('SIGNED_READS');
  const p=s.page;
  await p.getByRole('button',{name:'Alarms',exact:true}).click();
  const ev=read<Record<string,unknown>>(at(p,alarm+'/'+enc(f.alarm)+'/evidence'));
  await openRow(p,alarmLabel(a));
  expect(await ev).toMatchObject({alarmId:f.alarm,evaluationId:f.evaluation,currentState:a.currentState});
  await expect(p.getByText('Evaluation ID: '+f.evaluation,{exact:true})).toBeVisible();
  checkpoint('ALARM_EVIDENCE');
  if (phase === 'RESPONSE_BEFORE') {
    const manual=await get<Row>(s,alarm+'/'+enc(f.manualAlarm));
    await p.getByRole('button',{name:'Close',exact:true}).click();
    const manualPath=alarm+'/'+enc(f.manualAlarm);
    const signedMissing=await p.request.get(origin+manualPath+'/evidence',{headers:{Authorization:'Bearer '+s.token}});
    diagnostic('SIGNED_ALARM_MANUAL_EVIDENCE',signedMissing.status());
    expect(signedMissing.status()).toBe(404);
    const manualDetail=read<Row>(at(p,manualPath,'GET',{},'ALARM_MANUAL_DETAIL'));
    const missing=at(p,manualPath+'/evidence','GET',{},'ALARM_MANUAL_EVIDENCE');
    await openRow(p,alarmLabel(manual));
    const [openedManual,missingResponse]=await Promise.all([manualDetail,missing]);
    expect(openedManual.id).toBe(f.manualAlarm);
    expect(missingResponse.status()).toBe(404);
    await expect(p.getByText('Evaluation evidence unavailable.',{exact:true})).toBeVisible();
    await expect(p.getByText('Evaluation ID: '+f.evaluation,{exact:true})).toHaveCount(0);
  }
  await p.getByRole('button',{name:'Events & Incidents',exact:true}).click();
  const incidentPath=incident+'/'+enc(f.incident);
  const signedTimeline=await get<Record<string,unknown>[]>(s,incidentPath+'/timeline','SIGNED_INCIDENT_TIMELINE');
  const signedInvestigation=await get<Record<string,unknown>>(s,incidentPath+'/investigation','SIGNED_INCIDENT_INVESTIGATION');
  const signedEscalation=await get<Record<string,unknown>>(s,incidentPath+'/escalation','SIGNED_INCIDENT_ESCALATION');
  const timeline=read<Record<string,unknown>[]>(at(p,incidentPath+'/timeline','GET',{},'INCIDENT_TIMELINE'));
  const investigation=read<Record<string,unknown>>(at(p,incidentPath+'/investigation','GET',{},'INCIDENT_INVESTIGATION'));
  const escalation=read<Record<string,unknown>>(at(p,incidentPath+'/escalation','GET',{},'INCIDENT_ESCALATION'));
  await openRow(p,field(i,'incidentNumber')||i.id);
  const [history,timelineRows,escalationRow]=await Promise.all([investigation,timeline,escalation]);
  expect(history).toEqual(signedInvestigation);
  expect(timelineRows).toEqual(signedTimeline);
  expect(escalationRow).toEqual(signedEscalation);
  expect(history).toMatchObject({incidentId:f.incident,incidentStatus:'CLOSED',investigationState:'CLOSED',version:6});
  expect(JSON.stringify(history).includes(f.incidentReview)).toBe(true);
  expect(timelineRows.map(row=>row.sourceId).sort()).toEqual([f.alarm,f.candidate].sort());
  expect(escalationRow).toMatchObject({incidentId:f.incident,evaluationId:f.evaluation});
  await expect(p.getByText('Investigation state: CLOSED',{exact:true})).toBeVisible();
  await expect(p.getByText('ID: '+f.incidentReview,{exact:true})).toBeVisible();
  checkpoint('INCIDENT_HISTORY');
  await p.getByRole('tab',{name:'Leak detection'}).click();
  const evidence=read<Record<string,unknown>>(at(p,candidates+'/'+enc(f.candidate)+'/evidence'));
  await openRow(p,field(c,'candidateNumber')||c.id);
  expect(await evidence).toMatchObject({candidateId:f.candidate,evaluationId:f.evaluation});
  await expect(p.getByText('Evaluation ID: '+f.evaluation,{exact:true})).toBeVisible();
  const leak=read<Record<string,unknown>>(at(p,cases+'/'+enc(f.leakCase)+'/investigation'));
  await openRow(p,field(l,'caseNumber')||l.id);
  expect(await leak).toMatchObject({caseId:f.leakCase,candidateId:f.candidate,caseStatus:'DISMISSED',investigationState:'REVIEWED',version:5});
  await expect(p.getByText('ID: '+f.leakReview,{exact:true})).toBeVisible();
  checkpoint('LEAK_HISTORY');
}
async function responseDenied(browser:Browser, role:'sibling'|'foreign', grants: string[]) {
  const s=await session(browser,f.actors[role]);
  try{
    expect(s.grants).toEqual(grants);
    await selectScope(s.page,role==='foreign'?f.foreignCompany:f.company,role==='foreign'?f.actors.foreignFacility:f.siblingFacility);
    for(const [base,id,suffixes] of [[alarm,f.alarm,['','/evidence']],[incident,f.incident,['','/timeline','/investigation','/escalation']],[candidates,f.candidate,['','/evidence']],[cases,f.leakCase,['','/investigation']]] as const) {
      await maskedList(s,base+'?page=0&size=50',[id]);
      for(const suffix of suffixes) await deny(s,base+'/'+enc(id)+suffix,[id,f.evaluation]);
    }
    await s.page.getByRole('button',{name:'Events & Incidents',exact:true}).click();
    await expect(s.page.getByRole('heading',{name:'Events & Incidents'})).toBeVisible();
    await expect(s.page.getByRole('button',{name:'Open',exact:true})).toHaveCount(0);
    await expect(s.page.getByText(new RegExp(f.evaluation))).toHaveCount(0);
  }finally{await s.close();}
}
async function responsePhase(browser:Browser) {
  const s=await session(browser,f.actors.primary);
  try{
    await selectScope(s.page,f.company,f.facility);
    await responseReads(s);
    await responseDenied(browser,'sibling',s.grants); checkpoint('SIBLING_DENIAL');
    await responseDenied(browser,'foreign',s.grants); checkpoint('FOREIGN_DENIAL');
    if(phase==='RESPONSE_BEFORE'){
      await deny(s,alarm+'/'+enc(f.missing)+'/evidence',[f.missing,f.evaluation]);
      await deny(s,alarm+'/'+enc(f.manualAlarm)+'/evidence',[f.manualAlarm,f.evaluation]);
      await deny(s,candidates+'/'+enc(f.missing)+'/evidence',[f.missing,f.evaluation]);
      checkpoint('MISSING_SOURCE');
    }else{
      await selectScope(s.page,f.company,f.siblingFacility);
      await expect(s.page.getByText(new RegExp(f.leakReview))).toHaveCount(0);
      checkpoint('SCOPE_CHANGE');
      const revocable=await session(browser,f.actors.revocable);
      try{
        const detail=await get<Row>(revocable,incident+'/'+enc(f.incident));
        await revocable.page.getByRole('button',{name:'Events & Incidents',exact:true}).click();
        await openRow(revocable.page,field(detail,'incidentNumber')||detail.id);
        await expect(revocable.page.getByText('ID: '+f.incidentReview,{exact:true})).toBeVisible();
        checkpoint('REVOCATION_BEFORE');
        await handshake();
        await deny(revocable,incident+'/'+enc(f.incident)+'/investigation',[f.incident,f.evaluation]);
        await maskedList(revocable,incident+'?page=0&size=50',[f.incident]);
        await revocable.page.getByRole('button',{name:'Refresh',exact:true}).click();
        await expect(revocable.page.getByText(new RegExp(f.incidentReview))).toHaveCount(0);
        await expect(revocable.page.getByRole('button',{name:'Open',exact:true})).toHaveCount(0);
        checkpoint('REVOCATION_AFTER');
      }finally{await revocable.close();}
    }
  }finally{await s.close();}
}
function hseRoot(company=f.company,facility=f.facility){return api+'/hse/companies/'+enc(company)+'/facilities/'+enc(facility)+'/cases';}
async function hsePhase(browser:Browser){
  const s=await session(browser,f.actor);
  try{
    const p=s.page, base=hseRoot();
    await selectScope(p,f.company,f.facility);
    await p.getByRole('button',{name:'Events & Incidents',exact:true}).click();
    const masked=at(p,base,'GET',{page:'0',size:'25'});
    await p.getByRole('tab',{name:'HSE'}).click();
    expect([403,404]).toContain((await masked).status());
    await expect(p.getByText('This resource is unavailable or inaccessible.')).toBeVisible();
    await expect(p.getByText(f.caseId,{exact:true})).toHaveCount(0);
    checkpoint('MASKED_COLLECTION');
    await handshake();
    await p.getByLabel('Case number',{exact:true}).fill(f.caseNumber);
    const discovered=read<ScopedPage>(at(p,base,'GET',{caseNumber:f.caseNumber,page:'0',size:'25'}));
    await p.getByRole('button',{name:'Filter',exact:true}).click();
    const duplicates=await discovered;
    expect(duplicates.total).toBe(2);
    expect(new Set(duplicates.items.map(row=>row.id)).size).toBe(2);
    expect(duplicates.items.every(row=>row.caseNumber===f.caseNumber)).toBe(true);
    const one=await get<ScopedPage>(s,base+'?caseNumber='+enc(f.caseNumber)+'&page=0&size=1');
    const two=await get<ScopedPage>(s,base+'?caseNumber='+enc(f.caseNumber)+'&page=1&size=1');
    expect(one.total===2&&two.total===2&&one.items.length===1&&two.items.length===1&&one.items[0].id!==two.items[0].id).toBe(true);
    checkpoint('DUPLICATE_DISCOVERY');
    const path=base+'/'+enc(f.caseId);
    const signedCapas=await get<ScopedPage>(s,path+'/capas?page=0&size=25','SIGNED_HSE_CAPA_LIST');
    const signedHistory=await get<ScopedPage>(s,path+'/history?page=0&size=25','SIGNED_HSE_HISTORY');
    const signedCapa=await get<Row>(s,path+'/capas/'+enc(f.capaId),'SIGNED_HSE_CAPA_DETAIL');
    const detail=read<Row>(at(p,path));
    const capas=read<ScopedPage>(at(p,path+'/capas','GET',{page:'0',size:'25'},'HSE_CAPA_LIST'));
    const history=read<ScopedPage>(at(p,path+'/history','GET',{page:'0',size:'25'},'HSE_HISTORY'));
    await openRow(p,f.caseId,'Open case');
    expect(await detail).toMatchObject({id:f.caseId,status:'CLOSED',closureId:f.closureId,companyId:f.company,facilityId:f.facility});
    await expect(p.getByText('Closure ID: '+f.closureId,{exact:true})).toBeVisible();
    checkpoint('SCOPED_CASE');
    const [capaPage,events]=await Promise.all([capas,history]);
    expect(capaPage).toEqual(signedCapas);
    expect(events).toEqual(signedHistory);
    expect(capaPage.items.some(row=>row.id===f.capaId)).toBe(true);
    const cap=read<Row>(at(p,path+'/capas/'+enc(f.capaId),'GET',{},'HSE_CAPA_DETAIL'));
    await openRow(p,f.capaId,'Open CAPA');
    const receipt=await cap;
    expect(receipt).toEqual(signedCapa);
    expect(receipt).toMatchObject({id:f.capaId,caseId:f.caseId,status:'CLOSED'});
    expect(Boolean(receipt.evidenceId)).toBe(true);
    await expect(p.getByText('Evidence ID: '+receipt.evidenceId,{exact:true})).toBeVisible();
    expect(events.total).toBeGreaterThanOrEqual(9);
    expect(events.items.some(row=>row.referenceId===f.assessmentId&&row.operation==='ASSESS_IMPACT')).toBe(true);
    await expect(p.getByText('Reference ID: '+f.assessmentId,{exact:true})).toBeVisible();
    const otherId=duplicates.items.find(row=>row.id!==f.caseId)!.id;
    const actionNumber=field(receipt,'actionNumber');
    const otherPath=base+'/'+enc(otherId)+'/capas';
    const duplicateCapas=await get<ScopedPage>(s,otherPath+'?actionNumber='+enc(actionNumber)+'&page=0&size=25');
    expect(duplicateCapas.total).toBe(2);
    expect(new Set(duplicateCapas.items.map(row=>row.id)).size).toBe(2);
    expect(duplicateCapas.items.every(row=>row.caseId===otherId && row.actionNumber===actionNumber)).toBe(true);
    const first=await get<ScopedPage>(s,otherPath+'?actionNumber='+enc(actionNumber)+'&page=0&size=1');
    const second=await get<ScopedPage>(s,otherPath+'?actionNumber='+enc(actionNumber)+'&page=1&size=1');
    expect(first.total===2 && second.total===2 && first.items[0].id!==second.items[0].id).toBe(true);
    // Finish the second parent's unfiltered owner read before changing its filter.
    // This proves both corrected default discovery and exact browser parity.
    const signedOther=await get<ScopedPage>(s,otherPath+'?page=0&size=25','SIGNED_HSE_CAPA_LIST');
    expect(signedOther.total).toBe(2);
    expect(signedOther.items.map(row=>row.id).sort()).toEqual(duplicateCapas.items.map(row=>row.id).sort());
    const otherUnfiltered=read<ScopedPage>(at(p,otherPath,'GET',{page:'0',size:'25'},'HSE_CAPA_LIST'));
    await openRow(p,otherId,'Open case');
    expect(await otherUnfiltered).toEqual(signedOther);
    for(const row of signedOther.items) await expect(p.getByRole('cell',{name:row.id,exact:true})).toBeVisible();
    await p.getByLabel('Action number',{exact:true}).fill(actionNumber);
    const capFilter=read<ScopedPage>(at(p,otherPath,'GET',{actionNumber,page:'0',size:'25'}));
    await p.getByRole('button',{name:'Filter',exact:true}).last().click();
    expect((await capFilter).items.map(row=>row.id).sort()).toEqual(duplicateCapas.items.map(row=>row.id).sort());
    for(const row of duplicateCapas.items) await expect(p.getByRole('cell',{name:row.id,exact:true})).toBeVisible();
    checkpoint('CAPA_HISTORY');
    await deny(s,hseRoot(f.foreignCompany,f.facility),[f.caseId,f.capaId]);
    await deny(s,hseRoot(f.company,f.siblingFacility),[f.caseId,f.capaId]);
    await deny(s,base+'/'+enc(f.missing),[f.missing,f.caseId]);
    await deny(s,base+'/'+enc(duplicates.items.find(row=>row.id!==f.caseId)!.id)+'/capas/'+enc(f.capaId),[f.capaId]);
    checkpoint('WRONG_SCOPE');
    await maskedList(s,api+'/hse/cases?page=0&size=50',[f.caseId]);
    await maskedList(s,api+'/hse/capas?page=0&size=50',[f.capaId]);
    await deny(s,api+'/hse/cases/'+enc(f.caseId),[f.caseId]);
    await deny(s,api+'/hse/capas/'+enc(f.capaId),[f.capaId]);
    checkpoint('LEGACY_MASKED');
    await selectScope(p,f.company,f.siblingFacility);
    await expect(p.getByText(new RegExp(String(receipt.evidenceId)))).toHaveCount(0);
    await p.getByRole('button',{name:'Events & Incidents',exact:true}).click();
    await p.getByRole('tab',{name:'HSE'}).click();
    await expect(p.getByText(f.caseId,{exact:true})).toHaveCount(0);
    checkpoint('SCOPE_CHANGE');
  }finally{await s.close();}
}
async function openDraft(s:Session,draft:Draft){
  const plan=await get<Row>(s,planning+'/operational-plans/'+enc(draft.plan));
  const revision=await get<Row>(s,planning+'/revisions/'+enc(draft.revision));
  await s.page.getByRole('button',{name:'Planning',exact:true}).click();
  await s.page.getByRole('tab',{name:'Operational plans'}).click();
  await openRow(s.page,field(plan,'code')||plan.id);
  await openRow(s.page,field(revision,'revisionCode')||field(revision,'revisionNumber'),'Open revision');
  return {plan,revision};
}
async function submitDraft(s:Session,draft:Draft,stale:boolean, proveSelf=stale) {
  const {plan,revision}=await openDraft(s,draft);
  const p=s.page,path=planning+'/revisions/'+enc(draft.revision);
  await p.getByLabel('Configured target type ID').fill(f.type);
  await p.getByLabel('Configured workflow purpose ID').fill(f.purpose);
  const discovery=read<Definition[]>(at(p,api+'/workflow/definitions','GET',{targetModule:'planning',targetTypeId:f.type,workflowPurposeId:f.purpose,targetId:draft.revision,targetLocator:''}));
  await p.getByRole('button',{name:'Read draft and authorized processes'}).click();
  const definition=(await discovery).find(row=>row.id===f.definition);
  expect(Boolean(definition)&&definition!.version===1&&definition!.assignmentChoices.some(a=>a.actorId===f.reviewer)).toBe(true);
  if(stale)checkpoint('DRAFT_DISCOVERY');
  const body={expectedPlanUpdatedAt:field(plan,'updatedAt'),expectedRevisionUpdatedAt:field(revision,'updatedAt'),
    definitionId:f.definition,definitionVersion:definition!.version,targetTypeId:f.type,workflowPurposeId:f.purpose,reviewerActorId:f.reviewer};
  await p.getByRole('combobox',{name:'Review process'}).click();
  await p.getByRole('option',{name:definition!.nameFr+' · '+definition!.version,exact:true}).click();
  await choose(p,'Independent reviewer',f.reviewer);
  const submit=p.getByRole('button',{name:'Submit revision',exact:true});
  await expect(submit).toBeDisabled();
  await p.getByRole('checkbox',{name:'I confirm submission of this revision for independent review.'}).check();
  if (stale) {
    // A genuine concurrent metadata change makes the browser's discovered
    // revision token stale. Its one POST must fail and retire the form.
    const patch=await p.request.patch(origin+path,{headers:{Authorization:'Bearer '+s.token},data:{
      expectedUpdatedAt: revision.updatedAt, changeReasonText:'Synthetic concurrent metadata update',
    }});
    expect(patch.status()).toBe(200);
    const refreshed=await get<Row>(s,path);
    expect(refreshed.status).toBe('DRAFT');
    expect(refreshed.updatedAt).not.toBe(revision.updatedAt);
    let attempts=0;
    const observe=(request: Request)=> {
      if(new URL(request.url()).pathname===path+'/submit'&&request.method()==='POST')attempts++;
    };
    p.on('request',observe);
    try {
      const failed=at(p,path+'/submit','POST');
      await submit.click();
      const rejected=await failed;
      expect(rejected.status()).toBe(409);
      expect(rejected.request().postDataJSON()).toEqual(body);
      await expect(p.getByText('Command not confirmed. Refresh and review owner state; it will not be replayed.')).toBeVisible();
      expect(await get<Row>(s,path)).toMatchObject({status:'DRAFT',updatedAt:refreshed.updatedAt});
      await expect(p.getByRole('button',{name:'Submit revision',exact:true})).toHaveCount(0);
      await p.getByRole('button',{name:'Refresh',exact:true}).click();
      expect(attempts).toBe(1);
    } finally { p.off('request',observe); }
    checkpoint('STALE_SUBMIT');
    await submitDraft(s,draft,false,true);
    return;
  }
  const response=at(p,path+'/submit','POST');
  await submit.click();
  const posted=await response;
  expect(posted.status()).toBe(200);
  expect(posted.request().postDataJSON()).toEqual(body);
  const receipt=await posted.json() as Record<string,unknown>;
  const persisted=await get<Row>(s,path);
  expect(persisted).toMatchObject({id:draft.revision,status:'SUBMITTED',submittedByActorId:f.author,workflowInstanceId:receipt.workflowInstanceId,updatedAt:receipt.revisionUpdatedAt});
  const approval=await get<Record<string,unknown>>(s,path+'/approval');
  expect(approval).toMatchObject({revisionId:draft.revision,workflowInstanceId:receipt.workflowInstanceId,currentTaskId:receipt.workflowTaskId,currentTaskUpdatedAt:receipt.workflowTaskUpdatedAt});
  const target=await get<Row>(s,planning+'/targets/'+enc(draft.target));
  expect(target).toMatchObject({id:draft.target,revisionId:draft.revision,status:'DRAFT'});
  await expect(p.getByText('Submission persisted and verified by HidraAPI.',{exact:true})).toBeVisible();
  await openDraft(s,draft);
  await expect(p.getByText('Status: SUBMITTED',{exact:true}).last()).toBeVisible();
  if(proveSelf){
    checkpoint('SIGNED_SUBMIT');
    await expect(p.getByRole('button',{name:'APPROVE',exact:true})).toHaveCount(0);
    const denied=await p.request.post(origin+path+'/approval/actions/'+enc(f.approveTransition)+'/execute',{headers:{Authorization:'Bearer '+s.token},data:{expectedTaskUpdatedAt:approval.currentTaskUpdatedAt}});
    expect([403,404,409]).toContain(denied.status());
    expect(await get<Row>(s,path)).toMatchObject({status:'SUBMITTED',updatedAt:persisted.updatedAt});
    checkpoint('SELF_DENIED');
  }
}
async function decide(browser:Browser,draft:Draft,decision:'APPROVE'|'REJECT'){
  const s=await session(browser,f.reviewer);
  try{
    const p=s.page,path=planning+'/revisions/'+enc(draft.revision);
    const projection=await get<Record<string,unknown>>(s,path+'/approval');
    await openDraft(s,draft);
    await p.getByRole('button',{name:decision,exact:true}).click();
    const transition=decision==='APPROVE'?f.approveTransition:f.rejectTransition;
    const actionPath=path+'/approval/actions/'+enc(transition)+'/execute';
    const reason = decision === 'REJECT' ? {reasonId: f.rejectionReason} : {};
    if (decision === 'REJECT') {
      await expect(p.getByRole('button',{name:'Execute REJECT',exact:true})).toBeDisabled();
      await p.getByLabel('Reason ID').fill(f.rejectionReason);
    }
    const stale=await p.request.post(origin+actionPath,{headers:{Authorization:'Bearer '+s.token},data:{expectedTaskUpdatedAt:'2000-01-01T00:00:00Z', ...reason}});
    expect(stale.status()).toBe(409);
    expect(await get<Record<string,unknown>>(s,path+'/approval')).toMatchObject({revisionStatus:'SUBMITTED',currentTaskId:projection.currentTaskId,currentTaskUpdatedAt:projection.currentTaskUpdatedAt});
    const response=at(p,actionPath,'POST');
    await p.getByRole('button',{name:'Execute '+decision,exact:true}).click();
    const result=await response;
    expect(result.status()).toBe(200);
    expect(result.request().postDataJSON()).toEqual({expectedTaskUpdatedAt:projection.currentTaskUpdatedAt, ...reason});
    const revision=await get<Row>(s,path);
    expect(revision).toMatchObject({id:draft.revision,status:decision==='APPROVE'?'APPROVED':'REJECTED'});
    if(decision==='APPROVE') expect(revision.approvedByActorId).toBe(f.reviewer);
    else expect(Boolean(revision.approvedByActorId)).toBe(false);
    const plan=await get<Row>(s,planning+'/operational-plans/'+enc(draft.plan));
    expect(plan).toMatchObject({currentRevisionId:draft.revision,status:decision==='APPROVE'?'ACTIVE':'DRAFT'});
    const target=await get<Row>(s,planning+'/targets/'+enc(draft.target));
    expect(target).toMatchObject({id:draft.target,revisionId:draft.revision,status:decision==='APPROVE'?'ACTIVE':'DRAFT'});
    await expect(p.getByText(decision+' · revision '+revision.status,{exact:true})).toBeVisible();
  }finally{await s.close();}
}
async function planningPhase(browser:Browser){
  const author=await session(browser,f.author);
  const shared=['planning:periods:read','planning:operational-plans:read','planning:revisions:read','planning:targets:read','planning:revisions:execute','workflow:definitions:read'];
  expect(shared.every(grant=>author.grants.includes(grant))).toBe(true);
  try{
    await submitDraft(author,f.approveDraft,true);
    await author.page.getByRole('button',{name:'Overview',exact:true}).click();
    await submitDraft(author,f.rejectDraft,false);
  }finally{await author.close();}
  await decide(browser,f.approveDraft,'APPROVE');checkpoint('INDEPENDENT_APPROVE');
  await decide(browser,f.rejectDraft,'REJECT');checkpoint('INDEPENDENT_REJECT');
  for(const actor of [f.sibling,f.foreign]){
    const s=await session(browser,actor);
    try{
      expect(shared.every(grant=>s.grants.includes(grant))).toBe(true);
      for(const d of [f.approveDraft,f.rejectDraft]){
        await deny(s,planning+'/operational-plans/'+enc(d.plan),[d.plan,d.revision]);
        await deny(s,planning+'/revisions/'+enc(d.revision),[d.revision]);
        await deny(s,planning+'/targets/'+enc(d.target),[d.target]);
        await deny(s,planning+'/revisions/'+enc(d.revision)+'/approval',[d.revision]);
        await deny(s,planning+'/revisions/'+enc(d.revision)+'/submit',[d.revision], 'POST', { expectedPlanUpdatedAt:'2000-01-01T00:00:00Z',expectedRevisionUpdatedAt:'2000-01-01T00:00:00Z',definitionId:f.definition,definitionVersion:1,targetTypeId:f.type,workflowPurposeId:f.purpose,reviewerActorId:f.reviewer });
        await deny(s,planning+'/revisions/'+enc(d.revision)+'/approval/actions/'+enc(f.approveTransition)+'/execute',[d.revision], 'POST', {expectedTaskUpdatedAt:'2000-01-01T00:00:00Z'});
      }
      await maskedList(s,planning+'/operational-plans?page=0&size=50',[f.approveDraft.plan,f.rejectDraft.plan]);
      await s.page.getByRole('button',{name:'Planning',exact:true}).click();
      await s.page.getByRole('tab',{name:'Operational plans'}).click();
      await expect(s.page.getByRole('button',{name:'Open',exact:true})).toHaveCount(0);
    }finally{await s.close();}
  }
  checkpoint('WRONG_SCOPE');
  const fresh=await session(browser,f.author);
  try{
    const prior=await get<Row>(fresh,planning+'/revisions/'+enc(f.priorRevision));
    const priorTarget=await get<Row>(fresh,planning+'/targets/'+enc(f.priorTarget));
    expect(prior.status).toBe('APPROVED');expect(priorTarget.status).toBe('SUPERSEDED');
    await openDraft(fresh,{plan:f.approveDraft.plan,revision:f.priorRevision,target:f.priorTarget});
    await expect(fresh.page.getByText(/not the operational plan.s current revision/)).toBeVisible();
    await expect(fresh.page.getByLabel('Plan target')).toHaveCount(0);
    checkpoint('HISTORICAL_REVISION');
    await fresh.page.getByRole('button',{name:'Overview',exact:true}).click();
    await openDraft(fresh,f.approveDraft);
    await expect(fresh.page.getByText('Status: APPROVED',{exact:true})).toBeVisible();
    await expect(fresh.page.getByLabel('Plan target')).toBeVisible();
    // The current target is owner-authored but textual: there is no qualified actual.
    await choose(fresh.page,'Plan target',f.approveDraft.target);
    await expect(fresh.page.getByText('Monitoring returned no authoritative comparison rows for the selected plan target.')).toBeVisible();
    await expect(fresh.page.getByRole('table',{name:'Planned versus actual deviations'})).toHaveCount(0);
    // No Monitoring-owned qualified receipt is synthesized for this textual target.
    await expect(fresh.page.getByRole('button',{name:'Submit revision',exact:true})).toHaveCount(0);
    checkpoint('FRESH_LOGIN');
  }finally{await fresh.close();}
}

test('UXR-29 '+phase,async({browser})=>{
  if(phase==='HSE_AFTER')await hsePhase(browser);
  else if(phase==='PLANNING_SUBMIT_REVIEW')await planningPhase(browser);
  else await responsePhase(browser);
  checkpoint('COMPLETE');
});
