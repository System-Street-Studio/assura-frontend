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

    it('should handle Save and Next workflow', fakeAsync(() => {
        // Set some values
        component.itemName = 'Test Item';
        component.itemCount = 1;

        // Trigger Save and Next
        component.onSaveAndNext();

        // Verify popup is shown
        expect(component.showSuccessPopup).toBeTrue();

        // Wait for timeout
        tick(800);

        // Verify popup is hidden
        expect(component.showSuccessPopup).toBeFalse();

        // Verify item count incremented
        expect(component.itemCount).toBe(2);

        // Verify form reset
        expect(component.itemName).toBe('');
    }));

    it('should navigate to purchase orders on exit', () => {
        component.exit();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['procurement', 'purchase-orders']);
    });
});
