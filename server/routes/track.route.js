const router = require('express').Router();
const {
    postTrack,
    deleteTracks,
} = require('../controllers/track.controller');

router.route("/track").post(postTrack);
router.route("/delete/tracks").post(deleteTracks);

module.exports = router;