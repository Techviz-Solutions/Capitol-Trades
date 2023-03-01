import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {SenatorInfoComponent} from './components/senator-info/senator-info.component';
import {AnalyticsComponent} from './components/analytics/analytics.component';
import {IssuerInfoComponent} from './components/issuer-info/issuer-info.component';
import {CommitteeComponent} from './components/committee/committee.component';
import {NotFoundComponent} from './components/not-found/not-found.component';

const appRoutes: Routes = [
    // {path: 'login', component: LoginComponent},
    {path: '', redirectTo: 'trades', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'trades', component: HomeComponent},
    {path: 'analytics', component: AnalyticsComponent},
    {path: 'issuer-info/:c2iq', component: IssuerInfoComponent},
    {path: 'issuer-info', component: IssuerInfoComponent},
    {path: 'politician-info/:biographyId', component: SenatorInfoComponent},
    {path: 'committee/:id', component: CommitteeComponent},
    {path: '404', component: NotFoundComponent},
    {path: '**', redirectTo: '/404'},
];

export const routing = RouterModule.forRoot(appRoutes, { useHash: true, relativeLinkResolution: 'legacy' });
