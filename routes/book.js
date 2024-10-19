var express = require('express');
var router = express.Router();
const bookController = require('../controllers/bookController');

/* GET users listing. */
router.get('/books', bookController.getAllBooks);
router.post('/books', bookController.createBook);
router.get('/books/:id', bookController.getBook);

module.exports = router;
