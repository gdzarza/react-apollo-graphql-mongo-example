import React, {Component} from 'react';
import {BrowserRouter, Route, Link, Switch, Redirect} from 'react-router-dom';
import {Auth} from 'aws-amplify';

import BookList from './components/BookList';
import AddBook from './components/AddBook';
import ApolloClient from 'apollo-boost';
import {ApolloProvider} from 'react-apollo';



export default class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    async getAuthenticatedHeader() {
        let session = await Auth.currentSession();
        const token = session.idToken.jwtToken;
        //const token = session.accessToken.jwtToken;
        console.log(token);
        const keyValueObj = {Authorization: token ? `Bearer ${token}` : ""};
        this.setState({authHeader: keyValueObj});
    };

    async componentDidMount() {
        this.getAuthenticatedHeader();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevState.authHeader && this.state.authHeader) {
            const client = new ApolloClient({
                uri: 'http://localhost:4000/graphql',
                headers: this.state.authHeader
            });
            this.setState({client});
        }
    }


    signOut = async (e) => {
        e.preventDefault();
        Auth.signOut()
            .then(() => {
                this.props.onStateChange('signedOut', null);
                console.log('signedOut')
            })
            .catch(err => console.log(err));
    };

    renderContent() {
        return (
            <ApolloProvider client={this.state.client}>
                <div id="main">
                    <h1>Ninja's Reading List</h1>
                    <BookList/>
                    <AddBook/>
                </div>
            </ApolloProvider>
        );
    }

    render() {
        return (
            <div>
                {
                    this.props.authState === 'signedIn'
                    && !!this.state.client
                        ?
                        this.renderContent()
                        :
                        null
                }
            </div>
        );
    }
}
