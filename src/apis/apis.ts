


const getCustomApiCalls = () => ({
    getTextContent: getWrappedApiCall({
      apiName: 'getTextContent',
      apiCall: () => fetch('/'),
    }),
    nonExistingUrl: getWrappedApiCall({
      apiName: 'nonExistingUrl',
      apiCall: () => fetch('/flemming'),
    }),
  });

  const fetchApiRoutes = async () => {
    const getApis = getWrappedApiCall({
      apiName: 'initApis',
      apiCall: () => fetch('/api'),
    });

    const { data: apiRoutes } = await getApis();

    return apiRoutes;
  };

  const createApiCallsFromRoutes = (apiRoutes) => {
    const apiCalls = apiRoutes.reduce((acc, { path, methods }) => {
      debug('fetchApis', path);
      if (path !== '/') {
        Object.keys(methods).forEach((method) => {
          const apiName = hyphenToCamelCase([method, slugify(path)].join('-'));
          acc[apiName] = () => fetch(`/api${path}`, { method }),
          });
        });
      }
      return acc;
    }, getCustomApiCalls());

    return apiCalls;
  };