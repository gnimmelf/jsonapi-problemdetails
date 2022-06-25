export const API_STATES = Object.freeze({
  IDLE: 'IDLE',
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
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
      case 'isSuccess':
        return target.reqState === API_STATES.SUCCESS;
      case 'isFailed':
        return target.reqState === API_STATES.FAILED;
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

export const createApiState = ({
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
