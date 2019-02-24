import { useEffect, useRef, useMemo } from 'react'
import useReduxState from './useReduxState'
import useReduxActions from './useReduxActions'
import { shallowCompare } from './utils'

export default (selector, actionCreators, mapper, props) => {
  const prevPropsRef = useRef(null)
  const stateProps = useReduxState(selector, props)
  const actionProps = useReduxActions(actionCreators)

  const result = useMemo(() => {
    const allProps = mapper(stateProps, actionProps, props)
    const isTheSame =
      prevPropsRef.current && shallowCompare(allProps, prevPropsRef.current)
    return isTheSame ? prevPropsRef.current : allProps
  }, [stateProps, actionProps, props, mapper])

  useEffect(() => {
    prevPropsRef.current = result
  }, [result])

  return result
}
