const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Friends = require('../models/friends');
const { populate } = require('../models/friends');

const Requests = require('../models/requests');

const friendRouter = express.Router();

friendRouter.use(bodyParser.json());

friendRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200);})
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Friends.findOne({user: req.user._id})
    .populate('user')
    .populate('friends')
    .then((friends) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(friends);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Friends.findOne({user: req.user._id})
    .then((friend) => {
        if (friend) {
            for (var i = 0; i < req.body.length; i++)
                if (friend.friends.indexOf(req.body[i]._id) === -1)
                    friend.friends.push(req.body[i]._id);
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
            })
            .catch((err) => {
                return next(err);
            });
        }
        else {
            for (var i = 0; i < req.body.length; i++)
                if (friend.friends,indexOf(req.body[i]._id))
                    friend.friends.push(req.body[i]);
            friend.save()
            //Friends.create({"user": req.user._id, "friends": req.body})
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
            })
            .catch((err) => {
                return next(err);
            });
        }
    });
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /friends');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Friends.findOneAndRemove({"user": req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

friendRouter.route('/:friendId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200);})
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Friends.findOne({user: req.user._id})
    .then((friends) => {
        if (!friends) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "friends": friends});
        }
        else {
            if (friends.friends.indexOf(req.params.friendId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "friends": friends}); 
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "friends": friends});
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Requests.findOne({user: req.user._id})
    .then((request) => {
        if (request && request.requests.indexOf(req.params.friendId >= 0)) {
            Friends.findOne({user: req.user._id})
            .then((friend) => {
                if (friend) {            
                    if (friend.friends.indexOf(req.params.friendId) === -1) {
                        friend.friends.push(req.params.friendId)
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
                    Friends.create({"user": req.user._id, "friends": [req.params.friendId]})
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

            Friends.findOne({user: req.params.friendId})
            .then((friend) => {
                if (friend) {            
                    if (friend.friends.indexOf(req.user._id) === -1) {
                        friend.friends.push(req.user._id)
                        friend.save()
                        .then((friend) => {
                            Friends.findById(friend._id)
                            .populate('user')
                            .populate('friends')
                        }, (err) => next(err))
                    }
                }
                else {
                    Friends.create({"user": req.params.friendId, "friends": [req.user._id]})
                    .then((friend) => {
                        Friends.findById(friend._id)
                        .populate('user')
                        .populate('friends')
                    }, (err) => next(err))
                }
                
            }, (err) => next(err))
            .catch((err) => next(err));

            request.requests.splice(req.params.friendId, 1);
            request.save();
        }
        else {
            err = new Error('Request ' + req.params.friendId + ' not found');
            err.status = 404;
            return next(err); 
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /friends/' + req.params.friendId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Friends.findOne({user: req.user._id})
    .then((friend) => {
        if (friend) {            
            if (friend.friends.indexOf(req.params.friendId) >= 0) {
                friend.friends.splice(req.params.friendId, 1);
                friend.save()
                .then((friend) => {
                    Friends.findById(friend._id)
                    .populate('user')
                    .populate('friends')
                    .then((friend) => {
                        console.log('Friend deleted: ', friend);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(friend);
                    })
                }, (err) => next(err));
            }
            else {
                err = new Error('Friend ' + req.params.friendId + ' not found');
                err.status = 404;
                return next(err);
            }
        }
        else {
            err = new Error('Friends not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));

    Friends.findOne({user: req.params.friendId})
    .then((friend) => {
        if (friend) {            
            if (friend.friends.indexOf(req.user._id) >= 0) {
                friend.friends.splice(req.user._id, 1);
                friend.save()
                .then((friend) => {
                    Friends.findById(friend._id)
                    .populate('user')
                    .populate('friends')
                }, (err) => next(err));
            }
            else {
                err = new Error('Friend ' + req.user._id + ' not found');
                err.status = 404;
                return next(err);
            }
        }
        else {
            err = new Error('Friends not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = friendRouter;