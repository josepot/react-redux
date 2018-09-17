import PropTypes from 'prop-types'
import {Component, createContext, createElement} from 'react';

const context = createContext({});

export const {Consumer} = context;
const {Provider} = context;

export default class ReduxProvider extends Component {
  constructor(props) {
    super(props);
    const {store, isSSR} = props;
    this.state = {state: store.getState(), dispatch: store.dispatch};

    if (!isSSR) {
      this.subscription = store.subscribe(() => {
        this.setState({state: store.getState()});
      });
    }
  }

  componentWillUnmount() {
    this.subscription && this.subscription();
  }

  render() {
    return createElement(Provider, {value: this.state, children: this.props.children});
  }
}

ReduxProvider.propTypes = {
  children: PropTypes.element.isRequired,
  isSSR: PropTypes.bool,
  store: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired
  }),
};

ReduxProvider.defaultProps = {
  isSSR: false,
};
