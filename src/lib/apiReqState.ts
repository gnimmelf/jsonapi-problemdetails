export const API_REQ_STATES = Object.freeze({
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
        return target.reqState === API_REQ_STATES.IDLE;
      case 'isPending':
        return target.reqState === API_REQ_STATES.PENDING;
      case 'isDone':
        return target.reqState === API_REQ_STATES.DONE;
      case 'isSuccess':
        return (
          target.reqState === API_REQ_STATES.DONE && target.result.meta.success
        );
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

const createApiReqProxy = (apiState) => {
  return new Proxy(apiState, apiStateProxyHandler);
};

const createApiReqState = ({ apiName, apiCall, reqState, result }) => ({
  apiName,
  apiCall,
  result: result || null,
  reqState: reqState || API_REQ_STATES.IDLE,
});

export { createApiReqProxy, createApiReqState };
