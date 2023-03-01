import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TypesList} from '../../../../api/models/types-list';
import {TypesService} from '../../../../api/services/types.service';
import {Issuer} from "../../../../api/models/issuer";
import {Biography} from "../../../../api/models/biography";

@Component({
    selector: 'app-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnInit {
    selectedPoliticianNames = [] as Array<Biography>;
    selectedIssuerNames = [] as Array<Issuer>;
    suggestedPoliticianNames = [] as Array<Biography>;
    suggestedIssuerNames = [] as Array<Issuer>;
    displayFilterDialog = false;
    displayFilterDialogForIssuer = false;
    displayFilterDialogForPolitician = false;
    typeList: TypesList;
    shareTypes = [] as string[];
    tradeTypes: string[];
    filtersValues: string;
    @Output() appliedFilters = new EventEmitter();
    @Output() appliedFilterForIssuer = new EventEmitter();
    @Output() appliedFilterForPolitician = new EventEmitter();
    @Input() senatorSuggestionsForIssuer = [];
    @Input() issuerSuggestionsForPolitician = [];

    constructor(private typeService: TypesService) {
    }

    ngOnInit(): void {
        this.getTypes();
    }

    clearFilters(type: string) {
        if (type === 'home') {
            this.selectedPoliticianNames = [] as Array<Biography>;
            this.selectedIssuerNames = [] as Array<Issuer>;
            this.appliedFilters.emit({senator: this.selectedPoliticianNames, issuer: this.selectedIssuerNames});
        }
        if (type === 'issuer') {
            this.selectedPoliticianNames = [] as Array<Biography>;
            this.appliedFilterForIssuer.emit({senator: this.selectedPoliticianNames});
        }
        if (type === 'politician') {
            this.selectedIssuerNames = [] as Array<Issuer>;
            this.appliedFilterForPolitician.emit({issuer: this.selectedIssuerNames});
        }
    }

    applyChanges(type: string) {
        if (type === 'home') {
            this.appliedFilters.emit({senator: this.selectedPoliticianNames, issuer: this.selectedIssuerNames});
            this.displayFilterDialog = false;
        }
        if (type === 'issuer') {
            this.appliedFilterForIssuer.emit({senator: this.selectedPoliticianNames});
            this.displayFilterDialogForIssuer = false;
        }
        if (type === 'politician') {
            this.appliedFilterForPolitician.emit({issuer: this.selectedIssuerNames});
            this.displayFilterDialogForPolitician = false;
        }
    }

    displayDialog(type: string) {
        if (type === 'home') {
            this.displayFilterDialog = true;
        }
        if (type === 'issuer') {
            this.displayFilterDialogForIssuer = true;
        }
        if (type === 'politician') {
            this.displayFilterDialogForPolitician = true;
        }
    }

    getTypes() {
        // console.log('val', this.ticker);
        this.typeService.getTypes(true).subscribe(
            (res: TypesList) => {
                this.typeList = res;
                this.suggestedPoliticianNames = res.biographies;
            },
            (err) => {
            },
            () => {
                this.tradeTypes = this.typeList.tradeTypes.map(t => t.replace('Sale', 'Sell')).map(t => t.replace('Purchase', 'Buy'));
                this.shareTypes = this.typeList.shareTypes;
                this.suggestedIssuerNames = this.typeList.issuers;
            }
        );
    }

}
