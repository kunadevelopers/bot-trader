import * as _ from 'lodash';
import {OptionsInterface} from "Core/Options/OptionsInterface";
import KunaApiClient from 'Core/Kuna/ApiClient';
import BitfinexApiClient from 'Core/Bitfinex/ApiClient';

const kunaApiClient = new KunaApiClient();
const bitfinexApiClient = new BitfinexApiClient();

export class RobotTicker {

    private options: OptionsInterface = null;
    private timeout: number = 10000;
    intervalHandler: any;

    currentOrderId: number = null;

    isFetching: boolean = false;

    constructor(options: OptionsInterface) {
        this.setOptions(options);
    }

    setOptions(options: OptionsInterface) {
        this.options = options;

        if (this.options.apiKey && this.options.apiSecret) {
            kunaApiClient.setApiCred(this.options.apiKey, this.options.apiSecret);
        }
    }

    private fetchEvent = () => {
        bitfinexApiClient
            .extractSymbol('btcusd')
            .then(this.calculatePriceFromBitfinex)
            .then(this.extractOrderBook)
            .then(this.extractUahAccount)
            .then((uahAccount) => {
                console.log(uahAccount);
            });
    };

    private calculatePriceFromBitfinex = (bitfinexTicker: any) => {
        let toPrice = (bitfinexTicker.last_price * (100 - this.options.percent) / 100) * this.options.usd_uah;
        toPrice = Math.floor(toPrice * 100) / 100;

        console.log(toPrice);

        return toPrice;
    };

    private extractOrderBook = (toPrice: number) => {
        return kunaApiClient
            .extractOrderBook('btcuah')
            .then((response: any) => {
                const {asks = []} = response;
                return _.filter(asks, (ask) => {
                    return (+ask.price) <= toPrice;
                });
            });
    };

    private extractUahAccount = () => {
        return kunaApiClient
            .extractMe()
            .then((me: any) => {
                return _.find(me.accounts, {currency: 'uah'})
            });
    };

    startFetching() {
        if (this.isFetching || !this.options.enable) {
            return;
        }

        this.isFetching = true;
        this.intervalHandler = setInterval(this.fetchEvent, this.timeout)
    }

    stopFetching() {
        if (!this.isFetching) {
            return;
        }

        this.isFetching = false;
        clearInterval(this.intervalHandler);
    }
}