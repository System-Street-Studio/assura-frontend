export const ROLES = {
  STOREKEEPER: 'Storekeeper',
  HUMAN_RESOURCE: 'Human Resource',
  AUDITOR: 'Auditor',
  PROCUREMENT: 'Procurement',
  ADMIN: 'Admin',
  SUPERINTENDENT: 'Superintendent',
  ACCOUNTANT: 'Accountant',
  EMPLOYEE: 'Employee',
  DIVISION_HEAD: 'Division Head',
} as const;

export type RoleKey = keyof typeof ROLES;
export type RoleName = (typeof ROLES)[RoleKey];
