const router = require('express').Router();
const {
    postTrack,
    deleteTracks,
    editTrack
} = require('../controllers/track.controller');

router.route("/track").post(postTrack);
router.route("/delete/tracks").post(deleteTracks);
router.route("/track/:id").post(editTrack);

module.exports = router;