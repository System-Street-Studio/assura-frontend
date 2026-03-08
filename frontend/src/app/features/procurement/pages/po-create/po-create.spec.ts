import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PoCreate } from './po-create';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('PoCreate', () => {
    let component: PoCreate;
    let fixture: ComponentFixture<PoCreate>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [
                PoCreate,
                CommonModule,
                FormsModule,
                BrowserAnimationsModule,
                ButtonComponent,
                StatusCardComponent
            ],
            providers: [
                { provide: Router, useValue: routerSpy }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PoCreate);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
        expect(component.itemCount).toBe(1);
        expect(component.showSuccessPopup).toBeFalse();
        expect(component.itemName).toBe('');
    });

    it('should calculate amount correctly', () => {
        component.quantity = 10;
        component.unitPrice = 500;
        component.calculateTotals();
        expect(component.amount).toBe(5000);
    });

    it('should calculate discounted price correctly', () => {
        component.quantity = 10;
        component.unitPrice = 500;
        component.discount = 10; // 10%
        component.calculateTotals();
        expect(component.amount).toBe(5000);
        expect(component.discountedPrice).toBe(4500);
    });

    it('should calculate vat amount and total price correctly', () => {
        component.quantity = 10;
        component.unitPrice = 500;
        component.discount = 10; // 10% -> 4500
        component.vat = 15; // 15% of 4500 -> 675
        component.calculateTotals();
        expect(component.vatAmount).toBe(675);
        expect(component.totalPrice).toBe(5175);
    });

    it('should handle zero or null values gracefully', () => {
        component.quantity = 0;
        component.unitPrice = 500;
        component.calculateTotals();
        expect(component.amount).toBe(0);
        expect(component.totalPrice).toBe(0);
    });

    it('should reset calculations on Save and Next', fakeAsync(() => {
        component.quantity = 10;
        component.unitPrice = 500;
        component.calculateTotals();
        expect(component.amount).toBe(5000);

        component.onSaveAndNext();
        tick(800);

        expect(component.amount).toBe(0);
        expect(component.quantity).toBe(0);
    }));

    it('should navigate to purchase orders on exit', () => {
        component.exit();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['procurement', 'purchase-orders']);
    });
});
