import { strict as assert } from 'assert';
import { m365ProvisioningPlanSchema, type M365ProvisioningPlan } from '@apvee/m365-actionable-provisioning';
import {
  buildProvisioningPlanParameterMap,
  resolveProvisioningPlanPlaceholders,
} from '../../../packages/m365-actionable-provisioning/src/core/provisioning-plan';
import { provisioningPlan, deprovisioningPlan } from '../src/webparts/testProvisioning/test-plans/demo-plans';
import { createExamplePlan, examplePlan } from '../src/webparts/testProvisioning/test-plans/complete-plan';

type DemoAction = { verb: string; subactions?: readonly DemoAction[]; [key: string]: unknown };

function expand(plan: M365ProvisioningPlan): M365ProvisioningPlan {
  const parameters = buildProvisioningPlanParameterMap(plan.parameters);
  return m365ProvisioningPlanSchema.parse({
    ...plan,
    actions: resolveProvisioningPlanPlaceholders(plan.actions, parameters),
  });
}

function flatten(actions: readonly DemoAction[]): DemoAction[] {
  return actions.flatMap((action) => [action, ...flatten(action.subactions ?? [])]);
}

function position(actions: readonly DemoAction[], verb: string, key: string, value: string): number {
  const index = actions.findIndex((action) => action.verb === verb && action[key] === value);
  assert.ok(index >= 0, `Missing ${verb} for ${value}`);
  return index;
}

function assertGroupOrder(actions: readonly DemoAction[]): void {
  const available = new Set<string>();
  for (const action of actions) {
    if (action.verb === 'createSPGroup') available.add(String(action.title));
    if (action.verb === 'modifySPGroup') {
      assert.ok(available.has(String(action.groupName)), `Group modified before creation: ${action.groupName}`);
      assert.equal(action.title, undefined, 'Demo group references must remain stable');
    }
    if (action.principalType === 'spGroupName') {
      assert.ok(available.has(String(action.principal)), `Grant references an unavailable group: ${action.principal}`);
    }
    if (action.verb === 'deleteSPGroup') available.delete(String(action.groupName));
  }
}

function assertListGroupGrants(actions: readonly DemoAction[], readers: string, contributors: string): void {
  const lists = actions.filter((action) => action.verb === 'createSPList' || action.verb === 'modifySPList');
  assert.ok(lists.length > 0, 'Demo must exercise list grants');
  for (const list of lists) {
    const grants = (list.subactions ?? []).filter((action) => action.verb === 'grantSPListRoleAssignment' && action.principalType === 'spGroupName');
    assert.equal(grants.length, 2, `${list.verb} ${list.listName} needs both group grants`);
    for (const [principal, roleType] of [[readers, 'read'], [contributors, 'contribute']]) {
      const grant = grants.find((action) => action.principal === principal);
      assert.ok(grant, `Missing ${roleType} group grant on ${list.listName}`);
      assert.equal(grant.roleType, roleType);
      assert.equal(grant.breakRoleInheritance, true);
      assert.equal(grant.copyRoleAssignments, true);
      assert.equal(grant.clearSubscopes, false);
    }
  }
}

function assertPropertyPanePlans(): void {
  const provision = expand(provisioningPlan);
  const cleanup = expand(deprovisioningPlan);
  const actions = flatten(provision.actions);
  const removals = flatten(cleanup.actions);
  const firstList = actions.findIndex((action) => action.verb === 'createSPList');
  for (const name of ['M365 Demo Readers', 'M365 Demo Contributors']) {
    const created = position(actions, 'createSPGroup', 'title', name);
    const modified = position(actions, 'modifySPGroup', 'groupName', name);
    const granted = position(actions, 'grantSPSiteRoleAssignment', 'principal', name);
    assert.ok(created < modified && modified < granted && granted < firstList, 'Groups and site grants must precede lists');
    assert.equal(typeof actions[modified].description, 'string');
    assert.equal(actions[granted].principalType, 'spGroupName');
    assert.equal(actions[granted].roleType, 'read');
    assert.equal(actions[granted].breakRoleInheritance, true, 'Site grants must support inherited selected webs');
    assert.equal(actions[granted].copyRoleAssignments, true, 'Site grants must preserve existing assignments');
    assert.equal(actions[granted].clearSubscopes, false, 'Site grants must preserve child scopes');
    const revoked = position(removals, 'removeSPSiteRoleAssignment', 'principal', name);
    const deleted = position(removals, 'deleteSPGroup', 'groupName', name);
    assert.ok(revoked < deleted, 'Revoke the site binding before deleting the group');
    assert.ok(position(removals, 'deleteSPList', 'listName', 'customers') < revoked);
  }
  assertGroupOrder(actions);
  assertListGroupGrants(actions, 'M365 Demo Readers', 'M365 Demo Contributors');
  const parameters = buildProvisioningPlanParameterMap(provision.parameters);
  const cleanupParameters = buildProvisioningPlanParameterMap(cleanup.parameters);
  for (const key of ['DemoReadersGroupName', 'DemoContributorsGroupName']) {
    assert.equal(parameters[key], cleanupParameters[key]);
  }
  assert.ok(position(removals, 'deleteSPNavigationNode', 'title', 'Orders workspace') < position(removals, 'deleteSPList', 'listName', 'orders'));
  assert.ok(position(removals, 'deleteSPList', 'listName', 'orders') < position(removals, 'deleteSPList', 'listName', 'customers'));
  const lookup = actions.find((action) => action.verb === 'addSPField' && action.fieldName === 'Customer');
  assert.equal(lookup?.lookupListName, 'customers');
  assert.equal(lookup?.relationshipDeleteBehavior, 'Restrict');
  assert.equal(actions.filter((action) => action.verb === 'createSPListView').length, 2);
}

function assertCompletePlan(template: M365ProvisioningPlan, currentUserLoginName: string): void {
  const plan = expand(template);
  const actions = flatten(plan.actions);
  const siteCreation = plan.actions.find((action) => action.verb === 'createSPSite');
  const siteGroups = siteCreation?.subactions ?? [];
  const firstList = actions.findIndex((action) => action.verb === 'createSPList');
  for (const name of ['Engineering Demo Readers', 'Engineering Demo Contributors']) {
    assert.ok(siteGroups.some((action) => action.verb === 'createSPGroup' && action.title === name), `Site creation must ensure ${name}`);
    const created = position(actions, 'createSPGroup', 'title', name);
    const modified = position(actions, 'modifySPGroup', 'groupName', name);
    const granted = position(actions, 'grantSPSiteRoleAssignment', 'principal', name);
    assert.ok(created < modified && modified < granted && granted < firstList);
    assert.equal(typeof actions[modified].description, 'string');
    assert.notEqual(actions[created].description, actions[modified].description);
    assert.equal(actions[granted].principalType, 'spGroupName');
    assert.equal(actions[granted].roleType, 'read');
  }
  assertGroupOrder(actions);
  assertListGroupGrants(actions, 'Engineering Demo Readers', 'Engineering Demo Contributors');
  assert.deepEqual(actions.filter((action) => action.verb === 'createSPList' || action.verb === 'modifySPList')
    .map((action) => `${action.verb}:${action.listName}`), [
    'createSPList:requestCategories',
    'createSPList:engineeringRequests',
    'modifySPList:engineeringRequests',
    'createSPList:engineeringDocuments',
    'createSPList:tempToRecycle',
  ]);
  const temporary = 'Engineering Demo Temporary';
  const created = position(actions, 'createSPGroup', 'title', temporary);
  const modified = position(actions, 'modifySPGroup', 'groupName', temporary);
  const deleted = position(actions, 'deleteSPGroup', 'groupName', temporary);
  assert.ok(created < modified && modified < deleted);
  assert.deepEqual(actions.filter((action) => action.verb === 'deleteSPGroup').map((action) => action.groupName), [temporary]);
  assert.equal(actions.some((action) => action.principal === temporary), false, 'The disposable group must not receive a role');
  const userGrants = actions.filter((action) => action.verb === 'grantSPListRoleAssignment' && action.principalType === 'loginName');
  assert.equal(userGrants.length, 1);
  assert.equal(userGrants[0].principal, currentUserLoginName);
  assert.equal(userGrants[0].roleType, 'read');
  assert.equal(userGrants[0].copyRoleAssignments, true);
  assert.equal(actions.find((action) => action.verb === 'addSPField' && action.fieldName === 'RequestCategory')?.lookupListName, 'requestCategories');
  assert.deepEqual(actions.filter((action) => action.verb === 'enableSPListRating').map((action) => action.ratingType), ['Likes', 'Stars']);
  assert.equal(actions.some((action) => action.verb === 'createSPContentType' && action.name === 'Engineering Document'), true);
  assert.equal(actions.some((action) => action.verb === 'addSPContentTypeToList' && action.contentTypeName === 'Engineering Document'), true);
  assert.equal(actions.some((action) => action.verb === 'deleteSPList' || action.verb === 'deleteSPField'), false, 'Commented deletion examples must stay inactive');
}

try {
  assertPropertyPanePlans();
  assertCompletePlan(examplePlan, 'i:0#.f|membership|user@contoso.com');
  for (const login of ['i:0#.f|membership|first@contoso.com', 'i:0#.f|membership|second@contoso.com']) {
    assertCompletePlan(createExamplePlan(login), login);
  }
  console.log('SPFx demo plans smoke passed');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
