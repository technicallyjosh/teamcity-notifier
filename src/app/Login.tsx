import { ipcRenderer as ipc } from 'electron';
import * as React from 'react';
import { render } from 'react-dom';
import { Grid, Header, Form, Segment, Image, Input, Button } from 'semantic-ui-react';

class Login extends React.Component {
    componentDidMount() {
        ipc.on('app-settings', this.handleAppSettings);
        ipc.on('authenticate-error', this.handleAuthError);
    }

    componentWillUnmount() {
        ipc.removeListener('authenticate-error', this.handleAuthError);
        ipc.removeListener('app-settings', this.handleAppSettings);
    }

    state = {
        url: '',
        username: '',
        password: '',
        isLoading: false,
        error: ''
    };

    handleAppSettings = (_e: Electron.IpcMessageEvent, settings: any) => {
        this.setState({
            url: settings.url || '',
            username: settings.username || ''
        });
    };

    handleAuthError = (_e: Electron.IpcMessageEvent, err: any) => {
        this.setState({
            error: err,
            isLoading: false
        });
    };

    handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        this.setState({
            error: '',
            isLoading: true
        });

        const { url, username, password } = this.state;

        ipc.send('authenticate', { url, username, password });
    };

    handleChange = (e: any) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    render() {
        return (
            <div>
                <Grid columns={1} padded={true}>
                    <Grid.Column>
                        <Header as="h2" textAlign="center">
                            <Image src="images/teamcity.png" />
                            TeamCity Notifier
                        </Header>
                        <Header as="h4" textAlign="center">
                            Fill out the credentials for your TeamCity account. <strong>This project does not intrude on credentials.</strong>
                        </Header>
                    </Grid.Column>
                    {this.state.error ? (
                        <Grid.Column>
                            <Segment color="red" inverted>
                                {this.state.error}
                            </Segment>
                        </Grid.Column>
                    ) : null}
                    <Grid.Column>
                        <Form onSubmit={this.handleSubmit} loading={this.state.isLoading}>
                            <Segment>
                                <Form.Field required>
                                    <label>TeamCity URL</label>
                                    <Input
                                        fluid
                                        name="url"
                                        icon="cloud"
                                        iconPosition="left"
                                        value={this.state.url}
                                        onChange={this.handleChange}
                                        required
                                    />
                                </Form.Field>
                                <Form.Input
                                    fluid
                                    name="username"
                                    label="TeamCity Username"
                                    value={this.state.username}
                                    onChange={this.handleChange}
                                    icon="user"
                                    iconPosition="left"
                                    required
                                />
                                <Form.Input
                                    fluid
                                    name="password"
                                    label="TeamCity Password"
                                    type="password"
                                    onChange={this.handleChange}
                                    icon="lock"
                                    iconPosition="left"
                                    required
                                />
                                <Button fluid primary>
                                    Log In
                                </Button>
                            </Segment>
                        </Form>
                    </Grid.Column>
                </Grid>
            </div>
        );
    }
}

render(<Login />, document.getElementById('Login'));
