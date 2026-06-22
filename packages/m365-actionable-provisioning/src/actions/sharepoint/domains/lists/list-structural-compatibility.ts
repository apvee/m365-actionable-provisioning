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
