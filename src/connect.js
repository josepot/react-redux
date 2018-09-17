import hoistStatics from 'hoist-non-react-statics'
import PropTypes from 'prop-types'
import invariant from 'invariant'
import React, { Component } from 'react'

import {Consumer} from './Provider'
import {mapObj, shallowCompare} from './utils'

export default (fromStateProps, fromActionProps, mapper, {withRef = false} = {}) => BaseComponent => {
  invariant(
    typeof BaseComponent == 'function',
    `You must pass a component to the function returned by ` +
    `connect. Instead received ${JSON.stringify(BaseComponent)}`
  )
  class Connect extends Component {
    constructor(props) {
      super(props);
      invariant(props.dispatch,
        `Could not find "store" in the context. Wrap the root component in a <Provider>, `
      )
      this.state = {
        actionProps: mapObj(
          fromActionProps || {}, 
          fn => (...args) => props.dispatch(fn(...args))
        ),
        childProps: {},
        stateProps: {},
        dependsOnProps: Object
          .values(fromStateProps || {})
          .reduce((res, fn) => res && fn.length !== 1, true),
      };
    }

    static getDerivedStateFromProps({state, props, stateChanged}, {actionProps, dependsOnProps, stateProps: prevStateProps}) {
      const stateProps = stateChanged || dependsOnProps
        ? mapObj(fromStateProps || {}, selector => selector(state, props))
        : prevStateProps;
      const childProps = mapper
        ? mapper(stateProps, actionProps, props)
        : {...props, ...stateProps, ...actionProps};
      return {actionProps, stateProps, childProps, dependsOnProps};
    }

    shouldComponentUpdate(nextProps, nextState) {
      return !shallowCompare(this.state.childProps, nextState.childProps);
    }

    render() {
      return <BaseComponent {...this.state.childProps} ref={this.props.setWrappedInstance} />;
    }
  }

  Connect.propTypes = {
    dispatch: PropTypes.func.isRequired,
    props: PropTypes.object.isRequired,
    setWrappedInstance: PropTypes.func,
    state: PropTypes.any.isRequired,
    stateChanged: PropTypes.bool.isRequired,
  };

  class ConnectWrapper extends Component {
    constructor(props) {
      super(props)
      this.setWrappedInstance = this.setWrappedInstance.bind(this)
    }

    getWrappedInstance() {
      invariant(withRef,
        `To access the wrapped instance, you need to specify ` +
        `{ withRef: true } in the options argument of the connect() call.`
      )
      return this.wrappedInstance
    }

    setWrappedInstance(ref) {
      this.wrappedInstance = ref
    }

    render() {
      return (
        <Consumer>{({state, dispatch}) => {
          const stateChanged = state !== this.prevState;
          this.prevState = state;
          return (<Connect
            dispatch={dispatch}
            props={this.props}
            setWrappedInstance={withRef ? this.setWrappedInstance : undefined}
            state={state}
            stateChanged={stateChanged}
          />);
        }}</Consumer>
      );
    }
  }
  return hoistStatics(ConnectWrapper, BaseComponent);
}
