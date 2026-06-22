import type { M365ProvisioningPlan } from '@apvee/m365-actionable-provisioning';

/**
 * Provisioning template used by the TestProvisioning webpart.
 *
 * Creates two lists with a Lookup relationship and custom list views:
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
  ],
  actions: [
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
 * Deletes the same lists created by provisioningPlan, in a safe order.
 */
export const deprovisioningPlan: M365ProvisioningPlan = {
  schemaVersion: '1.0',
  parameters: [
    { key: 'CustomersListName', value: 'customers' },
    { key: 'OrdersListName', value: 'orders' },
    { key: 'OrdersTitle', value: 'Orders' },
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
  ],
};
