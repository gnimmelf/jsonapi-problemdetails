import { logError } from '../helpers/logError';

import { createDebugger } from '../helpers/createDebugger';

const debug = createDebugger(__filename);

export const createApiCallWrapper = ({
  apiName,
  apiCall,
  resultParser,
  onPending = () => {},
  onComplete = () => {},
}) => {
  const { location } = window;
  const typeUrlBase = `${location.protocol}://${location.host}/error-type`;

  return async (...args) => {
    const signal = args.find((arg) => arg instanceof AbortSignal) || {};

    let response;
    let result;

    onPending();

    try {
      response = await apiCall(...args);

      result = await (resultParser ? resultParser(response) : response.json());
      debug('fetchParsed', { response, result });
    } catch (err) {
      result = { meta: { catchBlockError: true } };
      if (signal.aborted) {
        result.type = `${typeUrlBase}/request-aborted`;
        result.title = 'Request was cancelled';
        result.details = `Request for (${apiName}) was aborted by signal`;
      } else {
        result.type = `${typeUrlBase}/response-parsing-error`;
        result.title = 'Client side parsing error';
        result.details = err.toString();
      }
    }

    if (!result.meta) {
      result.meta = {};
    }

    Object.assign(result.meta, {
      url: response.url,
      status: response.status,
      success: !result.meta.catchBlockError && response.status === 200,
    });

    if (
      !result.meta.success &&
      (result.meta.status >= 500 ||
        result.type.endsWith('response-parsing-error'))
    ) {
      result.meta.isRuntimeException = true;
      logError(result);
    }

    debug(`enhancedApiCall:${apiName}`, { result });

    onComplete(result);

    return result;
  };
};
