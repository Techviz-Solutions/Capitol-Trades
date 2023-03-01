import {MostTradedStockChart} from '../../../api/models/most-traded-stock-chart';
import {
    AfterViewChecked,
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewChild
} from '@angular/core';
import {SenatorsService} from '../../../api/services/senators.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {SenatorsBiography} from '../../../api/models/senators-biography';
import {Message, MessageService} from 'primeng';
import {MostTradedStock} from '../../../api/models/most-traded-stock';
import * as Highcharts from 'highcharts';
import {
    CommitteeService,
    IssuerService,
    MostTradedService,
    MostTradedStockChartService,
    StatsService,
    TradesService
} from 'src/api/services';
import {SenatorProfitableTrades} from 'src/api/models/senator-profitable-trades';
import {EChartOption} from 'echarts';
import {MostTradedStockSectorWise} from '../../../api/models/most-traded-stock-sector-wise';
import {TradeSearchFilter} from '../../../api/models/trade-search-filter';
import {NumberOfTradesTableComponent} from '../../shared/components/number-of-trades-table/number-of-trades-table.component';
import {SenatorTrade} from '../../../api/models/senator-trade';
import {Stats} from '../../../api/models/stats';
import {Committee} from '../../../api/models/committee';
import {Issuer} from '../../../api/models/issuer';
import {PriceSentimentData} from '../../../api/models/price-sentiment-data';
import GetPoliticianTradesParams = SenatorsService.GetPoliticianTradesParams;
import {FiltersComponent} from '../../shared/components/filters/filters.component';
import {DomSanitizer} from '@angular/platform-browser';

declare var require: any;
require('highcharts/modules/exporting')(Highcharts);


interface PaginationConfig {
    id: string;
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
}

@Component({
    selector: 'app-senator-info',
    templateUrl: './senator-info.component.html',
    styleUrls: ['./senator-info.component.css'],
    providers: [MessageService],
})
export class SenatorInfoComponent implements OnInit, AfterViewInit {
    public tradeTypesColors: any[] = [
        {trade: 'Purchase', color: '#0ea600'},
        {trade: 'Sale', color: 'red'},
        {trade: 'Sale (Full)', color: 'red'},
        {trade: 'Sale (Partial)', color: 'red'},
        {trade: 'Exchange', color: 'orange'},
    ];
    tradeCount = 0;
    isStatsNotExist = false;
    politicianImage;
    senatorBiography = {} as SenatorsBiography;
    mostTradedStocks = [] as MostTradedStock[];
    mostTradedBoughtStocks = [] as MostTradedStock[];
    mostTradedSoldStocks = [] as MostTradedStock[];
    mostProfitableBoughtTrades: SenatorProfitableTrades[];
    mostProfitableSoldTrades: SenatorProfitableTrades[];
    senatorTrades: SenatorTrade[] = [{}];
    politicianTradesData = [] as SenatorTrade[];
    public innerWidth: any;
    ticker: boolean;
    selectedIssuerName: string = null;
    public selectedStockDays: number;
    tradeSearchFilters: TradeSearchFilter;
    chartLoading = false;
    loadingBio = false;
    tradesTableLoading = false;
    loadingProfitablePurchases = false;
    loadingProfitableSells = false;
    DEFAULT_PAGE_SIZE;
    config: PaginationConfig;
    senatorDesc: string;
    senatorDescLess: string;
    isShowFullDesc: boolean;
    isShowReadMore = false;
    issuers = [];
    entriesTo: number;
    entriesFrom: number;
    // Top 10 sectors investment chart variables
    mtSectorsChartOptions: EChartOption;

    // last year activity variables

    // Most Traded Issuers timeline chart variables
    options: any;
    mtIssuersChartData: MostTradedStockChart;
    mtIssuers: Issuer[] = [];

    mtsData: MostTradedStockSectorWise[] = [];
    mtsFilteredData: MostTradedStockSectorWise[] = [];
    mtsSelectedTradeType: string;
    mtsSelectedDays: number;

    twitterHandler = null as string;

    @ViewChild(NumberOfTradesTableComponent)
    numberOfTradeTableComponent: NumberOfTradesTableComponent;
    loadedCount = 0;
    stats = {} as Stats;
    committees = [] as Committee[];
    selectedIssuer = null as Issuer;
    @ViewChild(FiltersComponent)
    filtersComponent: FiltersComponent;
    private priceData = [] as PriceSentimentData[];
    private sentimentData = [] as PriceSentimentData[];

    constructor(
        private senatorsService: SenatorsService,
        private mostTradedChartService: MostTradedStockChartService,
        private messageService: MessageService,
        private mostTradedService: MostTradedService,
        private _activatedRoute: ActivatedRoute,
        private statsService: StatsService,
        private committeeServie: CommitteeService,
        private _tradeService: TradesService,
        private _issuerService: IssuerService,
        private _router: Router,
        private _sanitizer: DomSanitizer
    ) {
        this.loadScript('https://platform.twitter.com/widgets.js');
    }

    ngOnInit(): void {
        this.senatorBiography.biographyId = this._activatedRoute.snapshot.params['biographyId'];
        this.innerWidth = window.innerWidth;
        this.ticker = this.innerWidth <= 768;
        if (this.ticker) {
            this.DEFAULT_PAGE_SIZE = 10;
            this.config = {
                id: 'server1',
                currentPage: 1,
                itemsPerPage: this.DEFAULT_PAGE_SIZE,
                totalItems: 0
            } as PaginationConfig;
        } else {
            this.DEFAULT_PAGE_SIZE = 20;
            this.config = {
                id: 'server1',
                currentPage: 1,
                itemsPerPage: this.DEFAULT_PAGE_SIZE,
                totalItems: 0
            } as PaginationConfig;
        }
        // console.log('tickerVal', this.ticker);
        this.initVariables();
        // this.getSenatorBiography();
        this.getStatsById();
    }

    ngAfterViewInit() {
        const biographyId = this.senatorBiography.biographyId;
        this.senatorsService.getSenatorBiographyById(
            biographyId
        ).subscribe(
            value => this.senatorBiography = value
            , error => {
                this.loadedCount++;
                // console.log(error);
                if (error.status === 500) {
                    this._router.navigate(['/404']);
                }
            }, () => {
                this.loadedCount++;
                this.twitterHandler = this.senatorBiography.twitterHandler?.replace('@', '');
                // console.log('Twitter Handle:', this.twitterHandler);
                this.loadScript('https://platform.twitter.com/widgets.js');
                this.politicianImage = this._sanitizer.
                bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + this.senatorBiography.politicianImage);

            });
        this.loadScript('https://platform.twitter.com/widgets.js');

    }

    public loadScript(url: string) {
        const body = <HTMLDivElement>document.body;
        const script = document.createElement('script');
        script.innerHTML = '';
        script.src = url;
        script.async = true;
        script.defer = true;
        body.appendChild(script);
    }

    initVariables() {
        this.selectedStockDays = 365;
        // this.mtsSelectedTradeType = 'Purchase';
        this.mtsSelectedDays = 365;
        this.isShowFullDesc = false;
        this.tradeSearchFilters = {
            pageNumber: 1,
            pageSize: this.DEFAULT_PAGE_SIZE,
            politicalName: null,
            issuerName: null,
            filingDateFrom: null,
            filingDateTo: null,
            shareTypes: ['Stock'],
            tradeType: null,
            transactionDateFrom: null,
            transactionDateTo: null
        };
        /* this.config = {
             itemsPerPage: 20,
             currentPage: 1,
             totalItems: this.tradeCount,
         };*/
    }

    getMostProfitableBoughtTrades(biographyId: number) {
        this.loadingProfitablePurchases = true;

        this.senatorsService.getPurchasedProfitableTrades(biographyId).subscribe(
            (res: SenatorProfitableTrades[]) => {
                this.mostProfitableBoughtTrades = res;
                // console.log(`mostProfitableTrades:`, res);
            },
            (error) => {
                this.loadedCount++;
                // this.drawMostTradedIssuersSentimentChart();
                this.loadingProfitablePurchases = false;

                if (error.status === 0) {
                    this.showMessage('Server is out of reach.', 'error', 'Error message');
                } else {
                    this.showMessage(error.message, 'error', 'Error message');
                }
            },
            () => {

                this.mostProfitableBoughtTrades.sort(
                    (a, b) => b.value_increase_percent - a.value_increase_percent
                );
                this.loadingProfitablePurchases = false;
            }
        );
    }

    getMostProfitableSoldTrades(biographyId: number) {
        this.loadingProfitableSells = true;

        this.senatorsService.getSoldProfitableTrades(biographyId).subscribe(
            (res: SenatorProfitableTrades[]) => {
                this.mostProfitableSoldTrades = res;
                // console.log(`mostProfitableTrades:`, res);
            },
            (error) => {
                // this.drawMostTradedIssuersSentimentChart();
                this.loadingProfitableSells = false;
                this.loadedCount++;

                if (error.status === 0) {
                    this.showMessage('Server is out of reach.', 'error', 'Error message');
                } else {
                    this.showMessage(error.message, 'error', 'Error message');
                }
            },
            () => {
                this.loadedCount++;
                this.loadingProfitableSells = false;
                this.mostProfitableSoldTrades.sort(
                    (a, b) => a.value_increase_percent - b.value_increase_percent
                );
            }
        );
    }

    getPoliticianTrades(pageNumber = 1) {
        this.tradesTableLoading = true;
        const params = {
            biographyId: this.senatorBiography.biographyId,
            isTicker: this.ticker,
            pageNumber: pageNumber,
            pageSize: this.DEFAULT_PAGE_SIZE,
            issuerName: this.selectedIssuerName
        } as GetPoliticianTradesParams;
        this.senatorsService.getPoliticianTrades(params).subscribe(
            (res: SenatorTrade[]) => {
                this.politicianTradesData = res;
            },
            (error) => {
                this.tradesTableLoading = false;
                this.loadedCount++;
                if (error.status === 0) {
                    this.showMessage('Server is out of reach.', 'error', 'Error message');
                } else {
                    this.showMessage(error.message, 'error', 'Error message');
                }
            },
            () => {
                this.loadedCount++;
                this.tradesTableLoading = false;
                this.senatorTrades = this.politicianTradesData;
                this.tradeCount = this.senatorTrades[0].totalTrades;
                this.config.totalItems = this.tradeCount;
                this.setPagination();
            }
        );
    }

    pageChanged(pageNumber: number) {
        this.config.currentPage = pageNumber;
        this.getPoliticianTrades(pageNumber);
    }

    setPagination() {
        this.config.totalItems = this.tradeCount;
        if (this.config.currentPage === 1 && this.tradeCount < 1) {
            this.entriesTo = 0;
            this.entriesFrom = 0;
            return;
        }
        this.entriesFrom = ((this.config.currentPage - 1) * this.DEFAULT_PAGE_SIZE) + 1;
        this.entriesTo = this.config.currentPage * this.DEFAULT_PAGE_SIZE;
        if (this.entriesTo > this.tradeCount) {
            this.entriesTo = this.tradeCount;
        }
    }

    isGvkeyAvailable(trade: SenatorTrade): boolean {
        return trade != null &&
            trade.gvkey != null &&
            trade.gvkey.length > 0 &&
            trade.gvkey !== '000000';
    }

    filteredTrades() {
        this.config.currentPage = 1;
        this.getPoliticianTrades(1);
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

    drawMostTradedSectorsChart() {
        /*console.log(
            'drawMostTradedSectorsChart'
        );*/

        const names = [];
        let series;
        this.mtsFilteredData.forEach((sector) => {
            const data = {
                name: sector.sectorName,
                value: sector.valueOfTrades,
            };
            names.push(sector.sectorName);
        });

        series = this.mtsFilteredData.map((sector) => ({
            name: sector.sectorName,
            value: sector.valueOfTrades

        }));

        // console.log('Series Data: ', series);

        this.mtSectorsChartOptions = {
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    return `<b>${params['name']} </b> </br>  ${'$' + params[
                        'value'
                        ].toLocaleString() + ' '} &nbsp;&nbsp; (${params['percent']}%)`;
                },
            },
            legend: {
                orient: 'vertical',
                left: '50%',
                top: 'middle',
                data: names,
            },
            series: [
                {
                    name: '',
                    type: 'pie',
                    radius: ['45%', '60%'],
                    center: ['25%', '50%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: false,
                        position: 'vertical',
                    },
                    labelLine: {
                        show: false,
                    },
                    data: series,
                },
            ],
        };
    }

    drawMostTradedIssuersSentimentChart(
        clickedIssuer,
        mtsBuyValues,
        mtsSellValues,
        mtsIssuerValues
    ) {
        this.options = {
            chart: {
                backgroundColor: '#fff',
                zoomType: 'x',
            },
            credits: {
                enabled: false,
            },
            title: {
                text: '',
                // style: {color: '#FFFFFF'},
            },
            yAxis: [
                // primary y axixs
                {
                    title: {
                        text: clickedIssuer[0].issuerName,
                        style: {
                            color: '#478f47',
                            fontSize: '12px'
                        }
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
                            'Buy Amount:' + ' ' + '$' + Highcharts.numberFormat(this.point.y, 0, '', ',')
                            + '' + '<br />' +
                            'Date:' + Highcharts.dateFormat('%Y-%m-%d', this.x);
                    } else if (this.point.color === '#d74f68') {
                        return ' ' +
                            'Sell Amount:' + ' ' + '$' + Highcharts.numberFormat(this.point.y, 0, '', ',')
                            + '' + '<br />' +
                            'Date:' + Highcharts.dateFormat('%Y-%m-%d', this.x);
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
                    data: mtsSellValues,
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
                    data: mtsBuyValues,
                    yAxis: 1,
                    tooltip: {
                        valuePrefix: '$',
                    },
                },
                {
                    type: 'line',
                    id: 'aapl-ohlc',
                    name: `${clickedIssuer[0].issuerName}`,
                    data: mtsIssuerValues,
                    color: '#23527c',
                    events: {
                        legendItemClick: function (e) {
                            e.preventDefault();
                        }
                    },
                    marker: {
                        enabled: false
                    }
                    // tooltip: {
                    //     valuePrefix: '$',
                    // },
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

    calculateMostTradedIssuerChartValues() {
        if (this.sentimentData.length < 1 || this.priceData.length < 1) {
            return;
        }
        this.mtIssuers = this.mtIssuers.filter(t => this.sentimentData.find(s => s.issuerName === t.name) != null);
        if (this.mtIssuers.find(t => t.gvkey === this.selectedIssuer.gvkey) == null) {
            this.selectedIssuer = this.mtIssuers[0];
        }
        const clickedIssuer = this.sentimentData
            .filter(t => t.issuerName === this.mtIssuers.find(a => a.gvkey === this.selectedIssuer.gvkey).name);
        const mtsBuyValues = clickedIssuer
            .filter((element) => {
                return element.amount !== null;
            })
            .filter(element => element.transactionType === 'Purchase')
            .map((element) => {
                // return element.sentimentValue;
                return {
                    x: Date.parse(element.priceDate),
                    y: element.amount,
                    color: '#478f47'
                };
            });

        const mtsSellValues = clickedIssuer
            .filter((element) => {
                return element.amount !== null;
            })
            .filter(element => element.transactionType === 'Sale')
            .map((element) => {
                // return element.sentimentValue;
                return {
                    x: Date.parse(element.priceDate),
                    y: element.amount,
                    color: '#d74f68'
                };
            });

        const mtsIssuerValues = this.priceData.reverse().map((element) => {
            return [
                Date.parse(element.priceDate),
                element.priceValue,
            ];
        });


        this.drawMostTradedIssuersSentimentChart(
            clickedIssuer,
            mtsBuyValues,
            mtsSellValues,
            mtsIssuerValues
        );
    }

    filterMostTradedSectors(tradeType: string, days: number) {
        this.mtsSelectedTradeType = tradeType;
        this.mtsSelectedDays = days;

        // console.log('==============filterMostTradedSectors=============');
        // console.log('this.selectedSectorTradeType', this.mtsSelectedTradeType);
        // console.log(' this.selectedSectorDays', this.mtsSelectedDays);

        this.mtsFilteredData = this.mtsData
            .filter(
                (p) =>
                    p.fromLastnDays === this.mtsSelectedDays &&
                    p.tradeType === this.mtsSelectedTradeType
            )
            .sort((a, b) => b.valueOfTrades - a.valueOfTrades);
        // console.log('this.mtsFilteredData', this.mtsFilteredData);

        this.drawMostTradedSectorsChart();


    }

    filterMostTradedStocks(days: number, tradeType: string) {
        if (tradeType === 'Purchase') {
            this.mostTradedBoughtStocks = this.mostTradedStocks.filter(
                (p) => p.fromLastnDays === days && p.tradeType === tradeType
            );
        }
        if (tradeType === 'Sale') {
            this.mostTradedSoldStocks = this.mostTradedStocks.filter(
                (p) => p.fromLastnDays === days && p.tradeType === tradeType
            );
        }
    }

    onChangeMostTradedStockDaysDropDown(days: number, tradeType: string) {
        if (days === null || tradeType === null) {
            return;
        }
        this.filterMostTradedStocks(+days, tradeType);
    }

    ShowFullDesc() {
        this.isShowFullDesc = true;
    }

    showLessDesc() {
        this.isShowFullDesc = false;
    }

    showLastOneYearTrades(politicianName: string, type?: string) {
        this.numberOfTradeTableComponent.loadTheTable(365, type, politicianName);
    }

    showStockTrades(fromLastnDays: number, tradeType: string, stockName: string) {
        this.numberOfTradeTableComponent.loadTheTable(fromLastnDays, tradeType, this.senatorBiography.senatorName
            , null,
            stockName);
    }

    sortStockBuyTradesByNumberOfTrades() {
        this.mostTradedBoughtStocks.sort(
            (a, b) => b.numberOfTrades - a.numberOfTrades
        );
    }

    sortStockBuyTradesByValueOfTrades() {
        this.mostTradedBoughtStocks.sort(
            (a, b) => b.valueOfTrades - a.valueOfTrades
        );
    }

    sortStockSoldByValueOfTrades() {
        this.mostTradedSoldStocks.sort(
            (a, b) => b.valueOfTrades - a.valueOfTrades
        );
    }

    sortStockSoldByNumberOfTrades() {
        this.mostTradedSoldStocks.sort(
            (a, b) => b.numberOfTrades - a.numberOfTrades
        );
    }

    getTransactionTypeColor(transactionType: string): string {
        if (this.senatorTrades.length > 0) {
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

    isEveryThingLoaded(): boolean {
        return this.loadedCount >= 9;
    }

    loadPriceChart() {
        if (this.selectedIssuer == null) {
            return;
        }
        this._issuerService.getIssuerPriceByGvkey(this.selectedIssuer.gvkey)
            .subscribe(
                t => this.priceData = t
                , error => {

                }, () => {
                    this.calculateMostTradedIssuerChartValues();
                });
    }

    chartShouldDisplay(): boolean {
        return this.priceData.length > 0 && this.sentimentData.length > 0;
    }

    private getStatsById() {
        const biographyId = this.senatorBiography.biographyId;
        this.getIssuerList(biographyId);
        this.getSentimentsChartData(biographyId);
        this.getMostProfitableBoughtTrades(biographyId);
        this.getMostProfitableSoldTrades(biographyId);
        this.getPoliticianTrades();

        this.senatorsService.getSenatorBiographyById(
            biographyId
        ).subscribe(
            value => this.senatorBiography = value
            , error => {
                this.loadedCount++;
                // console.log(error);
                if (error.status === 500) {
                    this._router.navigate(['/404']);
                }
            }, () => {
                this.loadedCount++;
                this.twitterHandler = this.senatorBiography.twitterHandler?.replace('@', '');
                this.loadScript('https://platform.twitter.com/widgets.js');
                console.log('image', this.senatorBiography);
                this.politicianImage = this._sanitizer.
                bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + this.senatorBiography.politicianImage);
                this.filterMostTradedStocks(this.selectedStockDays, 'Purchase');
                this.senatorDesc = this.senatorBiography.senatorDesc;
                this.senatorDescLess = this.senatorBiography.senatorDesc?.substr(
                    0,
                    400
                );

                if (this.senatorBiography.senatorDesc?.substr(
                    400,
                    500
                ).length > 0) {
                    this.isShowReadMore = true;
                }

                this.loadingBio = false;

            });

        this.mostTradedService.getMostTradedStock(
            biographyId
        ).subscribe(
            value =>
                this.mostTradedStocks = value,
            error => {
                this.loadedCount++;
            }, () => {
                this.loadedCount++;
                this.filterMostTradedStocks(this.selectedStockDays, 'Sale');
                this.filterMostTradedStocks(this.selectedStockDays, 'Purchase');
            }
        );
        this.mostTradedService.getMostTradedStockSectorWise(
            biographyId
        ).subscribe(
            value => this.mtsData = value
            , error => {
                this.loadedCount++;
            }, () => {
                this.loadedCount++;
                console.log('check', this.mtsData);
                // let checkTradeType = this.mtsData.some(t => t.tradeType === 'Purchase');
                if (this.mtsData.filter(t => t.tradeType === 'Purchase').length > 0) {
                    this.mtsSelectedTradeType = 'Purchase';
                } else {
                    this.mtsSelectedTradeType = 'Sale';
                }
                this.filterMostTradedSectors(this.mtsSelectedTradeType, this.mtsSelectedDays);
                this.drawMostTradedSectorsChart();
            });
        this.mostTradedService.getMostTradedBuyInSectors(
            biographyId
        ).subscribe(
            value => {
            },
            error => {
                this.loadedCount++;
            }, () => {
                this.loadedCount++;

            }
        );

        this.statsService.getStatsByBiographyId(biographyId)
            .subscribe(value => {
                    this.stats = value;
                }, error => {
                    this.isStatsNotExist = true;
                    this.loadedCount++;
                },
                () => {
                    this.loadedCount++;
                });

        this.committeeServie.getCommitteeByBiographyId(biographyId)
            .subscribe(value =>
                    this.committees = value,
                error => {

                }, () => {
                    this.loadedCount++;
                }
            );

    }

    private getIssuerList(biographyId: number) {
        let res = [] as Issuer[];
        this.senatorsService.getIssuersByBiographyId({
            biographyId: biographyId,
            isTicker: this.ticker
        }).subscribe(value => {
            res = value;
        }, error => {
            this.loadedCount++;
            if (error.status === 400) {
                this._router.navigate(['/404']);
            }
        }, () => {
            this.loadedCount++;
            if (res == null) {
                return;
            }
            res = res.filter(t => t.gvkey != null && t.gvkey !== '000000');
            if (res.length < 1) {
                return;
            }
            this.mtIssuers = res;
            this.selectedIssuer = this.mtIssuers[0];
            if (this.issuers.length < 1) {
                this.issuers = this.mtIssuers.map(t => t.name);
            }
            this.loadPriceChart();
        });
    }

    private getSentimentsChartData(biographyId: number) {
        let res = {} as MostTradedStockChart;
        this.mostTradedChartService.getMostActiveStockForChartBySenatorsFID(biographyId)
            .subscribe(value => {
                res = value;
            }, error => {

            }, () => {
                this.sentimentData = res.issuerPriceData;
                this.calculateMostTradedIssuerChartValues();
            });
    }

    showFiltersModel() {
        this.filtersComponent.displayDialog('politician');
    }

    getFiltersForMobile(valueEmitted: any): void {
        // console.log(valueEmitted);
        this.selectedIssuerName = valueEmitted.issuer;
        this.filteredTrades();
        // this.selectedSenatorName = valueEmitted.senator;
        // this.selectedIssuerName = valueEmitted.issuer;
        // this.searchTrades();
    }


}


export interface SectorData {
    name: string;
    value: number | string;
}

