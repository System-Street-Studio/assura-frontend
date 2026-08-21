import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SharedSidebarComponent } from './sidebar';
import { AuthService } from '../../../core/auth/auth.service';

// Covers the BUGS.md finding: the Approvals/Division-Head sidebar section listed
// 'Admin' among its roles even though /approvals is now Division-Head-only in
// shell.routes.ts — an Admin would have seen nav links into a feature area they
// can no longer navigate into.
describe('SharedSidebarComponent — Approvals section roles', () => {
  let component: SharedSidebarComponent;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getRoles']);
    authServiceSpy.getRoles.and.returnValue([]);
    const routerSpy = jasmine.createSpyObj('Router', [], { url: '/' });

    TestBed.configureTestingModule({
      imports: [SharedSidebarComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    component = TestBed.createComponent(SharedSidebarComponent).componentInstance;
  });

  it('only grants DivisionHead access to the Approvals nav links, not Admin', () => {
    const approvalsLinks = component.menuItems.filter(item => item.link.startsWith('/approvals/'));

    expect(approvalsLinks.length).toBeGreaterThan(0);
    for (const item of approvalsLinks) {
      expect(item.roles).toEqual(['DivisionHead']);
    }
  });
});
