import ExtensionPlatform from 'Core/Extension';
const browserAction = ExtensionPlatform.getExtension().browserAction;

export default class BadgeController {

    static updateBudgetColor(color: string) {
        browserAction.setBadgeBackgroundColor({
            color: '#11a0ff'
        });
    }

    static updateBudgetTexts(text: string) {
        browserAction.setTitle({
            title: text
        });
    }

    static changeImage(imageName: string) {
        browserAction.setIcon({
            path: '/images/' + imageName
        });
    }
}
