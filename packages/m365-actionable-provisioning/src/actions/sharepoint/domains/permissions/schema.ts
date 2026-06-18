import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";

export const permissionPrincipalTypes = [
  "loginName",
  "spGroupName",
  "entraGroupId",
  "m365GroupId",
  "entraGroupName",
  "m365GroupName",
  "m365GroupMailNickname",
] as const;

export const permissionRoleTypes = [
  "read",
  "contribute",
  "edit",
  "design",
  "fullControl",
] as const;

export type PermissionPrincipalType = (typeof permissionPrincipalTypes)[number];
export type PermissionRoleType = (typeof permissionRoleTypes)[number];

export const roleTypeKindByPermissionRoleType = {
  read: 2,
  contribute: 3,
  design: 4,
  fullControl: 5,
  edit: 6,
} as const satisfies Record<PermissionRoleType, 2 | 3 | 4 | 5 | 6>;

const permissionPrincipalTypeSchema = z.enum(permissionPrincipalTypes);
const permissionRoleTypeSchema = z.enum(permissionRoleTypes);

const permissionPrincipalSchema = z.object({
  principalType: permissionPrincipalTypeSchema,
  principal: z.string().trim().min(1),
});

const permissionRoleReferenceFields = {
  roleId: z.number().int().positive().optional(),
  roleName: z.string().trim().min(1).optional(),
  roleType: permissionRoleTypeSchema.optional(),
} as const;

export function countRoleReferences(value: {
  roleId?: number;
  roleName?: string;
  roleType?: PermissionRoleType;
}): number {
  return [
    value.roleId !== undefined,
    value.roleName !== undefined,
    value.roleType !== undefined,
  ].filter(Boolean).length;
}

function withExactlyOneRoleReference<TSchema extends z.ZodTypeAny>(schema: TSchema): TSchema {
  return schema.superRefine((value: unknown, ctx) => {
    const payload = value as {
      roleId?: number;
      roleName?: string;
      roleType?: PermissionRoleType;
    };
    const roleReferenceCount = countRoleReferences(payload);

    if (roleReferenceCount === 1) {
      return;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Exactly one of roleId, roleName, or roleType must be provided",
      path: ["roleId"],
    });
  }) as TSchema;
}

function withLegalBreakRoleInheritanceOptions<TSchema extends z.ZodTypeAny>(schema: TSchema): TSchema {
  return schema.superRefine((value: unknown, ctx) => {
    const payload = value as {
      breakRoleInheritance?: boolean;
      copyRoleAssignments?: boolean;
      clearSubscopes?: boolean;
    };

    if (payload.breakRoleInheritance === true) {
      return;
    }

    if (payload.copyRoleAssignments !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "copyRoleAssignments is only allowed when breakRoleInheritance is true",
        path: ["copyRoleAssignments"],
      });
    }

    if (payload.clearSubscopes !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "clearSubscopes is only allowed when breakRoleInheritance is true",
        path: ["clearSubscopes"],
      });
    }
  }) as TSchema;
}

export function createBreakRoleInheritanceSchema<Verb extends string>(verb: Verb) {
  return z.object({
    verb: z.literal(verb),
    copyRoleAssignments: z.boolean().optional(),
    clearSubscopes: z.boolean().optional(),
    subactions: leafSubactionsSchema,
  }).strict();
}

export function createResetRoleInheritanceSchema<Verb extends string>(verb: Verb) {
  return z.object({
    verb: z.literal(verb),
    subactions: leafSubactionsSchema,
  }).strict();
}

export function createGrantRoleAssignmentSchema<Verb extends string>(verb: Verb) {
  return withLegalBreakRoleInheritanceOptions(
    withExactlyOneRoleReference(
      z.object({
        verb: z.literal(verb),
        ...permissionPrincipalSchema.shape,
        ...permissionRoleReferenceFields,
        breakRoleInheritance: z.boolean().optional(),
        copyRoleAssignments: z.boolean().optional(),
        clearSubscopes: z.boolean().optional(),
        subactions: leafSubactionsSchema,
      }).strict()
    )
  );
}

export function createRemoveRoleAssignmentSchema<Verb extends string>(verb: Verb) {
  return withExactlyOneRoleReference(
    z.object({
      verb: z.literal(verb),
      ...permissionPrincipalSchema.shape,
      ...permissionRoleReferenceFields,
      subactions: leafSubactionsSchema,
    }).strict()
  );
}
