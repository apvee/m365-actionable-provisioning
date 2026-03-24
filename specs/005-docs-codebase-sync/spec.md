# Feature Specification: Documentation Codebase Sync

**Feature Branch**: `005-docs-codebase-sync`  
**Created**: March 24, 2026  
**Status**: Draft  
**Input**: User description: "Review and update documentation (docs folder and README.md) to align with current codebase"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Learns About Extraction Module (Priority: P1)

A developer discovers the `ExtractionService` API that extracts SharePoint list schemas and generates provisioning/deprovisioning plans programmatically, but finds no documentation explaining how to use it.

**Why this priority**: Extraction is a major feature (entire module with extractors, analyzers, generators) completely missing from documentation. Developers cannot discover or use this capability without source code reading.

**Independent Test**: Developer can find, understand, and use ExtractionService by reading documentation alone without inspecting source code.

**Acceptance Scenarios**:

1. **Given** the documentation site, **When** a developer searches for "extraction" or "extract schema", **Then** they find a dedicated section explaining the ExtractionService API
2. **Given** the extraction documentation, **When** a developer reads the examples, **Then** they can successfully extract a list schema and generate plans
3. **Given** the table of contents, **When** a developer looks for schema extraction, **Then** they find a clear link to the extraction documentation

---

### User Story 2 - Developer Uses React Hooks Correctly (Priority: P2)

A developer building a custom UI wants to use the React hooks (`useSPFxProvisioningEngine`, `useProvisioningDerivedState`, `useSPInstance`) but the documentation only briefly mentions them without detailed API reference.

**Why this priority**: Hooks are the primary React integration point. The introduction.md mentions them but hooks are only exported by provisioning-ui/hooks without detailed documentation.

**Independent Test**: Developer can implement a custom provisioning UI using documented hooks without copying from example code.

**Acceptance Scenarios**:

1. **Given** the spfx-engine.md document, **When** a developer reads the React Hooks section, **Then** they find complete signature, options, and return types for all exported hooks
2. **Given** hook documentation, **When** a developer implements `useSPFxProvisioningEngine`, **Then** they understand all options including `initialScope`, `targetSiteUrl`, and callback patterns
3. **Given** the documentation, **When** a developer wants derived state, **Then** they find `useProvisioningDerivedState` explained with use cases

---

### User Story 3 - Developer References Action Catalog Accurately (Priority: P2)

A developer building provisioning plans needs accurate reference for all available actions, but some exported actions in the codebase may not be fully documented in provisioning-schema.md.

**Why this priority**: Schema documentation is the primary reference. Undocumented actions lead to trial-and-error development.

**Independent Test**: All action types exported from `provisioning/index.ts` are documented in provisioning-schema.md with complete property references.

**Acceptance Scenarios**:

1. **Given** provisioning-schema.md, **When** a developer looks for `enableSPListRating`, **Then** they find it documented with all properties
2. **Given** the schema documentation, **When** comparing against `provisioning/index.ts` exports, **Then** all action verbs are documented
3. **Given** field action documentation, **When** a developer reads `addSPField` vs `createSPSiteColumn`, **Then** they understand when to use each

---

### User Story 4 - Developer Trusts Documentation Accuracy (Priority: P3)

A developer references import paths, type names, and API signatures from documentation and expects them to match the actual codebase exports.

**Why this priority**: Incorrect import paths or signatures cause frustration and wasted time.

**Independent Test**: All code examples in documentation can be copied and used without modification in a project importing from `@apvee/spfx-actionable-provisioning`.

**Acceptance Scenarios**:

1. **Given** introduction.md quick start code, **When** a developer copies the imports, **Then** they resolve correctly against the package exports
2. **Given** spfx-engine.md examples, **When** a developer copies type imports, **Then** TypeScript compiles without type errors
3. **Given** README.md example, **When** a developer copies the minimal plan, **Then** it validates against `ProvisioningPlan` type

---

### Edge Cases

- What happens when an action property has been deprecated or renamed?
- How does documentation handle internal vs public exports?
- What if code examples reference older API versions?

### Out of Scope

- `webparts/testProvisioning` - Demo/test webpart interno, non API pubblica

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Documentation MUST include a new standalone document `docs/extraction.md` covering the `ExtractionService` API with usage examples
- **FR-002**: Documentation MUST provide complete API reference for exported React hooks (`useSPFxProvisioningEngine`, `useProvisioningDerivedState`)
- **FR-003**: Documentation MUST document all action verbs exported from `provisioning/index.ts` including `enableSPListRating`, `deleteSPSite`, `deleteSPList`, `addSPField`, `createSPSiteColumn`
- **FR-004**: README.md MUST accurately reflect the current package structure and module paths
- **FR-005**: Documentation MUST verify all code example imports resolve correctly against actual exports
- ~~**FR-006**: Documentation MUST include the `useSPInstance` hook if it's publicly exported~~ *(N/A - research confirmed useSPInstance is NOT publicly exported)*
- **FR-007**: Documentation table of contents/navigation MUST be updated to include any new sections

### Key Entities

- **ExtractionService**: High-level API for extracting list schemas and generating provisioning/deprovisioning plans
- **React Hooks**: `useSPFxProvisioningEngine`, `useProvisioningDerivedState`, `useSPInstance`
- **Action Types**: Site actions, List actions, Field actions with their Zod schemas
- **Type Exports**: Public TypeScript interfaces and types for consumers

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of `@public` tagged exports from provisioning/index.ts are documented in provisioning-schema.md (verified via manual export comparison)
- **SC-002**: 100% of `@public` tagged exports from provisioning-ui/index.ts are documented in relevant documentation files (verified via manual export comparison)
- **SC-003**: Extraction module has a dedicated documentation section with at least one complete usage example
- **SC-004**: All code examples in documentation compile without type errors when copied into a TypeScript project
- **SC-005**: New developers can find and understand any public API within 2 minutes of searching the documentation

## Assumptions

- The extraction module (`provisioning/extraction`) is intended for public consumption based on its export structure
- Hooks exported from `provisioning-ui/hooks/index.ts` are the public React API
- Actions and schemas exported from `provisioning/catalogs` are the stable public API
- Documentation should follow the existing style and structure established in the current docs

## Clarifications

### Session 2026-03-24

- Q: L'ExtractionService deve essere documentato in un nuovo file o aggiunto a uno esistente? → A: Creare nuovo `docs/extraction.md` come documento standalone
- Q: Come definire cosa sia "public API" per la documentazione? → A: Solo export con tag JSDoc `@public`
- Q: Cosa è escluso dallo scope di questo aggiornamento documentazione? → A: Escludere webparts/testProvisioning (demo interno)
- Q: Come verificare la copertura 100% degli export @public? → A: Confronto manuale dei file exports
- Q: Quale lingua usare per i nuovi contenuti documentazione? → A: Inglese (lingua originale docs)
