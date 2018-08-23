import React, {Component} from 'react';
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom';

import configs from './configs';
import Amplify from 'aws-amplify';
import {Authenticator, Greetings} from 'aws-amplify-react';

// components
import Main from './Main';


Amplify.configure(configs);


const federated = {
    facebook_app_id: '2233235413558685'
    /** GZ: Descomentando estas lineas, el template agrega botones correspondientes **/
    //google_client_id: 'yourGoogleClientID',
    //amazon_client_id: 'yourAmazonClientID'
};

class App extends Component {
    render() {
        return (
            <Authenticator hide={[Greetings]} federated={federated}>
                <Main />
            </Authenticator>

        );
    }
}

export default App;
