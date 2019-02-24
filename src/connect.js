import React, { useMemo } from 'react'
import useRedux from './useRedux'

const emptyObj = {}
const alwaysEmpty = x => emptyObj // eslint-disable-line
const defaultMapper = (stateProps, actionProps, externalProps) => ({
  ...externalProps,
  ...stateProps,
  ...actionProps
})

export default (fromStateProps_, fromActionProps_, mapper_) => {
  const fromStateProps = fromStateProps_ || alwaysEmpty
  const fromActionProps = fromActionProps_ || null
  const mapper = mapper_ || defaultMapper

  return BaseComponent => {
    const EnhancedComponent = props => {
      const finalProps = useRedux(
        fromStateProps,
        fromActionProps,
        mapper,
        props
      )

      return useMemo(() => <BaseComponent {...finalProps} />, [finalProps])
    }

    return EnhancedComponent
  }
}
