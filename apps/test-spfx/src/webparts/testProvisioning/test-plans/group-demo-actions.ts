import type { GrantSPListRoleAssignmentPayload } from '@apvee/m365-actionable-provisioning';

/** Adds the demo groups while retaining existing list and child permissions. */
export const createDemoListGroupGrants = (
  readersGroupName: string,
  contributorsGroupName: string
): GrantSPListRoleAssignmentPayload[] => [
  {
    verb: 'grantSPListRoleAssignment',
    principalType: 'spGroupName',
    principal: readersGroupName,
    roleType: 'read',
    breakRoleInheritance: true,
    copyRoleAssignments: true,
    clearSubscopes: false,
  },
  {
    verb: 'grantSPListRoleAssignment',
    principalType: 'spGroupName',
    principal: contributorsGroupName,
    roleType: 'contribute',
    breakRoleInheritance: true,
    copyRoleAssignments: true,
    clearSubscopes: false,
  },
];
