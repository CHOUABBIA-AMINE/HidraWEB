import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
const web=process.env.HIDRA_FOUNDATION_WEB_URL;
const api=process.env.HIDRA_FOUNDATION_API_URL;
const admin=process.env.HIDRA_FOUNDATION_ADMIN;
const password=process.env.HIDRA_FOUNDATION_PASSWORD;
const ordinaryPassword=process.env.HIDRA_FOUNDATION_USER_PASSWORD;
if(process.env.HIDRA_FOUNDATION_REQUIRE_NATIVE==='1'&&(!web||!api||!admin||!password||!ordinaryPassword))throw new Error('Mandatory W2 native configuration missing');
test.skip(!web||!api||!admin||!password,'Requires native API/PostgreSQL with synthetic principals, not intercepted business APIs');
test.use({trace:'off',screenshot:'off',video:'off'});
async function login(page:Page){
 await page.goto(`${web}/network?mode=author`);
 await page.getByLabel(/^(Nom d’utilisateur|Username|اسم المستخدم)(?:\s*\*)?$/).fill(admin!);
 await page.getByLabel(/^(Mot de passe|Password|كلمة المرور)(?:\s*\*)?$/).fill(password!);
 await page.getByRole('button',{name:/^(Se connecter|Sign in|تسجيل الدخول)$/}).click();
 await expect(page.getByRole('heading',{name:'Network authoring',exact:true})).toBeVisible();
}
async function pick(page:Page,label:string,name:RegExp){
 await page.getByRole('combobox',{name:label,exact:true}).click();await page.getByRole('option',{name}).first().click();
}
function response(page:Page,path:string,method:string){return page.waitForResponse(r=>new URL(r.url()).pathname.endsWith(path)&&r.request().method()===method);}

async function createActiveCompany(request:APIRequestContext,headers:Record<string,string>,code:string){
 const created=await request.post(`${api}/api/v1/party/parties`,{headers,data:{code,legalName:`Synthetic ${code}`,partyTypeId:'w1-synthetic-party-type',countryCode:'DZ'}});expect(created.status()).toBe(200);const party=await created.json();
 const before=await request.get(`${api}/api/v1/party/parties/${party.id}`,{headers});expect(before.status()).toBe(200);
 const active=await request.post(`${api}/api/v1/party/parties/${party.id}/activate`,{headers,data:{expectedUpdatedAt:(await before.json()).updatedAt,reason:'Synthetic W2 company'}});expect(active.status()).toBe(200);
 return party.id as string;
}

test('native persisted system, station, installation, station configuration and Pipeline graph survive browser reload',async({page,request})=>{
 const auth=await request.post(`${api}/api/v1/identity/authentication/login`,{data:{providerType:'LOCAL',principal:admin,credentials:password}});expect(auth.status()).toBe(200);const token=(await auth.json()).accessToken;
 const headers={Authorization:`Bearer ${token}`};const code=`W2-${Date.now()}`;
 // Party setup uses genuine owner APIs; no SQL business object is admitted.
 await createActiveCompany(request,headers,code);
 await login(page);await pick(page,'Référence de partenaire éligible',new RegExp(code));
 await page.getByLabel('Code and name',{exact:true}).fill(code);await page.getByLabel('Reason and evidence reference',{exact:true}).fill('synthetic:W2 operator');
 await page.getByRole('button',{name:'System types',exact:true}).click();await pick(page,'System type',/W2_GAS/);
 const systemResponse=response(page,'/foundation/pipeline-systems','POST');await page.getByRole('button',{name:'Create system',exact:true}).click();expect((await systemResponse).status()).toBe(200);
 await page.getByRole('button',{name:'Station types',exact:true}).click();await pick(page,'Station type',/W2_COMPRESSOR/);
 const stationResponse=response(page,'/foundation/facilities','POST');await page.getByRole('button',{name:'Register station',exact:true}).click();expect((await stationResponse).status()).toBe(200);const facility=(await (await stationResponse).json()).items[0].id;
 const activation=response(page,`/facilities/${facility}/activation`,'POST');await page.getByRole('button',{name:'Activate station',exact:true}).click();expect((await activation).status()).toBe(200);
 await page.getByLabel('Position code and name',{exact:true}).fill(`${code}-P1`);await pick(page,'Equipment kind',/W2_COMPRESSOR/);
 const position=response(page,`/facilities/${facility}/equipment-positions`,'POST');await page.getByRole('button',{name:'Register physical position',exact:true}).click();expect((await position).status()).toBe(200);
 const unit=page.waitForResponse(r=>/\/installed-units\/[^/]+$/.test(new URL(r.url()).pathname)&&r.request().method()==='PUT');await page.getByRole('button',{name:'Register physical unit',exact:true}).click();expect((await unit).status()).toBe(200);
 const install=page.waitForResponse(r=>new URL(r.url()).pathname.endsWith('/installations')&&r.request().method()==='POST');await page.getByRole('button',{name:'Install unit',exact:true}).click();expect((await install).status()).toBe(200);
 await expect(page.getByRole('button',{name:'Prepare serial station graph',exact:true})).toBeEnabled();await page.getByRole('button',{name:'Prepare serial station graph',exact:true}).click();
 const stationGraph=page.waitForResponse(r=>new URL(r.url()).pathname.includes('/station-graph/revisions/')&&r.request().method()==='PUT');await page.getByRole('button',{name:'Save station graph revision',exact:true}).click();expect((await stationGraph).status()).toBe(200);
 const publication=response(page,`/facilities/${facility}/station-graph/publications`,'POST');await page.getByRole('button',{name:'Publish station graph',exact:true}).click();expect((await publication).status()).toBe(200);
 const config=response(page,`/facilities/${facility}/installed-configuration`,'PUT');await page.getByRole('button',{name:'Save installed configuration',exact:true}).click();expect((await config).status()).toBe(200);await expect(page.getByText('Installed configuration epoch: 1',{exact:true})).toBeVisible();
 const draft=response(page,'/engineering-networks','POST');await page.getByRole('button',{name:'Create network draft',exact:true}).click();expect((await draft).status()).toBe(201);
 await page.getByLabel('Pipeline code and name',{exact:true}).fill(`${code}-PIPE`);await pick(page,'Pipeline type',/W2_PIPE/);
 await page.getByRole('button',{name:'Add junction node',exact:true}).click();await pick(page,'Station for new node (empty for junction)',new RegExp(code));await page.getByRole('button',{name:'Add station node',exact:true}).click();
 await pick(page,'From port',/OUTLET/);await page.getByRole('combobox',{name:'To port',exact:true}).click();await page.getByRole('option',{name:/INLET/}).last().click();await page.getByRole('button',{name:'Add branch',exact:true}).click();
 const refreshedChoices=page.waitForResponse(r=>new URL(r.url()).pathname.endsWith('/authoring-choices')&&r.request().method()==='GET');
 const saved=page.waitForResponse(r=>new URL(r.url()).pathname.endsWith('/authored-topology')&&r.request().method()==='PUT');await page.getByRole('button',{name:'Save Pipeline and graph',exact:true}).click();const savedResponse=await saved;expect(savedResponse.status()).toBe(200);
 const snapshot=await savedResponse.json();expect(snapshot.bindings[0].pipeline.code).toBe(`${code}-PIPE`);expect(snapshot.geometryStatus).toBe('NOT_SUPPLIED');
 expect((await refreshedChoices).status()).toBe(200);
 const staleBody={...savedResponse.request().postDataJSON(),requestId:crypto.randomUUID()};const stale=await request.put(savedResponse.url(),{headers,data:staleBody});expect(stale.status()).toBe(409);
 await expect(page.getByText(/Persisted graph version: 2/)).toBeVisible();const link=page.url();expect(new URL(link).searchParams.get('draft')).toBeTruthy();
 await page.reload();await page.getByLabel(/^(Nom d’utilisateur|Username|اسم المستخدم)(?:\s*\*)?$/).fill(admin!);await page.getByLabel(/^(Mot de passe|Password|كلمة المرور)(?:\s*\*)?$/).fill(password!);await page.getByRole('button',{name:/^(Se connecter|Sign in|تسجيل الدخول)$/}).click();
 await expect(page.getByText(/Persisted graph version: 2/)).toBeVisible();await expect(page.getByText(new RegExp(`${code}-PIPE · ${code}-PIPE · 1`))).toBeVisible();
 await page.getByRole('button',{name:'Stations',exact:true}).click();await pick(page,'Station',new RegExp(code));await expect(page.getByText('Installed configuration epoch: 1',{exact:true})).toBeVisible();
 await page.getByLabel('Historical graph version',{exact:true}).fill('2');await expect(page.getByText(new RegExp(`History: ${code}-PIPE`))).toBeVisible();
 const persisted=await request.get(savedResponse.url(),{headers});expect(persisted.status()).toBe(200);expect((await persisted.json()).graph.version).toBe(2);
});

test('native ordinary user cannot disclose setup catalogs or mutate foundation business state',async({request})=>{
 const adminLogin=await request.post(`${api}/api/v1/identity/authentication/login`,{data:{providerType:'LOCAL',principal:admin,credentials:password}});expect(adminLogin.status()).toBe(200);const headers={Authorization:`Bearer ${(await adminLogin.json()).accessToken}`};
 const name=`w2-denied-${Date.now()}`;const created=await request.post(`${api}/api/v1/identity/users`,{headers,data:{userType:'HUMAN',username:name,emailAddress:`${name}@synthetic.invalid`,displayName:name}});expect(created.status()).toBe(200);const user=await created.json();
 const credentialState=await request.get(`${api}/api/v1/identity/users/${user.id}/local-credential/state`,{headers});expect(credentialState.status()).toBe(200);
 const credential=await request.put(`${api}/api/v1/identity/users/${user.id}/local-credential`,{headers,data:{expectedSecurityVersion:(await credentialState.json()).securityVersion,password:ordinaryPassword,reason:'Synthetic W2 denied actor'}});expect(credential.status()).toBe(200);
 const current=await request.get(`${api}/api/v1/identity/users/${user.id}/lifecycle`,{headers});expect(current.status()).toBe(200);
 const activated=await request.post(`${api}/api/v1/identity/users/${user.id}/activate`,{headers,data:{expectedUpdatedAt:(await current.json()).updatedAt,reason:'Synthetic W2 denied actor'}});expect(activated.status()).toBe(200);
 const company=await createActiveCompany(request,headers,`W2-DENIED-${Date.now()}`);
 const control=await request.get(`${api}/api/v1/topology/foundation/choices/SYSTEM_TYPES?companyPartyId=${company}`,{headers});expect(control.status()).toBe(200);
 const ordinary=await request.post(`${api}/api/v1/identity/authentication/login`,{data:{providerType:'LOCAL',principal:name,credentials:ordinaryPassword}});expect(ordinary.status()).toBe(200);const deniedHeaders={Authorization:`Bearer ${(await ordinary.json()).accessToken}`};
 const choices=await request.get(`${api}/api/v1/topology/foundation/choices/SYSTEM_TYPES?companyPartyId=${company}`,{headers:deniedHeaders});expect(choices.status()).toBe(403);expect(await choices.text()).not.toContain('W2_GAS');
 const write=await request.post(`${api}/api/v1/topology/foundation/pipeline-systems`,{headers:deniedHeaders,data:{companyPartyId:company,id:crypto.randomUUID(),requestId:crypto.randomUUID(),code:name,name,systemTypeId:'w2-gas',reason:'Synthetic refused write'}});expect(write.status()).toBe(403);
 const after=await request.get(`${api}/api/v1/topology/foundation/choices/SYSTEMS?companyPartyId=${company}`,{headers});expect(after.status()).toBe(200);expect((await after.json()).items).toEqual([]);
});
