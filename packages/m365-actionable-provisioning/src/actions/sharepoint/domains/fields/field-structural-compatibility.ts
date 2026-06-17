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
