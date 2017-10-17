import store from 'Popup/Store/index';

import ExtensionPlatform from 'Core/Extension';

import {Events} from 'Core/EventProtocol/Events';

ExtensionPlatform.getExtension().extension.onMessage.addListener((request, sender, sendResponse) => {
    let {event = null, ...payload} = request;

    if (!event) {
        throw Error("Event! Must be set");
    }

    switch (event) {
        default: {
            throw Error(`Not supported Event ${payload}`);
        }
    }
});