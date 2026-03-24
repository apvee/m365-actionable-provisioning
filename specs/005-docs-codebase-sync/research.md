# Research: Documentation Codebase Sync

**Feature**: 005-docs-codebase-sync  
**Date**: 2026-03-24  
**Purpose**: Identify documentation gaps between codebase exports and existing documentation

## Executive Summary

This research identifies all `@public` exports from the library and compares them against existing documentation. The analysis reveals:

- **1 major undocumented module**: ExtractionService (entire subsystem)
- **5 undocumented action types**: `deleteSPSite`, `deleteSPList`, `enableSPListRating`, `addSPField`, `createSPSiteColumn`
- **2 underdocumented hooks**: `useSPFxProvisioningEngine`, `useProvisioningDerivedState`
- **Field actions clarity needed**: `addSPField` vs `createSPSiteColumn` distinction

## Module Export Analysis

### 1. Core Module (`@apvee/spfx-actionable-provisioning/core`)

| Export | Type | Documented | Notes |
|--------|------|------------|-------|
| `ActionDefinition` | class | ❌ | Advanced use only |
| `defaultActionResultSchema` | const | ❌ | Advanced use only |
| `ProvisioningEngineBase` | class | ✅ | Via spfx-engine.md |
| `consoleSink` | function | ✅ | Via introduction.md |
| `createLogger` | function | ✅ | Via introduction.md |
| `createProvisioningPlanSchema` | function | ❌ | Advanced use only |
| `ProvisioningPlanTemplateError` | class | ❌ | Error type |
| `normalizeError` | function | ❌ | Utility |
| Type exports (15+) | types | Partial | Some in spfx-engine.md |

**Decision**: Core module is primarily for advanced/internal use. Document only `EngineStatus`, `EngineSnapshot`, `Logger`, `LogLevel` types that consumers commonly need.

### 2. Provisioning Module (`@apvee/spfx-actionable-provisioning/provisioning`)

#### Engines

| Export | Documented | Location | Gap |
|--------|------------|----------|-----|
| `SPFxProvisioningEngine` | ✅ | spfx-engine.md | Complete |
| `SharePointProvisioningEngine` | Partial | spfx-engine.md | Missing options reference |

#### Types

| Export | Documented | Location | Gap |
|--------|------------|----------|-----|
| `SPScope` | ❌ | - | Needs brief reference |
| `SPRuntimeContext` | ❌ | - | Internal type |
| `ProvisioningOutcome` | ❌ | - | Needs brief reference |
| `ProvisioningPlan` | ✅ | provisioning-schema.md | Complete |

#### Actions - Sites

| Action | Documented | Schema Documented | Gap |
|--------|------------|-------------------|-----|
| `createSPSite` | ✅ | ✅ | Complete |
| `modifySPSite` | ✅ | ✅ | Complete |
| `deleteSPSite` | ❌ | ❌ | **MISSING** |

#### Actions - Lists

| Action | Documented | Schema Documented | Gap |
|--------|------------|-------------------|-----|
| `createSPList` | ✅ | ✅ | Complete |
| `modifySPList` | ✅ | ✅ | Complete |
| `deleteSPList` | ❌ | ❌ | **MISSING** |
| `enableSPListRating` | ❌ | ❌ | **MISSING** |

#### Actions - Fields

| Action | Documented | Schema Documented | Gap |
|--------|------------|-------------------|-----|
| `createSPField` (legacy) | ✅ | ✅ | Deprecation note needed |
| `addSPField` | ❌ | ❌ | **MISSING** - new field action |
| `createSPSiteColumn` | ❌ | ❌ | **MISSING** - site column action |

#### Extraction Module (NOT in main provisioning/index.ts)

| Export | Documented | Notes |
|--------|------------|-------|
| `ExtractionService` | ❌ | **MAJOR GAP** - entire module undocumented |
| `extractListMetadata` | ❌ | Low-level API |
| `extractFields` | ❌ | Low-level API |
| `generateProvisioningPlan` | ❌ | Low-level API |
| `generateDeprovisioningPlan` | ❌ | Low-level API |
| Related types (10+) | ❌ | Need documentation |

**Note**: Extraction module appears to be accessible via `@apvee/spfx-actionable-provisioning/provisioning/extraction` but is NOT re-exported from main provisioning index.

### 3. Provisioning UI Module (`@apvee/spfx-actionable-provisioning/provisioning-ui`)

#### Components

| Export | Documented | Location | Gap |
|--------|------------|----------|-----|
| `ProvisioningDialog` | ✅ | provisioning-dialog.md | Complete |

#### Hooks

| Export | Documented | Location | Gap |
|--------|------------|----------|-----|
| `useSPFxProvisioningEngine` | Partial | spfx-engine.md | Missing options detail |
| `useProvisioningDerivedState` | Partial | spfx-engine.md | Missing return types |

**Note**: `useSPInstance` is NOT exported from public API (internal only)

#### Property Pane Fields

| Export | Documented | Location | Gap |
|--------|------------|----------|-----|
| `PropertyPaneProvisioningField` | ✅ | property-pane-fields.md | Complete |
| `PropertyPaneSiteSelectorField` | ✅ | property-pane-fields.md | Complete |

#### Models/Types

| Export | Documented | Notes |
|--------|------------|-------|
| `TemplateAppliedState` | ✅ | In property-pane-fields.md |
| `ProvisioningLogEntry` | ❌ | Internal model |
| `ComplianceLogEntry` | ❌ | Internal model |

## Documentation Files Analysis

### Current Documentation Structure

| File | Primary Focus | Last Updated | Accuracy |
|------|---------------|--------------|----------|
| introduction.md | Getting started | Unknown | ✅ Accurate imports |
| provisioning-schema.md | Action reference | Unknown | ⚠️ Missing 5+ actions |
| spfx-engine.md | Engine API | Unknown | ⚠️ Incomplete hooks |
| provisioning-dialog.md | Dialog component | Unknown | ✅ Accurate |
| property-pane-fields.md | Property pane | Unknown | ✅ Accurate |
| README.md | Overview | Unknown | ⚠️ Missing extraction |

### Recommended New Documentation

| File | Content | Priority |
|------|---------|----------|
| extraction.md | ExtractionService API reference | P1 |

## Key Findings

### Finding 1: ExtractionService Module Undocumented

**Impact**: High  
**Details**: The entire extraction subsystem (extractors, analyzers, generators) has no documentation. This is a complete feature that allows programmatic schema extraction from existing SharePoint lists.

**Recommendation**: Create `docs/extraction.md` with:
- Overview and use cases
- `ExtractionService` API reference
- Complete usage example
- Types reference

### Finding 2: Missing Action Documentation

**Impact**: Medium  
**Actions Undocumented**:
1. `deleteSPSite` - Site deletion action
2. `deleteSPList` - List deletion action  
3. `enableSPListRating` - Enable ratings on lists
4. `addSPField` - Add field to list (new API)
5. `createSPSiteColumn` - Create site column (new API)

**Recommendation**: Add sections to `provisioning-schema.md` for each action.

### Finding 3: Incomplete React Hooks Reference

**Impact**: Medium  
**Details**: `useSPFxProvisioningEngine` and `useProvisioningDerivedState` are mentioned but lack complete API documentation including:
- Full options interface
- Return type details
- Usage patterns

**Recommendation**: Expand hooks section in `spfx-engine.md`.

### Finding 4: Field Action Disambiguation Needed

**Impact**: Low-Medium  
**Details**: The relationship between `createSPField`, `addSPField`, and `createSPSiteColumn` is unclear. Developers need guidance on when to use each.

**Recommendation**: Add "Field Actions" section with decision matrix.

## Decisions Made

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Create standalone `extraction.md` | Extraction is a complete subsystem deserving dedicated docs | Add to spfx-engine.md (rejected: too long) |
| Only document `@public` exports | Per spec clarification | Document all exports (rejected: too noisy) |
| English language | Existing docs are English | Italian (rejected: inconsistent) |
| Skip webparts/testProvisioning | Internal demo code | Document as examples (rejected: not public API) |
| Manual export comparison for verification | No TypeDoc in project | Add TypeDoc (out of scope) |

## Next Steps

1. **Phase 1 - Data Model**: Define documentation structure for new content
2. **Phase 1 - Contracts**: N/A (documentation feature)
3. **Phase 1 - Quickstart**: Create implementation checklist
