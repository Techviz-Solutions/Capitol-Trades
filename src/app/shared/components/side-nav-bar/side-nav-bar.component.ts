import {Component, OnInit} from '@angular/core';
import {environment} from '../../../../environments/environment';

@Component({
    selector: 'app-side-nav-bar',
    templateUrl: './side-nav-bar.component.html',
    styleUrls: ['./side-nav-bar.component.css']
})
export class SideNavBarComponent implements OnInit {

    isProdEvn = environment.production;

    constructor() {
    }

    ngOnInit(): void {
    }

}
