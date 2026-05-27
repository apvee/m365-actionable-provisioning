# Lists Domain Helpers

Internal utilities for SharePoint list operations.

## Purpose

Provides reusable functions for:
- Looking up lists by various identifiers
- Probing list-related permissions
- Resolving web URLs

## Files

| File | Description |
|------|-------------|
| index.ts | Barrel export |
| list-lookup.ts | List lookup and URL resolution functions |
| list-permissions.ts | Permission probing for ManageLists |

## Key Functions

### List Lookup

```typescript
// Find list by root folder name (URL name)
const info = await getListInfoByRootFolderName(web, "Documents");

// Escape for OData filters
const safe = escapeODataStringLiteral("O'Brien's List");

// Resolve effective web URL
const url = await resolveWebUrlString(web, effectiveWebUrl);
```

### Permissions

```typescript
// Probe ManageLists permission
const result = await probeManageListsPermission(web, effectiveWebUrl);
// { decision: "allow" | "deny" | "unknown", message: string }
```
