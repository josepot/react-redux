import PropTypes from 'prop-types'
import React, { createContext, useState, useEffect } from 'react'

export const stateContext = createContext()
export const dispatchContext = createContext()

const { Provider: StateProvider } = stateContext
const { Provider: DispatchProvider } = dispatchContext

const StateProviderComp = ({ store, children }) => {
  const [stateStore, setStateStore] = useState(store.getState())

  useEffect(() => {
    setStateStore(store.getState())
    return store.subscribe(() => setStateStore(store.getState()))
  }, [store])

  return <StateProvider value={stateStore}>{children}</StateProvider>
}

export const ReduxProvider = ({ store, children }) => (
  <DispatchProvider value={store.dispatch}>
    <StateProviderComp store={store}>{children}</StateProviderComp>
  </DispatchProvider>
)

ReduxProvider.propTypes = {
  children: PropTypes.any,
  store: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired
  })
}
StateProviderComp.propTypes = ReduxProvider.propTypes

export const ServerProvider = ({ store, children }) => (
  <DispatchProvider value={store.dispatch}>
    <StateProvider value={store.getState()}>{children}</StateProvider>
  </DispatchProvider>
)

ServerProvider.propTypes = ReduxProvider.propTypes

export default ReduxProvider
