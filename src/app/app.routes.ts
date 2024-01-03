// Author: Preston Lee

import { Routes } from '@angular/router';
import { LaunchComponent } from './launch/launch.component';
import { PortalComponent } from './portal/portal.component';
import { SummaryComponent } from './summary/summary.component';
import { ConsentListComponent } from './consent-list/consent-list.component';
import { ConsentComponent } from './consent/consent.component';

export const routes: Routes = [
    {
        path: '',
        component: LaunchComponent
    },
    {
        path: 'portal/:patient_id',
        component: PortalComponent,
        children: [
            { path: 'summary', component: SummaryComponent },
            { path: 'consent-list', component: ConsentListComponent },
            { path: 'consent/:consent_id', component: ConsentComponent }

        ]
    }
]
