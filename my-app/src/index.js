import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import Client from 'aws-appsync'
import { Rehydrated } from 'aws-appsync-react'
import { ApolloProvider as Provider } from 'react-apollo'

import config from './appsync'
//Nader DAbit Youtube : aws appsync graphql
//https://docs.aws.amazon.com/appsync/latest/devguide/building-a-client-app-react.html
const client_ = new Client({
    url : config.graphqlEndpoint,
    region : config.region,
    auth : {
        type : config.authenticationType,
        apiKey : config.apiKey
    }
})

const WithProvider = () => (
    <Provider client={client_}>
        <Rehydrated>
            <App />
        </Rehydrated>
    </Provider>
)

ReactDOM.render(<WithProvider />, document.getElementById('root'));
