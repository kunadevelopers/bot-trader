import React from 'react';
import store from 'Popup/Store/index';
import {connect} from 'react-redux';
import * as _ from 'lodash';
import Numeral from 'numeral';

import Storage from 'Core/Options/Storage';

import {OptionsInterface} from 'Core/Options/OptionsInterface';

import ExtensionPlatform from 'Core/Extension';
import {Events} from 'Core/EventProtocol/Events';

const currentExtension = ExtensionPlatform.getExtension().extension;

interface HomeComponentStateInterface {
    options?: OptionsInterface
}

class HomeScreen extends React.Component<any, HomeComponentStateInterface> {
    componentWillMount() {
        this.setState({
            options: Storage.load()
        });
    }

    updateOptionsHandler() {
        const request = {event: Events.RELOAD_OPTIONS, newOptions: this.state.options};
        currentExtension.sendMessage(request);
    };

    onChangeOptionInput(event) {
        this.updateOptionValue(event.currentTarget.name, event.currentTarget.value);
    }

    onChangeCheckbox() {
        const {options} = this.state;

        this.updateOptionValue('enable', !options.enable);
    }

    updateOptionValue(name: string, value: any) {
        const {options} = this.state;

        options[name] = value;
        this.setState({options: options});
    }

    render() {
        return (
            <div>
                <div className="options-row">
                    <b>Enable:</b>
                    <input
                        type="checkbox"
                        checked={this.state.options.enable || false}
                        onChange={this.onChangeCheckbox.bind(this)}
                        name="enable"
                    />
                </div>
                <div className="options-row">
                    <b>USD / UAH:</b>
                    <input
                        type="text"
                        value={this.state.options.usd_uah || ''}
                        onChange={this.onChangeOptionInput.bind(this)}
                        name="usd_uah"
                    />
                </div>
                <div className="options-row">
                    <b>Percent:</b>
                    <input
                        type="text"
                        value={this.state.options.percent || ''}
                        onChange={this.onChangeOptionInput.bind(this)}
                        name="percent"
                    />
                </div>

                <div className="options-row">
                    <b>Api key:</b>
                    <input
                        type="text"
                        value={this.state.options.apiKey || ''}
                        onChange={this.onChangeOptionInput.bind(this)}
                        name="apiKey"
                    />
                </div>

                <div className="options-row">
                    <b>Api Secret:</b>
                    <input
                        type="text"
                        value={this.state.options.apiSecret || ''}
                        onChange={this.onChangeOptionInput.bind(this)}
                        name="apiSecret"
                    />
                </div>

                <button
                    className="options-save"
                    onClick={this.updateOptionsHandler.bind(this)}
                >Update
                </button>
            </div>
        );
    }
}

export default HomeScreen;