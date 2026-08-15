import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PoCreate } from './po-create';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProcurementService } from '../../services/procurement.service';
import { SupplierService } from '../../../../core/services/supplier.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { of } from 'rxjs';

describe('PoCreate', () => {
    let component: PoCreate;
    let fixture: ComponentFixture<PoCreate>;
    let routerSpy: jasmine.SpyObj<Router>;
    let procurementServiceSpy: jasmine.SpyObj<ProcurementService>;
    let supplierServiceSpy: jasmine.SpyObj<SupplierService>;
    let toastServiceSpy: jasmine.SpyObj<ToastService>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
        procurementServiceSpy = jasmine.createSpyObj('ProcurementService', ['createOrder']);
        supplierServiceSpy = jasmine.createSpyObj('SupplierService', ['getSuppliers']);
        supplierServiceSpy.getSuppliers.and.returnValue(of([]));
        toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);

        await TestBed.configureTestingModule({
            imports: [
                PoCreate,
                CommonModule,
                FormsModule,
                ReactiveFormsModule,
                BrowserAnimationsModule
            ],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: ProcurementService, useValue: procurementServiceSpy },
                { provide: SupplierService, useValue: supplierServiceSpy },
                { provide: ToastService, useValue: toastServiceSpy }
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
        expect(component.isSubmitting).toBeFalse();
        expect(component.itemForm.get('itemName')?.value).toBe('');
    });

    it('should calculate amount correctly', () => {
        component.itemForm.patchValue({ quantity: 10, unitPrice: 500 });
        component.calculateTotals();
        expect(component.amount).toBe(5000);
    });

    it('should calculate discounted price correctly', () => {
        component.itemForm.patchValue({ quantity: 10, unitPrice: 500, discount: 10 });
        component.calculateTotals();
        expect(component.amount).toBe(5000);
        expect(component.discountedPrice).toBe(4500);
    });

    it('should calculate vat amount and total price correctly', () => {
        component.itemForm.patchValue({ quantity: 10, unitPrice: 500, discount: 10, vat: 15 });
        component.calculateTotals();
        expect(component.vatAmount).toBe(675);
        expect(component.totalPrice).toBe(5175);
    });

    it('should handle zero or null values gracefully', () => {
        component.itemForm.patchValue({ quantity: 0, unitPrice: 500 });
        component.calculateTotals();
        expect(component.amount).toBe(0);
        expect(component.totalPrice).toBe(0);
    });

    it('should reset calculations on resetItemForm', () => {
        component.itemForm.patchValue({ quantity: 10, unitPrice: 500 });
        component.calculateTotals();
        expect(component.amount).toBe(5000);

        component.resetItemForm();

        expect(component.amount).toBe(0);
        expect(component.itemForm.get('quantity')?.value).toBe(0);
    });

    it('should navigate to purchase orders on exit', () => {
        component.exit();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['procurement', 'purchase-orders']);
    });
});

