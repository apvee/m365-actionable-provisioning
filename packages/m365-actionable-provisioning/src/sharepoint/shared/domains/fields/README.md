# Fields Domain Helpers

Internal utilities for SharePoint field operations.

## Purpose

Provides reusable functions for:
- Looking up fields by name or title
- Updating field properties
- Managing field view settings

## Files

| File | Description |
|------|-------------|
| index.ts | Barrel export |
| field-lookup.ts | Field lookup and manipulation utilities |

## Key Functions

### Field Lookup

```typescript
// Find field by internal name or title
const field = await getFieldByNameOrTitle(list, "Title");

// Check if field exists
const exists = await checkFieldExists(list, "CustomColumn");

// Extract field ID from various result shapes
const id = extractFieldId(createResult);
```

### Field Updates

```typescript
// Update display name
await updateFieldDisplayName(list, "InternalName", "Display Name");

// Apply view settings
await applyFieldViewSettings(list, "ColumnName", {
  addToDefaultView: true,
  showInEditForm: true,
  showInNewForm: false,
});
```
