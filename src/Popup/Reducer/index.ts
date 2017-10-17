import {combineReducers} from 'redux';

import {GlobalStateInterface} from 'Popup/Reducer/Interfaces/GlobalStateInterface';

import Global from './Global';

export interface PopupState {
    global: GlobalStateInterface;
}

export default combineReducers<PopupState>({
    global: Global
});