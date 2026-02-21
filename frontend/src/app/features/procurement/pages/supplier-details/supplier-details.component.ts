import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface Supplier {
    id: string;
    name: string;
    contactNumber: string;
    url: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    postalCode: string;
    dateRegistered: string;
    status: 'Active' | 'Inactive';
}

// Shared mock data — in a real app this would come from a service
export const SUPPLIERS: Supplier[] = [
    {
        id: 'P3443', name: 'Super Neat technology (Pvt)Ltd.',
        contactNumber: '0114814646', url: '', email: 'sales4@superneat.lk',
        addressLine1: 'No 478', addressLine2: 'Kandy road',
        city: 'Kelaniya', postalCode: '12000', dateRegistered: '2023 Aug 13', status: 'Active'
    },
    {
        id: 'P1021', name: 'TechWave Solutions Inc.',
        contactNumber: '0112345678', url: 'www.techwave.lk', email: 'info@techwave.lk',
        addressLine1: 'No 22', addressLine2: 'Galle Road',
        city: 'Colombo', postalCode: '00300', dateRegistered: '2022 Mar 05', status: 'Active'
    },
    {
        id: 'P2234', name: 'Global Systems & Services',
        contactNumber: '0119876543', url: 'www.globalsys.lk', email: 'contact@globalsys.lk',
        addressLine1: 'No 56', addressLine2: 'Hospital Road',
        city: 'Kandy', postalCode: '20000', dateRegistered: '2021 Nov 20', status: 'Active'
    },
    {
        id: 'P3390', name: 'Apex Procurement Co.',
        contactNumber: '0117654321', url: '', email: 'apex@procurement.lk',
        addressLine1: 'No 10', addressLine2: 'Main Street',
        city: 'Galle', postalCode: '80000', dateRegistered: '2020 Jun 15', status: 'Inactive'
    },
    {
        id: 'P4401', name: 'NovaTech Industries Ltd.',
        contactNumber: '0115432109', url: 'www.novatech.lk', email: 'nova@novatech.lk',
        addressLine1: 'No 88', addressLine2: 'Industrial Zone',
        city: 'Ratmalana', postalCode: '10390', dateRegistered: '2023 Jan 10', status: 'Active'
    },
    {
        id: 'P5512', name: 'Bright Horizon Supplies',
        contactNumber: '0113219876', url: '', email: 'supplies@brighthorizon.lk',
        addressLine1: 'No 34', addressLine2: 'Lake Drive',
        city: 'Negombo', postalCode: '11500', dateRegistered: '2022 Sep 01', status: 'Active'
    },
    {
        id: 'P6623', name: 'Quantum Parts & Materials',
        contactNumber: '0118765432', url: 'www.quantumparts.lk', email: 'parts@quantum.lk',
        addressLine1: 'No 7', addressLine2: 'Fort Lane',
        city: 'Colombo', postalCode: '00100', dateRegistered: '2019 Dec 22', status: 'Active'
    },
    {
        id: 'P7734', name: 'SilverLine Equipment Co.',
        contactNumber: '0116543210', url: 'www.silverline.lk', email: 'equipment@silverline.lk',
        addressLine1: 'No 15', addressLine2: 'Temple Road',
        city: 'Kurunegala', postalCode: '60000', dateRegistered: '2021 Apr 18', status: 'Inactive'
    },
];

@Component({
    selector: 'app-supplier-details',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './supplier-details.component.html',
    styleUrls: ['./supplier-details.component.css']
})
export class SupplierDetailsComponent implements OnInit {
    supplier: Supplier | undefined;

    constructor(private route: ActivatedRoute, private router: Router) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        this.supplier = SUPPLIERS.find(s => s.id === id);
    }

    goBack() {
        this.router.navigate(['procurement', 'suppliers']);
    }
}
