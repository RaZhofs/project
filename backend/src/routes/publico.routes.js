const { Router } = require('express');
const rsvpCtrl   = require('../controllers/rsvp.controller');

const router = Router();

router.post('/eventos/:id/rsvp',     rsvpCtrl.registrarRsvp);
router.get ('/eventos/:id/invitados', rsvpCtrl.getInvitados);

module.exports = router;
