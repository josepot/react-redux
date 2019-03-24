import React, { useMemo } from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import invariant from 'invariant'
import { isValidElementType } from 'react-is'
import useRedux from './useRedux'

const emptyObj = {}
const alwaysEmpty = x => emptyObj // eslint-disable-line
const defaultMapper = (stateProps, actionProps, externalProps) => ({
  ...externalProps,
  ...stateProps,
  ...actionProps
})

const stringifyComponent = Comp => {
  try {
    return JSON.stringify(Comp)
  } catch (err) {
    return String(Comp)
  }
}

export default (
  fromStateProps_,
  fromActionProps_,
  mapper_,
  { getDisplayName, forwardRef } = emptyObj
) => {
  const fromStateProps = fromStateProps_ || alwaysEmpty
  const fromActionProps = fromActionProps_ || null
  const mapper = mapper_ || defaultMapper

  return BaseComponent => {
    if (process.env.NODE_ENV !== 'production') {
      invariant(
        isValidElementType(BaseComponent),
        `You must pass a component to the function returned by ` +
          `connect. Instead received ${stringifyComponent(BaseComponent)}`
      )
    }

    const name = BaseComponent.name || BaseComponent.displayName || 'Component'
    const displayName = getDisplayName
      ? getDisplayName(name)
      : `Connect(${name})`

    const Connect = props => {
      const finalProps = useRedux(
        fromStateProps,
        fromActionProps,
        mapper,
        props,
        displayName
      )

      return useMemo(() => {
        let propsWithRef = finalProps
        if (finalProps.forwardedRef) {
          propsWithRef = { ...finalProps }
          propsWithRef.ref = finalProps.forwardedRef
          delete propsWithRef.forwardedRef
        }
        return <BaseComponent {...propsWithRef} />
      }, [finalProps])
    }

    Connect.WrappedComponent = BaseComponent
    Connect.displayName = displayName

    if (forwardRef) {
      const forwarded = React.forwardRef(function forwardConnectRef(
        props,
        ref
      ) {
        return <Connect wrapperProps={props} forwardedRef={ref} />
      })

      forwarded.displayName = displayName
      forwarded.WrappedComponent = Connect
      return hoistNonReactStatics(forwarded, Connect)
    }

    return hoistNonReactStatics(Connect, BaseComponent)
  }
}
