# Quickstart: Documentation Implementation Checklist

**Feature**: 005-docs-codebase-sync  
**Date**: 2026-03-24  
**Purpose**: Step-by-step implementation guide for documentation updates

## Pre-Implementation Checklist

- [ ] Read current documentation files to understand existing style
- [ ] Review research.md for gap analysis
- [ ] Review data-model.md for structure requirements
- [ ] Have codebase open for reference

## Phase A: Create New Documentation

### A1. Create docs/extraction.md

**Source files for reference**:
- `lib/provisioning/extraction/index.d.ts` - Public exports
- `lib/provisioning/extraction/extraction-service.d.ts` - Main service API
- `lib/provisioning/extraction/types/` - Type definitions

**Sections to write**:
1. [ ] Overview - What is schema extraction
2. [ ] Prerequisites - Required setup
3. [ ] ExtractionService class reference
4. [ ] ExtractionRequest/ExtractionResult types
5. [ ] Complete working example
6. [ ] Best practices section

**Verification**:
- [ ] All imports in examples are valid
- [ ] Example code compiles (mental check against types)
- [ ] Cross-links to provisioning-schema.md added

## Phase B: Update Existing Documentation

### B1. Update provisioning-schema.md

**Add new action sections**:

1. [ ] `deleteSPSite` action
   - Source: `src/provisioning/catalogs/schemas/sites/delete-sp-site.schema.ts`
   - Add schema definition table
   - Add usage example
   
2. [ ] `deleteSPList` action
   - Source: `src/provisioning/catalogs/schemas/lists/delete-sp-list.schema.ts`
   - Add schema definition table
   - Add usage example
   
3. [ ] `enableSPListRating` action
   - Source: `src/provisioning/catalogs/schemas/lists/enable-sp-list-rating.schema.ts`
   - Add schema definition table
   - Add usage example

4. [ ] `addSPField` action
   - Source: `src/provisioning/catalogs/schemas/fields/add-sp-field.schema.ts`
   - Add schema definition table
   - Add usage example
   - Note: This is for adding fields to lists

5. [ ] `createSPSiteColumn` action
   - Source: `src/provisioning/catalogs/schemas/fields/create-sp-site-column.schema.ts`
   - Add schema definition table
   - Add usage example
   - Note: This is for creating site columns

6. [ ] Field Actions Overview section
   - Explain when to use each field action
   - Decision matrix for addSPField vs createSPSiteColumn

**Verification**:
- [ ] All new actions documented with properties
- [ ] Examples use correct verb names
- [ ] TOC updated with new sections

### B2. Update spfx-engine.md

**Expand React Hooks section**:

1. [ ] `useSPFxProvisioningEngine` - Full API reference
   - Source: `src/provisioning-ui/hooks/useSPFxProvisioningEngine/`
   - Document all options with types
   - Document return object structure
   - Add usage patterns subsection

2. [ ] `useProvisioningDerivedState` - Full API reference
   - Source: `src/provisioning-ui/hooks/useProvisioningDerivedState/`
   - Document purpose and use cases
   - Document input/output types
   - Add example integration

**Verification**:
- [ ] All hook options documented
- [ ] Return types match actual code
- [ ] Examples compile correctly

### B3. Update introduction.md

**Changes needed**:
1. [ ] Add link to extraction.md in documentation table
2. [ ] Verify quick start imports are still valid
3. [ ] Consider adding extraction mention in overview

### B4. Update README.md

**Changes needed**:
1. [ ] Add extraction.md to documentation table
2. [ ] Verify example plan syntax is current

## Phase C: Verification

### C1. Import Verification

For each code example in documentation:
- [ ] Check import path exists in barrel exports
- [ ] Check type name matches actual export
- [ ] Check function signature matches actual code

**Files to verify**:
- [ ] docs/introduction.md
- [ ] docs/provisioning-schema.md
- [ ] docs/spfx-engine.md
- [ ] docs/extraction.md (new)
- [ ] README.md

### C2. Cross-Reference Check

- [ ] All internal doc links work
- [ ] New extraction.md linked from appropriate places
- [ ] TOC in README.md is complete

### C3. Style Consistency

- [ ] Heading levels consistent
- [ ] Code block language tags present
- [ ] Tables formatted consistently
- [ ] API reference format matches existing docs

## Success Criteria Verification

| Criterion | Verification Method | Status |
|-----------|-------------------|--------|
| SC-001: 100% @public exports documented | Manual comparison with provisioning/index.ts | [ ] |
| SC-002: 100% @public UI exports documented | Manual comparison with provisioning-ui/index.ts | [ ] |
| SC-003: Extraction module documented | Check extraction.md exists with example | [ ] |
| SC-004: Code examples compile | Mental/manual type check | [ ] |
| SC-005: APIs findable in <2min | Review TOC and structure | [ ] |

## Estimated Effort

| Phase | Estimated Time |
|-------|---------------|
| A: Create extraction.md | 2-3 hours |
| B1: Update provisioning-schema.md | 1-2 hours |
| B2: Update spfx-engine.md | 1 hour |
| B3-B4: Update intro & README | 30 min |
| C: Verification | 1 hour |
| **Total** | **5-7 hours** |
