import type { ProvisioningWarning } from "../../../../runtime";

export type ContentTypeReference = Readonly<{
  contentTypeId?: string;
  contentTypeName?: string;
}>;

export function getContentTypeReferenceResource(reference: ContentTypeReference): string {
  return reference.contentTypeId ?? reference.contentTypeName ?? "(content type)";
}

export function buildContentTypeNameMismatchWarning(
  expectedName: string,
  actualName: string,
  contentTypeId: string
): ProvisioningWarning {
  return {
    code: "CONTENT_TYPE_REFERENCE_NAME_MISMATCH",
    message: "Content type id resolved to a content type with a different name than the supplied contentTypeName.",
    details: { contentTypeId, expectedName, actualName },
  };
}
