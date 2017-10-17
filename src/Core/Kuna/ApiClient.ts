let CryptoJS = require("crypto-js");

import Axios, {AxiosInstance, AxiosPromise, AxiosResponse, AxiosError} from 'axios';

export default class KunApiClient {

    private axiosClient: AxiosInstance;

    private apiKey: string;
    private apiSecret: string;

    private domain: string = 'https://kuna.io'; // 'https://staging.kuna.io'
    private basePath: string = '/api/v2';

    constructor() {
        this.axiosClient = Axios.create({
            baseURL: this.domain + this.basePath
        });
    }

    setApiCred(apiKey: string, apiSecret: string) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    private handleRequestError = (error: AxiosError) => {
        const {response = null} = error;

        throw error;
    };

    extractTicker(tickerKey: string) {

        const onSuccess = (response: AxiosResponse) => {
            return response.data.ticker;
        };
        return this.axiosClient
            .get(`/tickers/${tickerKey}`)
            .then(onSuccess, this.handleRequestError);
    }

    static orderObject(unordered: Object): Object {
        const ordered = {};
        Object.keys(unordered).sort().forEach(function (key) {
            ordered[key] = unordered[key];
        });

        return ordered;
    }


    static serializeObject(obj) {
        return Object.keys(obj)
            .reduce((a, k) => {
                a.push(k + '=' + encodeURIComponent(obj[k]));
                return a
            }, [])
            .join('&')
    }

    extractOrderBook(tickerKey: string) {

        const onSuccess = (response: AxiosResponse) => {
            return {
                asks: response.data.asks,
                bids: response.data.bids
            };
        };

        return this.axiosClient
            .get(`/order_book?market=${tickerKey}`)
            .then(onSuccess, this.handleRequestError);
    }

    private sendPrivateRequest(method: string, path: string, requestParams: any) {

        method = method.toUpperCase();

        if (!this.apiKey || !this.apiSecret) {
            throw Error('API Key and API Secret must be set');
        }

        let requestData: any = {
            access_key: this.apiKey,
            tonce: +(new Date())
        };

        requestData = Object.assign({}, requestData, requestParams);
        const signatureString = [
            method,
            this.basePath + path,
            KunApiClient.serializeObject(KunApiClient.orderObject(requestData))
        ].join('|');

        requestData.signature = CryptoJS.enc.Hex.stringify(
            CryptoJS.HmacSHA256(signatureString, this.apiSecret)
        );

        let axiosPromise: AxiosPromise = null;

        let reuqestUrl = path;

        switch (method) {
            case 'GET': {
                axiosPromise = this.axiosClient.get(reuqestUrl, {params: requestData});
                break;
            }

            case 'POST': {
                axiosPromise = this.axiosClient.post(
                    reuqestUrl, KunApiClient.serializeObject(requestData)
                );
                break;
            }
        }

        const onSuccess = (response: AxiosResponse) => {
            return response.data;
        };

        return axiosPromise.then(onSuccess, this.handleRequestError);
    }

    extractMyTrades(market: string) {
        return this.sendPrivateRequest('GET', '/trades/my', {market: market});
    }

    extractMe() {
        return this.sendPrivateRequest('GET', '/members/me', {});
    }

    createOrder(market: string, side: string, volume: number, price: number) {
        return this.sendPrivateRequest('POST', '/orders', {
            side: side,
            market: market,
            volume: volume,
            price: price
        });
    }
}