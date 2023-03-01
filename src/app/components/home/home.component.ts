import {Component, Inject, OnInit, SecurityContext, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {TradesService} from '../../../api/services/trades.service';
import {APP_CONFIG} from '../../../constants/app-constants';
import {IAppConfig} from '../../../constants/app-constants.interface';
import {SenatorTrade} from '../../../api/models/senator-trade';
import {TradeSearchFilter} from '../../../api/models/trade-search-filter';
import {DatePipe} from '@angular/common';
import {TypesService} from '../../../api/services/types.service';
import {TypesList} from '../../../api/models/types-list';
import {Message, MessageService} from 'primeng';
import {IssuerService} from '../../../api/services/issuer.service';
import {CongressTypeEnum} from '../../../api/models/congress-type-enum';
import {Biography, Issuer, PoliticianPartyEnum} from '../../../api/models';
import {FormControl} from '@angular/forms';
import {FiltersComponent} from '../../shared/components/filters/filters.component';
import {DomSanitizer} from '@angular/platform-browser';
import {MatChipInputEvent} from '@angular/material/chips';

export interface Fruit {
    name: string;
}

interface City {
    name: string,
    code: string
}

@Component({
    selector: 'app-company',
    templateUrl: 'home.component.html',
    styleUrls: ['./home.component.css'],
    providers: [TradesService, MessageService],
})
export class HomeComponent implements OnInit {
    public innerWidth: any;
    ticker: boolean;
    toppings = new FormControl();
    toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
    senatorTrades: SenatorTrade[] = [{}];
    topFilters = {pageNumber: 1, pageSize: 20} as TradeSearchFilter;
    issuerSuggestions = [] as Array<Issuer>;
    typeList: TypesList;
    suggestedPoliticianNames = [] as Array<Biography>;
    politicianImage;
    // filter vars
    selectedPoliticianNames = [] as Array<Biography>;
    selectedIssuerNames = [] as Array<Issuer>;
    transactionDateFilter;
    filingDateFilter;
    publicationDateFilter;
    selectedShareType: string[];
    selectedTradeType: string[];
    tradeDateFrom: any = null;
    tradeDateTo: any = null;
    removable = true;
    selectable = true;
    // fillingDateFrom: any = null;
    // fillingDateTo: any = null;

    publicationDateFrom: any = null;
    publicationDateTo: any = null;

    shareTypes = [] as string[];
    tradeTypes: string[];

    loading = false;

    isFilterApplied: boolean;

    // pagination vars
    pageSize = 20;
    pageNumber = 1;
    totalTrades = 20;

    currentPage: number;
    previousPage: number;
    nextPage: number;
    entriesTo: number;
    entriesFrom: number;
    displayModal: boolean;
    cities: City[];
    selectedCities: City[];
    public TablePageConfig = {
        id: 'server',
        itemsPerPage: 20,
        currentPage: this.pageNumber,
        totalItems: this.totalTrades,
    };
    public tradeTypesColors: any[] = [
        {trade: 'Purchase', color: '#0ea600'},
        {trade: 'Sale', color: 'red'},
        {trade: 'Sale (Full)', color: 'red'},
        {trade: 'Sale (Partial)', color: 'red'},
        {trade: 'Exchange', color: '#D47F36'},
        {trade: 'Received', color: '#006EDF'}
    ];
    selectedCongressType = null as string;
    selectedPartyType = null as string;
    congressTypes = CongressTypeEnum.values().filter(t => t !== CongressTypeEnum.BOTH).map(t => t.toString());
    politicianParties = PoliticianPartyEnum.values().filter(t => t !== PoliticianPartyEnum.BOTH).map(t => t.toString());
    private readonly DATE_FORMAT = 'yyyy-MM-dd';

    @ViewChild(FiltersComponent)
    filtersComponent: FiltersComponent;

    fruits: Fruit[] = [
        {name: 'Politician'},
        {name: 'Stock'},
        {name: 'Issuer'},
    ];

    add(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        // Add our fruit
        if (value) {
            this.fruits.push({name: value});
        }

        // Clear the input value
    }

    remove(fruit: Fruit): void {
        const index = this.fruits.indexOf(fruit);

        if (index >= 0) {
            this.fruits.splice(index, 1);
        }
    }


    constructor(
        private _tradeService: TradesService,
        private typeService: TypesService,
        private datePipe: DatePipe,
        private issuerService: IssuerService,
        private messageService: MessageService,
        private _sanitizer: DomSanitizer,
        private _router: Router,
        @Inject(APP_CONFIG) private config: IAppConfig
    ) {
        this.cities = [
            {name: 'New York', code: 'NY'},
            {name: 'Rome', code: 'RM'},
            {name: 'London', code: 'LDN'},
            {name: 'Istanbul', code: 'IST'},
            {name: 'Paris', code: 'PRS'}
        ];
    }

    // ngAfterViewInit(): void {
    //     this.getFiltersForMobile();
    // }

    showModalDialog() {
        this.displayModal = true;
    }

    ngOnInit() {
        this.innerWidth = window.innerWidth;
        // console.log('WidthInit', this.innerWidth);
        this.ticker = this.innerWidth <= 768;
        // console.log(typeof this.ticker);
        // this.loadFromLocalStorage();
        this.initVariables();
        this.getTypes();
        this.getTrades(this.pageNumber);
    }

    showFiltersModel() {
        this.filtersComponent.displayDialog('home');
    }

    // @HostListener('window:resize', ['$event'])
    // onResize(event) {
    //     this.innerWidth = window.innerWidth;
    //      console.log('conChange', this.innerWidth);
    //     this.ticker = this.innerWidth <= 768;
    //     // this.loadFromLocalStorage();
    //     this.initVariables();
    //     this.getTypes();
    //     this.getTrades(this.pageNumber);
    // }

    // loadFromLocalStorage() {
    //     if (localStorage.getItem('selectedCongressType') == null && this.selectedCongressType != null) {
    //         localStorage.setItem('selectedCongressType', this.selectedCongressType);
    //     } else if (localStorage.getItem('selectedCongressType') != null) {
    //         this.selectedCongressType = localStorage.getItem('selectedCongressType');
    //     }
    //     if (localStorage.getItem('selectedPoliticianParty') == null && this.selectedPartyType != null) {
    //         localStorage.setItem('selectedPoliticianParty', this.selectedPartyType);
    //     } else if (localStorage.getItem('selectedPoliticianParty') != null) {
    //         this.selectedPartyType = localStorage.getItem('selectedPoliticianParty');
    //     }
    // }

    initVariables() {
        this.currentPage = 1;
        this.previousPage = 0;
        this.nextPage = this.currentPage + 1;
        this.isFilterApplied = false;
    }

    removedShareType() {
        this.topFilters.pageNumber = 1;
        this.setSearchFilters();
    }

    storeClickedPoliticianName(name: string) {
        localStorage.setItem('politicianName', name);
    }

    setSearchFilters() {
        // this.saveLocalStorage();

        this.topFilters.gvkeys = this.selectedIssuerNames.map(issuer => issuer.gvkey);
        this.topFilters.biographyIds = this.selectedPoliticianNames.map(politician => politician.id);
        this.topFilters.shareTypes = this.selectedShareType;
        this.topFilters.tradeType = (this.selectedTradeType !== undefined && this.selectedTradeType !== null) ? this.selectedTradeType.map(x =>
            x.replace('Sell', 'Sale').replace('Buy', 'Purchase')) : this.selectedTradeType;
        this.topFilters.transactionDateFrom = this.tradeDateFrom;
        this.topFilters.transactionDateTo = this.tradeDateTo;
        /*this.topFilters.filingDateFrom = this.fillingDateFrom;
        this.topFilters.filingDateTo = this.fillingDateTo;*/
        this.topFilters.publicationDateFrom = this.publicationDateFrom;
        this.topFilters.publicationDateTo = this.publicationDateTo;
        this.topFilters.congressType = this.selectedCongressType == null ? CongressTypeEnum.BOTH :
            CongressTypeEnum.values().find(t => t.toString() === this.selectedCongressType);
        this.topFilters.politicianParty = this.selectedPartyType == null ? PoliticianPartyEnum.BOTH : PoliticianPartyEnum.values().find(t => t.toString() === this.selectedPartyType);

        this.loadTheTrades(this.topFilters);
    }

    loadTheTrades(topFilters: TradeSearchFilter) {

        //  console.log('loading trades:')
        this.loading = true;
        this._tradeService.getSenatorTrades(topFilters).subscribe(
            (response: SenatorTrade[]) => {
                this.senatorTrades = response as SenatorTrade[];
                // console.log(this.senatorTrades)
            },
            (error) => {
                this.loading = false;
            },
            () => {
                this.loading = false;

                if (this.senatorTrades.length < 1) {
                    this.totalTrades = 0;
                    this.TablePageConfig.totalItems = 0;
                    return;
                }
                this.senatorTrades.forEach(t => {
                    t.politicianImage = this._sanitizer.sanitize(SecurityContext.RESOURCE_URL, this._sanitizer
                        .bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + t.politicianImage));
                });
                // console.log('check val', this.senatorTrades);
                // this.politicianImage = this._sanitizer.
                // bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + this.senatorTrades[1].politicianImage);
                this.totalTrades = this.senatorTrades[0].totalTrades;
                this.TablePageConfig.totalItems = this.senatorTrades[0].totalTrades;
                this.setPagination();
            }
        );
    }

    getTrades(page: number) {
        this.topFilters.ticker = this.ticker;
        this.topFilters.pageNumber = page;
        this.topFilters.pageSize = this.pageSize;
        this.TablePageConfig.currentPage = page;
        this.currentPage = page;
        this.setSearchFilters();

    }

    getFiltersForMobile(valueEmitted: any): void {
        // console.log(valueEmitted);
        this.selectedPoliticianNames = valueEmitted.senator;
        this.selectedIssuerNames = valueEmitted.issuer;
        this.searchTrades();
    }

    searchTrades() {
        const page = 1;
        this.topFilters.pageNumber = page;
        this.topFilters.pageSize = this.pageSize;
        this.TablePageConfig.currentPage = page;
        this.currentPage = page;

        // reset pagination vars
        this.currentPage = 1;
        this.entriesTo = 0;
        this.entriesFrom = 0;
        this.setSearchFilters();

    }

    getTypes() {
        // console.log('val', this.ticker);
        this.typeService.getTypes(this.ticker).subscribe(
            (res: TypesList) => {
                this.typeList = res;
                this.suggestedPoliticianNames = res.biographies;
            },
            (err) => {
            },
            () => {
                this.tradeTypes = this.typeList.tradeTypes.map(t => t.replace('Sale', 'Sell')).map(t => t.replace('Purchase', 'Buy'));
                this.shareTypes = this.typeList.shareTypes;
                this.issuerSuggestions = this.typeList.issuers;
            }
        );
    }

    /*searchIssuer(event: { term: string; items: any[] }) {
        const value = event.term;
        if (value == null || value.length < 1) {
            return;
        }
        if (
            this.issuerSuggestions.length > 0 &&
            value.length === 1 &&
            this.issuerSuggestions[0]
                .toLowerCase()
                .startsWith(value.charAt(0).toLowerCase())
        ) {
            return;
        }
        if (value.length > 1 && !value.endsWith(' ')) {
            return;
        }

        this.issuerService
            .getIssuerSuggestions(value)
            .subscribe((next: string[]) => {
                this.issuerSuggestions = next;
            });
    }*/

    onTransactionRangeSelection(e) {
        if (e.startDate != null && e.endDate != null) {
            this.tradeDateFrom = this.datePipe.transform(
                e.startDate._d,
                this.DATE_FORMAT
            );
            this.tradeDateTo = this.datePipe.transform(
                e.endDate._d,
                this.DATE_FORMAT
            );
            // this.searchTrades();
            // console.log(this.tradeDateFrom + ' ' + this.tradeDateTo);
        } else {
            this.tradeDateFrom = null;
            this.tradeDateTo = null;
            // console.log(this.tradeDateFrom + ' ' + this.tradeDateTo);
            // this.searchTrades();
        }
    }

    onPublicationRangeSelection(e) {
        if (e.startDate != null && e.endDate != null) {
            this.publicationDateFrom = this.datePipe.transform(
                e.startDate._d,
                this.DATE_FORMAT
            );
            this.publicationDateTo = this.datePipe.transform(
                e.endDate._d,
                this.DATE_FORMAT
            );
        } else {
            this.publicationDateFrom = null;
            this.publicationDateTo = null;
        }
    }

    /*onFillingRangeSelection(e) {
       // console.log({'ngModelChange()': e});
       if (e.startDate != null && e.endDate != null) {
           this.fillingDateFrom = this.datePipe.transform(
               e.startDate._d,
               this.DATE_FORMAT
           );
           this.fillingDateTo = this.datePipe.transform(
               e.endDate._d,
               this.DATE_FORMAT
           );
           this.searchTrades();
           // console.log(this.fillingDateFrom + ' ' + this.fillingDateTo);
       } else {
           this.fillingDateFrom = null;
           this.fillingDateTo = null;
           // console.log(this.fillingDateFrom + ' ' + this.fillingDateTo);
           this.searchTrades();
       }
   }*/

    /*onTransactionDateClear() {
        this.tradeDateTo = null;
        this.tradeDateFrom = null;
        this.searchTrades();
    }*/

    /* onFillingDateClear() {
         this.fillingDateFrom = null;
         this.fillingDateTo = null;
         this.searchTrades();
     }
 */


    /*getTransactionTypeColor(tradeType: string): string {
        if (this.senatorTrades.length > 0) {
            if (this.tradeTypesColors.filter((item) => item.trade === tradeType).length > 0) {
                return this.tradeTypesColors.filter((item) => item.trade === tradeType)[0]
                    .color;
            }
        }
        return '';
    }*/


    setPagination() {
        // console.log('this.currentPage: ', this.currentPage);

        if (this.currentPage === 1 && this.senatorTrades.length < 1) {
            this.entriesTo = 0;
            this.entriesFrom = 0;
            return;
        }

        if (this.currentPage === 1 && this.senatorTrades.length < 20) {
            this.entriesFrom = 1;
            this.entriesTo = this.senatorTrades.length;
            return;
        }

        if (this.currentPage === 1) {

            this.entriesFrom = 1;
            // console.log('this.entriesFrom in If', this.entriesFrom);

        } else {
            this.previousPage = this.currentPage - 1;
            // console.log('this.current page: ', this.currentPage);
            if (this.currentPage > (this.senatorTrades[0].totalTrades / 20)) {
                this.entriesFrom = 20 * this.previousPage;
                this.entriesTo = (this.previousPage * 20) + this.senatorTrades.length;


                /*  console.log('========this.currentPage === this.senatorTrades[0].totalTrades==========');
                  console.log('this.senatorTrades.length', this.senatorTrades.length);
                  console.log('this.entriesFrom ', this.entriesFrom);
                  console.log('this.entriesTo ', this.entriesTo);
                  console.log('==========================================================================');*/
                return;

            } else {

                this.entriesFrom = this.senatorTrades.length * this.previousPage;

                // console.log('this.senatorTrades.length', this.senatorTrades.length);
                // console.log('this.previousPage ', this.previousPage);
                // console.log('this.entriesFrom ', this.entriesFrom);
            }

        }

        this.entriesTo = this.currentPage * this.senatorTrades.length;

    }

    showMessage(detailMessage, severity, summary) {
        this.messageService.clear();
        const message = {
            severity: severity,
            summary: summary,
            detail: detailMessage,
        } as Message;
        this.messageService.add(message);
    }

    isGvkeyAvailable(trade: SenatorTrade): boolean {
        return trade != null &&
            trade.gvkey != null &&
            trade.gvkey.length > 0 &&
            trade.gvkey !== '000000';
    }

    isHideSpan(trade: SenatorTrade): boolean {
        let isHide = false;
        if (trade.tradeType === 'Sale (Partial)' ||
            trade.tradeType === 'Sale (Full)' ||
            (trade.comment !== null && trade.comment !== undefined && trade.comment.replace(/\s/g, '') !== '' && trade.comment !== '--')) {
            isHide = true;
        }
        return isHide;
    }

    // private saveLocalStorage() {
    //     if (this.selectedCongressType != null) {
    //         localStorage.setItem('selectedCongressType', this.selectedCongressType);
    //     } else {
    //         localStorage.removeItem('selectedCongressType');
    //     }
    //     if (this.selectedPartyType != null) {
    //         localStorage.setItem('selectedPoliticianParty', this.selectedPartyType);
    //     } else {
    //         localStorage.removeItem('selectedPoliticianParty');
    //     }
    // }
    applyChanges() {
        this.displayModal = false;
        this.searchTrades();
        this.isFilterApplied = true;
    }

    clearFilters() {
        this.selectedPoliticianNames = [] as Array<Biography>;
        this.selectedIssuerNames = [] as Array<Issuer>;
        this.selectedShareType = null;
        this.selectedTradeType = null;
        this.transactionDateFilter = null;
        this.filingDateFilter = null;
        this.publicationDateFilter = null;
        this.publicationDateFrom = null;
        this.publicationDateTo = null;
        this.tradeDateFrom = null;
        this.tradeDateTo = null;
        // this.fillingDateFrom = null;
        // this.fillingDateTo = null;
        this.selectedCongressType = null;
        this.selectedPartyType = null;
        if (this.isFilterApplied) {
            this.searchTrades();
        }

        this.isFilterApplied = false;

    }

    hide(el) {
        el.hide();
    }

    onCloseFilterDialog() {
        // console.log('on Hide filter dialog')
        if (!this.isFilterApplied) {
            this.clearFilters();
        }
    }


}
