# Tasks: Documentation Codebase Sync

**Input**: Design documents from `/specs/005-docs-codebase-sync/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Not requested - documentation feature only

**Organization**: Tasks grouped by user story for independent implementation

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)

---

## Phase 1: Setup

**Purpose**: Understand existing documentation style and prepare

- [x] T001 Review existing docs/introduction.md to understand documentation style
- [x] T002 [P] Review existing docs/provisioning-schema.md structure
- [x] T003 [P] Review existing docs/spfx-engine.md structure

---

## Phase 2: Foundational

**Purpose**: No foundational work required - all user stories are independent documentation updates

N/A - Documentation updates can proceed directly to user story phases

---

## Phase 3: User Story 1 - Extraction Module Documentation (Priority: P1) 🎯 MVP

**Goal**: Developer can find, understand, and use ExtractionService by reading documentation alone

**Independent Test**: A developer can extract a SharePoint list schema using only the documentation

### Implementation for User Story 1

- [x] T004 [US1] Create docs/extraction.md with overview section explaining what schema extraction is
- [x] T005 [US1] Add ExtractionService class reference to docs/extraction.md (constructor, methods)
- [x] T006 [US1] Add ExtractionRequest/ExtractionResult types reference to docs/extraction.md
- [x] T007 [US1] Add ExtractionServiceOptions type reference to docs/extraction.md
- [x] T008 [US1] Add complete working example to docs/extraction.md showing end-to-end extraction
- [x] T009 [US1] Add Extractors (Advanced) section to docs/extraction.md for low-level APIs
- [x] T010 [US1] Add Analyzers (Advanced) section to docs/extraction.md
- [x] T011 [US1] Add Generators (Advanced) section to docs/extraction.md
- [x] T012 [US1] Add Best Practices section to docs/extraction.md
- [x] T013 [US1] Verify all imports in extraction.md examples against lib/provisioning/extraction/index.d.ts

**Checkpoint**: docs/extraction.md is complete and self-contained

---

## Phase 4: User Story 2 - React Hooks Documentation (Priority: P2)

**Goal**: Developer can implement a custom provisioning UI using documented hooks

**Independent Test**: A developer can use useSPFxProvisioningEngine with full understanding of options and return values

### Implementation for User Story 2

- [x] T014 [US2] Expand useSPFxProvisioningEngine options interface documentation in docs/spfx-engine.md
- [x] T015 [US2] Document useSPFxProvisioningEngine return type (engine, snapshot, isRunning, run, checkCompliance, cancel) in docs/spfx-engine.md
- [x] T016 [US2] Add usage patterns subsection for useSPFxProvisioningEngine in docs/spfx-engine.md
- [x] T017 [US2] Document useProvisioningDerivedState purpose and use cases in docs/spfx-engine.md
- [x] T018 [US2] Document useProvisioningDerivedState input/output types in docs/spfx-engine.md
- [x] T019 [US2] Add example integration for useProvisioningDerivedState in docs/spfx-engine.md
- [x] T020 [US2] Verify all hook imports match src/provisioning-ui/hooks/index.ts exports

**Checkpoint**: React hooks section in spfx-engine.md is complete with full API reference

---

## Phase 5: User Story 3 - Action Catalog Documentation (Priority: P2)

**Goal**: All action types exported from provisioning/index.ts are documented

**Independent Test**: Developer can find complete property reference for enableSPListRating, deleteSPSite, deleteSPList, addSPField, createSPSiteColumn

### Implementation for User Story 3

- [x] T021 [P] [US3] Add deleteSPSite action section to docs/provisioning-schema.md (schema table + example)
- [x] T022 [P] [US3] Add deleteSPList action section to docs/provisioning-schema.md (schema table + example)
- [x] T023 [P] [US3] Add enableSPListRating action section to docs/provisioning-schema.md (schema table + example)
- [x] T024 [US3] Add Field Actions Overview section to docs/provisioning-schema.md (disambiguation when to use each)
- [x] T025 [P] [US3] Add addSPField action section to docs/provisioning-schema.md (schema table + example)
- [x] T026 [P] [US3] Add createSPSiteColumn action section to docs/provisioning-schema.md (schema table + example)
- [x] T027 [US3] Update Table of Contents in docs/provisioning-schema.md with new sections
- [x] T028 [US3] Verify all action schemas match src/provisioning/catalogs/schemas/ exports

**Checkpoint**: All @public action exports are documented in provisioning-schema.md

---

## Phase 6: User Story 4 - Documentation Accuracy (Priority: P3)

**Goal**: All code examples compile without errors when copied

**Independent Test**: Copy any code example from documentation and verify it compiles in a TypeScript project

### Implementation for User Story 4

- [x] T029 [P] [US4] Add extraction.md link to documentation table in docs/introduction.md
- [x] T030 [P] [US4] Verify quick start imports in docs/introduction.md match actual exports
- [x] T031 [P] [US4] Add extraction.md row to documentation table in README.md
- [x] T032 [P] [US4] Verify example plan syntax in README.md matches ProvisioningPlan type
- [x] T033 [US4] Verify README.md module structure and import paths match actual package exports
- [x] T034 [US4] Verify all internal doc cross-links work (dead link check)
- [x] T035 [US4] Verify code block language tags are present on all examples
- [x] T036 [US4] Update introduction.md table of contents with extraction.md entry

**Checkpoint**: All documentation links and imports are verified accurate

---

## Phase 7: Polish & Final Verification

**Purpose**: Final checks across all documentation

- [x] T037 Compare provisioning/index.ts @public exports against provisioning-schema.md coverage
- [x] T038 Compare provisioning-ui/index.ts @public exports against documentation coverage
- [x] T039 [P] Verify heading level consistency across all updated docs
- [x] T040 [P] Verify table formatting consistency across all updated docs
- [x] T041 Review extraction.md follows same style as spfx-engine.md
- [x] T042 Run quickstart.md verification checklist (SC-001 through SC-005)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────────────────────────────────────────────┐
                                                                              │
Phase 2 (Foundational) ─ N/A (skipped)                                        │
                                                                              │
Phase 3 (US1: Extraction) ────────────────────────────────────────┐           │
                                                                  │           │
Phase 4 (US2: Hooks) ─────────────────────────────────────────────┤ Parallel  │
                                                                  │ after     │
Phase 5 (US3: Actions) ───────────────────────────────────────────┤ Setup     │
                                                                  │           │
Phase 6 (US4: Accuracy) ──────────────────────────────────────────┘           │
                                                                              │
Phase 7 (Polish) ─────────────────────────────────────────────────────────────┘
```

### User Story Independence

| Story | Can Start After | Depends On |
|-------|-----------------|------------|
| US1 (Extraction) | Phase 1 | Setup only |
| US2 (Hooks) | Phase 1 | Setup only |
| US3 (Actions) | Phase 1 | Setup only |
| US4 (Accuracy) | US1 | T004 (extraction.md must exist for linking) |

### Parallel Opportunities

**Phase 1**: T002, T003 can run parallel with T001  
**Phase 3**: T009, T010, T011 can run parallel after T004-T008  
**Phase 5**: T021, T022, T023, T025, T026 can all run parallel  
**Phase 6**: T029, T030, T031, T032 can all run parallel  
**Phase 7**: T037, T038 can run parallel

### MVP Delivery

**Minimum Viable Documentation Update (US1 only)**:
- Complete Phase 1 + Phase 3 (T001-T013)
- Delivers: New extraction.md document
- Value: Developers can discover and use ExtractionService

**Incremental Delivery Path**:
1. US1 (P1) → extraction.md live
2. US2 (P2) → hooks documentation complete
3. US3 (P2) → all actions documented
4. US4 (P3) → full verification

---

## Implementation Strategy

1. **MVP First**: Complete US1 (extraction.md) as standalone deliverable
2. **Parallel Work**: US2, US3 can be worked simultaneously by same or different people
3. **Verification Last**: US4 verification tasks depend on content being written first
4. **Polish After**: Phase 7 runs only after all user stories complete

## Estimated Task Count

| Phase | Tasks | Parallel Opportunities |
|-------|-------|----------------------|
| Phase 1 (Setup) | 3 | 2 |
| Phase 3 (US1) | 10 | 3 |
| Phase 4 (US2) | 7 | 0 |
| Phase 5 (US3) | 8 | 5 |
| Phase 6 (US4) | 8 | 4 |
| Phase 7 (Polish) | 6 | 2 |
| **Total** | **42** | **16** |
