import {expect,test,type Page} from '@playwright/test';
const routes=[{route:'/api/v1/configuration/namespaces',methods:['GET'],module:'configuration',resource:'namespaces',action:'read',permission:'configuration:namespaces:read',enforcementStatus:'backend-enforced'}];
async function prepare(page:Page,grants=['*']){
 await page.route('**/api/v1/security/permissions/routes',r=>r.fulfill({json:routes}));await page.route('**/api/v1/security/permissions/catalog',r=>r.fulfill({json:{strategy:'derived-route-permission-catalog',enforcement:'backend-enforced',permissionFormat:'<module>:<resource>:<action>',routes}}));await page.route('**/api/v1/identity/me/permissions',r=>r.fulfill({json:grants}));
 await page.goto('/administration/configuration');await page.getByLabel('Nom d’utilisateur').fill('configuration-admin');await page.getByLabel('Mot de passe').fill('secret');await page.getByRole('button',{name:'Se connecter'}).click();
}
async function pick(page:Page,label:string,name:RegExp){await page.getByRole('combobox',{name:label,exact:true}).click();await page.getByRole('option',{name}).first().click();}
test('typed definition choices and rejected write require explicit review without retry',async({page})=>{
 let calls=0;
 await page.route('**/api/v1/configuration/namespaces?**',r=>r.fulfill({json:[{id:'ns',label:'Synthetic namespace'}]}));await page.route('**/api/v1/configuration/definitions?**',r=>r.fulfill({json:[]}));await page.route('**/api/v1/configuration/feature-flags?**',r=>r.fulfill({json:[]}));
 await page.route('**/api/v1/configuration/definitions',async r=>{calls++;expect(r.request().postDataJSON()).toEqual({namespaceId:'ns',key:'runtime.synthetic',displayNameFr:'Synthetic setting',valueType:'NUMBER',sensitivity:'INTERNAL',scoped:false,requiresApproval:false,defaultValue:'12.500'});await r.fulfill({status:403,json:{status:403,title:'Forbidden'}});});
 await prepare(page);await expect(page.getByRole('heading',{name:'Configuration administration',exact:true})).toBeVisible();await pick(page,'Namespace',/Synthetic namespace/);await page.getByLabel('Key',{exact:true}).fill('runtime.synthetic');await page.getByLabel('Display name',{exact:true}).fill('Synthetic setting');await pick(page,'Value type',/^NUMBER$/);await page.getByLabel('Default value',{exact:true}).fill('12.500');await page.getByRole('button',{name:'Create definition',exact:true}).click();await expect(page.getByText('HidraAPI refused this configuration operation.')).toBeVisible();await expect(page.getByRole('button',{name:'Create definition',exact:true})).toBeDisabled();expect(calls).toBe(1);
 await page.getByRole('button',{name:'Reload and review',exact:true}).click();await expect(page.getByRole('button',{name:'Create definition',exact:true})).toBeEnabled();expect(calls).toBe(1);
});
test('current route grants alone do not disclose administrator-only Configuration choices',async({page})=>{
 let calls=0;await page.route('**/api/v1/configuration/**',async r=>{calls++;await r.fulfill({status:403,json:{status:403}});});
 await prepare(page,['configuration:namespaces:read']);await expect(page.getByText('Current Configuration administrator authority required.')).toBeVisible();expect(calls).toBe(0);await expect(page.getByLabel('Namespace',{exact:true})).toHaveCount(0);
});
