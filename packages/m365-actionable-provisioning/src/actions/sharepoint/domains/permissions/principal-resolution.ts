import type { GraphFI } from "@pnp/graph";
import type { IWeb } from "@pnp/sp/webs";
import { escapeODataStringLiteral } from "../lists/list-lookup";
import { PermissionResolutionError, isNotFoundError } from "./errors";
import type { PermissionPrincipalType } from "./schema";

import "@pnp/graph/groups";
import "@pnp/sp/site-groups/web";
import "@pnp/sp/site-users/web";

export type PrincipalReference = Readonly<{
  principalType: PermissionPrincipalType;
  principal: string;
}>;

export type ResolvePrincipalArgs = PrincipalReference & Readonly<{
  web: IWeb;
  graphClient?: GraphFI;
  allowEnsureUser: boolean;
}>;

type PrincipalInfo = Readonly<{ Id?: number; LoginName?: string; Title?: string }>;
type GraphGroupInfo = Readonly<{
  id?: string;
  displayName?: string;
  mailNickname?: string;
  groupTypes?: readonly string[];
  securityEnabled?: boolean;
}>;

export function buildEntraGroupClaim(groupId: string): string {
  return `c:0t.c|tenant|${groupId}`;
}

export function buildM365GroupClaim(groupId: string): string {
  return `c:0o.c|federateddirectoryclaimprovider|${groupId}`;
}

async function materializePrincipalId(web: IWeb, loginName: string, allowEnsureUser: boolean): Promise<number> {
  let info: PrincipalInfo;
  try {
    info = allowEnsureUser
      ? await web.ensureUser(loginName)
      : await web.siteUsers.getByLoginName(loginName)();
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new PermissionResolutionError("not_found", `SharePoint principal '${loginName}' was not found.`, error);
    }
    throw error;
  }

  if (typeof info.Id === "number") {
    return info.Id;
  }

  throw new PermissionResolutionError("not_found", `SharePoint principal '${loginName}' did not return an Id.`, info);
}

async function resolveGroupIdByGraphQuery(
  graphClient: GraphFI | undefined,
  filter: string,
  resource: string
): Promise<string> {
  if (!graphClient) {
    throw new PermissionResolutionError("missing_prerequisite", `GraphFI instance is required to resolve ${resource}.`);
  }

  const matches = await graphClient.groups
    .filter(filter)
    .top(2)
    .select("id", "displayName", "mailNickname", "groupTypes", "securityEnabled")<GraphGroupInfo[]>();

  if (!Array.isArray(matches) || matches.length === 0) {
    throw new PermissionResolutionError("not_found", `${resource} was not found.`);
  }

  if (matches.length > 1) {
    throw new PermissionResolutionError("ambiguous", `${resource} matched multiple groups.`, matches);
  }

  const match = matches[0];
  if (!match?.id) {
    throw new PermissionResolutionError("not_found", `${resource} did not return a Microsoft Graph id.`, match);
  }

  return match.id;
}

export async function resolvePrincipalId(args: ResolvePrincipalArgs): Promise<number> {
  const { web, graphClient, principalType, principal, allowEnsureUser } = args;

  switch (principalType) {
    case "spGroupName":
      try {
        const group = await web.siteGroups.getByName(principal)();
        if (typeof group.Id === "number") return group.Id;
        throw new PermissionResolutionError("not_found", `SharePoint group '${principal}' did not return an Id.`, group);
      } catch (error) {
        if (isNotFoundError(error)) {
          throw new PermissionResolutionError("not_found", `SharePoint group '${principal}' was not found.`, error);
        }
        throw error;
      }

    case "entraGroupId":
      return materializePrincipalId(web, buildEntraGroupClaim(principal), allowEnsureUser);

    case "m365GroupId":
      return materializePrincipalId(web, buildM365GroupClaim(principal), allowEnsureUser);

    case "entraGroupName": {
      const safeName = escapeODataStringLiteral(principal);
      const groupId = await resolveGroupIdByGraphQuery(
        graphClient,
        `displayName eq '${safeName}' and securityEnabled eq true`,
        `Entra group '${principal}'`
      );
      return materializePrincipalId(web, buildEntraGroupClaim(groupId), allowEnsureUser);
    }

    case "m365GroupName": {
      const safeName = escapeODataStringLiteral(principal);
      const groupId = await resolveGroupIdByGraphQuery(
        graphClient,
        `displayName eq '${safeName}' and groupTypes/any(c:c eq 'Unified')`,
        `Microsoft 365 group '${principal}'`
      );
      return materializePrincipalId(web, buildM365GroupClaim(groupId), allowEnsureUser);
    }

    case "m365GroupMailNickname": {
      const safeNickname = escapeODataStringLiteral(principal);
      const groupId = await resolveGroupIdByGraphQuery(
        graphClient,
        `mailNickname eq '${safeNickname}' and groupTypes/any(c:c eq 'Unified')`,
        `Microsoft 365 group mailNickname '${principal}'`
      );
      return materializePrincipalId(web, buildM365GroupClaim(groupId), allowEnsureUser);
    }

    case "loginName":
      return materializePrincipalId(web, principal, allowEnsureUser);
  }
}
