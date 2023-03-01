import {Component, OnInit, SecurityContext, ViewChild} from '@angular/core';
import {
    CommitteeDetails,
    MostActiveList,
    MostActivePolitician,
    MostTradedStock,
    MostTradedStockSectorWise,
    PoliticianTradesValue, SenatorTrade,
    TradeSearchFilter
} from '../../../api/models';
import {ActivatedRoute, Router} from '@angular/router';
import {SectorService} from '../../../api/services/sector.service';
import {CommitteeService, StockService, TradesService} from '../../../api/services';
import {NumberOfTradesTableComponent} from '../../shared/components/number-of-trades-table/number-of-trades-table.component';
import {DomSanitizer} from '@angular/platform-browser';


@Component({
    selector: 'app-committee',
    templateUrl: './committee.component.html',
    styleUrls: ['./committee.component.css']
})
export class CommitteeComponent implements OnInit {

    @ViewChild(NumberOfTradesTableComponent)
    numOfTradeTableComponent: NumberOfTradesTableComponent;

    loadingTable = false;
    pieChartForSector = true;
    pieChartForStock = true;
    selectedCongressType = '';
    public politicianTradesBySector: PoliticianTradesValue[];
    public politicianTradesByStock: PoliticianTradesValue[];
    filteredMostActivePoliticianForBuy = [] as MostActivePolitician[];
    filteredMostActivePoliticianForSell = [] as MostActivePolitician[];
    filteredMostActiveStockForBuy = [] as MostTradedStock[];
    filteredMostActiveStockForSell = [] as MostTradedStock[];
    filteredMostActiveSectorForBuy = [] as MostTradedStockSectorWise[];
    filteredMostActiveSectorForSell = [] as MostTradedStockSectorWise[];
    public selectedPoliticianTradeType: string;
    public selectedStockTradeType: string;
    public selectedSectorTradeType: string;

    public selectedPoliticianDays: number;
    public selectedStockDays: number;
    public selectedSectorDays: number;
    selectedSector: string;
    selectedStock: string;
    senatorsTradeInSelectedSectorChartData: any;
    senatorsTradeInSelectedStockChartData: any;

    tradeSearchFilters: TradeSearchFilter;
    committeeDetail = {} as CommitteeDetails;
    mostActiveList = {} as MostActiveList;
    private committeeId = null as number;
    isShowFullDesc: boolean;
    isShowReadMore = false;
    senatorDescLess: string;

    constructor(private sectorService: SectorService,
                private stockService: StockService,
                private tradesService: TradesService,
                private committeeService: CommitteeService,
                private _activatedRoute: ActivatedRoute,
                private _router: Router,
                private _sanitizer: DomSanitizer
    ) {
        this._activatedRoute.queryParams.subscribe((params) => {
            this.selectedCongressType = params['type'];
        });
    }

    ngOnInit(): void {
        this.committeeId = +this._activatedRoute.snapshot.params['id'];
        if (this.committeeId == null) {
            return;
        }
        this.initVariables();
        this.getCommitteeDetails(this.committeeId);
        this.getMostActiveList(this.committeeId);
    }

    initVariables() {
        this.selectedPoliticianTradeType = 'Purchase';
        this.selectedStockTradeType = 'Purchase';
        this.selectedSectorTradeType = 'Purchase';
        this.isShowFullDesc = false;
        this.selectedPoliticianDays = 365;
        this.selectedStockDays = 365;
        this.selectedSectorDays = 365;
        this.tradeSearchFilters = {
            pageNumber: 1,
            pageSize: 20,
            politicalName: null,
            issuerName: null,
            filingDateFrom: null,
            filingDateTo: null,
            shareTypes: ['Stock'],
            tradeType: null,
            transactionDateFrom: null,
            transactionDateTo: null
        };
    }

    getCommitteeDetails(committeeId: number) {
        this.loadingTable = true;
        let res = null as CommitteeDetails;
        if (committeeId == null) {
            return;
        }
        this.committeeService.getCommitteeDetails(committeeId).subscribe(
            (value: CommitteeDetails) => {
                res = value;
            },
            (error) => {
                this.loadingTable = false;
                console.log(error);
                if (error.status === 400) {
                    this._router.navigate(['/404']);
                }

            },
            () => {
                if (res == null) {
                    return;
                }
                this.committeeDetail = res;
                this.senatorDescLess = this.committeeDetail.description?.substr(
                    0,
                    800
                );
                if (this.committeeDetail.description?.substr(
                    800,
                    900
                ).length > 0) {
                    this.isShowReadMore = true;
                }
                this.loadingTable = false;
            }
        );
    }

    getMostActiveList(committeeId: number) {
        this.committeeService.getCommitteeMostActiveList(committeeId)
            .subscribe(value => this.mostActiveList = value, error => {

            }, () => {
                // console.log('committee', this.mostActiveList);
                this.mostActiveList.mostActivePolitician.forEach(t => {
                    t.politicianImage = this._sanitizer.sanitize(SecurityContext.RESOURCE_URL, this._sanitizer
                        .bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + t.politicianImage));
                });
                this.filterMostActivePoliticiansForBuy(
                    'Purchase',
                    this.selectedPoliticianDays
                );
                this.filterMostActivePoliticiansForSell(
                    'Sale',
                    this.selectedPoliticianDays
                );
                this.filterMostActiveStockForBuy(
                    'Purchase',
                    this.selectedStockDays
                );
                this.filterMostActiveStockForSell(
                    'Sale',
                    this.selectedStockDays
                );
                this.filterMostActiveSectorsForBuy(
                    'Purchase',
                    this.selectedSectorDays
                );
                this.filterMostActiveSectorsForSell(
                    'Sale',
                    this.selectedSectorDays
                );
            });
    }

    // filterCommitteePage(tradeType: string, days: number) {
    //     // console.log('filterForCommitteePage', tradeType + '' + days);
    //     this.filterMostActivePoliticians(tradeType, days);
    //     this.filterMostActiveStock(tradeType, days);
    //     this.filterMostActiveSectors(tradeType, days);
    // }

    filterMostActivePoliticiansForBuy(tradeType: string, days: number) {
        this.selectedPoliticianTradeType = tradeType;
        this.selectedPoliticianDays = days;
        this.filteredMostActivePoliticianForBuy = this.mostActiveList.mostActivePolitician
            .filter(
                (p) =>
                    p.fromLastnDays === this.selectedPoliticianDays &&
                    p.tradeType === this.selectedPoliticianTradeType
            )
            .sort((a, b) => b.valueOfTrades - a.valueOfTrades);
    }

    filterMostActivePoliticiansForSell(tradeType: string, days: number) {
        this.selectedPoliticianTradeType = tradeType;
        this.selectedPoliticianDays = days;
        this.filteredMostActivePoliticianForSell = this.mostActiveList.mostActivePolitician
            .filter(
                (p) =>
                    p.fromLastnDays === this.selectedPoliticianDays &&
                    p.tradeType === this.selectedPoliticianTradeType
            )
            .sort((a, b) => b.valueOfTrades - a.valueOfTrades);
    }

    filterMostActiveStockForBuy(tradeType: string, days: number) {
        this.selectedStockTradeType = tradeType;
        this.selectedStockDays = days;
        this.filteredMostActiveStockForBuy = this.mostActiveList.mostTradedStock
            .filter(
                (p) =>
                    p.fromLastnDays === this.selectedStockDays &&
                    p.tradeType === this.selectedStockTradeType
            )
            .sort((a, b) => b.valueOfTrades - a.valueOfTrades);
        if (this.filteredMostActiveStockForBuy.length > 0) {
            // console.log('activeSector', this.filteredMostActiveStock);
            this.pieChartForStock = true;
            this.drawSenatorsTradeInStockPieChart(
                this.filteredMostActiveStockForBuy[0].stockName
            );
        } else {
            // console.log('here');
            this.pieChartForStock = false;
        }
    }

    filterMostActiveStockForSell(tradeType: string, days: number) {
        this.selectedStockTradeType = tradeType;
        this.selectedStockDays = days;
        this.filteredMostActiveStockForSell = this.mostActiveList.mostTradedStock
            .filter(
                (p) =>
                    p.fromLastnDays === this.selectedStockDays &&
                    p.tradeType === this.selectedStockTradeType
            )
            .sort((a, b) => b.valueOfTrades - a.valueOfTrades);
        if (this.filteredMostActiveStockForSell.length > 0) {
            // console.log('activeSector', this.filteredMostActiveStock);
            this.pieChartForStock = true;
            this.drawSenatorsTradeInStockPieChart(
                this.filteredMostActiveStockForSell[0].stockName
            );
        } else {
            // console.log('here');
            this.pieChartForStock = false;
        }
    }

    filterMostActiveSectorsForBuy(tradeType: string, days: number) {
        this.selectedSectorTradeType = tradeType;
        this.selectedSectorDays = days;
        this.filteredMostActiveSectorForBuy = this.mostActiveList.mostTradedStockSectorWise
            .filter(
                (p) =>
                    p.fromLastnDays === this.selectedSectorDays &&
                    p.tradeType === this.selectedSectorTradeType
            )
            .sort((a, b) => b.valueOfTrades - a.valueOfTrades);
        if (this.filteredMostActiveSectorForBuy.length > 0) {
            // console.log('activeSector', this.filteredMostActiveSector);
            this.pieChartForSector = true;
            this.drawSenatorsTradeInSectorPieChart(
                this.filteredMostActiveSectorForBuy[0].sectorName
            );
        } else {
            // console.log('here');
            this.pieChartForSector = false;
        }
    }

    filterMostActiveSectorsForSell(tradeType: string, days: number) {
        this.selectedSectorTradeType = tradeType;
        this.selectedSectorDays = days;
        this.filteredMostActiveSectorForSell = this.mostActiveList.mostTradedStockSectorWise
            .filter(
                (p) =>
                    p.fromLastnDays === this.selectedSectorDays &&
                    p.tradeType === this.selectedSectorTradeType
            )
            .sort((a, b) => b.valueOfTrades - a.valueOfTrades);
        if (this.filteredMostActiveSectorForSell.length > 0) {
            // console.log('activeSector', this.filteredMostActiveSector);
            this.pieChartForSector = true;
            this.drawSenatorsTradeInSectorPieChart(
                this.filteredMostActiveSectorForSell[0].sectorName
            );
        } else {
            // console.log('here');
            this.pieChartForSector = false;
        }
    }

    drawSenatorsTradeInSectorPieChart(SelectedSectorName: string) {
        // console.log('params', SelectedSectorName + this.selectedSectorTradeType + this.selectedSectorDays);
        // console.log('sectorName: ', sectorName);
        this.selectedSector = SelectedSectorName;
        let series = null;
        this.sectorService.getPoliticianTradeValuesBySector({
            sectorName: this.selectedSector,
            committeeId: this.committeeId
        }).subscribe(
            (response) => {
                this.politicianTradesBySector = response;
                // console.log('res', this.politicianTradesBySector);
            },
            (error) => console.log(error),
            () => {
                series = this.politicianTradesBySector.filter(
                    (p) =>
                        p.transactionType === this.selectedSectorTradeType &&
                        p.days === this.selectedSectorDays
                ).map((politician) => ({
                    name: politician.politicianName,
                    value: politician.values,
                }));
                // console.log('series', series);
                if (series != null) {
                    this.drawSectorWisePoliticianTradesValueChart(series);
                }
            }
        );
    }

    drawSectorWisePoliticianTradesValueChart(series: any) {
        this.senatorsTradeInSelectedSectorChartData = {
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    return `<b>${params['name']} </b> </br>  $${params['value'].toLocaleString()}
                            * &nbsp;&nbsp; (${params['percent']}%) <br> * Trade value is average of reported range of values`;
                },
            },
            series: [
                {
                    type: 'pie',
                    radius: '60%',
                    center: ['50%', '50%'],
                    // bottom: '50px',
                    data: series,
                    label: {
                        position: 'outer',
                        // alignTo: 'labelLine',
                        // margin: 20,
                        fontSize: 9,
                        // distanceToLabelLine: 20
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)',
                        },
                    },
                },
            ],
        };
    }


    drawSenatorsTradeInStockPieChart(stockName: string) {
        // console.log('stockName: ', stockName);
        this.selectedStock = stockName;

        let series = null;
        this.stockService.getPoliticianTradeValuesByStock({
            stockName: this.selectedStock,
            committeeId: this.committeeId
        }).subscribe(
            (response) => {
                this.politicianTradesByStock = response;
                // console.log('res', this.politicianTradesByStock);
            },
            (error) => console.log(error),
            () => {
                series = this.politicianTradesByStock.filter(
                    (p) =>
                        p.transactionType === this.selectedStockTradeType &&
                        p.days === this.selectedStockDays
                ).map((politician) => ({
                    name: politician.politicianName,
                    value: politician.values,
                }));
                // console.log('poli', series);
                if (series != null) {
                    this.drawPoliticianTradeInStockPieChart(series);
                }
            }
        );
    }

    drawPoliticianTradeInStockPieChart(series: any) {
        this.senatorsTradeInSelectedStockChartData = {
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    return `<b>${params['name']} </b> </br>  $${params[
                        'value'
                        ].toLocaleString()} * &nbsp;&nbsp; (${params['percent']})%
                        <br> * Trade value is average of reported range of values`;
                },
            },
            series: [
                {
                    type: 'pie',
                    radius: '60%',
                    center: ['50%', '50%'],
                    // bottom: '50px',
                    data: series,
                    label: {
                        position: 'outer',
                        // alignTo: 'labelLine',
                        // margin: 20,
                        fontSize: 9,
                        // distanceToLabelLine: 20
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)',
                        },
                    },
                },
            ],
        };
    }

    showPoliticianTrade(numOfdays: number, tradeType: string, politicianName: string) {
        this.numOfTradeTableComponent.loadTheTable(numOfdays, tradeType, politicianName, null, null, this.committeeId);
    }

    showStockTrade(numOfdays: number, tradeType: string, stockName: string) {
        this.numOfTradeTableComponent.loadTheTable(numOfdays, tradeType, null, null, stockName, this.committeeId);
    }

    showSectorTrade(numOfdays: number, tradeType: string, sectorName: string) {
        this.numOfTradeTableComponent.loadTheTable(numOfdays, tradeType, null, sectorName, null, this.committeeId);
    }

    sortMostActiveSectorValueOfTrades(tradeType: string) {
        if (tradeType === 'Buy') {
            this.filteredMostActiveSectorForBuy.sort(
                (a, b) => b.valueOfTrades - a.valueOfTrades
            );
        } else {
            this.filteredMostActiveSectorForSell.sort(
                (a, b) => b.valueOfTrades - a.valueOfTrades
            );
        }
    }

    sortMostActiveSectorNumberOfTrades(tradeType: string) {
        if (tradeType === 'Buy') {
            this.filteredMostActiveSectorForBuy.sort(
                (a, b) => b.numberOfTrades - a.numberOfTrades
            );
        } else {
            this.filteredMostActiveSectorForSell.sort(
                (a, b) => b.numberOfTrades - a.numberOfTrades
            );
        }
    }

    sortMostActivePoliticianNumberOfTrades(tradeType: string) {
        if (tradeType === 'Buy') {
            this.filteredMostActivePoliticianForBuy.sort(
                (a, b) => b.numberOfTrades - a.numberOfTrades
            );
        } else {
            this.filteredMostActivePoliticianForSell.sort(
                (a, b) => b.numberOfTrades - a.numberOfTrades
            );
        }
    }

    sortMostActivePoliticianValueOfTrades(tradeType: string) {
        if (tradeType === 'Buy') {
            this.filteredMostActivePoliticianForBuy.sort(
                (a, b) => b.valueOfTrades - a.valueOfTrades
            );
        } else {
            this.filteredMostActivePoliticianForSell.sort(
                (a, b) => b.valueOfTrades - a.valueOfTrades
            );
        }
    }

    sortMostActiveStockNumberOfTrades(tradeType: string) {
        if (tradeType === 'Buy') {
            this.filteredMostActiveStockForBuy.sort(
                (a, b) => b.numberOfTrades - a.numberOfTrades
            );
        } else {
            this.filteredMostActiveStockForSell.sort(
                (a, b) => b.numberOfTrades - a.numberOfTrades
            );
        }
    }

    sortMostActiveStockValueOfTrades(tradeType: string) {
        if (tradeType === 'Buy') {
            this.filteredMostActiveStockForBuy.sort(
                (a, b) => b.valueOfTrades - a.valueOfTrades
            );
        } else {
            this.filteredMostActiveStockForSell.sort(
                (a, b) => b.valueOfTrades - a.valueOfTrades
            );
        }
    }

    storeClickedPoliticianName(name: string) {
        localStorage.setItem('politicianName', name);
    }

    isGvkeyAvailable(trade: SenatorTrade): boolean {
        return trade != null &&
            trade.gvkey != null &&
            trade.gvkey.length > 0 &&
            trade.gvkey !== '000000';
    }

    ShowFullDesc() {
        this.isShowFullDesc = true;
    }

    showLessDesc() {
        this.isShowFullDesc = false;
    }
}
