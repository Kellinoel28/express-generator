const express = require('express')
const Favorite = require('../models/favorite')
const authenticate = require('../authenticate')
const cors = require('./cors')

const favoriteRouter = express.Router();

favoriteRouter.route('/')

    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser,  (req, res, next) => {
        Favorite.find({
            user: req.user._id
        })
            .populate('user')
            .populate('campsites')
            .then(favorites => {
                console.log('Favorites retrieved successfully:', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));

    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    for (let i = 0; i < req.body.length; i++) {
                        if (favorite.campsites.indexOf(req.body[i]._id) === -1) {
                            favorite.campsites.push(req.body[i]._id);
                        }
                        else {
                            console.log(`Campsite ${req.body[i]._id} is already in your favorites.`);
                        }
                    }
                    favorite.save()
                        .then(favorites => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        })

                } else {
                    Favorite.create({ user: req.user._id, campsites: req.body })
                        .then(favorite => {
                            console.log('Favorite added', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /favorites`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then(favorites => {
                if (favorites) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites)
                } else {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'text/plain')
                    res.end('You do not have any favorites to delete')
                }
            })
    })





favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorites => {
                if (favorites) {
                    if (favorites.campsites.includes(req.params.campsiteId)) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'text/plain');
                        res.send('Campsite already in your favorites.');
                    } else {
                        favorites.campsites.push(req.params.campsiteId);
                        favorites.save()
                            .then(favorites => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorites);
                            })
                    }
                } else {
                    Favorite.create({ user: req.user._id, campsites: req.body })
                        .then(favorite => {
                            console.log('Favorite added', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
    })

     /*.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    favorite.campsites = favorite.campsites.filter(campsite => campsite !== req.params.campsiteId);
    
                    favorite.save()
                        .then(updatedFavorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(updatedFavorite);
                        })
                        .catch(err => next(err));
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('You do not have any favorites to delete.');
                }
            }) 

            .catch(err => next(err));
    }); */

    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    const campsiteIndex = favorite.campsites.indexOf(req.params.campsiteId);

                    if (campsiteIndex !== -1) {
                        favorite.campsites.splice(campsiteIndex, 1);
                        favorite.save()
                            .then(updatedFavorite => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(updatedFavorite);
                            })
                            .catch(err => next(err));
                    } else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'text/plain');
                        res.end('Campsite not found in your favorites.');
                    }
                } else {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('Favorite document not found.');
                }
            })
            .catch(err => next(err));
    });



module.exports = favoriteRouter;