import { Routes } from '@angular/router';
import { OverviewComponent } from '../overview/overview';
import { MyAssetsComponent } from '../my-assets/my-assets';
import { DiscardedNotesComponent } from '../discarded-notes/discarded-notes';
import { BuyerComponent } from '../buyer/buyer';

export const superintendentRoutes: Routes = [
    { path: 'overview', component: OverviewComponent },
    { path: 'my-assets', component: MyAssetsComponent },
    { path: 'discarded-notes', component: DiscardedNotesComponent },
    { path: 'buyer', component: BuyerComponent },
    { path: '', redirectTo: 'overview', pathMatch: 'full' }
];
