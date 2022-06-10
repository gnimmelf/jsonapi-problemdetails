import url from 'url';
import express from 'express';
import slugify from 'slugify';

const api = express.Router();

const routes = [];

const devs = [
  {
    id: 10,
    name: 'Flemming Hansen',
    age: 19,
    color: 'blue',
    gender: 'male',
    league: 'mens',
  },
];

// helpers

function getFullType(req, type) {
  return url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: `/error-type/${slugify(type).toLocaleLowerCase()}`,
  });
}

function success(data, props = {}) {
  return {
    ...props,
    ...(data ? { data } : null),
  };
}

function error(req, type, errorProps = {}) {
  return {
    title: type,
    detail: `A(n) ${type.toLocaleLowerCase()} thing happened`,
    ...errorProps,
    type: getFullType(req, type),
  };
}

// Routes

api.get('/', (req, res) => {
  res.json(success(routes));
});

// 200

api.get('/success-empty', (req, res) => {
  res.status(200).json({
    meta: {
      exampleDevEnvProp: '//magic-link-redirect/xxxxxxx',
    },
    ...success(),
  });
});

api.get('/success-data', (req, res) => {
  res.status(200).json(success(devs[0]));
});

api.get('/badrequest', (req, res) => {
  res.status(400).json(error(req, 'Generic bad request'));
});

api.get('/fields-invalid', (req, res) => {
  res.status(400).json(
    error(req, 'fields-invalid', {
      errors: [
        {
          name: 'age',
          reason: 'must be a positive integer',
        },
        {
          name: 'color',
          reason: "must be 'green', 'red' or 'blue'",
        },
      ],
      title: 'Failed to update profile',
      detail: 'Fields did not validate',
    }),
  );
});

// 403

api.get('/forbidden-empty', (req, res) => {
  res.status(403).json(error(req, 'forbidden'));
});

api.get('/forbidden-data', (req, res) => {
  res.status(403).json(
    error(req, 'is-not-authenticated', {
      title: 'User not authenticated',
      data: {
        isUserAuthenticated: false,
      },
    }),
  );
});

// 404

api.get('/not-found-empty', (req, res) => {
  res.status(404).json(error(req, 'not-found'));
});

api.get('/not-found-data', (req, res) => {
  res.status(404).json(
    error(req, 'resource-not-found', {
      data: {
        agreements: [],
      },
    }),
  );
});

api.get('/fields-conflict', (req, res) => {
  res.status(409).json(
    error(req, 'fields-conflict', {
      errors: [
        {
          name: 'gender',
          reason: "Value is 'other'",
        },
        {
          name: 'league',
          reason: "Value is 'womens'",
        },
      ],
      title: 'Failed to update profile',
      detail: 'Conflicting values',
    }),
  );
});

// 500

api.get('/division-by-zero', (req, res) => {
  res.status(500).json(
    error(req, 'division-by-zero', {
      title: 'You have zero friends',
      detail: 'Could not divide surplus',
    }),
  );
});

// Non-json

api.get('/non-json-result', (req, res) => {
  res.send('Hello world!');
});

// Extract routes

api.stack.forEach((middleware) => {
  const { route } = middleware;
  if (route) {
    const { path, methods } = route;
    routes.push({ path, methods });
  }
});

export { api };
