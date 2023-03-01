import {Component, OnInit, SecurityContext, ViewChild} from '@angular/core';
import * as Highcharts from 'highcharts';
import {PriceSentimentChart} from '../../../api/models/price-sentiment-chart';
import {PriceSentimentChartService} from '../../../api/services/price-sentiment-chart.service';
import {MessageService} from 'primeng';
import {ActivatedRoute, Router} from '@angular/router';
import {IssuerService} from '../../../api/services';
import {IssuerTrades} from '../../../api/models/issuer-trades';
import {IssuerInfo} from '../../../api/models/issuer-info';
import {SenatorTrade} from '../../../api/models/senator-trade';
import {PoliticianTradesValue} from '../../../api/models/politician-trades-value';
import {PartyTradesValue} from '../../../api/models/party-trades-value';
import {PriceSentimentData} from '../../../api/models/price-sentiment-data';
import {animate, state, style, transition, trigger} from '@angular/animations';
import GetIssuerTradesParams = IssuerService.GetIssuerTradesParams;
import {FiltersComponent} from '../../shared/components/filters/filters.component';
import {DomSanitizer} from '@angular/platform-browser';

declare var require: any;
require('highcharts/highcharts-more')(Highcharts);
require('highcharts/modules/solid-gauge')(Highcharts);
require('highcharts/modules/heatmap')(Highcharts);
require('highcharts/modules/treemap')(Highcharts);
require('highcharts/modules/funnel')(Highcharts);

interface PaginationConfig {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
}

@Component({
    selector: 'app-issuer-info',
    templateUrl: './issuer-info.component.html',
    styleUrls: ['./issuer-info.component.css'],
    providers: [MessageService],
    animations: [
        trigger('flipState', [
            state('active', style({
                transform: 'rotateY(179deg)'
            })),
            state('inactive', style({
                transform: 'rotateY(0)'
            })),
            transition('active => inactive', animate('500ms ease-out')),
            transition('inactive => active', animate('500ms ease-in'))
        ])
    ]
})
export class IssuerInfoComponent implements OnInit {
    issuerChartOptions = null;
    tradeType = 'Purchase';
    tradeTypeParty = 'Purchase';
    tradeType_values = [{name: 'Total Buy Values', value: 'Purchase'},
        {name: 'Total Sell Values', value: 'Sale'}];
    issuerPoliticianValuesChart = null;
    issuerPartiesValuesChart = null;
    priceSentimentChartData: PriceSentimentChart[];
    highcharts = Highcharts;
    senators = [];
    issuerName = null;
    selectedSenatorName: string = null;
    issuerTradesData: IssuerTrades;
    senatorTrades: SenatorTrade[] = [{}];
    issuerInfo: IssuerInfo = {};
    politicianTradesValue = [] as PoliticianTradesValue[];
    politicianBuyTradesValueForMobileView = [] as PoliticianTradesValue[];
    politicianSaleTradesValueForMobileView = [] as PoliticianTradesValue[];
    partyTradesValue = [] as PartyTradesValue[];
    selectedCongressType = '';
    config: PaginationConfig;
    Page_Size = 0;
    pageWidth;
    public innerWidth: any;
    c2iq = null;
    loadingPartiesChart = false;
    loadingPoliticiansChart = false;
    loadingBasicInfo = false;
    loadingSentimentChartData = false;
    loadingSenatorsTradesTable = false;
    loadingIssuerPage;
    @ViewChild(FiltersComponent)
    filtersComponent: FiltersComponent;

    // currentPage: number;
    previousPage: number;
    entriesTo: number;
    entriesFrom: number;


    public tradeTypesColors: any[] = [
        {trade: 'Purchase', color: '#0ea600'},
        {trade: 'Sale', color: 'red'},
        {trade: 'Sale (Full)', color: 'red'},
        {trade: 'Sale (Partial)', color: 'red'},
        {trade: 'Exchange', color: 'orange'},
    ];
    loadingComplete = false;
    flip = 'inactive';
    private issuerPriceData = [] as PriceSentimentData[];

    constructor(
        private _priceSentimentChart: PriceSentimentChartService,
        private _issuerService: IssuerService,
        private messageService: MessageService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _sanitizer: DomSanitizer
    ) {
        this._activatedRoute.queryParams.subscribe((params) => {
            this.selectedCongressType = params['type'];
        });
        this.c2iq = this._activatedRoute.snapshot.params['c2iq'];
        if (this.c2iq === undefined) {
            this.issuerName = this._activatedRoute.snapshot.queryParamMap.get('name');
        }
    }

    toggleFlip() {
        this.flip = (this.flip === 'inactive') ? 'active' : 'inactive';
    }

    ngOnInit(): void {
        this.innerWidth = window.innerWidth;
        this.pageWidth = this.innerWidth <= 768;
        if (this.pageWidth) {
            this.Page_Size = 10;
        } else {
            this.Page_Size = 20;
        }
        this.loadingComplete = false;
        this.getIssuerTrades();
        // this.getPriceAndSentimentChartData();
        this.initVariables();
        this.getIssuerPriceData();

    }

    initVariables() {
        // this.currentPage = 1;
        this.previousPage = 0;

    }

    getIssuerTrades() {
        this.loadingIssuerPage = true;
        this.loadingBasicInfo = true;
        this.loadingPartiesChart = true;
        this.loadingPoliticiansChart = true;
        this.loadingSenatorsTradesTable = true;
        this.loadingSentimentChartData = true;
        const issuerTradesParams = {
            c2iq: this.c2iq,
            isPublic: !this.isZeroGvkeyCompany()
        } as GetIssuerTradesParams;
        this._issuerService.getIssuerTrades(issuerTradesParams).subscribe(
            (res: IssuerTrades) => {
                this.issuerTradesData = res;
            },
            (error) => {
                // console.log(error);

                this.loadingBasicInfo = false;
                this.loadingPartiesChart = false;
                this.loadingPoliticiansChart = false;
                this.loadingSenatorsTradesTable = false;
            },
            () => {
                this.issuerName = this.issuerTradesData.issuer.issuerName;
                if (this.issuerName === null) {
                    this._router.navigate(['/404']);
                }

                this.loadingBasicInfo = false;
                this.loadingPartiesChart = false;
                this.loadingPoliticiansChart = false;
                this.loadingSenatorsTradesTable = false;

                this.senatorTrades = this.issuerTradesData.tradesList;
                this.senatorTrades.forEach(t => {
                    t.politicianImage = this._sanitizer.sanitize(SecurityContext.RESOURCE_URL, this._sanitizer
                        .bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + t.politicianImage));
                });
                // console.log('senatorTrades', this.issuerTradesData.tradesList);
                this.partyTradesValue = this.issuerTradesData.partiesValues.filter(t => t.transactionType === this.tradeTypeParty);
                // console.log('partyTrades', this.partyTradesValue);
                if (this.partyTradesValue.length === 0) {
                    this.tradeTypeParty = 'Sale';
                    this.partyTradesValue = this.issuerTradesData.partiesValues.filter(t => t.transactionType === this.tradeTypeParty);
                }

                this.politicianBuyTradesValueForMobileView = this.issuerTradesData.politicianValues
                    .filter(t => t.transactionType === 'Purchase');

                this.politicianSaleTradesValueForMobileView = this.issuerTradesData.politicianValues
                    .filter(t => t.transactionType === 'Sale');
                this.politicianTradesValue = this.issuerTradesData.politicianValues.filter(t => t.transactionType === this.tradeType);
                // console.log('polchart', this.politicianTradesValue);
                if (this.politicianTradesValue.length === 0) {
                    this.tradeType = 'Sale';
                    this.politicianTradesValue = this.issuerTradesData.politicianValues.filter(t => t.transactionType === this.tradeType);
                }
                this.issuerInfo = this.issuerTradesData.issuer;
                this.senators = this.issuerTradesData.senators;

                // console.log('politicianTradesValue', this.politicianTradesValue);

                // const index = this.partyTradesValue.findIndex(item => item.parties === 'Democratic');
                // if (index !== -1) {
                //     this.partyTradesValue[index] = {
                //         'parties': 'Democrats',
                //         'values': this.partyTradesValue[index].values || 0,
                //         'displayColor': this.partyTradesValue[index].displayColor
                //     };
                // }
                this.drawPoliticiansTradeChart(this.politicianTradesValue, this.tradeType);
                this.drawPartiesTradeChart(this.partyTradesValue);
                if (this.c2iq !== undefined && this.c2iq != null) {
                    this.getPriceAndSentimentChartData();
                }
                this.config = {
                    itemsPerPage: this.Page_Size,
                    currentPage: 1,
                    totalItems: this.senatorTrades.length,
                };
                this.setPagination();
                this.loadingComplete = true;
                this.loadingIssuerPage = false;
            }
        );
    }

    updatePieChartData(tradeType: string, chartName: string) {

        switch (chartName) {
            case 'politicians' :
                this.loadingPoliticiansChart = true;
                break;
            case 'parties' :
                this.loadingPartiesChart = true;
                break;

        }
        if (this.loadingPartiesChart) {
            this.partyTradesValue = this.issuerTradesData.partiesValues.filter(t => t.transactionType === tradeType);
            this.loadingPartiesChart = false;
            // console.log('change', this.partyTradesValue);
            this.drawPartiesTradeChart(this.partyTradesValue);

        }
        if (this.loadingPoliticiansChart) {
            this.politicianTradesValue = this.issuerTradesData.politicianValues.filter(t => t.transactionType === tradeType);
            this.loadingPoliticiansChart = false;
            // console.log('politicianTrades', this.politicianTradesValue);
            this.drawPoliticiansTradeChart(this.politicianTradesValue, tradeType);
        }
    }

    getPriceAndSentimentChartData() {
        this.loadingSentimentChartData = true;

        this._priceSentimentChart.getPriceSentimentChart(this.c2iq).subscribe(
            (res: PriceSentimentChart[]) => {
                this.priceSentimentChartData = res;
            },
            (error) => {
                this.loadingSentimentChartData = false;

            },
            () => {
                if (this.priceSentimentChartData.length < 1) {
                    this.priceSentimentChartData.push({
                        date: '2020-02-11',
                        sentiment: -25,
                        price: 105,
                    } as PriceSentimentChart);
                    this.priceSentimentChartData.push({
                        date: '2020-05-25',
                        sentiment: 50,
                        price: 85,
                    } as PriceSentimentChart);
                    this.priceSentimentChartData.push({
                        date: '2020-06-18',
                        sentiment: -25,
                        price: 125,
                    } as PriceSentimentChart);
                }
                this.loadingSentimentChartData = false;
                this.drawPriceAndSentimentChart(this.priceSentimentChartData, this.issuerPriceData);
            }
        );
    }

    drawPriceAndSentimentChart(priceSentimentChart: PriceSentimentChart[], issuerPriceData: PriceSentimentData[]) {
        if (priceSentimentChart?.length < 1 || issuerPriceData?.length < 1) {
            return;
        }
        issuerPriceData = issuerPriceData.sort((a, b) => new Date(a.priceDate).getTime() - new Date(b.priceDate).getTime());
        const SandPValues = issuerPriceData.map((element) => {
            return [
                Date.parse(element.priceDate),
                element.priceValue,
            ];
        });
        // const dataLength = priceSentimentChart.length;
        // let i = 0;
        // for (i; i < dataLength; i += 1) {
        //     ohlc.push([
        //         Date.UTC(
        //             new Date(priceSentimentChart[i]['date']).getFullYear(),
        //             new Date(priceSentimentChart[i]['date']).getMonth(),
        //             new Date(priceSentimentChart[i]['date']).getDate()
        //         ), // the date
        //         priceSentimentChart[i]['price'], // price
        //     ]);
        //
        //     volume.push([
        //         Date.UTC(
        //             new Date(priceSentimentChart[i]['date']).getFullYear(),
        //             new Date(priceSentimentChart[i]['date']).getMonth(),
        //             new Date(priceSentimentChart[i]['date']).getDate()
        //         ), // the date
        //         priceSentimentChart[i]['amount'],
        //         priceSentimentChart[i]['displayColor']// the Value
        //     ]);
        // }

        // console.log('barValuesSentiments', volume);
        let chartBuy;
        let chartSell;
        if (priceSentimentChart?.length > 0) {
            priceSentimentChart = priceSentimentChart.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            chartBuy = priceSentimentChart
                .filter(element => element.transactionType === 'Purchase')
                .map((element) => {
                    return {
                        x: Date.parse(element.date),
                        y: element.amount,
                        color: '#478f47'
                    };
                });
            chartSell = priceSentimentChart
                .filter(element => element.transactionType === 'Sale')
                .map((element) => {
                    return {
                        x: Date.parse(element.date),
                        y: element.amount,
                        color: '#d74f68'
                    };
                });
        }
        // const chartBuySell = volume.map(function (x) {
        //     return {
        //         x: x[0],
        //         y: x[1],
        //         color: x[2]
        //     };
        // });
        this.issuerChartOptions = {
            chart: {
                backgroundColor: '#fff',
                zoomType: 'x'
            },
            credits: {
                enabled: false,
            },
            title: {
                text: '',
                // style: { color: '#FFFFFF' },
            },
            yAxis: [
                {
                    title: {
                        text: 'Daily Share Price',
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
                {
                    title: {
                        text: 'Buy & Sell',
                        style: {color: '#23527c'},
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
                            'Date:' + Highcharts.dateFormat('%Y-%m-%d', this.x);
                    } else if (this.point.color === '#d74f68') {
                        return ' ' +
                            'Sell Amount:' + ' ' + '$' + Highcharts.numberFormat(this.point.y, 0, '', ',') + '' + '<br />' +
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
                    name: this.issuerInfo.issuerName,
                    data: SandPValues,
                    color: '#23527c',
                    tooltip: {
                        valuePrefix: 'Price $',
                    },
                    events: {
                        legendItemClick: function (e) {
                            e.preventDefault();
                        }
                    },
                    marker: {
                        enabled: false
                    }
                },
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

    drawPoliticiansTradeChart(politicianTradesValue: PoliticianTradesValue[], tradType: string) {
        let series;
        let color;
        series = politicianTradesValue.map((t) => ({
            name: t.politicianName,
            value: t.values,
        }));
        if (tradType === 'Purchase') {
            color = '#478f47';
        } else if (tradType === 'Sale') {
            color = '#d74f68';
        }
        const politicianNames = politicianTradesValue.map(a => a.politicianName);
        const politicianValues = politicianTradesValue.map(a => a.values);
        // console.log('series1', series);
        this.issuerPoliticianValuesChart = {
            chart: {
                backgroundColor: '#fff',
                zoomType: 'x'
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false,
            },
            title: {
                text: ''
            },
            xAxis: {
                categories: politicianNames,
                tickWidth: 0,
            },
            yAxis: {
                title: {
                    text: 'Trade Value'
                }
            },
            tooltip: {
                formatter: function (args) {
                    if (this.point.color === '#478f47') {
                        return ' ' +
                            'Buy Amount:' + ' ' + '$' + Highcharts.numberFormat(this.point.y, 0, '', ',') + '*' + '<br />' +
                            'Politician:' + this.x + '<br/>' +
                            '*trade value is average of reported range of values';
                    } else if (this.point.color === '#d74f68') {
                        return ' ' +
                            'Sell Amount:' + ' ' + '$' + Highcharts.numberFormat(this.point.y, 0, '', ',') + '*' + '<br />' +
                            'Politician::' + this.x + '<br/>' +
                            '*trade value is average of reported range of values';
                    }
                }
            },
            scrollbar: {
                enabled: true
            },
            plotOptions: {
                series: {
                    pointWidth: 20,
                    groupPadding: 0
                }
            },
            series: [{
                type: 'column',
                data: politicianValues,
                name: 'Politician',
                color: color
            }],
            exporting: {
                enabled: false
            },


            // tooltip: {
            //     trigger: 'item',
            //     formatter: function (params) {
            //         return `<b>${params['name']} </b> </br>  $${params[
            //             'value'
            //             ].toLocaleString()} &nbsp;&nbsp; (${params['percent']}%)`;
            //     },
            // },
            // series: [
            //     {
            //         type: 'pie',
            //         radius: '70%',
            //         center: ['50%', '65%'],
            //         bottom: '100px',
            //         data: series,
            //         label: {
            //             position: 'outer',
            //             // alignTo: 'labelLine',
            //             // margin: 20,
            //             fontSize: 9,
            //         },
            //         emphasis: {
            //             itemStyle: {
            //                 shadowBlur: 10,
            //                 shadowOffsetX: 0,
            //                 shadowColor: 'rgba(0, 0, 0, 0.5)',
            //             },
            //         },
            //     },
            // ],
        };
    }

    drawPartiesTradeChart(partyTradesValue: PartyTradesValue[]) {
        let series;
        // console.log('partyTradesValue:', this.partyTradesValue);
        // console.log('parties', partyTradesValue);
        series = partyTradesValue.map((t) => ({
            name: (t.parties === 'Independent' ? 'Others' : t.parties),
            value: t.values,
            itemStyle: {color: ((t.parties === 'Democrat') ? '#23527c' : (t.parties === 'Republican') ? '#d40017' : '#696969')}
        }));
        // console.log('series1', series);
        this.issuerPartiesValuesChart = {
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    return ` $${params['value'].toLocaleString()}* &nbsp;&nbsp; (${
                        params['percent']
                    }%)` + '<br/> *trade value is average of reported range of values';
                },
            },
            series: [
                {
                    type: 'pie',
                    radius: '70%',
                    center: ['50%', '65%'],
                    bottom: '100px',
                    data: series,
                    label: {
                        // position: 'outer',
                        // alignTo: 'labelLine',
                        fontSize: 9,
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

    storeClickedPoliticianName(name: string) {
        localStorage.setItem('politicianName', name);
    }

    pageChanged(pageNumber: number) {
        this.config.currentPage = pageNumber;
        this.setPagination();
    }

    filteredTrades() {
        if (this.selectedSenatorName != null && this.selectedSenatorName !== '') {
            this.senatorTrades = this.issuerTradesData.tradesList.filter(t => t.politicianName === this.selectedSenatorName);
        } else {
            this.senatorTrades = this.issuerTradesData.tradesList;
        }
        this.config.totalItems = this.senatorTrades.length;
        this.config.currentPage = 1;
        this.setPagination();
    }

    updatePieChart(tradeType: string, chartName: string) {
        // this.tradeType = tradeType;
        // console.log('checkedTrade', this.tradeType);
        // console.log('chartName', chartName);

        this.updatePieChartData(tradeType, chartName);
    }

    setPagination() {
        // console.log('SetPagination this.config: ', this.config);

        if (this.config.currentPage === 1 && this.senatorTrades.length < 1) {
            this.entriesTo = 0;
            this.entriesFrom = 0;
            return;
        }

        if (this.config.currentPage === 1 && this.senatorTrades.length < 20) {
            this.entriesFrom = 1;
            this.entriesTo = this.senatorTrades.length;
            return;
        }

        if (this.config.currentPage === 1) {

            this.entriesFrom = 1;

        } else {
            this.previousPage = this.config.currentPage - 1;
            // console.log('this.current page: ', this.currentPage);
            if (this.config.currentPage > (this.senatorTrades[0].totalTrades / 20)) {
                this.entriesFrom = 20 * this.previousPage;
                this.entriesTo = (this.previousPage * 20) + this.senatorTrades.length - (20 * this.previousPage);

                return;

            } else {
                this.entriesFrom = 20 * this.previousPage;
            }

        }
        this.entriesTo = this.config.currentPage * 20;

    }

    shouldDisplayIssuerChart(): boolean {
        return this.priceSentimentChartData?.length > 0 && this.issuerPriceData?.length > 0;
    }

    isZeroGvkeyCompany(): boolean {
        return this.c2iq.toString().startsWith('US-');
    }

    private getIssuerPriceData() {
        this._issuerService.getIssuerPriceByGvkey(this.c2iq)
            .subscribe(value => {
                this.issuerPriceData = value;
            }, error => {

            }, () => {
                this.drawPriceAndSentimentChart(this.priceSentimentChartData, this.issuerPriceData);
            });
    }

    showFiltersModel() {
        this.filtersComponent.displayDialog('issuer');
    }

    getFiltersForMobile(valueEmitted: any): void {
        console.log(valueEmitted);
        this.selectedSenatorName = valueEmitted.senator;
        this.filteredTrades();
    }
}
