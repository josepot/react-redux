import React, {useContext} from 'react';
import invariant from 'invariant'
import {context} from './Provider';
import {mapObj, shallowCompare} from './utils'

const emptyObj = {};
export default (fromStateProps_, fromActionProps, mapper) => {
  const isObject = typeof fromStateProps_ === 'object';
  const dependsOnProps =
    fromStateProps_ &&
    (isObject ? Object.values(fromStateProps_) : [fromStateProps_]).some(
      fn => fn.length !== 1
    );

  const fromStateProps = !fromStateProps_
    ? () => emptyObj
    : isObject
    ? (...args) => mapObj(fromStateProps_, fn => fn(...args))
    : fromStateProps_;

  return BaseComponent => {
    invariant(
      typeof BaseComponent == 'function',
      `You must pass a component to the function returned by ` +
      `connect. Instead received ${JSON.stringify(BaseComponent)}`
    );
    let actionProps;
    let prevState;
    let prevStateProps;
    let prevProps;
    let prevFinalProps;
    let prevResult;

    return props => {
      const {state, dispatch} = useContext(context);

      const stateProps =
        dependsOnProps || prevState !== state
          ? fromStateProps(state, props)
          : prevStateProps;

      actionProps =
        actionProps ||
        mapObj(fromActionProps || emptyObj, fn => (...args) =>
          dispatch(fn(...args))
        );

      const finalProps =
        props === prevProps && stateProps === prevStateProps
          ? prevFinalProps
          : mapper
          ? mapper(stateProps, actionProps, props)
          : {...props, ...stateProps, ...actionProps};

      const result =
        !prevProps || !shallowCompare(finalProps, prevFinalProps) ? (
          <BaseComponent {...finalProps} />
        ) : (
          prevResult
        );

      prevState = state;
      prevStateProps = stateProps;
      prevProps = props;
      prevFinalProps = finalProps;
      prevResult = result;

      return result;
    };
  };
};
