import url from 'url'
import express from 'express'
import slugify from 'slugify'

const api = express.Router()

const routes = []

const devs = [
    {
        id: 10,
        name: 'Flemming Hansen',
        age: 19,
        color: 'blue',
        gender: 'male',
        league: 'mens'
    }
]

// helpers

function getFullType(req, type) {
    return url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: `/error-type/${slugify(type).toLocaleLowerCase()}`
    });
}

function success(data, props = {}) {
    return {
        meta: {
            success: true,
        },
        ...props,
        ...(data ? { data } : null)
    }
}

function error(req, type, errors = [], props = {}) {
    return {
        meta: {
            success: false
        },
        title: type,
        detail: `A(n) ${type.toLocaleLowerCase()} thing happened`,
        ...props,
        ...(errors.length ? { errors } : null),
        type: getFullType(req, type),
    }
}

// Routes

api.get('/', (req, res) => {
    res.json(success(routes))
})

// 200

api.get('/success-empty', (req, res) => {
    res.status(200).json(success())
})

api.get('/success-data', (req, res) => {
    res.status(200).json(success(devs[0]))
})


api.get('/badrequest', (req, res) => {
    res.status(400).json(error(req, 'Generic bad request'))
})

api.get('/fields-invalid', (req, res) => {
    res.status(400).json(error(req, 'fields-invalid', [{
        "name": "age",
        "reason": "must be a positive integer"
    },
    {
        "name": "color",
        "reason": "must be 'green', 'red' or 'blue'"
    }], {
        title: 'Failed to update profile',
        detail: 'Fields did not validate'
    }))
})

// 403

// 404


api.get('/fields-conflict', (req, res) => {
    res.status(409).json(error(req, 'fields-conflict', [{
        "name": "gender",
        "reason": "Value is 'other'"
    },
    {
        "name": "league",
        "reason": "Value is 'womens'"
    }], {
        title: 'Failed to update profile',
        detail: 'Conflicting values'
    }))
})

// Kickoff

api.stack.forEach(function (middleware) {
    const { route } = middleware
    if (route) {
        const { path, methods } = route
        routes.push({ path, methods });
    }
});

export { api }