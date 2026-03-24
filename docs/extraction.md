# Schema Extraction API Reference

This document provides a complete reference for extracting SharePoint list schemas and generating provisioning/deprovisioning plans using `@apvee/spfx-actionable-provisioning`.

## Table of Contents

- [Overview](#overview)
- [ExtractionService Class](#extractionservice-class)
- [Types Reference](#types-reference)
- [Complete Example](#complete-example)
- [Extractors (Advanced)](#extractors-advanced)
- [Analyzers (Advanced)](#analyzers-advanced)
- [Generators (Advanced)](#generators-advanced)
- [Best Practices](#best-practices)

---

## Overview

Schema extraction enables you to **reverse-engineer** existing SharePoint lists into provisioning plans. This is useful for:

- **Template creation**: Extract a list structure to replicate it elsewhere
- **Documentation**: Generate a machine-readable representation of your SharePoint schema
- **Migration**: Create provisioning plans from existing sites for migration scenarios
- **Backup**: Capture list configurations as JSON for version control

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ExtractionService                       │
│  High-level façade for complete extraction workflow         │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│    Extractors    │ │    Analyzers     │ │   Generators     │
│                  │ │                  │ │                  │
│ • List metadata  │ │ • Lookup deps    │ │ • Provisioning   │
│ • Fields         │ │ • Topological    │ │   plan           │
│ • Views          │ │   sort           │ │ • Deprovisioning │
│ • Content types  │ │                  │ │   plan           │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### Workflow Steps

The `ExtractionService` orchestrates a complete extraction workflow:

1. **Extract list metadata** - Reads list settings (title, template, versioning, etc.)
2. **Extract fields** - Reads field definitions for each list
3. **Analyze dependencies** - Detects lookup relationships between lists
4. **Auto-include lookups** - Optionally adds referenced lists to extraction
5. **Generate provisioning plan** - Creates a plan to recreate the lists
6. **Generate deprovisioning plan** - Creates a plan to delete the lists

---

## ExtractionService Class

### Import

```typescript
import { 
  ExtractionService,
  type ExtractionServiceOptions,
  type ExtractionServiceResult
} from '@apvee/spfx-actionable-provisioning/provisioning/extraction';
```

### Constructor Options

```typescript
interface ExtractionServiceOptions {
  /** PnPJS web instance for SharePoint operations */
  readonly web: IWeb;
  
  /** Source web URL */
  readonly webUrl: string;
  
  /** Source site URL (optional, for site-scoped operations) */
  readonly siteUrl?: string;
  
  /** Progress callback for UI updates */
  readonly onProgress?: OnExtractionProgress;
  
  /** Abort signal for cancellation */
  readonly signal?: AbortSignal;
}
```

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `extract(request)` | `Promise<ExtractionServiceResult>` | Extract schema from selected lists and generate plans |

### ExtractionServiceResult

```typescript
interface ExtractionServiceResult {
  /** Extraction result with lists and warnings */
  readonly extraction: ExtractionResult;
  
  /** Generated provisioning plan */
  readonly provisioningPlan: ProvisioningPlan;
  
  /** Generated deprovisioning plan */
  readonly deprovisioningPlan: ProvisioningPlan;
}
```

### Basic Usage

```typescript
import { spfi, SPFx } from '@pnp/sp';
import { ExtractionService } from '@apvee/spfx-actionable-provisioning/provisioning/extraction';

// Create SPFI instance
const sp = spfi().using(SPFx(this.context));
const webUrl = 'https://contoso.sharepoint.com/sites/project';

// Initialize service
const service = new ExtractionService({
  web: sp.web,
  webUrl,
  onProgress: (progress) => {
    console.log(`${progress.phase}: ${progress.message} (${progress.percentage}%)`);
  }
});

// Define lists to extract
const request = {
  selectedLists: [
    {
      listId: '12345678-1234-1234-1234-123456789abc',
      listName: 'Tasks',
      webUrl
    }
  ],
  options: {
    includeFields: true,
    includeViews: false,
    includeContentTypes: false,
    autoIncludeLookupSources: true
  }
};

// Run extraction
const result = await service.extract(request);

// Use the generated plans
console.log(JSON.stringify(result.provisioningPlan, null, 2));
```

---

## Types Reference

### ExtractionRequest

Request object passed to `extract()`:

```typescript
interface ExtractionRequest {
  /** Lists selected for extraction */
  readonly selectedLists: readonly ListReference[];
  
  /** Extraction options */
  readonly options: ExtractionOptions;
}
```

### ListReference

Reference to a list to extract:

```typescript
interface ListReference {
  /** Web URL containing the list */
  readonly webUrl: string;
  
  /** Unique list ID (GUID) */
  readonly listId: string;
  
  /** List internal name (from RootFolder) */
  readonly listName: string;
  
  /** List title for UI display (optional) */
  readonly title?: string;
}
```

### ExtractionOptions

Configurable extraction options:

```typescript
interface ExtractionOptions {
  /** Extract field definitions (default: true) */
  readonly includeFields: boolean;
  
  /** Extract view definitions (default: false) */
  readonly includeViews: boolean;
  
  /** Extract content types (default: false) */
  readonly includeContentTypes: boolean;
  
  /** Auto-include lists referenced by lookup fields (default: true) */
  readonly autoIncludeLookupSources: boolean;
}
```

**Default Options:**

```typescript
const DEFAULT_EXTRACTION_OPTIONS: ExtractionOptions = {
  includeFields: true,
  includeViews: false,
  includeContentTypes: false,
  autoIncludeLookupSources: true
};
```

### ExtractionResult

Result of the extraction operation:

```typescript
interface ExtractionResult {
  /** Whether extraction succeeded */
  readonly success: boolean;
  
  /** Extracted list definitions */
  readonly lists: readonly ExtractedList[];
  
  /** Dependency graph for lookup relationships */
  readonly dependencyGraph: DependencyGraph;
  
  /** Warnings generated during extraction */
  readonly warnings: readonly ExtractionWarning[];
  
  /** Fatal error message (if success=false) */
  readonly error?: string;
  
  /** Extraction timestamp */
  readonly extractedAt: Date;
  
  /** Source web URL */
  readonly sourceWebUrl: string;
}
```

### ExtractionProgress

Progress update emitted during extraction:

```typescript
interface ExtractionProgress {
  /** Current phase */
  readonly phase: 
    | 'initializing' 
    | 'extracting_lists' 
    | 'extracting_fields' 
    | 'analyzing_dependencies' 
    | 'generating_schema' 
    | 'completed';
  
  /** Completion percentage (0-100) */
  readonly percentage: number;
  
  /** Current status message */
  readonly message: string;
  
  /** Currently processing list */
  readonly currentList?: string;
  
  /** Total lists to process */
  readonly totalLists: number;
  
  /** Lists processed so far */
  readonly processedLists: number;
}
```

### ExtractionWarning

Warning generated during extraction:

```typescript
interface ExtractionWarning {
  /** Warning category */
  readonly category: ExtractionWarningCategory;
  
  /** Severity level */
  readonly severity: 'info' | 'warning' | 'error';
  
  /** Warning message */
  readonly message: string;
  
  /** Affected list ID (if applicable) */
  readonly listId?: string;
  
  /** Affected field name (if applicable) */
  readonly fieldInternalName?: string;
  
  /** Additional details */
  readonly details?: Record<string, unknown>;
}

type ExtractionWarningCategory = 
  | 'unsupported_field'      // Field type not supported for extraction
  | 'cross_web_lookup'       // Lookup references a different web
  | 'circular_dependency'    // Circular lookup dependency detected
  | 'permission_denied'      // Insufficient permissions
  | 'lookup_target_not_found'// Lookup target list not found
  | 'validation';            // Validation error
```

---

## Complete Example

### SPFx Web Part Integration

```typescript
import * as React from 'react';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import { 
  ExtractionService,
  type ExtractionRequest,
  type ExtractionServiceResult,
  DEFAULT_EXTRACTION_OPTIONS
} from '@apvee/spfx-actionable-provisioning/provisioning/extraction';
import type { WebPartContext } from '@microsoft/sp-webpart-base';

interface IProps {
  context: WebPartContext;
}

const ExtractionPanel: React.FC<IProps> = ({ context }) => {
  const [progress, setProgress] = React.useState<string>('');
  const [result, setResult] = React.useState<ExtractionServiceResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const abortController = React.useRef<AbortController | null>(null);

  const runExtraction = async (listId: string, listName: string) => {
    abortController.current = new AbortController();
    setError(null);
    setResult(null);

    const sp = spfi().using(SPFx(context));
    const webUrl = context.pageContext.web.absoluteUrl;

    const service = new ExtractionService({
      web: sp.web,
      webUrl,
      signal: abortController.current.signal,
      onProgress: (p) => setProgress(`${p.phase}: ${p.message}`)
    });

    const request: ExtractionRequest = {
      selectedLists: [{ listId, listName, webUrl }],
      options: {
        ...DEFAULT_EXTRACTION_OPTIONS,
        includeViews: false,
        includeContentTypes: false
      }
    };

    try {
      const extractionResult = await service.extract(request);
      setResult(extractionResult);
      
      // Show warnings
      for (const warning of extractionResult.extraction.warnings) {
        console.warn(`[${warning.category}] ${warning.message}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const cancelExtraction = () => {
    abortController.current?.abort();
    setProgress('Cancelled');
  };

  return (
    <div>
      <p>Status: {progress}</p>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {result && (
        <div>
          <h3>Extracted {result.extraction.lists.length} list(s)</h3>
          <h4>Provisioning Plan</h4>
          <pre>{JSON.stringify(result.provisioningPlan, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ExtractionPanel;
```

### Using the Generated Plan

Once extracted, you can use the provisioning plan with `SPFxProvisioningEngine`:

```typescript
import { SPFxProvisioningEngine } from '@apvee/spfx-actionable-provisioning/provisioning';
import { createLogger, consoleSink } from '@apvee/spfx-actionable-provisioning/core';

// ... after extraction
const { provisioningPlan } = await service.extract(request);

// Create engine with extracted plan
const targetSp = spfi().using(SPFx(this.context));
const logger = createLogger({ level: 'info', sink: consoleSink });

const engine = new SPFxProvisioningEngine({
  spfi: targetSp,
  planTemplate: provisioningPlan,
  logger
});

// Provision to another site
const snapshot = await engine.run();
console.log(`Provisioned ${snapshot.summary.succeeded} actions`);
```

---

## Extractors (Advanced)

Extractors are low-level functions for reading SharePoint data. Use these when you need granular control over extraction.

### Import

```typescript
import {
  extractListMetadata,
  buildExtractedList,
  extractFields,
  extractFieldByName,
  type ExtractListOptions,
  type ExtractFieldsOptions,
  type FieldExtractionResult
} from '@apvee/spfx-actionable-provisioning/provisioning/extraction';
```

### extractListMetadata

Extracts list metadata without fields:

```typescript
const listInfo = await extractListMetadata(web, listId);
// Returns: IListInfo with settings, template, etc.
```

### buildExtractedList

Builds an `ExtractedList` from raw list info:

```typescript
const extracted = buildExtractedList(listInfo, webUrl);
// Returns: ExtractedList with structured settings
```

### extractFields

Extracts all non-system fields from a list:

```typescript
const { fields, warnings } = await extractFields(list, {
  signal: abortController.signal
});
// Returns: FieldExtractionResult with ExtractedField[] and warnings
```

### extractFieldByName

Extracts a single field by internal name:

```typescript
const field = await extractFieldByName(list, 'ProjectCode');
// Returns: ExtractedField or undefined
```

---

## Analyzers (Advanced)

Analyzers detect relationships between lists and determine execution order.

### Import

```typescript
import {
  analyzeLookupRelations,
  updateLookupListNames,
  topologicalSort,
  reverseTopologicalOrder,
  type AnalyzeRelationsOptions,
  type RelationshipAnalysisResult
} from '@apvee/spfx-actionable-provisioning/provisioning/extraction';
```

### analyzeLookupRelations

Analyzes lookup field dependencies between lists:

```typescript
const { graph, warnings } = analyzeLookupRelations(extractedLists, {
  autoIncludeLookupSources: true,
  sourceWebUrl: webUrl
});
// Returns: DependencyGraph and any warnings
```

### topologicalSort

Sorts lists by dependency order (for provisioning):

```typescript
const { ordered, circularDependencies } = topologicalSort(dependencyGraph);
// Lists in order: create dependencies first
```

### reverseTopologicalOrder

Sorts lists in reverse order (for deprovisioning):

```typescript
const reversed = reverseTopologicalOrder(dependencyGraph);
// Lists in order: delete dependents first
```

### updateLookupListNames

Replaces list GUIDs with internal names in lookup field definitions:

```typescript
const updatedLists = updateLookupListNames(extractedLists, listNameMap);
// Ensures plans use stable list names, not GUIDs
```

---

## Generators (Advanced)

Generators create provisioning and deprovisioning plans from extracted data.

### Import

```typescript
import {
  generateProvisioningPlan,
  generateDeprovisioningPlan,
  resolveLookupReferences,
  type GeneratePlanOptions,
  type GeneratePlanResult,
  type GenerateDeprovisionPlanOptions,
  type GenerateDeprovisionPlanResult
} from '@apvee/spfx-actionable-provisioning/provisioning/extraction';
```

### generateProvisioningPlan

Creates a provisioning plan from extracted lists:

```typescript
const { plan, warnings } = generateProvisioningPlan(extractedLists, {
  schemaVersion: '1.0',
  version: '1.0.0',
  targetWebUrl: 'https://contoso.sharepoint.com/sites/target',
  sortedListNames: orderedListNames
});
// Returns: ProvisioningPlan with createSPList actions
```

### generateDeprovisioningPlan

Creates a deprovisioning plan (delete lists):

```typescript
const { plan, warnings } = generateDeprovisioningPlan(extractedLists, {
  schemaVersion: '1.0',
  version: '1.0.0',
  targetWebUrl: 'https://contoso.sharepoint.com/sites/target',
  sortedListNames: reverseOrderedListNames
});
// Returns: ProvisioningPlan with deleteSPList actions
```

### resolveLookupReferences

Resolves lookup field references to use list names instead of GUIDs:

```typescript
const resolvedFields = resolveLookupReferences(fields, listIdToNameMap);
// Ensures lookupList property uses internal names
```

---

## Best Practices

### Error Handling

Always handle extraction errors and warnings:

```typescript
const result = await service.extract(request);

if (!result.extraction.success) {
  console.error('Extraction failed:', result.extraction.error);
  return;
}

// Check warnings
const errors = result.extraction.warnings.filter(w => w.severity === 'error');
if (errors.length > 0) {
  console.error('Critical warnings:', errors);
}
```

### Cancellation

Support user-initiated cancellation for long extractions:

```typescript
const abortController = new AbortController();

// Allow cancellation
document.getElementById('cancel').onclick = () => abortController.abort();

const service = new ExtractionService({
  web: sp.web,
  webUrl,
  signal: abortController.signal
});
```

### Progress Feedback

Provide UI feedback during extraction:

```typescript
const service = new ExtractionService({
  web: sp.web,
  webUrl,
  onProgress: (progress) => {
    updateProgressBar(progress.percentage);
    updateStatusText(progress.message);
    
    if (progress.currentList) {
      updateCurrentItem(`Processing: ${progress.currentList}`);
    }
  }
});
```

### Lookup Dependencies

When `autoIncludeLookupSources` is enabled, the service automatically includes lists referenced by lookup fields. This ensures the provisioning plan is self-contained.

If you disable this option, ensure you manually include all referenced lists or the generated plan may fail during provisioning.

### Field Type Support

Not all SharePoint field types are fully supported for extraction. Check warnings for `unsupported_field` category:

| Status | Field Types |
|--------|-------------|
| Fully Supported | Text, MultilineText, Number, Currency, DateTime, Boolean, Choice, MultiChoice, Url, User, Lookup |
| Partially Supported | Calculated (formula may not transfer), Taxonomy (managed metadata) |
| Not Supported | External data columns, custom field types |

### Security Considerations

- Extraction uses the current user's permissions
- Ensure users have at least read access to lists and fields
- Site columns require site-level read permissions
- Content types require content type gallery access

### Plan Versioning

Always version your extracted plans:

```typescript
const result = await service.extract(request);

// Add metadata before saving
const versionedPlan = {
  ...result.provisioningPlan,
  version: `extracted-${new Date().toISOString().split('T')[0]}`,
  title: `Extraction from ${webUrl}`,
  description: `Auto-generated from site extraction on ${new Date().toLocaleString()}`
};
```
