import type { IWeb } from "@pnp/sp/webs";
import { PermissionKind } from "@pnp/sp/security";
import { createLogger } from "../../src/core/logger";
import { buildInitialTrace } from "../../src/core/trace";
import type { M365RuntimeContext } from "../../src/runtime";

export type TestGroup = { Id: number; Title: string; Description?: string | null };
export type GroupWrite = { operation: "add" | "update" | "remove" | "grant"; id: number; props?: unknown };

/** Stateful stand-in for the external SharePoint boundary, not the action logic. */
export function createGroupFixture(seed: readonly TestGroup[] = []) {
  const groups = new Map(seed.map((group) => [group.Id, { ...group }]));
  const writes: GroupWrite[] = [];
  const queries: { filter: string; fields: string[]; limit: number }[] = [];
  const probes: PermissionKind[] = [];
  const bindings = new Map<number, Set<number>>();
  const settings = {
    readError: undefined as unknown,
    writeError: undefined as unknown,
    probeError: undefined as unknown,
    response: undefined as unknown,
    overrideResponse: false,
    createAllowed: true,
    manageAllowed: true,
    forbidWrites: false,
  };
  const beforeWrite = () => {
    if (settings.forbidWrites) throw new Error("Compliance attempted a write");
    if (settings.writeError) throw settings.writeError;
  };
  const siteGroups = {
    filter: (filter: string) => {
      const query = { filter, fields: [] as string[], limit: Infinity };
      const read = Object.assign(async () => {
        queries.push(query);
        if (settings.readError) throw settings.readError;
        if (settings.overrideResponse) return settings.response;
        const byId = /^Id eq (\d+)$/.exec(filter);
        const byName = /^Title eq '((?:[^']|'')*)'$/.exec(filter);
        if (!byId && !byName) throw new Error(`Unexpected group filter: ${filter}`);
        return [...groups.values()].filter((group) => byId
          ? group.Id === Number(byId[1])
          : group.Title === byName![1].replace(/''/g, "'")).slice(0, query.limit).map((group) => ({ ...group }));
      }, {
        select: (...fields: string[]) => { query.fields = fields; return read; },
        top: (limit: number) => { query.limit = limit; return read; },
      });
      return read;
    },
    getById: (id: number) => ({
      update: async (props: Partial<TestGroup>) => {
        beforeWrite();
        const group = groups.get(id);
        if (!group) throw Object.assign(new Error("Group not found"), { status: 404 });
        if (props.Title && [...groups.values()].some((other) => other.Id !== id && other.Title === props.Title)) {
          throw Object.assign(new Error("Group already exists"), { status: 400 });
        }
        writes.push({ operation: "update", id, props });
        Object.assign(group, props);
        return { ...group };
      },
    }),
    getByName: (name: string) => async () => {
      if (settings.readError) throw settings.readError;
      const group = [...groups.values()].find((item) => item.Title === name);
      if (!group) throw Object.assign(new Error("Group not found"), { status: 404 });
      return { ...group };
    },
    add: async (props: { Title: string; Description?: string }) => {
      beforeWrite();
      const id = Math.max(0, ...groups.keys()) + 1;
      const group = { Id: id, ...props };
      writes.push({ operation: "add", id, props });
      groups.set(id, group);
      return { ...group };
    },
    removeById: async (id: number) => {
      beforeWrite();
      writes.push({ operation: "remove", id });
      groups.delete(id);
    },
  };
  const web = {
    siteGroups,
    currentUserHasPermissions: async (kind: PermissionKind) => {
      probes.push(kind);
      if (settings.probeError) throw settings.probeError;
      return kind === PermissionKind.CreateGroups ? settings.createAllowed : settings.manageAllowed;
    },
    select: (...fields: string[]) => async () => {
      if (fields.length !== 1 || fields[0] !== "HasUniqueRoleAssignments") throw new Error("Unexpected web query");
      return { HasUniqueRoleAssignments: true };
    },
    roleDefinitions: { getByType: (kind: number) => async () => {
      if (kind !== 2) throw new Error("Unexpected role type");
      return { Id: 1073741826, Name: "Read", RoleTypeKind: 2 };
    } },
    roleAssignments: {
      getById: (id: number) => ({ bindings: async () => [...(bindings.get(id) ?? [])].map((Id) => ({ Id })) }),
      add: async (id: number, roleId: number) => {
        beforeWrite();
        writes.push({ operation: "grant", id, props: roleId });
        const roles = bindings.get(id) ?? new Set<number>();
        roles.add(roleId);
        bindings.set(id, roles);
      },
      remove: async (id: number, roleId: number) => { beforeWrite(); bindings.get(id)?.delete(roleId); },
    },
    ensureUser: async () => { throw new Error("Group actions must not ensure users"); },
  } as unknown as IWeb;
  return { web, groups, writes, queries, probes, bindings, settings };
}

export function groupContext<TPayload extends Record<string, unknown>>(
  payload: TPayload,
  fixture = createGroupFixture(),
  path = "1"
): M365RuntimeContext<TPayload> {
  return {
    scopeIn: { web: fixture.web, webUrl: "https://contoso.sharepoint.com/sites/groups" },
    clients: { spfi: {} as NonNullable<M365RuntimeContext["clients"]["spfi"]> },
    out: { byAction: {}, trace: buildInitialTrace([]) },
    logger: createLogger({ level: "silent", sink: { write: () => {} } }),
    action: { path, verb: String(payload.verb), payload },
  };
}
