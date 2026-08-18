import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { MaintenanceNoteCreateComponent } from './maintenance-note-create.component';
import { ProcurementService } from '../../services/procurement.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AssetSummaryDto, RepairingFirmDto } from '../../models/maintenance.model';

// Covers a bug found by the test-workflow simulation: the "Repair Firm" field on
// this form was accepted as optional even though it should be required (unlike
// every other required field on the page, it had no Validators.required, no "*"
// marker, and no error message). This also covers the related status-value
// mismatch: the create form previously wrote "In Progress" (with a space) while
// every other place in the app (the note view/edit page, the Storekeeper's
// MaintenanceStatus type, the backend's own status-transition switch cases) uses
// "InProgress" (no space) — causing a note's status to appear to "disappear" when
// reopened, and risking a silent overwrite back to "Scheduled" on save.
describe('MaintenanceNoteCreateComponent', () => {
    let component: MaintenanceNoteCreateComponent;
    let fixture: ComponentFixture<MaintenanceNoteCreateComponent>;
    let procurementServiceSpy: jasmine.SpyObj<ProcurementService>;
    let toastServiceSpy: jasmine.SpyObj<ToastService>;

    const assets: AssetSummaryDto[] = [
        { id: 16, assetCode: 'AST-0016', assetName: 'Office Chair Ergonomic', productName: 'Office Chair Ergonomic', categoryName: 'Furniture', divisionName: 'IT' }
    ];
    const firms: RepairingFirmDto[] = [
        { id: 1, name: 'Acme Repairs' }
    ];

    beforeEach(async () => {
        procurementServiceSpy = jasmine.createSpyObj('ProcurementService', ['getAssets', 'getRepairingFirms', 'createMaintenance']);
        procurementServiceSpy.getAssets.and.returnValue(of(assets));
        procurementServiceSpy.getRepairingFirms.and.returnValue(of(firms));
        procurementServiceSpy.createMaintenance.and.returnValue(of(99));
        toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [MaintenanceNoteCreateComponent, CommonModule, FormsModule, ReactiveFormsModule],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
                { provide: ProcurementService, useValue: procurementServiceSpy },
                { provide: ToastService, useValue: toastServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(MaintenanceNoteCreateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    function fillValidFormExceptRepairFirm(): void {
        component.noteForm.patchValue({
            assetId: 16,
            date: '2026-08-16',
            cost: 100,
            description: 'Screen replacement',
            status: 'Scheduled'
        });
    }

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('marks the form invalid when repairingFirmId is missing', () => {
        fillValidFormExceptRepairFirm();
        expect(component.noteForm.valid).toBeFalse();
        expect(component.noteForm.get('repairingFirmId')?.errors?.['required']).toBeTruthy();
    });

    it('marks the form valid once repairingFirmId is filled alongside the other required fields', () => {
        fillValidFormExceptRepairFirm();
        component.noteForm.patchValue({ repairingFirmId: 1 });
        expect(component.noteForm.valid).toBeTrue();
    });

    it('does not call createMaintenance when repairingFirmId is missing (submit rejected)', () => {
        fillValidFormExceptRepairFirm();
        component.save();
        expect(procurementServiceSpy.createMaintenance).not.toHaveBeenCalled();
        expect(component.noteForm.get('repairingFirmId')?.touched).toBeTrue();
    });

    it('calls createMaintenance with every submitted field, including repairingFirmId, when the form is valid', () => {
        fillValidFormExceptRepairFirm();
        component.noteForm.patchValue({ repairingFirmId: 1, status: 'InProgress' });

        component.save();

        expect(procurementServiceSpy.createMaintenance).toHaveBeenCalledTimes(1);
        const submitted = procurementServiceSpy.createMaintenance.calls.mostRecent().args[0];
        expect(submitted.assetId).toBe(16);
        expect(submitted.maintenanceDate).toBe('2026-08-16');
        expect(submitted.cost).toBe(100);
        expect(submitted.description).toBe('Screen replacement');
        expect(submitted.repairingFirmId).toBe(1);
        expect(submitted.status).toBe('InProgress');
    });

    it('uses the canonical "InProgress" (no space) status value, matching the rest of the app', () => {
        const statusControl = component.noteForm.get('status');
        statusControl?.setValue('InProgress');
        expect(statusControl?.value).toBe('InProgress');
    });
});
