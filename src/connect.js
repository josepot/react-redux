import hoistStatics from 'hoist-non-react-statics'
import PropTypes from 'prop-types'
import invariant from 'invariant'
import React, { Component } from 'react'

import {Consumer} from './Provider'
import {mapObj, shallowCompare} from './utils'

const emptyObj = {};
export default (fromStateProps_, fromActionProps, mapper, {withRef = false} = {}) => BaseComponent => {
  invariant(
    typeof BaseComponent == 'function',
    `You must pass a component to the function returned by ` +
    `connect. Instead received ${JSON.stringify(BaseComponent)}`
  )
  const isObject = typeof fromStateProps_ === 'object';
  const dependsOnProps = fromStateProps_ && (isObject ? Object.values(fromStateProps_) : [fromStateProps_])
    .some(fn => fn.length !== 1);

  const fromStateProps = !fromStateProps_
    ? () => emptyObj
    : isObject
      ? function() {
        return mapObj(fromStateProps_, fn => fn.apply(null, arguments));
      }
      : fromStateProps_;

  class Connect extends Component {
    constructor(props) {
      super(props);
      invariant(props.dispatch,
        `Could not find "store" in the context. Wrap the root component in a <Provider>, `
      )
      this.state = {
        actionProps: mapObj(
          fromActionProps || emptyObj, 
          fn => (...args) => props.dispatch(fn(...args))
        ),
        childProps: emptyObj,
        stateProps: emptyObj,
      };
    }

    static getDerivedStateFromProps({state, props, stateChanged}, {actionProps, stateProps: prevStateProps}) {
      const stateProps = stateChanged || dependsOnProps
        ? fromStateProps(state, props)
        : prevStateProps;
      const childProps = mapper
        ? mapper(stateProps, actionProps, props)
        : {...props, ...stateProps, ...actionProps};
      return {actionProps, childProps, stateProps};
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
      this.setWrappedInstance = withRef
        ? this.setWrappedInstance.bind(this)
        : undefined;
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
            setWrappedInstance={this.setWrappedInstance}
            state={state}
            stateChanged={stateChanged}
          />);
        }}</Consumer>
      );
    }
  }
  return hoistStatics(ConnectWrapper, BaseComponent);
}
