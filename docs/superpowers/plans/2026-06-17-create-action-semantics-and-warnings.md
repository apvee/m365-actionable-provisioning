# Create Action Semantics And Warnings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make SharePoint `create*` actions intentionally mean "ensure resource exists", add structural collision detection, and surface best-effort provisioning warnings without turning create actions into implicit modify actions.

**Architecture:** Preserve the current idempotent create behavior and keep `modify*` actions responsible for desired-state enforcement. Add a small warning contract to action results, introduce focused structural compatibility helpers for lists and fields, and document the action semantics clearly. Compliance for `create*` checks existence plus structural compatibility only; mutable property drift such as title or description remains acceptable for create actions.

**Tech Stack:** TypeScript, Zod, PnPjs v4, SharePoint Online, npm workspaces, `tsx` smoke validation, `tsc`.

---

## Behavior Contract

The implementation must preserve these semantics:

- `createSPSite`, `createSPList`, `addSPField`, and `createSPSiteColumn` mean **ensure exists**.
- Existing resources with mutable property differences remain acceptable for create actions.
- `modifySPSite`, `modifySPList`, and `modifySPField` mean **enforce mutable desired state**.
- `deleteSPSite`, `deleteSPList`, and `deleteSPField` mean **ensure absent**.
- Create actions may report `already_exists` and still propagate scope to descendants.
- Create compliance must not mark a resource non-compliant only because `title`, description, group, required, default values, view membership, or other mutable configuration differs.
- Create compliance should mark structural collisions as `non_compliant` when the structural fact is readable.
- Best-effort post-create operations must not fail the whole action, but their failures must be logged and returned as warnings.

Structural collisions in this plan:

- Existing list with matching `listName` but mismatched numeric `BaseTemplate`.
- Existing field with matching `fieldName` but incompatible SharePoint field type.

Non-goals:

- Do not add automatic reconciliation to `create*`.
- Do not add new provisioning verbs.
- Do not redesign the SPFx dialog UI.
- Do not require a live SharePoint tenant for smoke validation.

## File Structure

Modify these runtime files:

```text
packages/m365-actionable-provisioning/src/runtime/result.ts
packages/m365-actionable-provisioning/src/runtime/index.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/_shared/action-results.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/domains/lists/list-lookup.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/domains/lists/list-structural-compatibility.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/domains/lists/index.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/domains/fields/field-lookup.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/domains/fields/field-structural-compatibility.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/lists/create-sp-list/action.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/fields/_shared/field-base-schema.ts
packages/m365-actionable-provisioning/src/actions/sharepoint/fields/_shared/field-handler.ts
```

Modify these validation and documentation files:

```text
packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts
packages/m365-actionable-provisioning/README.md
packages/m365-actionable-provisioning/src/actions/sharepoint/README.md
docs/provisioning-schema.md
```

Do not modify these files in this plan:

```text
packages/spfx-m365-actionable-provisioning/src/components/ProvisioningDialog/**
packages/spfx-m365-actionable-provisioning/src/components/LogPanel/**
packages/spfx-m365-actionable-provisioning/src/loc/**
apps/test-spfx/**
```

Reason: the first implementation should improve runtime truthfulness and docs without coupling the change to UI rendering. The current UI can still display action result JSON and logs. A separate UI plan can add warning badges/counts later.

---

### Task 1: Baseline And Contract Guard

**Files:**
- Read: `packages/m365-actionable-provisioning/src/runtime/result.ts`
- Read: `packages/m365-actionable-provisioning/src/actions/sharepoint/lists/create-sp-list/action.ts`
- Read: `packages/m365-actionable-provisioning/src/actions/sharepoint/fields/_shared/field-handler.ts`
- Read: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/fields/field-lookup.ts`
- Read: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/lists/list-lookup.ts`

- [ ] **Step 1: Confirm worktree state**

Run:

```bash
git status --short
```

Expected: no unrelated dirty files in the files listed above. If unrelated changes exist, inspect them and preserve them.

- [ ] **Step 2: Run baseline smoke**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
```

Expected: exit code `0`.

- [ ] **Step 3: Run baseline build**

Run:

```bash
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: exit code `0`.

- [ ] **Step 4: Inspect existing create semantics before editing**

Run:

```bash
nl -ba packages/m365-actionable-provisioning/src/actions/sharepoint/lists/create-sp-list/action.ts | sed -n '150,190p'
nl -ba packages/m365-actionable-provisioning/src/actions/sharepoint/fields/_shared/field-handler.ts | sed -n '70,115p'
nl -ba packages/m365-actionable-provisioning/src/actions/sharepoint/fields/_shared/field-handler.ts | sed -n '440,545p'
nl -ba packages/m365-actionable-provisioning/src/runtime/result.ts | sed -n '1,80p'
```

Expected: confirm `createSPList` and field creation currently skip on existing resources, best-effort catches are silent, and `ProvisioningResultLight` has no warning channel.

---

### Task 2: Add Warning Contract To M365 Results

**Files:**
- Modify: `packages/m365-actionable-provisioning/src/runtime/result.ts`
- Modify: `packages/m365-actionable-provisioning/src/runtime/index.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/_shared/action-results.ts`
- Modify: `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`

- [ ] **Step 1: Add JSON value import**

In `packages/m365-actionable-provisioning/src/runtime/result.ts`, add this import immediately after the package documentation comment and before the first exported type:

```ts
import type { JsonValue } from "../core/json";
```

- [ ] **Step 2: Extend the public result type with warnings**

In `packages/m365-actionable-provisioning/src/runtime/result.ts`, keep existing `ProvisioningOutcome` and `SkipReason` unchanged, then replace the current `ProvisioningResultLight` section with:

```ts
/**
 * Non-blocking warning emitted by a provisioning action.
 *
 * @remarks
 * Warnings describe best-effort work or structural concerns that did not make
 * the action throw. They are audit data; action outcome still remains either
 * `executed` or `skipped`.
 *
 * @public
 */
export type ProvisioningWarning = Readonly<{
  code: string;
  message: string;
  details?: JsonValue;
}>;

type ProvisioningResultBase = Readonly<{
  resource: string;
  warnings?: readonly ProvisioningWarning[];
}>;

/**
 * Minimal, audit-friendly action result shape.
 *
 * @public
 */
export type ProvisioningResultLight = Readonly<
  | (ProvisioningResultBase & { outcome: "executed" })
  | (ProvisioningResultBase & { outcome: "skipped"; reason: SkipReason })
>;
```

- [ ] **Step 3: Re-export the warning type**

In `packages/m365-actionable-provisioning/src/runtime/index.ts`, replace the result export line with:

```ts
export type { ProvisioningOutcome, ProvisioningResultLight, ProvisioningWarning, SkipReason } from "./result";
```

- [ ] **Step 4: Add warning helpers to action results**

In `packages/m365-actionable-provisioning/src/actions/sharepoint/_shared/action-results.ts`, update imports:

```ts
import type { M365ActionResult, M365Scope, ProvisioningResultLight, ProvisioningWarning, SkipReason } from "../../../runtime";
```

Add this helper above `withScopeDelta`:

```ts
function withWarnings<T extends ProvisioningResultLight>(
  result: T,
  warnings?: readonly ProvisioningWarning[]
): T {
  return warnings && warnings.length > 0 ? ({ ...result, warnings } as T) : result;
}
```

Replace `actionExecuted` and `actionSkipped` with:

```ts
export function actionExecuted(
  resource: string,
  scopeDelta?: Partial<M365Scope>,
  warnings?: readonly ProvisioningWarning[]
): M365ActionResult {
  return withScopeDelta(withWarnings({ outcome: "executed", resource }, warnings), scopeDelta);
}

export function actionSkipped(
  resource: string,
  reason: SkipReason,
  scopeDelta?: Partial<M365Scope>,
  warnings?: readonly ProvisioningWarning[]
): M365ActionResult {
  return withScopeDelta(withWarnings({ outcome: "skipped", resource, reason }, warnings), scopeDelta);
}
```

- [ ] **Step 5: Update smoke result type to include warnings**

In `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`, add a local warning type near `SmokeResult`:

```ts
type SmokeWarningDetails = null | boolean | number | string | readonly SmokeWarningDetails[] | {
  readonly [key: string]: SmokeWarningDetails;
};

type SmokeWarning = {
  code: string;
  message: string;
  details?: SmokeWarningDetails;
};
```

Replace `SmokeResult` with:

```ts
type SmokeResult =
  | { outcome: "executed"; resource: string; warnings?: readonly SmokeWarning[] }
  | { outcome: "skipped"; resource: string; reason: string; warnings?: readonly SmokeWarning[] };
```

- [ ] **Step 6: Add smoke assertion for warnings remaining JSON-safe**

In `assertJsonResultContract()`, after the existing JSON-safe output assertion, add:

```ts
  assert(
    defaultActionResultSchema.safeParse({
      result: {
        outcome: "executed",
        resource: "warning-smoke",
        warnings: [
          {
            code: "SMOKE_WARNING",
            message: "Smoke warning",
            details: { key: "value" },
          },
        ],
      },
    }).success,
    "Default action result schema should accept JSON-safe provisioning warnings"
  );
```

- [ ] **Step 7: Run focused validation**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: both commands exit `0`.

- [ ] **Step 8: Commit result warning contract**

Run:

```bash
git add packages/m365-actionable-provisioning/src/runtime/result.ts \
  packages/m365-actionable-provisioning/src/runtime/index.ts \
  packages/m365-actionable-provisioning/src/actions/sharepoint/_shared/action-results.ts \
  packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts
git commit -m "feat: add provisioning result warnings"
```

Expected: commit succeeds. If the user does not want commits during execution, skip this step and keep the same file boundary for review.

---

### Task 3: Surface Best-Effort Field Creation Warnings

**Files:**
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/fields/_shared/field-handler.ts`

- [ ] **Step 1: Import warning type**

In `field-handler.ts`, update the runtime import:

```ts
import type { M365Scope, M365ActionResult, ProvisioningWarning } from "../../../../runtime";
```

- [ ] **Step 2: Add warning helper inside `handleFieldCreation`**

Inside `handleFieldCreation`, immediately after `const resource = def.fieldName;`, add:

```ts
    const warnings: ProvisioningWarning[] = [];

    const addWarning = (
        code: string,
        message: string,
        details?: Record<string, string | number | boolean | null>
    ): void => {
        const warning: ProvisioningWarning = details ? { code, message, details } : { code, message };
        warnings.push(warning);
        logger.warn(message, {
            code,
            fieldName: def.fieldName,
            fieldType: def.fieldType,
            ...(details ?? {}),
        });
    };
```

- [ ] **Step 3: Preserve missing prerequisite behavior**

Leave the missing-container return as `skipped/missing_prerequisite` without warnings:

```ts
    if (!container) {
        return {
            result: {
                outcome: "skipped",
                resource,
                reason: "missing_prerequisite",
            },
        };
    }
```

Expected: this action still skips when neither list nor web is in scope.

- [ ] **Step 4: Replace the MultilineText silent catch**

Replace:

```ts
        } catch {
            // Best-effort: don't fail provisioning if only Required can't be set.
        }
```

in the `MultilineText` required block with:

```ts
        } catch (e) {
            addWarning(
                "FIELD_BEST_EFFORT_REQUIRED_FAILED",
                "Field was created, but Required could not be applied as a best-effort post-create update.",
                { error: normalizeError(e).message }
            );
        }
```

- [ ] **Step 5: Replace the User silent catch**

Replace the `catch` in the `User` post-create update block with:

```ts
        } catch (e) {
            addWarning(
                "FIELD_BEST_EFFORT_USER_SETTINGS_FAILED",
                "Field was created, but one or more user field settings could not be applied as best-effort post-create updates.",
                { error: normalizeError(e).message }
            );
        }
```

- [ ] **Step 6: Replace the Lookup post-create silent catch**

Replace the `catch` in the `Lookup` post-create configuration block with:

```ts
            } catch (e) {
                addWarning(
                    "FIELD_BEST_EFFORT_LOOKUP_SETTINGS_FAILED",
                    "Field was created, but one or more lookup field settings could not be applied as best-effort post-create updates.",
                    { error: normalizeError(e).message }
                );
            }
```

- [ ] **Step 7: Replace the dependent lookup silent catch**

Replace the `catch` in the dependent lookup loop with:

```ts
                } catch (e) {
                    addWarning(
                        "FIELD_BEST_EFFORT_DEPENDENT_LOOKUP_FAILED",
                        "Field was created, but a dependent lookup field could not be added.",
                        { showField, error: normalizeError(e).message }
                    );
                }
```

- [ ] **Step 8: Return accumulated warnings**

Replace the final return:

```ts
    return {
        result: {
            outcome: "executed",
            resource,
        },
    };
```

with:

```ts
    return {
        result: {
            outcome: "executed",
            resource,
            ...(warnings.length > 0 ? { warnings } : {}),
        },
    };
```

- [ ] **Step 9: Run focused validation**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: both commands exit `0`.

- [ ] **Step 10: Review diff for behavior**

Run:

```bash
git diff -- packages/m365-actionable-provisioning/src/actions/sharepoint/fields/_shared/field-handler.ts
```

Expected: no best-effort operation becomes blocking; every previously silent best-effort failure now logs `warn` and returns a warning.

- [ ] **Step 11: Commit best-effort warnings**

Run:

```bash
git add packages/m365-actionable-provisioning/src/actions/sharepoint/fields/_shared/field-handler.ts
git commit -m "feat: surface field best-effort warnings"
```

Expected: commit succeeds unless execution is intentionally running without commits.

---

### Task 4: Add Field Structural Compatibility Helper

**Files:**
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/fields/field-lookup.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/fields/field-structural-compatibility.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/fields/_shared/field-handler.ts`

- [ ] **Step 1: Extend field info with type when requested**

In `field-lookup.ts`, after `FieldInfoLite`, add:

```ts
export type FieldStructuralInfo = FieldInfoLite & Readonly<{
  TypeAsString?: string;
}>;
```

Then add this function below `getFieldByNameOrTitle`:

```ts
export async function getFieldStructuralInfoByNameOrTitle(
  container: FieldContainer,
  internalNameOrTitle: string
): Promise<FieldStructuralInfo | undefined> {
  try {
    const field = container.fields.getByInternalNameOrTitle(internalNameOrTitle);
    const info = (await field.select("Id", "InternalName", "Title", "TypeAsString")()) as FieldStructuralInfo;
    if (!info?.Id) return undefined;
    return info;
  } catch {
    return undefined;
  }
}
```

- [ ] **Step 2: Create structural compatibility helper**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/fields/field-structural-compatibility.ts` with:

```ts
import type { BaseFieldPayload } from "../../fields/_shared/field-base-schema";
import type { FieldStructuralInfo } from "./field-lookup";

export type FieldStructuralCompatibility = Readonly<
  | {
      compatible: true;
      expectedFieldType: BaseFieldPayload["fieldType"];
      actualTypeAsString?: string;
    }
  | {
      compatible: false;
      expectedFieldType: BaseFieldPayload["fieldType"];
      actualTypeAsString?: string;
      reason: "field_type_mismatch" | "field_type_unverifiable";
    }
>;

const expectedSharePointTypes: Record<BaseFieldPayload["fieldType"], readonly string[]> = {
  Text: ["Text"],
  MultilineText: ["Note"],
  Number: ["Number"],
  Currency: ["Currency"],
  Boolean: ["Boolean"],
  Choice: ["Choice"],
  MultiChoice: ["MultiChoice"],
  User: ["User", "UserMulti"],
  Lookup: ["Lookup", "LookupMulti"],
  Url: ["URL"],
  Calculated: ["Calculated"],
  Location: ["Location"],
  Image: ["Thumbnail", "Image"],
  DateTime: ["DateTime"],
};

export function checkFieldStructuralCompatibility(
  expectedFieldType: BaseFieldPayload["fieldType"],
  actual: FieldStructuralInfo
): FieldStructuralCompatibility {
  const actualTypeAsString = actual.TypeAsString;
  if (!actualTypeAsString) {
    return {
      compatible: false,
      expectedFieldType,
      actualTypeAsString,
      reason: "field_type_unverifiable",
    };
  }

  const acceptedTypes = expectedSharePointTypes[expectedFieldType];
  if (acceptedTypes.includes(actualTypeAsString)) {
    return {
      compatible: true,
      expectedFieldType,
      actualTypeAsString,
    };
  }

  return {
    compatible: false,
    expectedFieldType,
    actualTypeAsString,
    reason: "field_type_mismatch",
  };
}
```

- [ ] **Step 3: Use helper for existing field create path**

In `field-handler.ts`, update imports from `field-lookup`:

```ts
    getFieldStructuralInfoByNameOrTitle,
```

Add import:

```ts
import { checkFieldStructuralCompatibility } from "../../domains/fields/field-structural-compatibility";
```

Replace the idempotency check:

```ts
    const exists = await checkFieldExists(container, def.fieldName);
    if (exists) {
```

with:

```ts
    const existingField = await getFieldStructuralInfoByNameOrTitle(container, def.fieldName);
    if (existingField) {
        const compatibility = checkFieldStructuralCompatibility(def.fieldType, existingField);
        const structuralWarnings: ProvisioningWarning[] = [];

        if (!compatibility.compatible) {
            structuralWarnings.push({
                code: "FIELD_STRUCTURAL_COLLISION",
                message: "Field already exists with a structural type that does not match the create action payload.",
                details: {
                    fieldName: def.fieldName,
                    expectedFieldType: def.fieldType,
                    actualTypeAsString: compatibility.actualTypeAsString ?? null,
                    reason: compatibility.reason,
                },
            });

            logger.warn("Field structural collision detected while skipping create", {
                fieldName: def.fieldName,
                expectedFieldType: def.fieldType,
                actualTypeAsString: compatibility.actualTypeAsString,
                reason: compatibility.reason,
            });
        }
```

Within the existing return for already-existing fields, add warnings:

```ts
            result: {
                outcome: "skipped",
                resource,
                reason: "already_exists",
                ...(structuralWarnings.length > 0 ? { warnings: structuralWarnings } : {}),
            },
```

Expected: existing same-type fields still skip cleanly; existing wrong-type fields still skip but now warn.

- [ ] **Step 4: Remove unused `checkFieldExists` import**

If `checkFieldExists` is no longer used in `field-handler.ts`, remove it from the import list.

- [ ] **Step 5: Run focused validation**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: both commands exit `0`.

- [ ] **Step 6: Commit field compatibility helper**

Run:

```bash
git add packages/m365-actionable-provisioning/src/actions/sharepoint/domains/fields/field-lookup.ts \
  packages/m365-actionable-provisioning/src/actions/sharepoint/domains/fields/field-structural-compatibility.ts \
  packages/m365-actionable-provisioning/src/actions/sharepoint/fields/_shared/field-handler.ts
git commit -m "feat: detect field structural collisions"
```

Expected: commit succeeds unless execution is intentionally running without commits.

---

### Task 5: Make Field Create Compliance Structural But Not Mutable-State Enforcing

**Files:**
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/fields/_shared/field-handler.ts`
- Modify: `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`

- [ ] **Step 1: Update `checkFieldCompliance` to use structural info**

In `field-handler.ts`, inside `checkFieldCompliance`, replace:

```ts
        const fieldInfo = await getFieldByNameOrTitle(container, def.fieldName);
        if (!fieldInfo) {
            return { outcome: "non_compliant", resource, reason: "not_found" };
        }

        return { outcome: "compliant", resource };
```

with:

```ts
        const fieldInfo = await getFieldStructuralInfoByNameOrTitle(container, def.fieldName);
        if (!fieldInfo) {
            return { outcome: "non_compliant", resource, reason: "not_found" };
        }

        const compatibility = checkFieldStructuralCompatibility(def.fieldType, fieldInfo);
        if (!compatibility.compatible) {
            return {
                outcome: compatibility.reason === "field_type_unverifiable" ? "unverifiable" : "non_compliant",
                resource,
                reason: compatibility.reason,
                message:
                    compatibility.reason === "field_type_unverifiable"
                        ? "Field exists, but its SharePoint field type could not be verified."
                        : "Field exists, but its SharePoint field type does not match the create action payload.",
                details: {
                    expectedFieldType: def.fieldType,
                    actualTypeAsString: compatibility.actualTypeAsString,
                },
            };
        }

        return { outcome: "compliant", resource };
```

Expected: create field compliance still ignores mutable property drift but detects type collisions.

- [ ] **Step 2: Add smoke tests for field structural helper**

In `smoke-m365-engine.ts`, add imports:

```ts
import { checkFieldStructuralCompatibility } from "../src/actions/sharepoint/domains/fields/field-structural-compatibility";
```

Add this function after `assertSharePointCatalogComposition()`:

```ts
function assertFieldStructuralCompatibility(): void {
  const compatibleText = checkFieldStructuralCompatibility("Text", {
    Id: "1",
    InternalName: "SmokeText",
    Title: "Smoke Text",
    TypeAsString: "Text",
  });
  assert(compatibleText.compatible, "Text create compliance should accept SharePoint Text fields");

  const incompatibleText = checkFieldStructuralCompatibility("Text", {
    Id: "2",
    InternalName: "SmokeText",
    Title: "Smoke Text",
    TypeAsString: "Lookup",
  });
  assert(!incompatibleText.compatible, "Text create compliance should reject SharePoint Lookup fields");
  assert(
    !incompatibleText.compatible && incompatibleText.reason === "field_type_mismatch",
    "Wrong SharePoint field type should be reported as field_type_mismatch"
  );

  const userMulti = checkFieldStructuralCompatibility("User", {
    Id: "3",
    InternalName: "SmokeUser",
    Title: "Smoke User",
    TypeAsString: "UserMulti",
  });
  assert(userMulti.compatible, "User create compliance should accept UserMulti as structurally compatible");

  const unverifiable = checkFieldStructuralCompatibility("Text", {
    Id: "4",
    InternalName: "SmokeUnknown",
    Title: "Smoke Unknown",
  });
  assert(!unverifiable.compatible, "Missing TypeAsString should be treated as structurally unverifiable");
  assert(
    !unverifiable.compatible && unverifiable.reason === "field_type_unverifiable",
    "Missing TypeAsString should be reported as field_type_unverifiable"
  );
}
```

Call it in `main()` after `assertSharePointCatalogComposition();`:

```ts
  assertFieldStructuralCompatibility();
```

- [ ] **Step 3: Run focused validation**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: both commands exit `0`.

- [ ] **Step 4: Commit field create compliance change**

Run:

```bash
git add packages/m365-actionable-provisioning/src/actions/sharepoint/fields/_shared/field-handler.ts \
  packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts
git commit -m "feat: check field create structural compliance"
```

Expected: commit succeeds unless execution is intentionally running without commits.

---

### Task 6: Add List Template Structural Compatibility

**Files:**
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/lists/list-lookup.ts`
- Create: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/lists/list-structural-compatibility.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/lists/index.ts`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/lists/create-sp-list/action.ts`
- Modify: `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`

- [ ] **Step 1: Extend list lookup info with template**

In `list-lookup.ts`, replace `ListInfo` with:

```ts
export interface ListInfo {
  Id: string;
  Title?: string;
  BaseTemplate?: number;
  RootFolder?: { Name?: string };
}
```

In `getListInfoByRootFolderName`, replace the select call:

```ts
    .select("Id", "Title", "RootFolder/Name")
```

with:

```ts
    .select("Id", "Title", "BaseTemplate", "RootFolder/Name")
```

- [ ] **Step 2: Create pure list compatibility helper**

Create `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/lists/list-structural-compatibility.ts` with:

```ts
import type { ListInfo } from "./list-lookup";

export type ListStructuralCompatibility = Readonly<
  | {
      compatible: true;
      expectedTemplate: number;
      actualTemplate: number;
    }
  | {
      compatible: false;
      expectedTemplate: number;
      actualTemplate?: number;
      reason: "list_template_mismatch" | "list_template_unverifiable";
    }
>;

export function checkListStructuralCompatibility(
  expectedTemplate: number,
  actual: Pick<ListInfo, "BaseTemplate">
): ListStructuralCompatibility {
  const actualTemplate = actual.BaseTemplate;
  if (actualTemplate === undefined) {
    return {
      compatible: false,
      expectedTemplate,
      actualTemplate,
      reason: "list_template_unverifiable",
    };
  }

  if (actualTemplate === expectedTemplate) {
    return {
      compatible: true,
      expectedTemplate,
      actualTemplate,
    };
  }

  return {
    compatible: false,
    expectedTemplate,
    actualTemplate,
    reason: "list_template_mismatch",
  };
}
```

- [ ] **Step 3: Export list compatibility helper**

In `packages/m365-actionable-provisioning/src/actions/sharepoint/domains/lists/index.ts`, add:

```ts
export {
  checkListStructuralCompatibility,
  type ListStructuralCompatibility,
} from "./list-structural-compatibility";
```

- [ ] **Step 4: Add warning builder in create list action**

In `create-sp-list/action.ts`, add `ProvisioningWarning` to the runtime type import:

```ts
import type { M365Clients, ProvisioningResultLight, M365Scope, M365RuntimeContext, M365ActionResult, ProvisioningWarning } from "../../../../runtime";
```

Add this import:

```ts
import { checkListStructuralCompatibility } from "../../domains/lists/list-structural-compatibility";
```

Add this helper above the action class:

```ts
function buildListStructuralWarning(
  listName: string,
  compatibility: ReturnType<typeof checkListStructuralCompatibility>
): ProvisioningWarning | undefined {
  if (compatibility.compatible) return undefined;

  if (compatibility.reason === "list_template_unverifiable") {
    return {
      code: "LIST_TEMPLATE_UNVERIFIABLE",
      message: "List already exists, but its template could not be verified.",
      details: { listName, expectedTemplate: compatibility.expectedTemplate },
    };
  }

  return {
    code: "LIST_STRUCTURAL_COLLISION",
    message: "List already exists with a template that does not match the create action payload.",
    details: {
      listName,
      expectedTemplate: compatibility.expectedTemplate,
      actualTemplate: compatibility.actualTemplate,
    },
  };
}
```

- [ ] **Step 5: Move template resolution before existing-list check**

In `createSPList` handler, move:

```ts
    const template = ctx.action.payload.template;
    const enableContentTypes = ctx.action.payload.enableContentTypes ?? false;
```

so it sits immediately after:

```ts
    const listName = ctx.action.payload.listName;
    const displayTitle = ctx.action.payload.title;
```

Expected: `template` is available before the idempotency branch and the later create call still uses the same value.

- [ ] **Step 6: Warn on existing list template mismatch during run**

In `createSPList` handler, inside `if (existing?.Id)`, before `ctx.logger.info(...)`, add:

```ts
      const compatibility = checkListStructuralCompatibility(template, existing);
      const structuralWarning = buildListStructuralWarning(listName, compatibility);
      if (structuralWarning) {
        ctx.logger.warn("List structural collision detected while skipping create", {
          listName,
          expectedTemplate: template,
          actualTemplate: existing.BaseTemplate,
          warningCode: structuralWarning.code,
        });
      }
```

Replace the `actionSkipped` call with:

```ts
      return actionSkipped(
        listName,
        "already_exists",
        {
          web,
          list: web.lists.getById(existing.Id),
        },
        structuralWarning ? [structuralWarning] : undefined
      );
```

- [ ] **Step 7: Mark create list compliance non-compliant on real template mismatch**

In `checkCompliance`, after `if (!found?.Id)`, add:

```ts
      const compatibility = checkListStructuralCompatibility(ctx.action.payload.template, found);
      if (!compatibility.compatible && compatibility.reason === "list_template_mismatch") {
        return nonCompliant({
          resource: listName,
          reason: "template_mismatch",
          message: "List exists, but its template does not match the create action payload.",
          details: {
            expectedTemplate: compatibility.expectedTemplate,
            actualTemplate: compatibility.actualTemplate,
          },
        });
      }
```

Do not mark `list_template_unverifiable` as non-compliant in this task. The action should continue as compliant for existence when the template cannot be read, because the intended create semantics are tolerant and SharePoint API availability can vary.

- [ ] **Step 8: Add smoke tests for list compatibility helper**

In `smoke-m365-engine.ts`, add import:

```ts
import { checkListStructuralCompatibility } from "../src/actions/sharepoint/domains/lists/list-structural-compatibility";
```

Add this function after `assertFieldStructuralCompatibility()`:

```ts
function assertListStructuralCompatibility(): void {
  const compatible = checkListStructuralCompatibility(100, { BaseTemplate: 100 });
  assert(compatible.compatible, "List create compatibility should accept matching BaseTemplate");

  const mismatch = checkListStructuralCompatibility(100, { BaseTemplate: 101 });
  assert(!mismatch.compatible, "List create compatibility should reject mismatched BaseTemplate");
  assert(
    !mismatch.compatible && mismatch.reason === "list_template_mismatch",
    "Mismatched BaseTemplate should be reported as list_template_mismatch"
  );

  const unverifiable = checkListStructuralCompatibility(100, {});
  assert(!unverifiable.compatible, "Missing BaseTemplate should be treated as structurally unverifiable");
  assert(
    !unverifiable.compatible && unverifiable.reason === "list_template_unverifiable",
    "Missing BaseTemplate should be reported as list_template_unverifiable"
  );
}
```

Call it in `main()` after `assertFieldStructuralCompatibility();`:

```ts
  assertListStructuralCompatibility();
```

- [ ] **Step 9: Run focused validation**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: both commands exit `0`.

- [ ] **Step 10: Commit list structural collision detection**

Run:

```bash
git add packages/m365-actionable-provisioning/src/actions/sharepoint/domains/lists/list-lookup.ts \
  packages/m365-actionable-provisioning/src/actions/sharepoint/domains/lists/list-structural-compatibility.ts \
  packages/m365-actionable-provisioning/src/actions/sharepoint/domains/lists/index.ts \
  packages/m365-actionable-provisioning/src/actions/sharepoint/lists/create-sp-list/action.ts \
  packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts
git commit -m "feat: detect list create template collisions"
```

Expected: commit succeeds unless execution is intentionally running without commits.

---

### Task 7: Document Action Semantics And Correct Lookup Examples

**Files:**
- Modify: `packages/m365-actionable-provisioning/README.md`
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/README.md`
- Modify: `docs/provisioning-schema.md`

- [ ] **Step 1: Expand package README**

Replace `packages/m365-actionable-provisioning/README.md` with:

```md
# @apvee/m365-actionable-provisioning

Schema-first actionable provisioning engine for Microsoft 365.

## Public API

- `@apvee/m365-actionable-provisioning`

## Action Semantics

Provisioning actions use explicit semantics:

- `create*` actions ensure a resource exists.
- `modify*` actions enforce mutable desired state.
- `delete*` actions ensure a resource is absent.

Create actions are intentionally idempotent and tolerant. If a resource already exists with the same stable identity, the action may return `skipped` with `reason: "already_exists"` and continue. Mutable properties supplied to create actions, such as titles, descriptions, groups, required flags, versioning settings, or default values, are create-time defaults. They are not reconciled when the resource already exists.

Use a follow-up `modify*` action when a plan must enforce mutable state:

```ts
{
  verb: "createSPList",
  listName: "requests",
  title: "Requests"
},
{
  verb: "modifySPList",
  listName: "requests",
  title: "Richieste",
  enableVersioning: true
}
```

Create actions may still report structural warnings or non-compliant compliance results for collisions that make the plan ambiguous, such as an existing field with the requested internal name but a different SharePoint field type.

## Warnings

Action results may include `warnings`. Warnings are non-blocking audit details. They are used when an action succeeds or skips but part of the operation needs operator attention, such as a best-effort SharePoint post-create setting that could not be applied.
```

- [ ] **Step 2: Add semantics to SharePoint action README**

In `packages/m365-actionable-provisioning/src/actions/sharepoint/README.md`, add this section after `## Purpose`:

```md
## Action Semantics

SharePoint actions follow a deliberate create/modify/delete split:

- `createSPSite`, `createSPList`, `addSPField`, and `createSPSiteColumn` ensure that the target resource exists.
- `modifySPSite`, `modifySPList`, and `modifySPField` enforce mutable configuration on existing resources.
- `deleteSPSite`, `deleteSPList`, and `deleteSPField` ensure absence.

Create actions do not reconcile mutable properties on already-existing resources. For example, an existing list with the requested `listName` but a different `Title` still satisfies the create action. Add a `modifySPList` action when the title must be enforced.

Compliance for create actions checks existence and structural compatibility. It does not fail because mutable properties differ. Structural collisions, such as an existing field with a different SharePoint field type, can return `non_compliant` because descendant actions may otherwise operate against the wrong shape.
```

- [ ] **Step 3: Add semantics to schema docs**

In `docs/provisioning-schema.md`, after `## Plan Structure` and before `### Schema Definition`, add:

```md
### Action Semantics

The schema separates existence from mutable desired state:

| Action family | Meaning | Drift behavior |
|---------------|---------|----------------|
| `create*` | Ensure the resource exists | Existing mutable property differences are accepted |
| `modify*` | Enforce mutable state | Declared mutable property differences are non-compliant |
| `delete*` | Ensure the resource is absent | Existing resource is non-compliant |

Create action payload properties are used when creating a missing resource. If the resource already exists, those properties are not automatically reconciled. Use a follow-up `modify*` action when the plan must enforce configuration.

```ts
{
  verb: "createSPList",
  listName: "requests",
  title: "Requests"
},
{
  verb: "modifySPList",
  listName: "requests",
  title: "Richieste",
  enableVersioning: true
}
```

Create compliance still detects structural collisions when possible. For example, an existing field with the same `fieldName` but an incompatible SharePoint field type is not treated as a clean create match.
```

- [ ] **Step 4: Correct Lookup field docs**

In `docs/provisioning-schema.md`, replace the Supported Field Types row:

```md
| `Lookup` | Lookup to another list | `lookupList`, `lookupField` |
```

with:

```md
| `Lookup` | Lookup to another list | `lookupListName`, `lookupListId`, `showField` |
```

Replace the Lookup example:

```ts
{
  verb: "addSPField",
  fieldType: "Lookup",
  fieldName: "Category",
  displayName: "Category",
  lookupList: "Categories",      // List internal name
  lookupField: "Title",          // Field to display
  allowMultipleValues: false
}
```

with:

```ts
{
  verb: "addSPField",
  fieldType: "Lookup",
  fieldName: "Category",
  displayName: "Category",
  lookupListName: "Categories",  // List root folder name
  showField: "Title",            // Field to display
  allowMultipleValues: false
}
```

- [ ] **Step 5: Document best-effort properties**

In `docs/provisioning-schema.md`, after the Lookup example, add:

```md
### Best-Effort Field Settings

Some SharePoint field settings are applied after field creation because PnPjs or SharePoint REST does not apply them reliably during the initial create call. The action still succeeds when the field is created, but the result can include warnings if these best-effort updates fail.

Current best-effort settings include:

| Field type | Settings |
|------------|----------|
| `MultilineText` | `required` post-create update |
| `User` | `allowMultipleValues`, `presence`, `selectionGroup` |
| `Lookup` | post-create lookup settings and `dependentLookupFields` |

Use `modifySPField` after creation when a plan must enforce mutable field settings and surface drift through compliance.
```

- [ ] **Step 6: Run docs sanity search**

Run:

```bash
rg -n "lookupList\\b|lookupField\\b|create\\*|modify\\*|Best-Effort|already_exists" packages/m365-actionable-provisioning/README.md packages/m365-actionable-provisioning/src/actions/sharepoint/README.md docs/provisioning-schema.md
```

Expected:

- `lookupList` and `lookupField` no longer appear as documented property names.
- `create*`, `modify*`, best-effort warning semantics, and `already_exists` appear in the docs.

- [ ] **Step 7: Run build validation**

Run:

```bash
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: exit code `0`.

- [ ] **Step 8: Commit documentation**

Run:

```bash
git add packages/m365-actionable-provisioning/README.md \
  packages/m365-actionable-provisioning/src/actions/sharepoint/README.md \
  docs/provisioning-schema.md
git commit -m "docs: define create action semantics"
```

Expected: commit succeeds unless execution is intentionally running without commits.

---

### Task 8: Add Final Smoke Guardrails And Package Verification

**Files:**
- Modify: `packages/m365-actionable-provisioning/src/actions/sharepoint/fields/_shared/field-base-schema.ts`
- Modify: `packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts`

- [ ] **Step 1: Add schema parsing check for corrected Lookup docs shape**

In `assertSharePointCatalogComposition()`, after the `listField` assertion, add:

```ts
  const lookupField = listSubactionSchema.safeParse({
    verb: "addSPField",
    fieldType: "Lookup",
    fieldName: "SmokeLookup",
    displayName: "Smoke Lookup",
    lookupListName: "SmokeCategories",
    showField: "Title",
  });
  assert(lookupField.success, "SharePoint list subaction schema should accept documented lookup field shape");
```

- [ ] **Step 2: Make Lookup field schema reject unknown property names**

In `packages/m365-actionable-provisioning/src/actions/sharepoint/fields/_shared/field-base-schema.ts`, change the end of `baseFieldLookupSchema` from:

```ts
    showInNewForm: z.boolean().optional(),
});
```

to:

```ts
    showInNewForm: z.boolean().optional(),
}).strict();
```

Expected: documented Lookup property names still pass; stale unknown names such as `lookupList` and `lookupField` now fail validation instead of being stripped silently.

- [ ] **Step 3: Add schema rejection check for stale Lookup docs shape**

Immediately after the new lookup success assertion, add:

```ts
  const staleLookupField = listSubactionSchema.safeParse({
    verb: "addSPField",
    fieldType: "Lookup",
    fieldName: "SmokeLookup",
    displayName: "Smoke Lookup",
    lookupList: "SmokeCategories",
    lookupField: "Title",
  });
  assert(!staleLookupField.success, "SharePoint list subaction schema should reject stale lookupList/lookupField names");
```

- [ ] **Step 4: Run full validation for M365 package**

Run:

```bash
npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning
npm run build -w @apvee/m365-actionable-provisioning
```

Expected: both commands exit `0`.

- [ ] **Step 5: Run root build if time allows**

Run:

```bash
npm run build
```

Expected: exit code `0`. If this fails in `build:test-spfx` due to unrelated SPFx environment noise, record the exact failure and keep the M365 package smoke/build result as the acceptance gate for this plan.

- [ ] **Step 6: Commit smoke guardrails**

Run:

```bash
git add packages/m365-actionable-provisioning/src/actions/sharepoint/fields/_shared/field-base-schema.ts \
  packages/m365-actionable-provisioning/scripts/smoke-m365-engine.ts
git commit -m "test: guard lookup schema examples"
```

Expected: commit succeeds unless execution is intentionally running without commits.

---

## Final Acceptance Criteria

- `create*` actions remain idempotent and do not reconcile mutable state.
- Existing same-type fields still produce `skipped/already_exists`.
- Existing wrong-type fields produce a structural warning during run and `non_compliant` or `unverifiable` during create compliance.
- Existing same-template lists still produce `skipped/already_exists`.
- Existing different-template lists produce a structural warning during run and `non_compliant` during create compliance.
- Best-effort field post-create failures are logged with `logger.warn` and returned in result `warnings`.
- Documentation explains `create* = ensure exists`, `modify* = enforce state`, and `delete* = ensure absent`.
- Documentation no longer uses stale Lookup property names.
- `npm run smoke:m365-engine -w @apvee/m365-actionable-provisioning` exits `0`.
- `npm run build -w @apvee/m365-actionable-provisioning` exits `0`.

## Self-Review

- Spec coverage: The plan covers point 1 by defining create compliance as existence plus structural compatibility, point 2 by documenting create-vs-modify semantics and avoiding automatic reconciliation, and point 3 by adding non-blocking warnings for best-effort field updates.
- Placeholder scan: The plan intentionally avoids open-ended placeholders. Any optional step has a concrete skip condition.
- Type consistency: Warning types flow from `ProvisioningWarning` to `ProvisioningResultLight`, `M365ActionResult`, action result helpers, and smoke result types. Structural compatibility uses `BaseFieldPayload["fieldType"]` consistently.
- Scope check: The plan stays in `@apvee/m365-actionable-provisioning` runtime/docs and does not modify SPFx rendering. UI warning badges remain a separate follow-up.
