const router = require('express').Router();
const {
    postTrack,
    deleteTracks,
    editTrack,
    enableNotifications
} = require('../controllers/track.controller');

router.route("/track").post(postTrack);
router.route("/delete/tracks").post(deleteTracks);
router.route("/track/:id").post(editTrack);
router.route("/notif/track/:id").post(enableNotifications);

module.exports = router;