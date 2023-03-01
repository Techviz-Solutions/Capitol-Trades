import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {SenatorTrade} from '../../../../api/models';
import {TradesService} from '../../../../api/services/trades.service';


@Component({
    selector: 'app-number-of-trades-table',
    templateUrl: './number-of-trades-table.component.html',
    styleUrls: ['./number-of-trades-table.component.css']
})
export class NumberOfTradesTableComponent implements OnInit {
    readonly DEFAULT_PAGE_SIZE = 16;
    config = {currentPage: 1, itemsPerPage: this.DEFAULT_PAGE_SIZE, totalItems: 0} as PaginationConfig;
    tradeCount = 0;
    displayModal = false;

    public tradeTypesColors: any[] = [
        {trade: 'Purchase', color: '#0ea600'},
        {trade: 'Sale', color: 'red'},
        {trade: 'Sale (Full)', color: 'red'},
        {trade: 'Sale (Partial)', color: 'red'},
        {trade: 'Exchange', color: '#D47F36'},
        {trade: 'Received', color: '#006EDF'}
    ];
    @Output()
    closeDialogEvent = new EventEmitter<boolean>();
    title = '';
    data = [] as SenatorTrade[];
    loading = false;
    headerToShow = null as string;

    constructor(private _tradeService: TradesService) {
    }

    loadTheTable(numberOfDays: number, tradeType: string,
                 politicianName ?: string, sectorName?: string,
                 stockName?: string, committeeId?: number, party?: string) {
        let res;
        this.loading = true;
        this._tradeService.getSenatorTradesForAnalytics({
            pageSize: 500,
            pageNumber: 1,
            tradeType: tradeType,
            politicianName: politicianName,
            stockName: stockName,
            committeeId: committeeId,
            sector: sectorName,
            numberOfDays: numberOfDays,
            party: party
        }).subscribe(
            value => {
                res = value;
            }, error => {
                this.loading = false;
            },
            () => {
                this.loading = false;
                if (res.length < 1) {
                    return;
                }
                this.data = res;
                this.tradeCount = this.data[0].totalTrades;
                this.config = {
                    itemsPerPage: this.DEFAULT_PAGE_SIZE,
                    currentPage: 1,
                    totalItems: this.tradeCount
                };

                let title = 'Trades';
                if (politicianName != null) {
                    title = `${politicianName}`;
                    this.headerToShow = 'stock';
                } else if (stockName != null) {
                    title = `${stockName}`;
                    this.headerToShow = 'person';
                } else if (sectorName != null) {
                    this.headerToShow = 'both';
                    title = `${sectorName}`;
                }
                this.title = title;
                this.displayModal = true;
            }
        );
    }

    getHeaders(): string[] {
        if (this.headerToShow == null || this.headerToShow === 'both') {
            return [
                'Publication Date',
                'Politician Name',
                // 'Owner',
                'Issuer/Asset',
                'Transaction Date',
                'Transaction',
                // 'Asset Class',
                'Shares',
                'Share Price',
                'Value',
                'URL'];
        }
        if (this.headerToShow === 'stock') {
            return [
                'Publication Date',
                // 'Filing Date',
                // 'Owner',
                'Issuer/Asset',
                'Transaction Date',
                'Transaction ',
                'Shares',
                'Share Price',
                'Value',
                'URL'];
        }
        return [
            'Publication Date',
            // 'Filing Date',
            'Politician Name',
            // 'Owner',
            'Transaction Date',
            'Transaction',
            'Shares',
            'Share Price',
            'Value',
            'URL'];
    }


    getTransactionTypeColor(tradeType: string): string {
        if (this.data.length > 0) {
            if (this.tradeTypesColors.filter((item) => item.trade === tradeType).length > 0) {
                return this.tradeTypesColors.filter((item) => item.trade === tradeType)[0]
                    .color;
            }
        }
        return '';
    }

    showHeader(): string {
        if (this.headerToShow == null) {
            return 'both';
        }
        return this.headerToShow;
    }

    ngOnInit(): void {

    }

    OnCloseDialog() {
        this.closeDialogEvent.emit(true);

    }

    pageChanged(pageNumber: number) {
        this.config.currentPage = pageNumber;
    }
}

interface PaginationConfig {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
}
