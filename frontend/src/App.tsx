import { ThemeProvider, createTheme } from '@material-ui/core';
import { createBrowserHistory } from 'history';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';
import { pdfjs } from 'react-pdf';
import { Provider } from 'react-redux';
import { Route, Router } from 'react-router-dom';
import persistStore from 'redux-persist/es/persistStore';
import { PersistGate } from 'redux-persist/integration/react';

import AppLayout from './layouts/AppLayout';
import Notifier from './modules/notifications/components/Notifier';
import configureStore from './modules/store';
import MainRouter from './routers/MainRouter';
import palette from './utilities/palette';
import './assets/css/fonts.css';


// eslint-disable-next-line import/namespace
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const history = createBrowserHistory();
const store = configureStore();
const persistor = persistStore(store);

const theme = createTheme({
    palette,
    typography: {
        htmlFontSize: 16,
        fontFamily: 'Lato',
    },
});

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <Router history={history}>
                    <ThemeProvider theme={theme}>
                        <SnackbarProvider>
                            <AppLayout>
                                <Notifier />
                                <Route path="" render={MainRouter}></Route>
                            </AppLayout>
                        </SnackbarProvider>
                    </ThemeProvider>
                </Router>
            </PersistGate>
        </Provider>
    );
};

export default App;
