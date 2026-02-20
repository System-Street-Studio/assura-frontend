import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseOrdersComponent } from './purchase-orders.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FilterDropdownComponent } from '../../../../shared/components/filter-dropdown/filter-dropdown';

describe('PurchaseOrdersComponent', () => {
    let component: PurchaseOrdersComponent;
    let fixture: ComponentFixture<PurchaseOrdersComponent>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [
                PurchaseOrdersComponent,
                CommonModule,
                FormsModule,
                MatIconModule,
                FilterDropdownComponent
            ],
            providers: [
                { provide: Router, useValue: routerSpy }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PurchaseOrdersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have initial orders data', () => {
        expect(component.orders.length).toBeGreaterThan(0);
        expect(component.orders[0].id).toBeDefined();
    });

    it('should have initial requests data', () => {
        expect(component.requests.length).toBeGreaterThan(0);
    });

    it('should default selectedRequest to the first request', () => {
        expect(component.selectedRequest).toEqual(component.requests[0]);
    });

    it('should update selectedRequest when selectRequest is called', () => {
        const secondRequest = component.requests[1];
        component.selectRequest(secondRequest);
        expect(component.selectedRequest).toEqual(secondRequest);
    });

    it('should navigate to details page', () => {
        const testId = 'S-123';
        component.navigateToDetails(testId);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['procurement', 'purchase-orders', testId]);
    });

    it('should navigate to create page', () => {
        component.navigateToCreate();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['procurement', 'purchase-orders', 'create']);
    });

    it('should toggle filter visibility', () => {
        expect(component.isFilterOpen).toBeFalse();
        component.toggleFilter();
        expect(component.isFilterOpen).toBeTrue();
        component.toggleFilter();
        expect(component.isFilterOpen).toBeFalse();
    });

    it('should close filter on onFilterClose', () => {
        component.isFilterOpen = true;
        component.onFilterClose([]);
        expect(component.isFilterOpen).toBeFalse();
    });
});
