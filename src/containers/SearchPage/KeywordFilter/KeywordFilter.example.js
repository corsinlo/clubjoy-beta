import React from 'react';
import { withRouter } from 'react-router-dom';

import { stringify, parse } from '../../../util/urlHelpers';

import KeywordFilter from './KeywordFilter';

const URL_PARAM = 'keywords';

const handleSubmit = (values, history) => {
  console.log('Submitting values', values);
  const queryParams = values ? `?${stringify(values)}` : '';
  history.push(`${window.location.pathname}${queryParams}`);
};

const KeywordFilterPopup = withRouter((props) => {
  const { history, location } = props;

  const params = parse(location.search);
  const keyword = params[URL_PARAM];
  const initialValues = keyword ? { [URL_PARAM]: keyword } : { [URL_PARAM]: null };

  return (
    <KeywordFilter
      id="KeywordFilterPopupExample"
      name="keyword"
      queryParamNames={[URL_PARAM]}
      label="Keyword"
      onSubmit={(values) => handleSubmit(values, history)}
      showAsPopup
      liveEdit={false}
      initialValues={initialValues}
      contentPlacementOffset={-14}
    />
  );
});

export const KeywordFilterPopupExample = {
  component: KeywordFilterPopup,
  props: {},
  group: 'page:SearchPage',
};

const KeywordFilterPlain = withRouter((props) => {
  const { history, location } = props;

  const params = parse(location.search);
  const keyword = params[URL_PARAM];
  const initialValues = keyword ? { [URL_PARAM]: keyword } : { [URL_PARAM]: null };

  return (
    <KeywordFilter
      id="KeywordFilterPlainExample"
      name="keyword"
      queryParamNames={[URL_PARAM]}
      label="Keyword"
      onSubmit={(values) => {
        handleSubmit(values, history);
      }}
      showAsPopup={false}
      liveEdit
      initialValues={initialValues}
    />
  );
});

export const KeywordFilterPlainExample = {
  component: KeywordFilterPlain,
  props: {},
  group: 'page:SearchPage',
};
