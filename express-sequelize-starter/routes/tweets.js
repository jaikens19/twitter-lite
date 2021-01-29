const express = require('express')
const db = require("../db/models")
const router = express.Router()
const { check, validationResult } = require("express-validator");
const { Tweet } = db

const asyncHandler = (handler) => (req, res, next) => {
    handler(req, res, next)
    .catch(next)
}

const tweetNotFoundError = (id) => {
  const err = Error(`Tweet with id of ${id} could not be found.`);
  err.title = "Tweet not found.";
  err.status = 404;
  return err;
}

const validateTweet = [
    check("message")
        .exists({ checkFalsy: true })
        .withMessage("Tweet can't be empty."),
    check("message")
        .isLength({ max: 280 })
        .withMessage("Tweet can't be longer than 280 characters."),
];

const handleValidationErrors = (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        const errors = validationErrors.array().map((error) => error.msg);

        const err = Error("Bad request.");
        err.errors = errors;
        err.status = 400;
        err.title = "Bad request.";
        return next(err);
    }
    next();
};

router.get("/", asyncHandler(async(req, res) => {
    const tweets = await Tweet.findAll();
    res.json({ tweets });
}));

router.get('/:id(\\d+)', asyncHandler(async(req, res, next) => {
    const tweetId = parseInt(req.params.id, 10);
    const tweet = await Tweet.findByPk(tweetId);

    if (tweet) {
        res.json({ tweet });
    } else {
        next(tweetNotFoundError(tweetId));
    }
}))

router.post('/', validateTweet, handleValidationErrors, asyncHandler(async(req, res, next) => {
    const message = req.body.message
    const tweet = await Tweet.create({ message })
    res.json({ tweet })
}))

router.put('/:id(\\d+)', asyncHandler(async(req, res, next) => {
    const tweetId = parseInt(req.params.id, 10);
    const tweet = await Tweet.findByPk(tweetId);

    if (tweet) {
        await tweet.update({message: req.body.message})
        res.json({ tweet });
    } else {
        next(tweetNotFoundError(tweetId));
    }
}))

router.delete('/:id(\\d+)', asyncHandler(async(req, res, next) => {
    const tweetId = parseInt(req.params.id, 10);
    const tweet = await Tweet.findByPk(tweetId);

    if (tweet) {
        await tweet.destroy();
        res.status(204).end();
    } else {
        next(tweetNotFoundError(tweetId));
    }
}))








module.exports = router;