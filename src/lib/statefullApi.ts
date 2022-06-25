export const API_STATES = Object.freeze({
  IDLE: 'IDLE',
  PENDING: 'PENDING',
  DONE: 'DONE',
});

const apiStateProxyHandler = {
  get(target, prop) {
    switch (prop) {
      // Methods
      case 'call':
        return target.apiCall;
      // Props
      case 'isIdle':
        return target.reqState === API_STATES.IDLE;
      case 'isPending':
        return target.reqState === API_STATES.PENDING;
      case 'isDone':
        return target.reqState === API_STATES.DONE;
      default:
        return target[prop];
    }
  },
  set(target, prop, value) {
    switch (prop) {
      /* eslint-disable no-return-assign */
      /* eslint-disable no-param-reassign */
      case 'result':
        return (target.result = value);
      /* eslint-disable no-return-assign */
      /* eslint-disable no-param-reassign */
      default:
        throw new Error(`Unknown prop '${prop}`);
    }
  },
};

export const createStatefullApi = (apiState) => {
  return new Proxy(apiState, apiStateProxyHandler);
};

export const createApiStateValue = ({
  apiName,
  apiCall,
  reqState,
  result,
} = {}) => ({
  apiName,
  apiCall,
  result: result || null,
  reqState: reqState || API_STATES.IDLE,
});
