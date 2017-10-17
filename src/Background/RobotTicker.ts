import * as _ from 'lodash';
import {OptionsInterface} from "Core/Options/OptionsInterface";
import KunaApiClient from 'Core/Kuna/ApiClient';
import BitfinexApiClient from 'Core/Bitfinex/ApiClient';
import {OrderInterface} from "Core/Kuna/Interfaces/OrderInterface";
import {AccountInterface} from "Core/Kuna/Interfaces/AccountInterface";

const kunaApiClient = new KunaApiClient();
const bitfinexApiClient = new BitfinexApiClient();

export class RobotTicker {

    private options: OptionsInterface = null;
    private timeout: number = 60000;
    intervalHandler: any;

    currentOrderId: number = null;

    isFetching: boolean = false;

    toPrice: number;

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
            .then(this.executeOrders);
    };

    private handleFetchingError = (error: Error) => {
        throw error
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


    private calculatePriceFromBitfinex = (bitfinexTicker: any) => {
        let toPrice = (bitfinexTicker.last_price * (100 - this.options.percent) / 100) * this.options.usd_uah;
        toPrice = Math.floor(toPrice * 100) / 100;

        this.toPrice = toPrice;
        console.log(toPrice);

        return toPrice;
    };


    private executeOrders = () => {
        const onSuccess = (data) => {

            const uahAccount: AccountInterface = data[0];
            const orderList: Array<OrderInterface> = data[1];

            console.log(orderList);

            if (orderList.length) {

                const order = orderList.shift();
                console.log(+uahAccount.balance);

                let needBalance = order.remaining_volume * order.price * 1.002;

                if (needBalance < uahAccount.balance) {
                    kunaApiClient
                        .createOrder('btcuah', 'buy', order.remaining_volume, order.price)
                        .then((res) => console.log(res.data))
                        .catch(this.handleFetchingError)
                }
            } else {
                if (uahAccount.balance < 1000) {
                    return;
                }

                let orderVolume = +((uahAccount.balance * 0.998) / this.toPrice).toFixed(4);
                let orderPrice = +this.toPrice.toFixed(2);

                kunaApiClient
                    .createOrder('btcuah', 'buy', orderVolume, orderPrice)
                    .then((res) => console.log(res.data))
                    .catch(this.handleFetchingError)
            }
        };

        const onError = (error) => {
        };

        Promise
            .all([
                this.extractUahAccount(),
                this.extractOrderBook()
            ])
            .then(onSuccess, onError);
    };

    private extractOrderBook = () => {
        return kunaApiClient
            .extractOrderBook('btcuah')
            .then((response: any) => {
                return _.filter(response.asks, (ask: any) => {
                    return (+ask.price) <= this.toPrice;
                })
            }, this.handleFetchingError);
    };

    private extractUahAccount = () => {
        return kunaApiClient
            .extractMe()
            .then((me: any) => {
                return _.find(me.accounts, {currency: 'uah'})
            }, this.handleFetchingError);
    };
}
