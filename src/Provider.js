import PropTypes from 'prop-types'
import React, { createContext, useState, useEffect } from 'react'

export const context = createContext({})

const { Provider } = context

const ReduxProvider = ({ store, children, isSSR }) => {
  const { dispatch } = store
  const [state, setState] = useState(undefined)

  useEffect(() => {
    setState(store.getState())
    return isSSR ? undefined : store.subscribe(() => setState(store.getState()))
  }, [isSSR, setState, store])

  return !isSSR && state === undefined ? null : (
    <Provider value={{ state: store.getState(), dispatch }}>
      {children}
    </Provider>
  )
}

ReduxProvider.propTypes = {
  children: PropTypes.any,
  isSSR: PropTypes.bool,
  store: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired
  })
}

ReduxProvider.defaultProps = {
  isSSR: false
}

export default ReduxProvider
