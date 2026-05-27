# Utils

General utility functions for the provisioning module.

## Purpose

This folder contains utility functions that:
- Handle error extraction and normalization from PnPjs
- Resolve target webs for action execution
- Provide object manipulation helpers

## Files

| File | Description |
|------|-------------|
| index.ts | Barrel export for all utilities |
| sp-utils.ts | `resolveTargetWeb()` - resolves target web from scope/payload |
| object-utils.ts | `pickDefined()` - filters undefined/null from objects |
| pnpjs-error.ts | Error extraction utilities for PnPjs HTTP errors |

## Key Functions

### resolveTargetWeb

Resolves the target Web for actions that operate within a web context:

```typescript
const { web, effectiveWebUrl } = await resolveTargetWeb({
  spfi,
  scopeWeb: ctx.scopeIn.web,
  webUrl: payload.webUrl,
  siteUrl: payload.siteUrl,
});
```

Resolution order:
1. Explicit `webUrl` from payload
2. Explicit `siteUrl` (root web of site collection)
3. `scopeWeb` from parent action
4. Default: root web of SPFI context

### pickDefined

Creates a shallow copy with only defined values:

```typescript
const payload = pickDefined({
  title: "My List",
  description: undefined,  // excluded
  enableVersioning: true,
});
// Result: { title: "My List", enableVersioning: true }
```

## Adding New Utilities

1. Create a new file in this folder
2. Export functions and types
3. Add export to `index.ts`
4. If the utility should be public API, add export to `../index.ts`
