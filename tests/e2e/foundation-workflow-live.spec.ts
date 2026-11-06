import { expect, test, type Page, type APIRequestContext } from '@playwright/test';
const api=process.env.HIDRA_FOUNDATION_API_URL,web=process.env.HIDRA_FOUNDATION_WEB_URL,admin=process.env.HIDRA_FOUNDATION_ADMIN,password=process.env.HIDRA_FOUNDATION_PASSWORD,userPassword=process.env.HIDRA_FOUNDATION_USER_PASSWORD;
const company=process.env.HIDRA_W4_COMPANY,unit=process.env.HIDRA_W4_UNIT,link=process.env.HIDRA_W4_LINK,reviewer=process.env.HIDRA_W4_REVIEWER,reason=process.env.HIDRA_W4_REASON;
// W4 credentials appear only after W1-W3 passed and the explicit capability switch.
if(process.env.HIDRA_FOUNDATION_REQUIRE_NATIVE==='1'&&(!api||!web||!admin||!password||!userPassword))throw new Error('Mandatory W4 native environment missing');
test.skip(!api||!web||!admin||!password,'Requires immutable native API/PostgreSQL');test.use({trace:'off',screenshot:'off',video:'off'});
async function login(page:Page,name:string,credentials:string,path='/work/tasks'){
 await page.goto(`${web}${path}`);await page.getByLabel(/^(Nom d’utilisateur|Username|اسم المستخدم)(?:\s*\*)?$/).fill(name);await page.getByLabel(/^(Mot de passe|Password|كلمة المرور)(?:\s*\*)?$/).fill(credentials);await page.getByRole('button',{name:/^(Se connecter|Sign in|تسجيل الدخول)$/}).click();
 await expect(page.getByRole('heading',{name:/^(Mes tâches|My Tasks|مهامي)$/,exact:true})).toBeVisible();
 const language=page.getByRole('combobox',{name:/^(Langue|Language|اللغة)$/});await language.click();await page.getByRole('option',{name:'EN',exact:true}).click();
}
async function pick(page:Page,label:string,name:RegExp){await page.getByRole('combobox',{name:label,exact:true}).click();await page.getByRole('option',{name}).first().click();}
const response=(page:Page,path:string,method:string)=>page.waitForResponse(r=>new URL(r.url()).pathname.endsWith(path)&&r.request().method()===method);
async function bearer(request:APIRequestContext,name:string,credentials:string){const r=await request.post(`${api}/api/v1/identity/authentication/login`,{data:{providerType:'LOCAL',principal:name,credentials}});expect(r.status()).toBe(200);return {Authorization:`Bearer ${(await r.json()).accessToken}`};}
test('W4 native discovered process and independent human APPROVE/REJECT persist after reload and stale replay',async({page,request})=>{
 if(!company||!unit||!link||!reviewer||!reason)throw new Error('Configured W4 native reference absent');
 const reviewHeaders=await bearer(request,reviewer,userPassword!);
 for(const decision of ['APPROVE','REJECT']){
  const query=new URLSearchParams({companyPartyId:company,installedUnitId:unit,linkId:link,revisionId:'1'});
  await login(page,admin!,password!,`/work/tasks?${query}`);
  const handoffResponse=response(page,'/definitions/installed-characteristic-link-target','GET');await page.getByRole('button',{name:'Read target and processes',exact:true}).click();expect((await handoffResponse).status()).toBe(200);
  await pick(page,'Review process',/Synthetic W4 link review/);await pick(page,'Independent reviewer',/Synthetic W4 independent reviewer/);
  const start=response(page,'/workflow/instances','POST');await page.getByRole('button',{name:'Start review process',exact:true}).click();const started=await start;expect(started.status()).toBe(200);const instance=(await started.json()).id;
  expect(started.request().postDataJSON().targetCodeSnapshot).toBe((await (await handoffResponse).json()).targetLocator);
  await expect(page.getByText(`Persisted instance: ${instance}`,{exact:true})).toBeVisible();
  const assigned=response(page,'/workflow/tasks','POST');await page.getByRole('button',{name:'Assign review task',exact:true}).click();const created=await assigned;expect(created.status()).toBe(200);const task=(await created.json()).id;
  await login(page,reviewer,userPassword!,`/work/tasks?taskId=${task}`);
  await expect(page.getByRole('button',{name:decision,exact:true})).toBeVisible();await page.getByRole('button',{name:decision,exact:true}).click();
  if(decision==='APPROVE')await page.getByLabel('comment *',{exact:true}).fill('Synthetic independent native review');
  else await page.getByLabel('reasonId *',{exact:true}).fill(reason);
  const refreshedTimeline=response(page,`/instances/${instance}/timeline`,'GET');
  const executed=page.waitForResponse(r=>new URL(r.url()).pathname.includes(`/tasks/${task}/transitions/`)&&r.request().method()==='POST');await page.getByRole('button',{name:`Action: ${decision}`,exact:true}).click();const result=await executed;expect(result.status()).toBe(200);expect((await result.json()).decision).toBe(decision);expect((await refreshedTimeline).status()).toBe(200);
  await expect(page.getByText(`${decision} · ${decision==='APPROVE'?'APPROVED':'REJECTED'}`,{exact:true})).toBeVisible();
  // Wait for the refreshed native task state before issuing a deliberate stale command.
  await expect(page.getByRole('button',{name:decision,exact:true})).toHaveCount(0);
  const replay=await request.post(result.url(),{headers:reviewHeaders,data:result.request().postDataJSON()});expect(replay.status()).toBe(409);
  const reloadedTimeline=response(page,`/instances/${instance}/timeline`,'GET');await login(page,reviewer,userPassword!,`/work/tasks?taskId=${task}`);expect((await reloadedTimeline).status()).toBe(200);await expect(page.getByRole('button',{name:decision,exact:true})).toHaveCount(0);await expect(page.getByRole('heading',{name:'Timeline',exact:true})).toBeVisible();
  const timeline=await request.get(`${api}/api/v1/workflow/instances/${instance}/timeline`,{headers:reviewHeaders});expect(timeline.status()).toBe(200);const entries=await timeline.json();expect(entries.filter((e:{decision?:string})=>e.decision===decision)).toHaveLength(1);
  const current=await request.get(`${api}/api/v1/workflow/instances/${instance}`,{headers:reviewHeaders});expect(current.status()).toBe(200);expect((await current.json()).status).toBe('COMPLETED');
  const draft=await request.get(`${api}/api/v1/topology/installed-units/${unit}/characteristic-links/${link}?companyPartyId=${company}`,{headers:reviewHeaders});expect(draft.status()).toBe(200);expect((await draft.json()).link.state).toBe('DRAFT');
 }
});
test('W4 native unrelated LOCAL actor cannot discover targets or disclose task history and counts',async({page,request})=>{
 if(!company||!unit||!link)throw new Error('Configured W4 native target absent');
 const headers=await bearer(request,admin!,password!);const name=`w4-denied-${Date.now()}`;
 const r=await request.post(`${api}/api/v1/identity/users`,{headers,data:{userType:'HUMAN',username:name,emailAddress:`${name}@synthetic.invalid`,displayName:'Synthetic unrelated W4 actor'}});expect(r.status()).toBe(200);const id=(await r.json()).id;
 const credential=await request.get(`${api}/api/v1/identity/users/${id}/local-credential/state`,{headers});expect(credential.status()).toBe(200);expect((await request.put(`${api}/api/v1/identity/users/${id}/local-credential`,{headers,data:{expectedSecurityVersion:(await credential.json()).securityVersion,password:userPassword,reason:'Synthetic W4 denial'}})).status()).toBe(200);
 const state=await request.get(`${api}/api/v1/identity/users/${id}/lifecycle`,{headers});expect(state.status()).toBe(200);expect((await request.post(`${api}/api/v1/identity/users/${id}/activate`,{headers,data:{expectedUpdatedAt:(await state.json()).updatedAt,reason:'Synthetic W4 denial'}})).status()).toBe(200);
 const denied=await bearer(request,name,userPassword!);
 const h=await request.get(`${api}/api/v1/workflow/definitions/installed-characteristic-link-target?${new URLSearchParams({companyPartyId:company,installedUnitId:unit,linkId:link,revisionId:'1'})}`,{headers:denied});expect(h.status()).toBe(404);expect(await h.text()).toBe('');
 for(const path of ['/tasks?view=all','/tasks/missing','/instances/missing/timeline','/tasks/missing/available-actions']){const response=await request.get(`${api}/api/v1/workflow${path}`,{headers:denied});expect(response.status()).toBe(403);expect(await response.text()).not.toContain('Synthetic W4 link review');}
 const refused=await request.post(`${api}/api/v1/workflow/instances`,{headers:denied,data:{definitionId:'unknown',definitionVersion:1}});expect(refused.status()).toBe(403);
 // The actual browser must not mount an unauthorized Workflow start form.
 await page.goto(`${web}/overview`);await page.getByLabel(/^(Nom d’utilisateur|Username|اسم المستخدم)(?:\s*\*)?$/).fill(name);await page.getByLabel(/^(Mot de passe|Password|كلمة المرور)(?:\s*\*)?$/).fill(userPassword!);await page.getByRole('button',{name:/^(Se connecter|Sign in|تسجيل الدخول)$/}).click();await expect(page.getByRole('heading',{name:/^(Vue d’ensemble|Overview)$/})).toBeVisible();expect(await page.getByRole('button',{name:'Start review process',exact:true}).count()).toBe(0);
});
