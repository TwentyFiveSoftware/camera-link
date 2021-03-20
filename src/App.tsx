import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import RTCConnection from './models/RTCConnection';
import PageHome from './pages/PageHome';
import PageAcceptConnection from './pages/PageAcceptConnection';

export const rtcConnection = new RTCConnection();

const App = () => {
    return (
        <Router>
            <Switch>
                <Route path={'/:connectionId'}>
                    <PageAcceptConnection />
                </Route>
                <Route path={'/'} exact={true}>
                    <PageHome />
                </Route>
            </Switch>
        </Router>
    );
};

export default App;
