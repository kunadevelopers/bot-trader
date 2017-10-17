import Axios, {AxiosInstance, AxiosPromise, AxiosResponse, AxiosError} from 'axios';

export default class BitfinexApiClient {

    private axiosClient: AxiosInstance;

    constructor() {
        this.axiosClient = Axios.create({
            baseURL: 'https://api.bitfinex.com/v1'
        });
    }

    extractSymbol(symbol: string): AxiosPromise {

        const onSuccess = (response: AxiosResponse) => {
            return response.data;
        };

        const onError = (error: AxiosError) => {

            const {response = null} = error;

            console.error(error);
            console.error(response);
        };

        return this.axiosClient
            .get(`/pubticker/${symbol}`)
            .then(onSuccess, onError);
    }
}
