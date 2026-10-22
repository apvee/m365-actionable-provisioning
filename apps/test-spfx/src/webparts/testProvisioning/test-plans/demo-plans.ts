import type { M365ProvisioningPlan } from '@apvee/m365-actionable-provisioning';
import { createDemoListGroupGrants } from './group-demo-actions';

/**
 * Provisioning template used by the TestProvisioning webpart.
 *
 * Creates demo groups and two lists with separate role grants, a Lookup
 * relationship and custom list views:
 * - customers
 * - orders (lookup -> customers)
 */
export const provisioningPlan: M365ProvisioningPlan = {
  schemaVersion: '1.0',
  parameters: [
    { key: 'CustomersListName', value: 'customers' },
    { key: 'OrdersListName', value: 'orders' },
    { key: 'CustomersTitle', value: 'Customers' },
    { key: 'OrdersTitle', value: 'Orders' },
    { key: 'DemoReadersGroupName', value: 'M365 Demo Readers' },
    { key: 'DemoContributorsGroupName', value: 'M365 Demo Contributors' },
  ],
  actions: [
    {
      verb: 'modifySPSite',
      subactions: [
        {
          verb: 'createSPGroup',
          title: '{parameter:DemoReadersGroupName}',
          description: 'Readers group created by the Property Pane demo',
        },
        {
          verb: 'createSPGroup',
          title: '{parameter:DemoContributorsGroupName}',
          description: 'Contributors group created by the Property Pane demo',
        },
        {
          verb: 'modifySPGroup',
          groupName: '{parameter:DemoReadersGroupName}',
          description: 'Read access to the demo site and its customer/order lists',
        },
        {
          verb: 'modifySPGroup',
          groupName: '{parameter:DemoContributorsGroupName}',
          description: 'Read access to the demo site and contribute access to its customer/order lists',
        },
        {
          verb: 'grantSPSiteRoleAssignment',
          principalType: 'spGroupName',
          principal: '{parameter:DemoReadersGroupName}',
          roleType: 'read',
        },
        {
          verb: 'grantSPSiteRoleAssignment',
          principalType: 'spGroupName',
          principal: '{parameter:DemoContributorsGroupName}',
          roleType: 'read',
        },
      ],
    },
    {
      verb: 'createSPList',
      listName: '{parameter:CustomersListName}',
      title: '{parameter:CustomersTitle}',
      desc: '{parameter:CustomersTitle} master data (lookup source)',
      template: 100,
      onQuickLaunch: true,
      enableVersioning: true,
      subactions: [
        {
          verb: 'addSPField',
          fieldType: 'Text',
          fieldName: 'CustomerCode',
          displayName: 'Customer Code',
          required: true,
          indexed: true,
          enforceUniqueValues: true,
          addToDefaultView: true,
        },
        {
          verb: 'addSPField',
          fieldType: 'Text',
          fieldName: 'CustomerEmail',
          displayName: 'Customer Email',
          required: false,
          addToDefaultView: true,
        },
        {
          verb: 'createSPListView',
          title: 'Customers by Code',
          fields: ['Title', 'CustomerCode', 'CustomerEmail'],
          viewQuery: '<OrderBy><FieldRef Name="CustomerCode" /></OrderBy>',
          rowLimit: 100,
          paged: true,
          defaultView: true,
        },
        ...createDemoListGroupGrants('{parameter:DemoReadersGroupName}', '{parameter:DemoContributorsGroupName}'),
      ],
    },
    {
      verb: 'createSPList',
      listName: '{parameter:OrdersListName}',
      title: '{parameter:OrdersTitle}',
      desc: '{parameter:OrdersTitle} transactional list (lookup -> {parameter:CustomersTitle})',
      template: 100,
      onQuickLaunch: true,
      enableVersioning: true,
      subactions: [
        {
          verb: 'addSPField',
          fieldType: 'DateTime',
          fieldName: 'OrderDate',
          displayName: 'Order Date',
          displayFormat: 'DateOnly',
          required: true,
          addToDefaultView: true,
        },
        {
          verb: 'addSPField',
          fieldType: 'Currency',
          fieldName: 'OrderTotal',
          displayName: 'Order Total',
          minimumValue: 0,
          currencyLocaleId: 1033,
          required: true,
          addToDefaultView: true,
        },
        {
          verb: 'addSPField',
          fieldType: 'Lookup',
          fieldName: 'Customer',
          displayName: 'Customer',
          // NOTE: lookupListName matches the lookup list RootFolder/Name (our listName), not Title.
          lookupListName: '{parameter:CustomersListName}',
          showField: 'CustomerCode',
          relationshipDeleteBehavior: 'Restrict',
          dependentLookupFields: ['Title', 'CustomerEmail'],
          required: true,
          addToDefaultView: true,
        },
        {
          verb: 'createSPListView',
          title: 'Orders by Date',
          fields: ['Title', 'OrderDate', 'OrderTotal', 'Customer'],
          viewQuery: '<OrderBy><FieldRef Name="OrderDate" Ascending="FALSE" /></OrderBy>',
          rowLimit: 100,
          paged: true,
          defaultView: true,
        },
        ...createDemoListGroupGrants('{parameter:DemoReadersGroupName}', '{parameter:DemoContributorsGroupName}'),
      ],
    },
    {
      verb: 'modifySPSite',
      subactions: [
        {
          verb: 'createSPNavigationNode',
          location: 'quicklaunch',
          title: '{parameter:OrdersTitle} workspace',
          url: 'Lists/{parameter:OrdersListName}/AllItems.aspx',
        },
      ],
    },
  ],
};

/**
 * Deprovisioning template used by the TestProvisioning webpart.
 *
 * Removes navigation, recycles lists, then revokes site grants and deletes
 * the groups created by provisioningPlan.
 */
export const deprovisioningPlan: M365ProvisioningPlan = {
  schemaVersion: '1.0',
  parameters: [
    { key: 'CustomersListName', value: 'customers' },
    { key: 'OrdersListName', value: 'orders' },
    { key: 'OrdersTitle', value: 'Orders' },
    { key: 'DemoReadersGroupName', value: 'M365 Demo Readers' },
    { key: 'DemoContributorsGroupName', value: 'M365 Demo Contributors' },
  ],
  actions: [
    {
      verb: 'modifySPSite',
      subactions: [
        {
          verb: 'deleteSPNavigationNode',
          location: 'quicklaunch',
          title: '{parameter:OrdersTitle} workspace',
        },
      ],
    },
    {
      verb: 'deleteSPList',
      listName: '{parameter:OrdersListName}',
      recycle: true,
    },
    {
      verb: 'deleteSPList',
      listName: '{parameter:CustomersListName}',
      recycle: true,
    },
    {
      verb: 'modifySPSite',
      subactions: [
        {
          verb: 'removeSPSiteRoleAssignment',
          principalType: 'spGroupName',
          principal: '{parameter:DemoReadersGroupName}',
          roleType: 'read',
        },
        {
          verb: 'removeSPSiteRoleAssignment',
          principalType: 'spGroupName',
          principal: '{parameter:DemoContributorsGroupName}',
          roleType: 'read',
        },
        {
          verb: 'deleteSPGroup',
          groupName: '{parameter:DemoReadersGroupName}',
        },
        {
          verb: 'deleteSPGroup',
          groupName: '{parameter:DemoContributorsGroupName}',
        },
      ],
    },
  ],
};
