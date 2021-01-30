const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Requests = require('../models/requests');
const { populate } = require('../models/requests');

const Friends = require('../models/friends');

const requestRouter = express.Router();

requestRouter.use(bodyParser.json());

requestRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200);})
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Requests.findOne({user: req.user._id})
    .populate('user')
    .populate('requests')
    .then((requests) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(requests);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /requests');
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /requests');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Requests.findOneAndRemove({"user": req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

requestRouter.route('/:requestId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200);})
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Requests.findOne({user: req.user._id})
    .then((requests) => {
        if (!requests) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "requests": requests});
        }
        else {
            if (requests.requests.indexOf(req.params.requestId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "requests": requests}); 
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "requests": requests});
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Requests.findOne({user: req.user._id})
    .then((request) => {
        if (request && request.requests.indexOf(req.params.requestId) >= 0) {
            Friends.findOne({user: req.user._id})
            .then((friend) => {
                if (friend) {            
                    if (friend.friends.indexOf(req.params.requestId) === -1) {
                        friend.friends.push(req.params.requestId)
                        friend.save()
                        .then((friend) => {
                            Friends.findById(friend._id)
                            .populate('user')
                            .populate('friends')
                            .then((friend) => {
                                console.log('Friend created: ', friend);
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(friend);
                            })
                        }, (err) => next(err))
                    }
                }
                else {
                    Friends.create({"user": req.user._id, "friends": [req.params.requestId]})
                    .then((friend) => {
                        Friends.findById(friend._id)
                        .populate('user')
                        .populate('friends')
                        .then((friend) => {
                            console.log('Friend created: ', friend);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(friend);
                        })
                    }, (err) => next(err))
                }
                
            }, (err) => next(err))
            .catch((err) => next(err));

            Friends.findOne({user: req.params.requestId})
            .then((friend) => {
                if (friend) {            
                    if (friend.friends.indexOf(req.user._id) === -1) {
                        friend.friends.push(req.user._id)
                        friend.save();
                    }
                }
                else {
                    Friends.create({"user": req.params.requestId, "friends": [req.user._id]});
                }
                
            }, (err) => next(err))
            .catch((err) => next(err));

            request.requests.splice(req.params.requestId, 1);
            request.save();
        }
        else {
            Requests.findOne({user: req.params.requestId})
            .then((request) => {
                if (req.user._id !== req.params.requestId) {
                    if (request) {            
                        if (request.requests.indexOf(req.user._id) === -1) {
                            request.requests.push(req.user._id)
                            request.save()
                            .then((request) => {
                                Requests.findById(request._id)
                                .populate('user')
                                .populate('requests')
                                console.log('Request created: ', request);
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(request);
                            }, (err) => next(err))
                        }
                    }
                    else {
                        Requests.create({"user": req.params.requestId, "requests": [req.user._id]})
                        .then((request) => {
                            Requests.findById(request._id)
                            .populate('user')
                            .populate('requests')
                            console.log('Request added: ', request);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(request);
                        }, (err) => next(err))
                    }
                }
                else {
                    var err = new Error('You can not add yourself to the requests list!');
                    err.status = 403;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));    
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /requests/' + req.params.requestId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Requests.findOne({user: req.user._id})
    .then((request) => {
        if (request) {            
            if (request.requests.indexOf(req.params.requestId) >= 0) {
                request.requests.splice(req.params.requestId, 1);
                request.save()
                .then((request) => {
                    Requests.findById(request._id)
                    .populate('user')
                    .populate('requests')
                    .then((request) => {
                        console.log('Request deleted: ', request);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(request);
                    })
                }, (err) => next(err));
            }
            else {
                err = new Error('Request ' + req.params.requestId + ' not found');
                err.status = 404;
                return next(err);
            }
        }
        else {
            err = new Error('Requests not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = requestRouter;