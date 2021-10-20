import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import CollectionsCardAddImagePage from '../modules/cards/pages/CollectionsCardAddImagePage';
import CollectionsCardAddPage from '../modules/cards/pages/CollectionsCardAddPage';
import CollectionsCardAddTextPage from '../modules/cards/pages/CollectionsCardAddTextPage';
import CollectionsCardPage from '../modules/cards/pages/CollectionsCardPage';
import CollectionsCardShowImageOrTextPage from '../modules/cards/pages/CollectionsCardShowImageOrTextPage';
import CollectionsCardStarredPage from '../modules/cards/pages/CollectionsCardStarredPage';
import CollectionsImageCardEditPage from '../modules/cards/pages/CollectionsImageCardEditPage';
import CollectionAddPage from '../modules/collections/pages/CollectionAddPage';
import CollectionPage from '../modules/collections/pages/CollectionPage';
import HomePage from '../pages/HomePage';
import InfoPage from '../pages/InfoPage';
import TemplatePage from '../pages/utilities/TemplatePage';
import routes from '../utilities/routes';

const MainRouter = (): JSX.Element => {
    return (
        <>
            <Switch>
                <Route exact path={'/'} component={HomePage} />
                <Route exact path={routes.INFO} component={InfoPage} />
                <Route exact path={routes.COLLECTIONS.INDEX} component={CollectionPage} />
                <Route exact path={routes.COLLECTIONS.NEW} component={CollectionAddPage} />
                <Route exact path={routes.COLLECTIONS.SHOW} component={CollectionsCardPage} />
                <Route exact path={routes.COLLECTIONS.CARD.NEWTEXT} component={CollectionsCardAddTextPage} />
                <Route exact path={routes.COLLECTIONS.CARD.NEWIMAGE} component={CollectionsCardAddImagePage} />
                <Route exact path={routes.COLLECTIONS.CARD.NEW} component={CollectionsCardAddPage} />
                <Route exact path={routes.COLLECTIONS.CARD.SHOW} component={CollectionsCardShowImageOrTextPage} />
                <Route exact path={routes.CARDS.SHOW_STARRED} component={CollectionsCardStarredPage} />
                {/* TODO: Distinguish between image card edit and text card edit somewhere */}
                <Route exact path={routes.COLLECTIONS.CARD.EDIT} component={CollectionsImageCardEditPage} />
                <Route exact path={routes.TEST} component={TemplatePage} />
            </Switch>
        </>
    );
};

export default MainRouter;
