# Implementation Plan: Documentation Codebase Sync

**Branch**: `005-docs-codebase-sync` | **Date**: 2026-03-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-docs-codebase-sync/spec.md`

## Summary

Review and update documentation (docs folder and README.md) to align with current codebase. Primary focus: document the undocumented ExtractionService API, complete React hooks reference, ensure all `@public` tagged exports are documented, and verify code example accuracy.

## Technical Context

**Language/Version**: Markdown (documentation), TypeScript 5.3.3 (code examples)  
**Primary Dependencies**: N/A (documentation only)  
**Storage**: N/A  
**Testing**: Manual verification - code examples compile without type errors  
**Target Platform**: GitHub/npm documentation consumers  
**Project Type**: Documentation update for SPFx library  
**Performance Goals**: N/A  
**Constraints**: Must use English language, follow existing doc structure  
**Scale/Scope**: 5 doc files (introduction.md, provisioning-schema.md, spfx-engine.md, provisioning-dialog.md, property-pane-fields.md) + 1 new file (extraction.md) + README.md

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Schema-First Architecture | N/A | Documentation only - no code changes |
| II. Type Safety | ✅ PASS | Code examples must use proper TypeScript types |
| III. Scope-Based Execution | N/A | Documentation only - no engine changes |
| IV. Declarative Plans | ✅ PASS | Plan examples must follow schema structure |
| V. Compliance Checking | N/A | Documentation only - no compliance changes |
| Documentation Workflow | ✅ PASS | This feature IS documentation - aligns perfectly |
| Barrel Exports | ✅ PASS | Must document only `@public` exports from barrel files |

**Gate Status**: ✅ ALL GATES PASSED - May proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/005-docs-codebase-sync/
├── plan.md              # This file
├── research.md          # Phase 0: API export analysis
├── data-model.md        # Phase 1: Documentation structure
├── quickstart.md        # Phase 1: Doc update checklist
└── tasks.md             # Phase 2: Implementation tasks
```

### Target Documentation Files

```text
docs/
├── introduction.md       # UPDATE: Fix imports, add extraction mention
├── provisioning-schema.md # UPDATE: Add missing action docs
├── spfx-engine.md        # UPDATE: Complete hooks reference
├── provisioning-dialog.md # REVIEW: Verify accuracy
├── property-pane-fields.md # REVIEW: Verify accuracy
└── extraction.md         # CREATE: New standalone document

README.md                 # UPDATE: Verify structure, add extraction link
```

### Source Reference (read-only for this feature)

```text
src/
├── core/index.ts                  # @public exports to document
├── provisioning/index.ts          # @public exports to document
├── provisioning/extraction/       # ExtractionService API source
└── provisioning-ui/
    ├── index.ts                   # @public exports to document
    ├── hooks/                     # React hooks source
    └── components/                # UI components source
```

**Structure Decision**: Documentation-only feature targeting `/docs/` folder with one new file creation (`extraction.md`) and updates to existing documentation.

## Complexity Tracking

> No constitution violations - documentation-only feature aligns with all principles.

N/A - No complexity exceptions required.

## Generated Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| Research | [research.md](./research.md) | API export gap analysis |
| Data Model | [data-model.md](./data-model.md) | Documentation structure definition |
| Quickstart | [quickstart.md](./quickstart.md) | Implementation checklist |

## Key Findings from Research

1. **ExtractionService module completely undocumented** - Major gap requiring new `docs/extraction.md`
2. **5 action types missing documentation**: `deleteSPSite`, `deleteSPList`, `enableSPListRating`, `addSPField`, `createSPSiteColumn`
3. **React hooks need expansion**: `useSPFxProvisioningEngine` and `useProvisioningDerivedState` lack full API reference
4. **`useSPInstance` is NOT public** - Not exported from main provisioning-ui index, so excluded from documentation scope

## Constitution Check - Post Design

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| II. Type Safety | ✅ PASS | data-model.md defines import verification rules |
| Documentation Workflow | ✅ PASS | All updates follow JSDoc `@public` pattern |
| Barrel Exports | ✅ PASS | Only barrel-exported APIs to be documented |

**Post-Design Gate Status**: ✅ ALL GATES STILL PASSING

## Next Steps

Run `/speckit.tasks` to generate implementation tasks from this plan.
