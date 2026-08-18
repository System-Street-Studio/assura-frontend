export const ROLES = {
  STOREKEEPER: 'Storekeeper',
  HUMAN_RESOURCE: 'HR',
  AUDITOR: 'Auditor',
  PROCUREMENT: 'Procurement',
  ADMIN: 'Admin',
  SUPERINTENDENT: 'Superintendent',
  ACCOUNTANT: 'Accountant',
  EMPLOYEE: 'Employee',
  DIVISION_HEAD: 'DivisionHead',
  SYSTEM_ADMIN: 'SystemAdmin',
} as const;

export type RoleKey = keyof typeof ROLES;
export type RoleName = (typeof ROLES)[RoleKey];
