import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import classNames from 'classnames';
import { H2, H3, H4, H5, NamedLink } from '../../components';

import * as allExamples from '../../examples';

import css from './StyleguidePage.module.css';

const ALL = '*';
const DEFAULT_GROUP = 'misc';
const PREFIX_SEPARATOR = ':';

function Example(props) {
  const {
    componentName,
    exampleName,
    component: ExampleComponent,
    description,
    props: exampleProps,
    useDefaultWrapperStyles,
    rawOnly,
  } = props;

  const exampleWrapperClassName = useDefaultWrapperStyles ? css.defaultWrapperStyles : '';
  const desc = description ? <p className={css.withMargin}>Description: {description}</p> : null;
  return (
    <li className={css.example}>
      <H3 className={css.withMargin}>
        <NamedLink
          name="StyleguideComponent"
          params={{ component: componentName }}
          className={css.link}
        >
          {componentName}
        </NamedLink>{' '}
        /{' '}
        <NamedLink
          name="StyleguideComponentExample"
          params={{ component: componentName, example: exampleName }}
          className={css.link}
        >
          {exampleName}
        </NamedLink>
      </H3>
      <span className={css.withMargin}>
        <NamedLink
          name="StyleguideComponentExampleRaw"
          params={{ component: componentName, example: exampleName }}
          className={css.link}
        >
          raw
        </NamedLink>
      </span>
      {desc}
      <div className={exampleWrapperClassName}>
        {rawOnly ? (
          <p>
            This component is available in{' '}
            <NamedLink
              name="StyleguideComponentExampleRaw"
              params={{ component: componentName, example: exampleName }}
            >
              raw mode
            </NamedLink>{' '}
            only.
          </p>
        ) : (
          <ExampleComponent {...exampleProps} />
        )}
      </div>
    </li>
  );
}

const { bool, func, node, object, oneOfType, shape, string, arrayOf } = PropTypes;

Example.defaultProps = {
  description: null,
  props: {},
  useDefaultWrapperStyles: true,
};

Example.propTypes = {
  componentName: string.isRequired,
  exampleName: string.isRequired,
  component: oneOfType([func, node]).isRequired,
  description: string,
  props: object,
  useDefaultWrapperStyles: bool,
};

// Renders the list of component example groups as clickable filters
function Nav(props) {
  const { groups, selectedGroup } = props;
  const toGroupLink = (group, linkableContent) => {
    const linkProps = {
      name: group === ALL ? 'Styleguide' : 'StyleguideGroup',
      params: group === ALL ? null : { group },
    };

    const linkContent = linkableContent || (group === ALL ? 'all components' : group);
    const isSelected = selectedGroup && group === selectedGroup;
    const groupLink = classNames(css.link, { [css.selectedGroup]: isSelected });
    return (
      <li key={group} className={css.group}>
        <NamedLink {...linkProps} className={groupLink}>
          {linkContent}
        </NamedLink>
      </li>
    );
  };

  const filteredGroups = groups.filter((g) => g !== ALL && g !== DEFAULT_GROUP);
  // Get prefixGroups => { elements: [], page: [], unprefixed: [] }
  const prefixGroups = filteredGroups.reduce((acc, g) => {
    const prefixIndex = g.indexOf(PREFIX_SEPARATOR);
    const prefix = prefixIndex > 0 ? g.slice(0, prefixIndex) : null;

    if (prefix) {
      const prevGroupsWithPrefix = acc && acc[prefix] ? acc[prefix] : [];
      return { ...acc, [prefix]: [...prevGroupsWithPrefix, g] };
    }
    const prevUnprefixedGroups = acc && acc.unprefixed ? acc.unprefixed : [];
    return { ...acc, unprefixed: [...prevUnprefixedGroups, g] };
  }, {});

  const getGroupLinks = (prefixGroups, prefix) =>
    prefix && prefixGroups[prefix]
      ? prefixGroups[prefix].map((g) => toGroupLink(g, g.slice(prefix.length + 1)))
      : !prefix
        ? prefixGroups.unprefixed.map((g) => toGroupLink(g))
        : [];

  const designElementGroups = getGroupLinks(prefixGroups, 'elements');
  const pageSubComponentGroups = getGroupLinks(prefixGroups, 'page');
  const sharedComponentGroups = getGroupLinks(prefixGroups);

  return (
    <nav className={css.withMargin}>
      <ul>{toGroupLink(ALL)}</ul>
      <H5>Design elements</H5>
      <ul className={css.groups}>{designElementGroups}</ul>
      <H5>Shared components</H5>
      <ul className={css.groups}>
        {sharedComponentGroups}
        {toGroupLink(DEFAULT_GROUP)}
      </ul>
      <H5>Page-related components</H5>
      <ul className={css.groups}>{pageSubComponentGroups}</ul>
    </nav>
  );
}

Nav.defaultProps = { selectedGroup: null };

Nav.propTypes = {
  groups: arrayOf(string).isRequired,
  selectedGroup: string,
};

// The imported examples are in a nested tree structure. Flatten the
// structure into an array of example objects.
const flatExamples = (examples) =>
  Object.keys(examples).reduce((flattened, componentName) => {
    const exs = Object.keys(examples[componentName]).reduce((result, exampleName) => {
      const ex = examples[componentName][exampleName];
      return result.concat([
        {
          componentName,
          exampleName,
          group: DEFAULT_GROUP,
          ...ex,
        },
      ]);
    }, []);
    return flattened.concat(exs);
  }, []);

// Filter the examples based on the given criteria
const examplesFor = (examples, group, componentName, exampleName) =>
  examples.filter(
    (ex) =>
      (group === ALL || ex.group === group) &&
      (componentName === ALL || ex.componentName === componentName) &&
      (exampleName === ALL || ex.exampleName === exampleName),
  );

function StyleguidePage(props) {
  const { params, raw } = props;
  const group = params.group ? decodeURIComponent(params.group) : ALL;
  const componentName = params.component || ALL;
  const exampleName = params.example || ALL;

  const flattened = flatExamples(allExamples);
  const groups = flattened.reduce((result, ex) => {
    if (ex.group && !result.includes(ex.group)) {
      return result.concat(ex.group);
    }
    return result;
  }, []);
  groups.sort();
  const selectedGroup = isEmpty(params) ? ALL : params.group;
  const examples = examplesFor(flattened, group, componentName, exampleName);

  // Raw examples are rendered without any wrapper
  if (raw && examples.length > 0) {
    // There can be only one raw example at a time, therefore pick
    // only the first example in the examples Array
    const { component: ExampleComponent, props: exampleProps } = examples[0];
    return <ExampleComponent {...exampleProps} />;
  }
  if (raw) {
    return (
      <p>
        No example with filter {componentName}/{exampleName}/raw
      </p>
    );
  }

  const html =
    examples.length > 0 ? (
      <ul className={css.examplesList}>
        {examples.map((ex) => (
          <Example key={`${ex.componentName}/${ex.exampleName}`} {...ex} />
        ))}
      </ul>
    ) : (
      <p>
        No examples with filter: {componentName}/{exampleName}
      </p>
    );

  const prefixIndex = selectedGroup ? selectedGroup.indexOf(PREFIX_SEPARATOR) : -1;
  const selectedGroupWithoutPrefix =
    prefixIndex > 0 ? selectedGroup.slice(prefixIndex + 1).trim() : selectedGroup;
  return (
    <section className={css.root} id="styleguide">
      <div className={css.navBar}>
        <H2 as="h1" className={css.withMargin}>
          <NamedLink name="Styleguide" className={css.link}>
            Styleguide
          </NamedLink>
        </H2>
        <H4 as="h2" className={css.withMargin}>
          Select category:
        </H4>
        <Nav groups={groups} selectedGroup={selectedGroup} />
      </div>
      <div className={css.main}>
        <H2 className={css.contentHeading}>
          {selectedGroupWithoutPrefix
            ? `Selected category: ${selectedGroupWithoutPrefix}`
            : `Component`}
        </H2>
        {html}
      </div>
    </section>
  );
}

StyleguidePage.defaultProps = { raw: false };

StyleguidePage.propTypes = {
  params: shape({
    group: string,
    component: string,
    example: string,
  }).isRequired,
  raw: bool,
};

export default StyleguidePage;
