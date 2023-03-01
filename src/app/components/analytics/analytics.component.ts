import {Component, OnInit, SecurityContext, ViewChild} from '@angular/core';
import {MostActiveListService} from '../../../api/services/most-active-list.service';
import {MostActiveList} from '../../../api/models/most-active-list';
import {MostActivePolitician} from '../../../api/models/most-active-politician';
import {MostTradedStock} from '../../../api/models/most-traded-stock';
import {MostTradedStockSectorWise} from '../../../api/models/most-traded-stock-sector-wise';
import {SentimentsService} from '../../../api/services/sentiments.service';
import {Sentiments} from '../../../api/models/sentiments';
import {PoliticianTradesValue, PriceList, TradeSearchFilter} from '../../../api/models';
import {PriceService, SectorService} from '../../../api/services';
import {TradesService} from '../../../api/services/trades.service';
import * as Highcharts from 'highcharts';
import {NumberOfTradesTableComponent} from '../../shared/components/number-of-trades-table/number-of-trades-table.component';
import GetPoliticianTradeValuesBySectorParams = SectorService.GetPoliticianTradeValuesBySectorParams;
import {DomSanitizer} from '@angular/platform-browser';


interface PaginationConfig {
    id: string;
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
}

@Component({
    selector: 'app-analytics',
    templateUrl: './analytics.component.html',
    styleUrls: ['./analytics.component.css'],
})
export class AnalyticsComponent implements OnInit {
    chartValuesCount = 0;
    filteredMostActivePoliticiansWithRespectToBuy = [] as MostActivePolitician[];
    filteredMostActivePoliticiansWithRespectToSell = [] as MostActivePolitician[];
    mostActivePoliticianBuyMobileView = [] as MostActivePolitician[];
    mostActivePoliticianSaleMobileView = [] as MostActivePolitician[];
    filteredMostActiveStockWithRespectToBuy = [] as MostTradedStock[];
    filteredMostActiveStockWithRespectToSell = [] as MostTradedStock[];
    mostActiveStockBuyMobileView = [] as MostTradedStock[];
    mostActiveStockSaleMobileView = [] as MostTradedStock[];
    filteredMostActiveSectorWithRespectToBuy = [] as MostTradedStockSectorWise[];
    filteredMostActiveSectorWithRespectToSell = [] as MostTradedStockSectorWise[];
    mostActiveSectorBuyMobileView = [] as MostTradedStockSectorWise[];
    mostActiveSectorSaleMobileView = [] as MostTradedStockSectorWise[];
    mostActiveList = {} as MostActiveList;

    readonly DEFAULT_PAGE_SIZE = 16;
    configForBuy = {
        id: 'serverForBuy',
        currentPage: 1,
        itemsPerPage: this.DEFAULT_PAGE_SIZE,
        totalItems: 0
    } as PaginationConfig;
    configForSell = {
        id: 'serverForSell',
        currentPage: 1,
        itemsPerPage: this.DEFAULT_PAGE_SIZE,
        totalItems: 0
    } as PaginationConfig;
    tradeCountForBuy = 0;
    tradeCountForSell = 0;

    senatorsTradeInSelectedSectorChartDataForBuy: any;
    senatorsTradeInSelectedSectorChartDataForSell: any;
    loadingTable = false;
    loadingSP500Chart = false;

    displayModalForBuy: boolean;
    displayModalForSell: boolean;

    options: any;
    public tradeTypesColors: any[] = [
        {trade: 'Purchase', color: '#0ea600'},
        {trade: 'Sale', color: 'red'},
        {trade: 'Sale (Full)', color: 'red'},
        {trade: 'Sale (Partial)', color: 'red'},
        {trade: 'Exchange', color: 'orange'},
    ];
    selectedSectorForBuy: string;
    selectedSectorForSell: string;
    public selectedPoliticianTradeType: string;
    public selectedPoliticianParty: string;
    public politicianTradesBySector: PoliticianTradesValue[];
    public selectedStockTradeType: string;
    public selectedStockParty: string;
    public selectedSectorTradeType: string;
    public selectedSectorParty: string;

    public selectedPoliticianDays: number;
    public selectedStockDays: number;
    public selectedSectorDays: number;

    public politicianValueOfTradeSortType: string;
    public stockValueOfTradeSortType: string;
    public sectorValueOfTradeSortType: string;

    filteredPoliticianTradesBySectorForBuy: PoliticianTradesValue[];
    filteredPoliticianTradesBySectorForSell: PoliticianTradesValue[];
    // not of trades pop vars
    showTrades = false;
    tradeSearchFilters: TradeSearchFilter;

    @ViewChild(NumberOfTradesTableComponent)
    numberOfTradesTableComponent: NumberOfTradesTableComponent;

    // selectedCongressType = 'Senator';
    selectedTradeType = 'Purchase';
    selectedDaysFrom = 365;
    selectedParty = 'All';


    constructor(
        private mostActiveListService: MostActiveListService,
        private sentimentsService: SentimentsService,
        private priceService: PriceService,
        private _tradeService: TradesService,
        private sectorService: SectorService,
        private _sanitizer: DomSanitizer
    ) {
        // SelectItem API with label-value pairs
    }

    ngOnInit(): void {
        this.initVariables();
        this.getMostActiveListData();
        this.geSenatorsTradeSentimentData();
    }

    initVariables() {
        this.selectedPoliticianTradeType = 'Purchase';
        this.selectedStockTradeType = 'Purchase';
        this.selectedSectorTradeType = 'Purchase';
        this.selectedPoliticianParty = 'All';
        this.selectedStockParty = 'All';
        this.selectedSectorParty = 'All';

        this.selectedPoliticianDays = 365;
        this.selectedStockDays = 365;
        this.selectedSectorDays = 365;

        this.chartValuesCount = 0;

        this.politicianValueOfTradeSortType = 'ascending';
        this.stockValueOfTradeSortType = 'ascending';
        this.sectorValueOfTradeSortType = 'ascending';

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

    getMostActiveListData() {
        this.loadingTable = true;
        this.mostActiveListService.getMostActiveList().subscribe(
            (value: MostActiveList) => {
                this.mostActiveList = value;
            },
            (error) => {
                this.loadingTable = false;
                console.log(error);
            },
            () => {

                console.log('most', this.mostActiveList);
                // active politician
                this.mostActiveList.mostActivePolitician.forEach(t => {
                    t.politicianImage = this._sanitizer.sanitize(SecurityContext.RESOURCE_URL, this._sanitizer
                        .bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + t.politicianImage));
                });
                this.mostActivePoliticianBuyMobileView = this.mostActiveList.mostActivePolitician
                    .sort((a, b) => b.valueOfTrades - a.valueOfTrades)
                    .filter(t => t.tradeType === 'Purchase' && t.fromLastnDays === 365);
                this.mostActivePoliticianSaleMobileView = this.mostActiveList.mostActivePolitician
                    .sort((a, b) => b.valueOfTrades - a.valueOfTrades)
                    .filter(t => t.tradeType === 'Sale' && t.fromLastnDays === 365);
                // active stock
                this.mostActiveStockBuyMobileView = this.mostActiveList.mostTradedStock
                    .sort((a, b) => b.valueOfTrades - a.valueOfTrades)
                    .filter(t => t.tradeType === 'Purchase' && t.fromLastnDays === 365);
                this.mostActiveStockSaleMobileView = this.mostActiveList.mostTradedStock
                    .sort((a, b) => b.valueOfTrades - a.valueOfTrades)
                    .filter(t => t.tradeType === 'Sale' && t.fromLastnDays === 365);
                // active sector
                this.mostActiveSectorBuyMobileView = this.mostActiveList.mostTradedStockSectorWise
                    .sort((a, b) => b.valueOfTrades - a.valueOfTrades)
                    .filter(t => t.tradeType === 'Purchase' && t.fromLastnDays === 365);
                this.mostActiveSectorSaleMobileView = this.mostActiveList.mostTradedStockSectorWise
                    .sort((a, b) => b.valueOfTrades - a.valueOfTrades)
                    .filter(t => t.tradeType === 'Sale' && t.fromLastnDays === 365);
                this.filterMostActivePoliticiansWithRespectToBuy(
                    'Purchase',
                    this.selectedPoliticianDays,
                    this.selectedPoliticianParty
                );
                this.filterMostActivePoliticiansWithRespectToSell(
                    'Sale',
                    this.selectedPoliticianDays,
                    this.selectedPoliticianParty
                );
                this.filterMostActiveStockWithRespectToBuy(
                    'Purchase',
                    this.selectedStockDays,
                    this.selectedStockParty
                );
                this.filterMostActiveStockWithRespectToSell(
                    'Sale',
                    this.selectedStockDays,
                    this.selectedStockParty
                );


                this.filterMostActiveSectorsWithRespectToBuy(
                    'Purchase',
                    this.selectedSectorDays,
                    this.selectedSectorParty
                );

                this.filterMostActiveSectorsWithRespectToSell(
                    'Sale',
                    this.selectedSectorDays,
                    this.selectedSectorParty
                );
                this.loadingTable = false;
            }
        );
    }

    geSenatorsTradeSentimentData() {
        let res = [];
        let priceRes = [];
        this.loadingSP500Chart = true;
        this.priceService.getPriceForSnP500().subscribe(
            (response) => {
                priceRes = response;
            },
            (error) => {
                this.loadingSP500Chart = false;
                console.log(error);
            },
            () => {
                this.sentimentsService.getSentiments().subscribe(
                    (response) => {
                        res = response as Sentiments[];
                    },
                    (error) => console.log(error),
                    () => {
                        this.loadingSP500Chart = false;
                        this.drawSandPPriceSentimentChart(res, priceRes);
                    }
                );
            }
        );

    }

    // filterAnalyticsPage() {
    //     // console.log('filters', this.selectedTradeType + this.selectedDaysFrom + this.selectedParty);
    //     this.filterMostActivePoliticiansWithRespectToBuy(this.selectedTradeType, this.selectedDaysFrom, this.selectedParty);
    //     this.filterMostActiveStock(this.selectedTradeType, this.selectedDaysFrom, this.selectedParty);
    //     this.filterMostActiveSectors(this.selectedTradeType, this.selectedDaysFrom, this.selectedParty);
    // }

    filterMostActivePoliticiansWithRespectToBuy(tradeType: string, days: number, party: string) {
        // console.log('filterparams', tradeType + days + party);
        const selectedDays = days;
        // console.log('BeforeFilteredData', this.mostActiveList.mostActivePolitician);
        if (party === 'All') {
            this.filteredMostActivePoliticiansWithRespectToBuy = this.mostActiveList.mostActivePolitician
                .filter(t => t.tradeType === tradeType && t.fromLastnDays === Number(days))
                .sort((a, b) => b.valueOfTrades - a.valueOfTrades);
            // console.log('filteredData', this.filteredMostActivePolitician);
        } else {
            this.filteredMostActivePoliticiansWithRespectToBuy = this.mostActiveList.mostActivePolitician
                .filter(t => t.tradeType === tradeType && t.fromLastnDays === Number(days) && t.party === party)
                .sort((a, b) => b.valueOfTrades - a.valueOfTrades);
        }
    }

    filterMostActivePoliticiansWithRespectToSell(tradeType: string, days: number, party: string) {
        // console.log('filterparams', tradeType + days + party);
        const selectedDays = days;
        // console.log('BeforeFilteredData', this.mostActiveList.mostActivePolitician);
        if (party === 'All') {
            this.filteredMostActivePoliticiansWithRespectToSell = this.mostActiveList.mostActivePolitician
                .filter(t => t.tradeType === tradeType && t.fromLastnDays === Number(days))
                .sort((a, b) => b.valueOfTrades - a.valueOfTrades);
            // console.log('filteredData', this.filteredMostActivePolitician);
        } else {
            this.filteredMostActivePoliticiansWithRespectToSell = this.mostActiveList.mostActivePolitician
                .filter(t => t.tradeType === tradeType && t.fromLastnDays === Number(days) && t.party === party)
                .sort((a, b) => b.valueOfTrades - a.valueOfTrades);
        }
    }

    filterMostActiveStockWithRespectToBuy(tradeType: string, days: number, party: string) {
        this.filteredMostActiveStockWithRespectToBuy = this.mostActiveList.mostTradedStock
            .filter(t => t.tradeType === tradeType && t.fromLastnDays === Number(days) && t.party === party)
            .sort((a, b) => b.valueOfTrades - a.valueOfTrades);
    }

    filterMostActiveStockWithRespectToSell(tradeType: string, days: number, party: string) {
        this.filteredMostActiveStockWithRespectToSell = this.mostActiveList.mostTradedStock
            .filter(t => t.tradeType === tradeType && t.fromLastnDays === Number(days) && t.party === party)
            .sort((a, b) => b.valueOfTrades - a.valueOfTrades);
    }

    filterMostActiveSectorsWithRespectToBuy(tradeType: string, days: number, party: string) {
        this.filteredMostActiveSectorWithRespectToBuy = this.mostActiveList.mostTradedStockSectorWise
            .filter(t => t.tradeType === tradeType && t.fromLastnDays === Number(days) && t.party === party)
            .sort((a, b) => b.valueOfTrades - a.valueOfTrades);
        // console.log('sectorCheck', this.filteredMostActiveSector);
        this.filteredPoliticianTradesBySectorForBuy = null;
        if (this.filteredMostActiveSectorWithRespectToBuy.length > 0) {
            this.drawSenatorsTradeInSectorPieChartForBuy(
                this.filteredMostActiveSectorWithRespectToBuy[0].sectorName, tradeType, days, party
            );
        }
    }

    filterMostActiveSectorsWithRespectToSell(tradeType: string, days: number, party: string) {
        this.filteredMostActiveSectorWithRespectToSell = this.mostActiveList.mostTradedStockSectorWise
            .filter(t => t.tradeType === tradeType && t.fromLastnDays === Number(days) && t.party === party)
            .sort((a, b) => b.valueOfTrades - a.valueOfTrades);
        // console.log('sectorCheck', this.filteredMostActiveSector);
        this.filteredPoliticianTradesBySectorForSell = null;
        if (this.filteredMostActiveSectorWithRespectToSell.length > 0) {
            this.drawSenatorsTradeInSectorPieChartForSell(
                this.filteredMostActiveSectorWithRespectToSell[0].sectorName, tradeType, days, party
            );
        }
    }

    drawSenatorsTradeInSectorPieChartForBuy(sectorName: string, tradeType: string, days: number, party: string) {
        this.selectedSectorForBuy = sectorName;
        // console.log('filterForChart', this.selectedSector + tradeType + days + party);
        let series = null;
        const params: GetPoliticianTradeValuesBySectorParams = {
            sectorName: this.selectedSectorForBuy,
            party: party,
            committeeId: null,
        };
        this.sectorService.getPoliticianTradeValuesBySector(params).subscribe(
            (response) => {
                this.politicianTradesBySector = response;
                //  console.log('Response: ', this.politicianTradesBySector);

            },
            (error) => console.log(error),
            () => {
                console.log('testSeeMore', this.politicianTradesBySector);
                series = this.politicianTradesBySector.filter(
                    (p) =>
                        p.transactionType === 'Purchase' &&
                        p.days === Number(days)
                ).map((politician) => ({
                    name: politician.politicianName,
                    value: politician.values,
                })).sort((a: any, b: any) => {
                    return b.value - a.value;
                }).slice(0, 10);
                this.filteredPoliticianTradesBySectorForBuy = this.politicianTradesBySector.filter((trade: PoliticianTradesValue) =>
                    trade.transactionType === tradeType &&
                    trade.days === Number(days)
                ).sort((a: any, b: any) => {
                    return b.values - a.values;
                });


                this.tradeCountForBuy = this.filteredPoliticianTradesBySectorForBuy.length;

                /*this.config.currentPage = 1;
                this.config.totalItems = this.tradeCount;*/
                this.configForBuy = {
                    id: 'serverForBuy',
                    itemsPerPage: this.DEFAULT_PAGE_SIZE,
                    currentPage: 1,
                    totalItems: this.tradeCountForBuy
                };
                // this.config.totalItems = this.tradeCount;


                // console.log('this.tradeCount: ', this.tradeCount);
                // console.log('config: ', this.config);
                // console.log('filteredPoliticianTradesBySector: ', this.filteredPoliticianTradesBySector);
                if (series.length != null) {
                    this.drawSectorWisePoliticianTradesValueChartForBuy(series);
                }
            }
        );
    }

    drawSenatorsTradeInSectorPieChartForSell(sectorName: string, tradeType: string, days: number, party: string) {
        this.selectedSectorForSell = sectorName;
        // console.log('filterForChart', this.selectedSector + tradeType + days + party);
        let series = null;
        const params: GetPoliticianTradeValuesBySectorParams = {
            sectorName: this.selectedSectorForSell,
            party: party,
            committeeId: null,
        };
        this.sectorService.getPoliticianTradeValuesBySector(params).subscribe(
            (response) => {
                this.politicianTradesBySector = response;
                //  console.log('Response: ', this.politicianTradesBySector);

            },
            (error) => console.log(error),
            () => {
                series = this.politicianTradesBySector.filter(
                    (p) =>
                        p.transactionType === 'Sale' &&
                        p.days === Number(days)
                ).map((politician) => ({
                    name: politician.politicianName,
                    value: politician.values,
                })).sort((a: any, b: any) => {
                    return b.value - a.value;
                }).slice(0, 10);

                this.filteredPoliticianTradesBySectorForSell = this.politicianTradesBySector.filter((trade: PoliticianTradesValue) =>
                    trade.transactionType === tradeType &&
                    trade.days === Number(days)
                ).sort((a: any, b: any) => {
                    return b.values - a.values;
                });


                this.tradeCountForSell = this.filteredPoliticianTradesBySectorForSell.length;

                /*this.config.currentPage = 1;
                this.config.totalItems = this.tradeCount;*/
                this.configForSell = {
                    id: 'serverForSell',
                    itemsPerPage: this.DEFAULT_PAGE_SIZE,
                    currentPage: 1,
                    totalItems: this.tradeCountForSell
                };
                // this.config.totalItems = this.tradeCount;


                // console.log('this.tradeCount: ', this.tradeCount);
                // console.log('config: ', this.config);
                // console.log('filteredPoliticianTradesBySector: ', this.filteredPoliticianTradesBySector);
                if (series.length != null) {
                    this.drawSectorWisePoliticianTradesValueChartForSell(series);
                }
            }
        );
    }

    drawSectorWisePoliticianTradesValueChartForBuy(series: any) {
        this.senatorsTradeInSelectedSectorChartDataForBuy = {
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    return `<b>${params['name']} </b> </br>  $${params[
                        'value'
                        ].toLocaleString()} &nbsp;&nbsp; (${params['percent']}%)`;
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
                        fontSize: 12,
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

    drawSectorWisePoliticianTradesValueChartForSell(series: any) {
        this.senatorsTradeInSelectedSectorChartDataForSell = {
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    return `<b>${params['name']} </b> </br>  $${params[
                        'value'
                        ].toLocaleString()} &nbsp;&nbsp; (${params['percent']}%)`;
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
                        fontSize: 12,
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

    pageChangedForBuy(pageNumber: number) {
        // console.log('page number:', pageNumber);
        this.configForBuy.currentPage = pageNumber;
        // console.log('pageChanged() -> config', this.config)
    }

    pageChangedForSell(pageNumber: number) {
        // console.log('page number:', pageNumber);
        this.configForSell.currentPage = pageNumber;
        // console.log('pageChanged() -> config', this.config)
    }

    showMoreSectorsTradesDataInTableForBuy() {
        this.displayModalForBuy = true;
    }


    showMoreSectorsTradesDataInTableForSell() {
        this.displayModalForSell = true;
    }

    getTransactionTypeColor(transactionType: string): string {
        if (this.politicianTradesBySector.length > 0) {
            if (this.tradeTypesColors.filter(
                (item) => item.trade === transactionType
            ).length > 0) {
                return this.tradeTypesColors.filter(
                    (item) => item.trade === transactionType
                )[0].color;
            }
        }
        return '';
    }

    storeClickedPoliticianName(name: string) {
        localStorage.setItem('politicianName', name);
    }

    drawSandPPriceSentimentChart(sentiments: Sentiments[], sAndP500ChartData: PriceList[]) {
        /*const labelMap = {
            '0 - 1k': 1,
            '1k - 15k': 2,
            '15k - 50k': 3,
            '50k - 100k': 4,
            '100k - 250k': 5,
            '250k 500k': 6,
            '500K -1M': 7,
            '1M - 5M': 8,
            '5M - 25M': 9,
            '25M - 50M': 10
            //what's the correct api response for over 50 => 11
        };

// Similar as the above, but inversely. Used to show the labels of the y axis.
        const inverseLabelMap = {
            0: '',
            1: '0-1k',
            2: '1k-15k',
            3: '15k-50k',
            4: '50k-100k',
            5: '100k-250k',
            6: '250k-500k',
            7: '500k-1M',
            8: '1M-5M',
            9: '5M-25M',
            10: '25M-50M'
            //what's the correct api response for over 11-50
        };

        const clickedIssuer = [{issuerName: 'CHEVRON'}];
        this.chartValuesCount = sentiments.length + sAndP500ChartData.length;

        const SandPValues = sAndP500ChartData.map((element) => {
            return [
                Date.parse(element.date),
                element.price,
            ];
        });

        /!*
                const chartSellValues = sentiments
                    .filter((e) => e.transactionType === 'Sale')
                    .map(({lastDateOfTheWeek, range}) => ({
                        x: new Date(lastDateOfTheWeek).getTime(),
                        y: labelMap[range],
                        color: '#d74f68',
                    }));

                const chartBuyValues = sentiments
                    .filter((e) => e.transactionType === 'Purchase')
                    .map(({lastDateOfTheWeek, range}) => ({
                        x: new Date(lastDateOfTheWeek).getTime(),
                        y: labelMap[range],
                        color: '#478f47',
                    }));*!/


        const newMtsSellValues = sentiments
            .filter((e) => e.transactionType === 'Sale')
            .map(({lastDateOfTheWeek, range}) => ({
                x: new Date(lastDateOfTheWeek).getTime(),
                y: labelMap[range],
                color: '#d74f68',
            }));

// Creating the new mts buy values as per our requirements. The x is still the time in milliseconds, while the y is the above mentioned integer, between 0-11.
        const newMtsBuyValues = sentiments
            .filter((e) => e.transactionType === 'Purchase')
            .map(({lastDateOfTheWeek, range}) => ({
                x: new Date(lastDateOfTheWeek).getTime(),
                y: labelMap[range],
                color: '#478f47',
            }));


        let options: Highcharts.Options = {
            chart: {
                backgroundColor: '#fff',

            },

            yAxis: [
                // primary y axixs
                {
                    title: {
                        text: "Share Price",
                        style: {
                            color: '#478f47',
                            fontSize: '12px',
                        },
                    },
                    // labels: {
                    //  style: { color: 'red' },
                    // },
                    // top: '70%',
                    // height: '30%',
                    offset: 0
                },

                // secondary y axixs
                {
                    alternateGridColor: '#f0f0f0',
                    title: {
                        text: 'Trade Value',
                        style: {
                            color: '#23527c',
                        },
                    },
                    gridLineWidth: 0,
                    //Making sure the range labels are on the right hand side.
                    opposite: true,
                    labels: {
                        formatter: function () {
                            // Using the inverse map to transform the integers into range labels
                            return inverseLabelMap[this.value];
                        },
                        // This positioning moves the labels between the ticks as they represent a range rather than a value.
                        x: 5,
                        y: 20
                    },
                    //Specifying the tickinterval and length.
                    tickInterval: 1,
                    tickLength: 10,
                    //Manually specifying the ticks, from 0-10, as for all of them to be visible at the same time.
                    tickPositions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    // height: '70%',
                },
            ],
            xAxis: {
                type: 'datetime',
                labels: {
                    style: {
                        color: 'black',
                    },
                },
                zoomEnabled: false,
                startOnTick: false,
                endOnTick: false,
                minTickInterval: 28 * 24 * 3600 * 1000,
            },

            tooltip: {
                formatter: function (args) {
                    if (this.point.color === '#478f47') {
                        //Using the range for the tooltips as well.
                        return (
                            ' ' +
                            'Buy Amount:' +
                            ' ' +
                            inverseLabelMap[this.point.y] +
                            '' +
                            '<br />' +
                            'Date:' +
                            Highcharts.dateFormat('%Y-%m-%d', this.x)
                        );
                    } else if (this.point.color === '#d74f68') {
                        return (
                            ' ' +
                            'Sell Amount:' +
                            ' ' +
                            inverseLabelMap[this.point.y] +
                            '' +
                            '<br />' +
                            'Date:' +
                            Highcharts.dateFormat('%Y-%m-%d', this.x)
                        );
                    } else {
                        return (
                            ' ' +
                            'Share Price:' +
                            ' ' +
                            this.point.y +
                            '<br />' +
                            'Date:' +
                            Highcharts.dateFormat('%Y-%m-%d', this.x)
                        );
                    }
                },
            },
            legend: {
                useHTML: true,
            },
            credits: {
                enabled: false
            },
            series: [
                {
                    type: 'column',
                    id: 'aapl-volume',
                    // useHTML: true,
                    name:
                        '<span class="bar bar-red"></span> <span class="bar-margin"> </span> ' + ' Sell',
                    pointWidth: 10,
                    color: '#ffffff',
                    data: newMtsBuyValues,
                    yAxis: 1,
                    tooltip: {
                        valuePrefix: '$',
                    },
                },
                {
                    type: 'column',
                    id: 'aapl-volume',
                    // useHTML: true,
                    name:
                        '<span class="bar bar-green"></span> <span class="bar-margin"> </span>' + 'Buy ',
                    pointWidth: 10,
                    color: '#ffffff',
                    data: newMtsSellValues,
                    yAxis: 1,
                    tooltip: {
                        valuePrefix: '$',
                    },
                },
                {
                    type: 'line',
                    id: 'aapl-ohlc',
                    name: `${clickedIssuer[0].issuerName}`,
                    data: SandPValues,
                    color: '#23527c',
                    events: {
                        legendItemClick: function (e) {
                            e.preventDefault();
                        },
                    },
                    marker: {
                        enabled: false,
                    },
                    // tooltip: {
                    //     valuePrefix: '$',
                    // },
                },
            ],
            exporting: {
                enabled: false,
            },
            title: null,
            responsive: {
                rules: [
                    {
                        condition: {
                            maxWidth: 800,
                        },
                        chartOptions: {
                            rangeSelector: {
                                inputEnabled: false,
                            },
                        },
                    },
                ],
            },
        }
        Highcharts.chart("chart-container", options); */
        this.chartValuesCount = sentiments.length + sAndP500ChartData.length;
        const SandPValues = sAndP500ChartData.map((element) => {
            return [
                Date.parse(element.date),
                element.price,
            ];
        });
        const chartBuy = sentiments
            .filter(element => element.transactionType === 'Purchase')
            .map((element) => {
                return {
                    x: Date.parse(element.lastDateOfTheWeek),
                    y: element.amount,
                    color: '#478f47'
                };
            });
        const chartSell = sentiments
            .filter(element => element.transactionType === 'Sale')
            .map((element) => {
                return {
                    x: Date.parse(element.lastDateOfTheWeek),
                    y: element.amount,
                    color: '#d74f68'
                };
            });
        this.options = {
            chart: {
                zoomType: 'x',
                backgroundColor: '#fff'
            },
            credits: {
                enabled: false,
            },
            title: {
                text: ''
            },
            yAxis: [
                // primary y axixs
                {
                    title: {
                        text: 'S&P 500 Index',
                        style: {color: '#478f47'},
                    },
                    labels: {
                        style: {
                            color: 'red',
                        },
                    },
                    // top: '70%',
                    // height: '30%',
                    offset: 0,
                    opposite: true,
                },
                // secondary y axixs
                {
                    title: {
                        text: 'Buy & Sell',
                        style: {
                            color: '#23527c',
                        },
                    },
                    labels: {
                        style: {
                            color: '#23527c',
                        },
                    },
                    // height: '70%',
                },
            ],
            xAxis: {
                type: 'datetime',
                labels: {
                    style: {
                        color: 'black',
                    },
                },
                zoomEnabled: false,
                startOnTick: false,
                endOnTick: false,
                minTickInterval: 28 * 24 * 3600 * 1000
            },
            tooltip: {
                formatter: function (args) {
                    if (this.point.color === '#478f47') {
                        return ' ' +
                            'Buy Amount:' + ' ' + '$' + Highcharts.numberFormat(this.point.y, 0, '', ',') + '' + '<br />' +
                            'Date:' + Highcharts.dateFormat('%Y-%m-%d', this.x) + '<br/>';

                    } else if (this.point.color === '#d74f68') {
                        return ' ' +
                            'Sell Amount:' + ' ' + '$' + Highcharts.numberFormat(this.point.y, 0, '', ',') + '' + '<br />' +
                            'Date:' + Highcharts.dateFormat('%Y-%m-%d', this.x) + '<br/>';
                    } else {
                        return ' ' +
                            'Share Price:' + ' ' + this.point.y + '<br />' +
                            'Date:' + Highcharts.dateFormat('%Y-%m-%d', this.x);
                    }
                }
            },
            legend: {
                useHTML: true
            },
            series: [
                {
                    type: 'column',
                    id: 'aapl-volume',
                    useHTML: true,
                    name: '<span class="bar bar-red"></span> <span class="bar-margin"> </span> ' + ' Sell',
                    pointWidth: 10,
                    color: '#ffffff',
                    data: chartSell,
                    yAxis: 1,
                    tooltip: {
                        valuePrefix: '$',
                    },
                },
                {
                    type: 'column',
                    id: 'aapl-volume',
                    useHTML: true,
                    name: '<span class="bar bar-green"></span> <span class="bar-margin"> </span>' + 'Buy ',
                    pointWidth: 10,
                    color: '#ffffff',
                    data: chartBuy,
                    yAxis: 1,
                    tooltip: {
                        valuePrefix: '$',
                    },
                },
                {
                    type: 'line',
                    id: 'aapl-ohlc',
                    name: ` S&P 500`,
                    data: SandPValues,
                    color: '#23527c',
                    tooltip: {
                        valuePrefix: 'Price $',
                    },
                    events: {
                        legendItemClick: function (e) {
                            e.preventDefault();
                        }
                    }
                }
            ],
            exporting: {
                enabled: false
            },
            responsive: {
                rules: [
                    {
                        condition: {
                            maxWidth: 800,
                        },
                        chartOptions: {
                            rangeSelector: {
                                inputEnabled: false,
                            },
                        },
                    },
                ],
            },
        };
    }

    onCloseNumberOfTradesDialog() {
        this.showTrades = false;
    }

    sortTableDataWrtNumberOfTrades(table: string, tradeType: string) {
        if (table === 'politician' && tradeType === 'Buy') {
            this.filteredMostActivePoliticiansWithRespectToBuy.sort(
                (a, b) => b.numberOfTrades - a.numberOfTrades
            );
        } else if (table === 'politician' && tradeType === 'Sell') {
            this.filteredMostActivePoliticiansWithRespectToSell.sort(
                (a, b) => b.numberOfTrades - a.numberOfTrades
            );
        } else if (table === 'stock' && tradeType === 'Buy') {
            this.filteredMostActiveStockWithRespectToBuy.sort(
                (a, b) => b.numberOfTrades - a.numberOfTrades
            );
        } else if (table === 'stock' && tradeType === 'Sell') {
            this.filteredMostActiveStockWithRespectToSell.sort(
                (a, b) => b.numberOfTrades - a.numberOfTrades
            );
        } else if (table === 'sector' && tradeType === 'Buy') {
            this.filteredMostActiveSectorWithRespectToBuy.sort(
                (a, b) => b.numberOfTrades - a.numberOfTrades
            );
        } else if (table === 'sector' && tradeType === 'Sell') {
            this.filteredMostActiveSectorWithRespectToSell.sort(
                (a, b) => b.numberOfTrades - a.numberOfTrades
            );
        }
    }

    sortTableDataWrtIssuerAndPoliticianOfTrades(table: string, tradeType: string) {
        if (table === 'politician' && tradeType === 'Buy') {
            this.filteredMostActivePoliticiansWithRespectToBuy.sort(
                (a, b) => b.IssuerCount - a.IssuerCount
            );
        } else if (table === 'politician' && tradeType === 'Sell') {
            this.filteredMostActivePoliticiansWithRespectToSell.sort(
                (a, b) => b.IssuerCount - a.IssuerCount
            );
        } else if (table === 'stock' && tradeType === 'Buy') {
            this.filteredMostActiveStockWithRespectToBuy.sort(
                (a, b) => b.PoliticianCount - a.PoliticianCount
            );
        } else if (table === 'stock' && tradeType === 'Sell') {
            this.filteredMostActiveStockWithRespectToSell.sort(
                (a, b) => b.PoliticianCount - a.PoliticianCount
            );
        } else if (table === 'sector' && tradeType === 'Buy') {
            this.filteredMostActiveSectorWithRespectToBuy.sort(
                (a, b) => b.PoliticianCount - a.PoliticianCount
            );
        } else if (table === 'sector' && tradeType === 'Sell') {
            this.filteredMostActiveSectorWithRespectToSell.sort(
                (a, b) => b.PoliticianCount - a.PoliticianCount
            );
        }
    }

    sortTableDataWrtValueOfTrades(table: string, tradeType: string) {
        if (table === 'politician' && tradeType === 'Buy') {
            // this.politicianValueOfTradeSortType =
            //     this.politicianValueOfTradeSortType === 'ascending'
            //         ? 'descending'
            //         : this.politicianValueOfTradeSortType === 'descending'
            //         ? 'ascending'
            //         : 'ascending';

            // if (this.politicianValueOfTradeSortType === 'ascending') {
            this.filteredMostActivePoliticiansWithRespectToBuy.sort(
                (a, b) => b.valueOfTrades - a.valueOfTrades
            );
            // }
            // if (this.politicianValueOfTradeSortType === 'descending') {
            //     this.filteredMostActivePolitician.sort(
            //         (a, b) => a.valueOfTrades - b.valueOfTrades
            //     );
            // }
        } else if (table === 'politician' && tradeType === 'Sell') {
            this.filteredMostActivePoliticiansWithRespectToSell.sort(
                (a, b) => b.valueOfTrades - a.valueOfTrades
            );
        } else if (table === 'stock' && tradeType === 'Buy') {
            // this.stockValueOfTradeSortType =
            //     this.stockValueOfTradeSortType === 'ascending'
            //         ? 'descending'
            //         : this.stockValueOfTradeSortType === 'descending'
            //         ? 'ascending'
            //         : 'ascending';

            // if (this.stockValueOfTradeSortType === 'descending') {
            this.filteredMostActiveStockWithRespectToBuy.sort(
                (a, b) => b.valueOfTrades - a.valueOfTrades
            );
            // }
            //  if (this.stockValueOfTradeSortType === 'ascending') {
            //     this.filteredMostActiveStock.sort(
            //         (a, b) => b.valueOfTrades - a.valueOfTrades
            //     );
            // }
        } else if (table === 'stock' && tradeType === 'Sell') {
            this.filteredMostActiveStockWithRespectToSell.sort(
                (a, b) => b.valueOfTrades - a.valueOfTrades
            );
        } else if (table === 'sector' && tradeType === 'Buy') {
            // this.sectorValueOfTradeSortType =
            //     this.sectorValueOfTradeSortType === 'ascending'
            //         ? 'descending'
            //         : this.sectorValueOfTradeSortType === 'descending'
            //         ? 'ascending'
            //         : 'ascending';
            // if (this.sectorValueOfTradeSortType === 'ascending') {
            this.filteredMostActiveSectorWithRespectToBuy.sort(
                (a, b) => b.valueOfTrades - a.valueOfTrades
            );
            // }
            // if (this.sectorValueOfTradeSortType === 'descending') {
            //     this.filteredMostActiveSector.sort(
            //         (a, b) => a.valueOfTrades - b.valueOfTrades
            //     );
            // }
        } else if (table === 'sector' && tradeType === 'Sell') {
            this.filteredMostActiveSectorWithRespectToSell.sort(
                (a, b) => b.valueOfTrades - a.valueOfTrades
            );
        }
    }

    searchTradeByPolitician(politicianName: string, fromLastNDays: number, tradeType: string, party: string) {
        this.numberOfTradesTableComponent.loadTheTable(fromLastNDays, tradeType, politicianName, null, null, null, party);
    }

    searchTradeByStocks(stockName: string, fromLastNDays: number, tradeType: string, party: string) {
        this.numberOfTradesTableComponent.loadTheTable(fromLastNDays, tradeType, null, null, stockName, null, party);
    }

    searchTradeBySector(sectorName: string, fromLastNDays: number, tradeType: string, party: string) {
        this.numberOfTradesTableComponent.loadTheTable(fromLastNDays, tradeType, null, sectorName, null, null, party);
    }
}
