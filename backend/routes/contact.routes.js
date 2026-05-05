const router = require('express').Router();
const auth   = require('../middleware/auth.middleware');
const { submit, list } = require('../controllers/contact.controller');

router.post('/', submit);           // public — contact form
router.get('/',  auth, list);       // protected — admin view

module.exports = router;
