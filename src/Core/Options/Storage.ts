import {OptionsInterface} from "Core/Options/OptionsInterface";
import DefaultOptions from "Core/Options/DefaultOptions";
const OPTIONS_STORAGE_KEY = "options";

export default class Storage {

    static save(obj: OptionsInterface) {
        localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(obj));
    }

    static load(): OptionsInterface {
        let optionsStr = localStorage.getItem(OPTIONS_STORAGE_KEY);
        let options: OptionsInterface;

        try {
            options = optionsStr ? JSON.parse(optionsStr) : {};
        } catch (error) {
            options = ({} as OptionsInterface);
        }

        options.enable = options.enable || DefaultOptions.enable;
        options.usd_uah = options.usd_uah || DefaultOptions.usd_uah;
        options.percent = options.percent || DefaultOptions.percent;
        options.apiKey = options.apiKey || DefaultOptions.apiKey;
        options.apiSecret = options.apiSecret || DefaultOptions.apiSecret;

        return options;
    }
}