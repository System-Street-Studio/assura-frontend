import { shellRoutes } from './shell.routes';
import { ROLES } from '../../core/constants/roles';

// Covers the BUGS.md finding: Admin was granted /approvals route access in the
// frontend but every Transfer-by-head backend endpoint is Division-Head-only
// ([Authorize(Roles = "DivisionHead")]), so an Admin who reached /approvals/transfers
// got a failed list load and every action button 403'd. Per the deliberate fix,
// /approvals is now restricted to Division Head only in the frontend, matching the
// backend gate rather than widening it.
describe('shellRoutes — /approvals access', () => {
  it('restricts /approvals to Division Head only, not Admin', () => {
    const approvalsRoute = shellRoutes.find(r => r.path === 'approvals');

    expect(approvalsRoute).toBeTruthy();
    expect(approvalsRoute!.data?.['roles']).toEqual([ROLES.DIVISION_HEAD]);
    expect(approvalsRoute!.data?.['roles']).not.toContain(ROLES.ADMIN);
  });
});
