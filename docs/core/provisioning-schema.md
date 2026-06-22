# Provisioning Schema Reference

This document provides a complete reference for the `@apvee/m365-actionable-provisioning` schema model, including plan structure, action types, parameters, and field definitions.

## Table of Contents

- [Plan Structure](#plan-structure)
- [Parameters](#parameters)
- [Site Actions](#site-actions)
- [List Actions](#list-actions)
- [Permission Actions](#permission-actions)
- [Field Actions](#field-actions)
- [Content Type Actions](#content-type-actions)
- [Schema Exports](#schema-exports)
- [Complete Examples](#complete-examples)
- [Best Practices](#best-practices)

---

## Plan Structure

### Action Semantics

The schema separates existence from mutable desired state:

| Action family | Meaning | Drift behavior |
|---------------|---------|----------------|
| `create*` | Ensure the resource exists | Existing mutable property differences are accepted |
| `modify*` | Enforce mutable state | Declared mutable property differences are non-compliant |
| `delete*` | Ensure the resource is absent | Existing resource is non-compliant |

Create action payload properties are used when creating a missing resource. If the resource already exists, those properties are not automatically reconciled. Use a follow-up `modify*` action when the plan must enforce configuration.

```ts
{
  verb: "createSPList",
  listName: "requests",
  title: "Requests"
},
{
  verb: "modifySPList",
  listName: "requests",
  title: "Richieste",
  enableVersioning: true
}
```

Create compliance still detects structural collisions when possible. For example, an existing field with the same `fieldName` but an incompatible SharePoint field type is not treated as a clean create match.

List identity uses `listName`, the stable list root/name. Mutable list display values such as SharePoint `Title` or Microsoft Graph `displayName` are not used to identify lists.

A provisioning plan is a JSON object validated by Zod schemas. The root structure includes metadata and an array of actions.

### Schema Definition

```typescript
import type { M365ProvisioningPlan } from '@apvee/m365-actionable-provisioning';

interface M365ProvisioningPlan {
  schemaVersion?: string;  // Defaults to "1.0"
  title?: string;          // Optional plan title
  description?: string;    // Optional plan description
  parameters?: Parameter[]; // Dynamic parameters
  actions: Action[];       // Root-level actions
}
```

### Minimal Plan Example

```typescript
const minimalPlan: M365ProvisioningPlan = {
  schemaVersion: "1.0",
  actions: [
    {
      verb: "modifySPSite",
      siteUrl: "https://contoso.sharepoint.com/sites/project",
      title: "My Project"
    }
  ]
};
```

### Complete Plan Example

```typescript
const completePlan: M365ProvisioningPlan = {
  schemaVersion: "1.0",
  title: "Engineering Portal Setup",
  description: "Provisions the engineering portal with required lists and fields",
  parameters: [
    { key: "TenantUrl", value: "https://contoso.sharepoint.com" },
    { key: "ProjectAlias", value: "engineering-portal" }
  ],
  actions: [
    // Site and list actions...
  ]
};
```

---

## Parameters

Parameters enable dynamic value substitution throughout your plan using the `{parameter:KeyName}` syntax.

### Parameter Definition

```typescript
interface Parameter {
  key: string;    // Unique identifier
  value: string;  // Default value
}
```

### Using Parameters

Reference parameters in any string field using `{parameter:KeyName}`:

```typescript
{
  parameters: [
    { key: "TenantUrl", value: "https://contoso.sharepoint.com" },
    { key: "SiteName", value: "project-alpha" }
  ],
  actions: [
    {
      verb: "createSPSite",
      siteType: "CommunicationSite",
      title: "Project Alpha",
      url: "{parameter:TenantUrl}/sites/{parameter:SiteName}"
    }
  ]
}
```

### Parameter Best Practices

| Practice | Recommendation |
|----------|---------------|
| Naming | Use PascalCase (e.g., `TenantUrl`, `ProjectName`) |
| Reuse | Extract repeated URLs and names into parameters |
| Environment | Use parameters for tenant-specific values |
| Lists | Parameterize list internal names for consistency |

---

## Content Type Actions

Content type actions use Microsoft Graph. Runtime clients must include `graphClient`, and Microsoft Graph must grant `Sites.Manage.All` or a higher permission such as `Sites.FullControl.All`.

`createSPContentType` does not accept a custom content type id. Provide `name` and `parentId`; Microsoft Graph returns the generated id. Reference actions accept `contentTypeId` or `contentTypeName`; `contentTypeId` wins when both are supplied.

Field-to-content-type actions require existing site columns. Create the site column first, then attach it to the content type:

```typescript
{
  verb: "createSPSiteColumn",
  fieldType: "Text",
  fieldName: "CustomerCode",
  displayName: "Customer Code"
},
{
  verb: "createSPContentType",
  name: "Customer Document",
  parentId: "0x0101",
  subactions: [
    {
      verb: "addSPFieldToContentType",
      fieldName: "CustomerCode",
      required: true
    }
  ]
}
```

When a site column is created in the same provisioning run, reference it by `fieldName` from content type field actions. The engine propagates the actual SharePoint field id created or found by `createSPSiteColumn` and uses that id internally, avoiding Graph name lookup timing differences without relying on caller-supplied GUIDs.

Bind a site content type to a list or document library through a list subaction:

```typescript
{
  verb: "createSPList",
  listName: "documents",
  title: "Documents",
  template: 101,
  enableContentTypes: true,
  subactions: [
    {
      verb: "addSPContentTypeToList",
      contentTypeName: "Customer Document"
    }
  ]
}
```

`setSPListDefaultContentType` is not registered in V1. Default content type ordering remains spike-gated until a reliable implementation path is proven.

---

## Site Actions

Site actions operate at the SharePoint site collection level.

### createSPSite

Creates a new SharePoint site collection.

#### Communication Site

```typescript
{
  verb: "createSPSite",
  siteType: "CommunicationSite",
  
  // Required
  title: string,           // Site title
  url: string,             // Full site URL
  
  // Optional
  owner?: string,          // Owner email
  lcid?: number,           // Locale ID (e.g., 1033 for en-US)
  description?: string,    // Site description
  classification?: string, // Data classification
  siteDesignId?: string,   // Site design GUID
  hubSiteId?: string,      // Hub site GUID to associate
  shareByEmailEnabled?: boolean,
  webTemplate?: "SITEPAGEPUBLISHING#0" | "STS#3",
  
  subactions?: Action[]    // Site-level subactions
}
```

**Example:**

```typescript
{
  verb: "createSPSite",
  siteType: "CommunicationSite",
  title: "Engineering Portal",
  url: "{parameter:TenantUrl}/sites/engineering",
  description: "Central hub for engineering resources",
  lcid: 1033,
  webTemplate: "SITEPAGEPUBLISHING#0",
  subactions: [
    // Lists and site columns...
  ]
}
```

#### Team Site (Microsoft 365 Group)

```typescript
{
  verb: "createSPSite",
  siteType: "TeamSite",
  
  // Required
  displayName: string,     // Microsoft 365 Group display name
  alias: string,           // Group alias (URL segment)
  url: string,             // Expected site URL
  
  // Optional
  isPublic?: boolean,      // Public or private group
  lcid?: number,           // Locale ID
  description?: string,    // Group description
  classification?: string, // Data classification
  owners?: string[],       // Owner emails
  hubSiteId?: string,      // Hub site GUID
  siteDesignId?: string,   // Site design GUID
  
  subactions?: Action[]
}
```

**Example:**

```typescript
{
  verb: "createSPSite",
  siteType: "TeamSite",
  displayName: "Project Alpha Team",
  alias: "project-alpha-team",
  url: "{parameter:TenantUrl}/sites/project-alpha-team",
  isPublic: false,
  description: "Collaboration space for Project Alpha",
  owners: ["admin@contoso.com"]
}
```

### modifySPSite

Modifies an existing SharePoint site.

```typescript
{
  verb: "modifySPSite",
  
  // Required (one of)
  siteUrl: string,         // Target site URL
  
  // Optional modifications
  title?: string,          // New site title
  description?: string,    // New description
  
  subactions?: Action[]    // Site-level subactions (lists, site columns)
}
```

**Example:**

```typescript
{
  verb: "modifySPSite",
  siteUrl: "{parameter:TenantUrl}/sites/{parameter:ProjectName}",
  title: "Engineering Portal (Updated)",
  description: "Updated engineering portal description",
  subactions: [
    {
      verb: "createSPSiteColumn",
      fieldType: "Text",
      fieldName: "ProjectCode",
      displayName: "Project Code",
      maxLength: 20
    },
    {
      verb: "createSPList",
      listName: "requests",
      title: "Requests",
      template: 100
    }
  ]
}
```

### deleteSPSite

Deletes a SharePoint site collection.

```typescript
{
  verb: "deleteSPSite",
  siteUrl: string          // Site URL to delete
}
```

> **Warning**: This action permanently deletes the site. Use with caution.

---

## List Actions

List actions create, modify, or delete SharePoint lists.

### createSPList

Creates a new SharePoint list.

```typescript
{
  verb: "createSPList",
  
  // Target (optional - inherited from parent scope)
  siteUrl?: string,        // Site collection URL
  webUrl?: string,         // Web URL (for subsites)
  
  // Required
  listName: string,        // Internal name (no spaces)
  title: string,           // Display title
  template: number,        // List template ID (default: 100)
  
  // Optional settings
  desc?: string,           // Description
  enableContentTypes?: boolean,
  hidden?: boolean,
  onQuickLaunch?: boolean,
  enableAttachments?: boolean,
  enableFolderCreation?: boolean,
  enableVersioning?: boolean,
  enableMinorVersions?: boolean,
  forceCheckout?: boolean,
  majorVersionLimit?: number,      // 1-50000
  majorWithMinorVersionsLimit?: number,
  draftVersionVisibility?: "Reader" | "Author" | "Approver",
  readSecurity?: 1 | 2,    // 1=All users, 2=Created items
  writeSecurity?: 1 | 2 | 3 | 4,
  noCrawl?: boolean,       // Exclude from search
  enableModeration?: boolean,
  
  subactions?: Action[]    // List-level subactions (fields)
}
```

**Common Template IDs:**

| Template | ID | Description |
|----------|-----|-------------|
| GenericList | 100 | Custom list |
| DocumentLibrary | 101 | Document library |
| Survey | 102 | Survey list |
| Links | 103 | Links list |
| Announcements | 104 | Announcements |
| Contacts | 105 | Contacts list |
| Events | 106 | Calendar |
| Tasks | 107 | Tasks list |
| DiscussionBoard | 108 | Discussion board |
| PictureLibrary | 109 | Picture library |
| IssueTracking | 1100 | Issue tracking |

**Example:**

```typescript
{
  verb: "createSPList",
  listName: "engineeringRequests",
  title: "Engineering Requests",
  desc: "Track engineering requests and their status",
  template: 100,
  enableVersioning: true,
  majorVersionLimit: 50,
  onQuickLaunch: true,
  enableFolderCreation: true,
  readSecurity: 1,
  writeSecurity: 1,
  subactions: [
    {
      verb: "addSPField",
      fieldType: "Text",
      fieldName: "RequestTitle",
      displayName: "Request Title",
      required: true,
      addToDefaultView: true
    },
    {
      verb: "enableSPListRating",
      ratingType: "Likes"
    }
  ]
}
```

### modifySPList

Modifies an existing SharePoint list.

```typescript
{
  verb: "modifySPList",
  
  // Target (required)
  listName: string,        // Internal list name
  siteUrl?: string,
  webUrl?: string,
  
  // Optional modifications (same as createSPList)
  title?: string,
  desc?: string,
  // ... all list settings
  
  subactions?: Action[]
}
```

### deleteSPList

Deletes a SharePoint list.

```typescript
{
  verb: "deleteSPList",
  
  // Required
  listName: string,        // Internal list name
  
  // Optional
  webUrl?: string,         // Web URL (for targeting specific web)
  recycle?: boolean        // Send to recycle bin (default: true)
}
```

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `listName` | `string` | ✓ | - | Internal name of the list to delete |
| `webUrl` | `string` | - | Current web | Web URL containing the list |
| `recycle` | `boolean` | - | `true` | If true, sends to recycle bin; if false, permanently deletes |

**Example:**

```typescript
{
  verb: "deleteSPList",
  listName: "oldRequests",
  recycle: true  // Can be restored from recycle bin
}
```

> **Warning**: Set `recycle: false` with extreme caution—this permanently deletes all list data.

### enableSPListRating

Enables ratings on a list (subaction within `createSPList` or `modifySPList`).

```typescript
{
  verb: "enableSPListRating",
  ratingType: "Likes" | "Stars"
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `ratingType` | `"Likes" \| "Stars"` | ✓ | Type of rating to enable |

- **Likes**: Simple like/unlike toggle (recommended for modern sites)
- **Stars**: 1-5 star rating scale

**Example:**

```typescript
{
  verb: "createSPList",
  listName: "ideas",
  title: "Ideas",
  template: 100,
  subactions: [
    {
      verb: "enableSPListRating",
      ratingType: "Likes"
    }
  ]
}
```

---

## Permission Actions

Permission actions manage SharePoint role inheritance and explicit role
bindings on site and list/library scopes. V1 is additive and targeted: it
changes only the declared inheritance state or principal/role binding. Grant
and remove role-assignment actions affect only the declared principal/role
binding.

Site permission actions are allowed only under `createSPSite` and
`modifySPSite`:

```ts
{
  verb: "modifySPSite",
  siteUrl: "https://contoso.sharepoint.com/sites/project",
  subactions: [
    {
      verb: "grantSPSiteRoleAssignment",
      principalType: "spGroupName",
      principal: "Project Owners",
      roleName: "Full Control",
      breakRoleInheritance: true,
      copyRoleAssignments: true,
      clearSubscopes: false
    }
  ]
}
```

List/library permission actions are allowed only under `createSPList` and
`modifySPList`:

```ts
{
  verb: "modifySPList",
  listName: "documents",
  subactions: [
    {
      verb: "grantSPListRoleAssignment",
      principalType: "m365GroupMailNickname",
      principal: "project-members",
      roleType: "contribute"
    }
  ]
}
```

Supported verbs:

| Scope | Inheritance | Role assignments |
|-------|-------------|------------------|
| Site | `breakSPSiteRoleInheritance`, `resetSPSiteRoleInheritance` | `grantSPSiteRoleAssignment`, `removeSPSiteRoleAssignment` |
| List/library | `breakSPListRoleInheritance`, `resetSPListRoleInheritance` | `grantSPListRoleAssignment`, `removeSPListRoleAssignment` |

Principal fields:

```ts
principalType:
  | "loginName"
  | "spGroupName"
  | "entraGroupId"
  | "m365GroupId"
  | "entraGroupName"
  | "m365GroupName"
  | "m365GroupMailNickname";
principal: string;
```

Role fields require exactly one of:

```ts
roleId?: number;
roleName?: string;
roleType?: "read" | "contribute" | "edit" | "design" | "fullControl";
```

`grant*RoleAssignment` can break inherited permissions only when
`breakRoleInheritance: true` is declared. The public defaults are
`copyRoleAssignments: true` and `clearSubscopes: false`.

`reset*RoleInheritance` removes unique local role assignments and returns the
target to inherited permissions. Use it only when that destructive behavior is
intended.

Group name lookups are convenience features and must resolve to exactly one
group. Prefer `entraGroupId`, `m365GroupId`, or `m365GroupMailNickname` for
deterministic provisioning. Graph is used only for group lookup by name or mail
nickname; role assignment writes use SharePoint security APIs.

---

## Field Actions

Field actions create, modify, or delete columns. The verb used depends on context:

| Verb | Context | Description |
|------|---------|-------------|
| `createSPSiteColumn` | Site (modifySPSite subaction) | Creates a site column |
| `addSPField` | List (createSPList/modifySPList subaction) | Creates a list column |
| `modifySPField` | Site or List | Modifies an existing field |
| `deleteSPField` | Site or List | Deletes a field |

### Field Actions Overview

When creating fields in SharePoint, choosing the correct verb is important:

#### When to Use `createSPSiteColumn`

- Creating a **reusable column** at the site level
- Column will be added to **content types** or **multiple lists**
- Column appears in the **Site Columns gallery**
- Used within `modifySPSite` subactions

#### When to Use `addSPField`

- Creating a column **specific to one list**
- Column is **not reusable** across the site
- Column exists **only within the target list**
- Used within `createSPList` or `modifySPList` subactions

#### Decision Matrix

| Scenario | Verb | Rationale |
|----------|------|----------|
| Field reused across lists | `createSPSiteColumn` | Create once, add to lists via content types |
| List-specific field | `addSPField` | No need for site-level visibility |
| Field in content type | `createSPSiteColumn` | Content types require site columns |
| Quick list customization | `addSPField` | Simplest approach for single lists |

### addSPField

Creates a field directly on a SharePoint list. Use this within `createSPList` or `modifySPList` subactions.

```typescript
{
  verb: "addSPField",
  
  // Required
  fieldType: FieldType,    // "Text", "Number", "Choice", etc.
  fieldName: string,       // Internal name (no spaces)
  displayName: string,     // Display name shown in UI
  
  // Common optional
  group?: string,          // Field group (for organization)
  required?: boolean,      // Whether field is required
  description?: string,    // Field description
  hidden?: boolean,        // Hide from forms
  defaultValue?: any,      // Default value (type varies by fieldType)
  
  // List-only properties
  addToDefaultView?: boolean,    // Add column to default view
  showInDisplayForm?: boolean,   // Show in display form
  showInEditForm?: boolean,      // Show in edit form
  showInNewForm?: boolean,       // Show in new item form
  
  // Validation
  validationFormula?: string,    // Validation formula
  validationMessage?: string,    // Custom validation message
  enforceUniqueValues?: boolean, // Require unique values
  indexed?: boolean              // Index for performance
}
```

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `fieldType` | `FieldType` | ✓ | - | Field type (see Supported Field Types) |
| `fieldName` | `string` | ✓ | - | Internal name (no spaces, no special chars) |
| `displayName` | `string` | ✓ | - | Display name shown in UI |
| `addToDefaultView` | `boolean` | - | `false` | Automatically add to list's default view |
| `showInDisplayForm` | `boolean` | - | `true` | Show field in display form |
| `showInEditForm` | `boolean` | - | `true` | Show field in edit form |
| `showInNewForm` | `boolean` | - | `true` | Show field in new item form |

**Example:**

```typescript
{
  verb: "createSPList",
  listName: "projects",
  title: "Projects",
  template: 100,
  subactions: [
    {
      verb: "addSPField",
      fieldType: "Text",
      fieldName: "ProjectCode",
      displayName: "Project Code",
      required: true,
      maxLength: 10,
      enforceUniqueValues: true,
      addToDefaultView: true
    },
    {
      verb: "addSPField",
      fieldType: "Choice",
      fieldName: "Status",
      displayName: "Status",
      choices: ["Not Started", "In Progress", "Completed"],
      defaultChoice: "Not Started",
      addToDefaultView: true
    }
  ]
}
```

### createSPSiteColumn

Creates a site column (field at the web level). Use this within `modifySPSite` subactions.

```typescript
{
  verb: "createSPSiteColumn",
  
  // Required
  fieldType: FieldType,    // "Text", "Number", "Choice", etc.
  fieldName: string,       // Internal name (no spaces)
  displayName: string,     // Display name
  
  // Common optional
  group?: string,          // Site column group (for organization)
  required?: boolean,      // Whether field is required
  description?: string,    // Field description
  hidden?: boolean,        // Hide from site column gallery
  id?: string,             // Advanced field id hint; do not use as a content type reference
  
  // Validation
  validationFormula?: string,    // Validation formula
  validationMessage?: string,    // Custom validation message
  enforceUniqueValues?: boolean, // Require unique values
  indexed?: boolean              // Index for performance
}
```

> **Note**: Site columns do NOT support list-only properties like `addToDefaultView`, `showInDisplayForm`, etc.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `fieldType` | `FieldType` | ✓ | Field type (see Supported Field Types) |
| `fieldName` | `string` | ✓ | Internal name (no spaces, no special chars) |
| `displayName` | `string` | ✓ | Display name shown in UI |
| `group` | `string` | - | Site column group for organization |
| `id` | `string` | - | Advanced SharePoint field id hint. Do not use it as the content type column reference; use `fieldName` in same-run content type actions so the engine can use the actual created/found id. |

**Example:**

```typescript
{
  verb: "modifySPSite",
  siteUrl: "{parameter:TenantUrl}/sites/{parameter:ProjectName}",
  subactions: [
    {
      verb: "createSPSiteColumn",
      fieldType: "Text",
      fieldName: "ProjectCode",
      displayName: "Project Code",
      group: "Custom Columns",
      maxLength: 20,
      required: true
    },
    {
      verb: "createSPSiteColumn",
      fieldType: "User",
      fieldName: "ProjectManager",
      displayName: "Project Manager",
      group: "Custom Columns",
      selectionMode: "PeopleOnly"
    }
  ]
}
```

### Supported Field Types

The library supports the following SharePoint field types:

| Type | Description | Key Properties |
|------|-------------|----------------|
| `Text` | Single line of text | `maxLength` (1-255) |
| `MultilineText` | Multiple lines | `numberOfLines`, `richText`, `appendOnly` |
| `Number` | Numeric value | `minimumValue`, `maximumValue`, `showAsPercentage` |
| `Currency` | Currency value | `minimumValue`, `maximumValue`, `currencyLocaleId` |
| `DateTime` | Date/time | `displayFormat`, `calendarType`, `friendlyDisplayFormat` |
| `Boolean` | Yes/No | `defaultValue` |
| `Choice` | Single choice | `choices`, `editFormat`, `fillInChoice`, `defaultChoice` |
| `MultiChoice` | Multiple choices | `choices`, `fillInChoice`, `defaultValue` |
| `Url` | Hyperlink/Picture | `displayFormat` ("Hyperlink" or "Image") |
| `User` | Person/Group | `selectionMode`, `selectionGroup` |
| `Lookup` | Lookup to another list | `lookupListName`, `lookupListId`, `showField` |
| `Calculated` | Calculated value | `formula`, `outputType` |
| `Location` | Location picker | (no additional properties) |

### Common Field Properties

All field types share these base properties:

```typescript
{
  // Required for all fields
  fieldType: FieldType,    // "Text", "Number", etc.
  fieldName: string,       // Internal name (no spaces)
  displayName: string,     // Display name
  
  // Common optional properties
  group?: string,          // Site column group
  required?: boolean,      // Required field
  description?: string,    // Field description
  hidden?: boolean,        // Hidden field
  id?: string,             // Advanced field id hint
  
  // List-only properties (ignored for site columns)
  addToDefaultView?: boolean,
  showInDisplayForm?: boolean,
  showInEditForm?: boolean,
  showInNewForm?: boolean
}
```

### Field Type Examples

#### Text Field

```typescript
{
  verb: "addSPField",
  fieldType: "Text",
  fieldName: "ProjectCode",
  displayName: "Project Code",
  maxLength: 20,
  required: true,
  defaultValue: "PRJ-",
  enforceUniqueValues: true,
  indexed: true,
  addToDefaultView: true
}
```

#### MultilineText Field

```typescript
{
  verb: "addSPField",
  fieldType: "MultilineText",
  fieldName: "Description",
  displayName: "Description",
  numberOfLines: 6,
  richText: true,
  appendOnly: false,
  allowHyperlink: true
}
```

#### Number Field

```typescript
{
  verb: "addSPField",
  fieldType: "Number",
  fieldName: "Score",
  displayName: "Score",
  minimumValue: 0,
  maximumValue: 100,
  defaultValue: 0,
  showAsPercentage: false,
  addToDefaultView: true
}
```

#### Currency Field

```typescript
{
  verb: "addSPField",
  fieldType: "Currency",
  fieldName: "Budget",
  displayName: "Budget",
  minimumValue: 0,
  maximumValue: 1000000,
  currencyLocaleId: 1033,  // USD
  defaultValue: 0
}
```

#### DateTime Field

```typescript
{
  verb: "addSPField",
  fieldType: "DateTime",
  fieldName: "DueDate",
  displayName: "Due Date",
  displayFormat: "DateOnly",     // or "DateTime"
  calendarType: "Gregorian",
  friendlyDisplayFormat: "Relative",  // or "Disabled"
  addToDefaultView: true
}
```

#### Choice Field

```typescript
{
  verb: "addSPField",
  fieldType: "Choice",
  fieldName: "Status",
  displayName: "Status",
  choices: ["New", "In Progress", "Completed", "Cancelled"],
  editFormat: "Dropdown",        // or "RadioButtons"
  fillInChoice: false,
  defaultChoice: "New",
  addToDefaultView: true
}
```

#### MultiChoice Field

```typescript
{
  verb: "addSPField",
  fieldType: "MultiChoice",
  fieldName: "Tags",
  displayName: "Tags",
  choices: ["Frontend", "Backend", "DevOps", "Security"],
  fillInChoice: true,
  defaultValue: ["Backend"]
}
```

#### User Field

```typescript
{
  verb: "addSPField",
  fieldType: "User",
  fieldName: "AssignedTo",
  displayName: "Assigned To",
  selectionMode: "PeopleOnly",   // or "PeopleAndGroups"
  selectionGroup: 0,             // 0 = all users
  allowMultipleValues: false
}
```

#### Lookup Field

```typescript
{
  verb: "addSPField",
  fieldType: "Lookup",
  fieldName: "Category",
  displayName: "Category",
  lookupListName: "Categories",  // List root folder name
  showField: "Title",            // Field to display
  allowMultipleValues: false
}
```

### Best-Effort Field Settings

Some SharePoint field settings are applied after field creation because PnPjs or SharePoint REST does not apply them reliably during the initial create call. The action still succeeds when the field is created, but the result can include warnings if these best-effort updates fail.

Current best-effort settings include:

| Field type | Settings |
|------------|----------|
| All list fields | `addToDefaultView` membership |
| `MultilineText` | `required` post-create update |
| `User` | `allowMultipleValues`, `presence`, `selectionGroup` |
| `Lookup` | post-create lookup settings and `dependentLookupFields` |

Use `modifySPField` after creation when a plan must enforce mutable field settings and surface drift through compliance.

#### Calculated Field

```typescript
{
  verb: "addSPField",
  fieldType: "Calculated",
  fieldName: "FullName",
  displayName: "Full Name",
  formula: '=CONCATENATE([First Name]," ",[Last Name])',
  outputType: "Text"             // or "Number", "Currency", "DateTime", "Boolean"
}
```

### Modifying Fields

Use `modifySPField` to update existing field properties:

```typescript
{
  verb: "modifySPField",
  fieldType: "Text",             // Must match existing field type
  fieldName: "ProjectCode",      // Internal name to find
  displayName: "Project Code (Updated)",
  maxLength: 50
}
```

---

## Schema Exports

The library exports Zod schemas and constants for advanced validation and type generation.

### Import

```typescript
import {
  // Schema objects
  m365ActionsSchema,
  m365ProvisioningPlanSchema,
  
  // Constants
  DEFAULT_SCHEMA_VERSION,
  SUPPORTED_SCHEMA_VERSIONS,
  
  // Type
  type SupportedSchemaVersion,
  type M365ProvisioningPlan,
} from '@apvee/m365-actionable-provisioning';
```

### m365ProvisioningPlanSchema

The root Zod schema for validating entire provisioning plans:

```typescript
import { m365ProvisioningPlanSchema } from '@apvee/m365-actionable-provisioning';

// Validate a plan
const result = m365ProvisioningPlanSchema.safeParse(myPlan);
if (!result.success) {
  console.error('Invalid plan:', result.error.issues);
}
```

### m365ActionsSchema

The Zod schema for validating individual actions:

```typescript
import { m365ActionsSchema } from '@apvee/m365-actionable-provisioning';

// Validate an action
const result = m365ActionsSchema.safeParse(myAction);
```

### Schema Version Constants

```typescript
// Current default schema version
const DEFAULT_SCHEMA_VERSION = "1.0";

// All supported schema versions
const SUPPORTED_SCHEMA_VERSIONS = ["1.0"] as const;

// Type for schema version
type SupportedSchemaVersion = "1.0";
```

### Action Classes (Advanced)

For advanced use cases, action classes are exported:

```typescript
import {
  // Site actions
  CreateSPSiteAction,
  ModifySPSiteAction,
  DeleteSPSiteAction,
  
  // List actions
  CreateSPListAction,
  ModifySPListAction,
  DeleteSPListAction,
  EnableSPListRatingAction,
  
  // Field actions
  AddSPFieldAction,
  CreateSPSiteColumnAction,
  ModifySPFieldAction,
  DeleteSPFieldAction,
} from '@apvee/m365-actionable-provisioning';
```

### Action Schemas (Advanced)

Individual action schemas for fine-grained validation:

```typescript
import {
  createSPSiteSchema,
  modifySPSiteSchema,
  deleteSPSiteSchema,
  createSPListSchema,
  modifySPListSchema,
  deleteSPListSchema,
  addSPFieldSchema,
  createSPSiteColumnSchema,
  modifySPFieldSchema,
  deleteSPFieldSchema,
} from '@apvee/m365-actionable-provisioning';
```

---

## Complete Examples

### Example 1: Communication Site with Lists

```typescript
import type { M365ProvisioningPlan } from '@apvee/m365-actionable-provisioning';

export const engineeringPortalPlan: M365ProvisioningPlan = {
  schemaVersion: "1.0",
  title: "Engineering Portal Setup",
  parameters: [
    { key: "TenantUrl", value: "https://contoso.sharepoint.com" },
    { key: "PortalName", value: "engineering-portal" }
  ],
  actions: [
    {
      verb: "createSPSite",
      siteType: "CommunicationSite",
      title: "Engineering Portal",
      url: "{parameter:TenantUrl}/sites/{parameter:PortalName}",
      description: "Central hub for engineering resources",
      lcid: 1033,
      webTemplate: "SITEPAGEPUBLISHING#0"
    },
    {
      verb: "modifySPSite",
      siteUrl: "{parameter:TenantUrl}/sites/{parameter:PortalName}",
      subactions: [
        // Site columns
        {
          verb: "createSPSiteColumn",
          fieldType: "Choice",
          fieldName: "Priority",
          displayName: "Priority",
          choices: ["Low", "Medium", "High", "Critical"],
          defaultChoice: "Medium"
        },
        // Lists
        {
          verb: "createSPList",
          listName: "engineeringRequests",
          title: "Engineering Requests",
          template: 100,
          enableVersioning: true,
          majorVersionLimit: 50,
          subactions: [
            {
              verb: "addSPField",
              fieldType: "Text",
              fieldName: "RequestTitle",
              displayName: "Request Title",
              required: true,
              addToDefaultView: true
            },
            {
              verb: "addSPField",
              fieldType: "MultilineText",
              fieldName: "Description",
              displayName: "Description",
              richText: true,
              numberOfLines: 6
            },
            {
              verb: "addSPField",
              fieldType: "DateTime",
              fieldName: "DueDate",
              displayName: "Due Date",
              displayFormat: "DateOnly",
              addToDefaultView: true
            }
          ]
        }
      ]
    }
  ]
};
```

### Example 2: Team Site with Document Library

```typescript
export const projectTeamPlan: M365ProvisioningPlan = {
  schemaVersion: "1.0",
  parameters: [
    { key: "TenantUrl", value: "https://contoso.sharepoint.com" },
    { key: "TeamAlias", value: "project-alpha" }
  ],
  actions: [
    {
      verb: "createSPSite",
      siteType: "TeamSite",
      displayName: "Project Alpha Team",
      alias: "{parameter:TeamAlias}",
      url: "{parameter:TenantUrl}/sites/{parameter:TeamAlias}",
      isPublic: false,
      description: "Project Alpha collaboration space",
      subactions: [
        {
          verb: "createSPList",
          listName: "ProjectDocuments",
          title: "Project Documents",
          template: 101,  // Document Library
          enableVersioning: true,
          enableMinorVersions: true,
          majorVersionLimit: 500,
          majorWithMinorVersionsLimit: 10,
          subactions: [
            {
              verb: "addSPField",
              fieldType: "Choice",
              fieldName: "DocumentType",
              displayName: "Document Type",
              choices: ["Specification", "Design", "Report", "Other"],
              addToDefaultView: true
            },
            {
              verb: "addSPField",
              fieldType: "DateTime",
              fieldName: "ReviewDate",
              displayName: "Review Date",
              displayFormat: "DateOnly"
            }
          ]
        }
      ]
    }
  ]
};
```

---

## Best Practices

### Plan Organization

1. **Use parameters** for tenant URLs, list names, and environment-specific values
2. **Group related actions** using `modifySPSite` as a container for lists and site columns
3. **Order matters**: Create lookup source lists before lists that reference them

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Parameters | PascalCase | `TenantUrl`, `ProjectName` |
| List internal names | camelCase | `engineeringRequests` |
| Field internal names | PascalCase | `RequestTitle`, `DueDate` |
| Site URLs | lowercase-hyphenated | `/sites/engineering-portal` |

### Field Design

1. **Always set `required`** explicitly when needed
2. **Use `addToDefaultView: true`** for important fields
3. **Set `defaultValue`** for better user experience
4. **Group site columns** using the `group` property

### Versioning

1. **Increment `version`** when making plan changes
2. **Document changes** in the plan description
3. **Keep `schemaVersion`** at "1.0" unless using newer schema features

### Error Prevention

1. **Validate plans** using the schema before deployment
2. **Use compliance checking** before running provisioning
3. **Test in development** before production deployment
4. **Avoid duplicate field names** within the same scope

---

## Related Documentation

- [Core engine](./engine.md) - Generic engine API and execution model
- [SPFx integration](../spfx/integration.md) - SPFx package setup and hook runtime
- [ProvisioningDialog](../spfx/provisioning-dialog.md) - Dialog component for SPFx provisioning UI
- [Property pane fields](../spfx/property-pane-fields.md) - SPFx property pane integration
