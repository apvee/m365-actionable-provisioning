# Data Model: Documentation Structure

**Feature**: 005-docs-codebase-sync  
**Date**: 2026-03-24  
**Purpose**: Define the structure and organization of documentation updates

## Document Hierarchy

```
docs/
├── introduction.md          # Entry point, quick start
├── provisioning-schema.md   # Action reference (comprehensive)
├── spfx-engine.md          # Engine API + React hooks
├── provisioning-dialog.md   # Dialog component
├── property-pane-fields.md  # Property pane fields
└── extraction.md            # NEW: Schema extraction API
```

## Entity: Documentation Section

### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Section heading |
| anchor | string | Yes | URL-safe anchor ID |
| content_type | enum | Yes | `overview`, `api_reference`, `example`, `table` |
| parent_section | string | No | Parent anchor for nesting |
| code_examples | CodeExample[] | No | Associated code blocks |

### Content Types

- **overview**: Conceptual explanation
- **api_reference**: Function/type signature with parameters
- **example**: Working code sample
- **table**: Structured reference data

## Entity: CodeExample

### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| language | string | Yes | `typescript`, `json`, `bash` |
| title | string | No | Description of what example shows |
| code | string | Yes | The actual code |
| imports | string[] | Yes | Required import statements |
| verified | boolean | Yes | Whether imports were verified against codebase |

## New Document: extraction.md

### Structure

```markdown
# Schema Extraction API Reference

## Overview
[Conceptual introduction to extraction workflow]

## ExtractionService Class
### Constructor
### Methods
  - extract(request): Promise<ExtractionServiceResult>

## Types
### ExtractionRequest
### ExtractionResult
### ExtractionServiceOptions
### ExtractionServiceResult

## Extractors (Advanced)
### extractListMetadata
### extractFields

## Analyzers (Advanced)  
### analyzeLookupRelations
### topologicalSort

## Generators (Advanced)
### generateProvisioningPlan
### generateDeprovisioningPlan

## Complete Example
[End-to-end extraction workflow]

## Best Practices
[Tips for extraction usage]
```

## Updates to: provisioning-schema.md

### New Sections Required

```markdown
## Site Actions
### deleteSPSite              # NEW
  - Schema definition
  - Example
  - Notes

## List Actions  
### deleteSPList              # NEW
  - Schema definition
  - Example
  - Notes

### enableSPListRating        # NEW
  - Schema definition
  - Example
  - Notes

## Field Actions
### Overview                  # NEW (disambiguation)
  - When to use addSPField
  - When to use createSPSiteColumn
  - Migration from createSPField

### addSPField                # NEW
  - Schema definition
  - Example
  - Notes

### createSPSiteColumn        # NEW
  - Schema definition
  - Example
  - Notes
```

## Updates to: spfx-engine.md

### Expanded Hooks Section

```markdown
## React Hooks

### useSPFxProvisioningEngine
#### Options Interface        # EXPAND
  - context
  - planTemplate
  - targetSiteUrl
  - initialScope
  - logger
  - options

#### Return Type             # EXPAND
  - engine
  - snapshot
  - isRunning
  - run()
  - checkCompliance()
  - cancel()

#### Usage Patterns          # NEW
  - Basic usage
  - With target site
  - With custom scope

### useProvisioningDerivedState
#### Purpose                 # EXPAND
#### Input/Output           # EXPAND
#### Use Cases              # NEW
```

## Updates to: README.md

### TOC Update

```markdown
| Document | Description |
|----------|-------------|
| [Introduction](./docs/introduction.md) | Getting started... |
| [Provisioning Schema](./docs/provisioning-schema.md) | Complete reference... |
| [SPFx Engine](./docs/spfx-engine.md) | Engine API... |
| [ProvisioningDialog](./docs/provisioning-dialog.md) | Dialog component... |
| [Property Pane Fields](./docs/property-pane-fields.md) | PropertyPane... |
| [Schema Extraction](./docs/extraction.md) | Extract schemas... | # NEW
```

## Validation Rules

### Import Verification

All code examples MUST:
1. Use explicit imports (no `import *`)
2. Import from documented public paths only:
   - `@apvee/spfx-actionable-provisioning/core`
   - `@apvee/spfx-actionable-provisioning/provisioning`
   - `@apvee/spfx-actionable-provisioning/provisioning-ui`
3. Be verified against actual exports before documentation merge

### Valid Import Paths

```typescript
// ✅ Valid
import { ProvisioningDialog } from '@apvee/spfx-actionable-provisioning/provisioning-ui';
import { createLogger, consoleSink } from '@apvee/spfx-actionable-provisioning/core';
import { SPFxProvisioningEngine, type ProvisioningPlan } from '@apvee/spfx-actionable-provisioning/provisioning';

// ❌ Invalid (internal paths)
import { useSPInstance } from '@apvee/spfx-actionable-provisioning/provisioning-ui/hooks/useSPInstance';
```

## Cross-Reference Requirements

| Source | Must Link To |
|--------|-------------|
| introduction.md → Quick Start | provisioning-schema.md (plan structure) |
| introduction.md → Extraction | extraction.md (NEW) |
| spfx-engine.md → Plan Format | provisioning-schema.md |
| extraction.md → Plan Output | provisioning-schema.md |
| README.md → All Docs | All doc files |
