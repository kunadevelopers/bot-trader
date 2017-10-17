import ExtensionPlatform from 'Core/Extension';
import {RobotTicker} from 'Background/RobotTicker';

import Storage from 'Core/Options/Storage';
import {Events} from 'Core/EventProtocol/Events';
import BadgeController from 'Background/BadgeController';


let options = Storage.load();
let robotTicker = new RobotTicker(options);

/**
 * @param request
 * @param sender
 * @param sendResponse
 */
const extensionEventListener = (request, sender, sendResponse) => {
    const {event = null} = request;

    if (!event) {
        return;
    }

    switch (event) {
        case Events.RELOAD_OPTIONS: {

            robotTicker.stopFetching();

            Storage.save(request.newOptions);
            options = Storage.load();

            robotTicker.setOptions(options);
            robotTicker.startFetching();

            console.log(options);

            sendResponse({success: true});
            break;
        }
    }
};

const initBackground = () => {
    ExtensionPlatform.getExtension().extension.onMessage.addListener(extensionEventListener);

    BadgeController.updateBudgetColor('#11a0ff');
    robotTicker.startFetching();
};

document.addEventListener('DOMContentLoaded', initBackground);