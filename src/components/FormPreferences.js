/*global chrome*/
/*global browser*/

import React from 'react';
import {Form, Input, Button} from 'antd';

const API = browser || chrome;

class FormPreferences extends React.Component {
    state = {
        dirty: false,
        success: false,
        error: null,
        domain: '',
        integrationID: '',
        region: '',
    };

    componentDidMount() {
        const {domain, integrationID, region} = this.state;

        if (API !== window) {
            API.storage.sync.get(['domain','integrationID', 'region']).then((data) => {
                this.setState({
                    domain: data.hasOwnProperty('domain') ? data.domain : domain,
                    integrationID: data.hasOwnProperty('integrationID') ? data.integrationID : integrationID,
                    region: data.hasOwnProperty('region') ? data.region : region,
                });
            }).catch((error) => {
                console.error('componentDidMount', error);
            });
        }
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                try {
                    API.storage.sync.set(values).then(() => {
                        this.setState({success: true});
                        this.sendRefreshMessage();
                    }).catch((error) => {
                        this.setState({error});
                    });
                } catch (error) {
                    this.setState({error});
                }
            }
        });
    };

    refreshDelay = 500;
    sendRefreshMessage() {
        const {domain, integrationID, region} = this.state;
        API.tabs.query({url:  `*://*${domain}*/*`}).then((tabs) => {
            for (const tab of tabs) {
                setTimeout(() => {
                    API.tabs.sendMessage(tab.id, {refresh: true, tab: tab.id, integrationID, region});
                }, this.refreshDelay);
            }
        }).catch((error) => {
            console.error('react sendRefreshMessage', error);
        });
    }

    setDomain = (value) => {
        this.setState({domain: value});
        this.onChange();
    };

    onChange = () => {
        this.setState({
            dirty: true,
            success: false,
            error: null,
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { dirty, success, error, domain, integrationID, region } = this.state;

        const formItemLayout = {
            labelCol: {
                xs: { span: 12 },
                sm: { span: 12 },
            },
            wrapperCol: {
                xs: { span: 12 },
                sm: { span: 12 },
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 24,
                    offset: 0,
                },
            },
        };

        return (
            <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item label="Target Domain">
                    {getFieldDecorator('domain', {
                        initialValue: domain,
                        rules: [{
                            required: true,
                            message: 'Please input your target domain!',
                        }],
                    })(<Input onChange={this.setDomain} />)}
                </Form.Item>
                <Form.Item label="Integration ID">
                    {getFieldDecorator('integrationID', {
                        initialValue: integrationID,
                        rules: [{
                            required: true,
                            message: 'Please input your Watson Assistant integration id!',
                        }],
                    })(<Input onChange={this.onChange} />)}
                </Form.Item>
                <Form.Item label="Region">
                    {getFieldDecorator('region', {
                        initialValue: region,
                        rules: [{
                            required: true,
                            message: 'Please input your Watson Assistant region!',
                        }],
                    })(<Input onChange={this.onChange} />)}
                </Form.Item>
                <Form.Item {...tailFormItemLayout} className="center">
                    <Button disabled={!dirty} type="primary" htmlType="submit">Save</Button>
                </Form.Item>
                <div className="center">
                    {success ? <span className="bold green">Values successfully saved.</span> : null}
                    {error ? <span className="bold red">An error has occurred. {error.message}</span> : null}
                </div>
            </Form>
        );
    }
}

export default Form.create({ name: 'preferences' })(FormPreferences);