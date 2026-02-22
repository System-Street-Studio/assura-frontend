import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination';
import { CommonModule } from '@angular/common';

describe('PaginationComponent', () => {
    let component: PaginationComponent;
    let fixture: ComponentFixture<PaginationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PaginationComponent, CommonModule],
        }).compileComponents();

        fixture = TestBed.createComponent(PaginationComponent);
        component = fixture.componentInstance;
        component.currentPage = 1;
        component.totalPages = 3;
        component.pageNumbers = [1, 2, 3];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit pageChange when goTo is called with valid page', () => {
        const spy = spyOn(component.pageChange, 'emit');
        component.goTo(2);
        expect(spy).toHaveBeenCalledWith(2);
    });

    it('should not emit pageChange when page < 1', () => {
        const spy = spyOn(component.pageChange, 'emit');
        component.goTo(0);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit pageChange when page > totalPages', () => {
        const spy = spyOn(component.pageChange, 'emit');
        component.goTo(10);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should emit pageChange for the last page', () => {
        const spy = spyOn(component.pageChange, 'emit');
        component.goTo(3);
        expect(spy).toHaveBeenCalledWith(3);
    });
});
