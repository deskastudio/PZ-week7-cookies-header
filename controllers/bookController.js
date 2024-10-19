const Book = require('../models/book');

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createBook = async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    year: req.body.year
  });

  try {
    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book == null) {
      return res.status(404).json({ message: 'Buku tidak ditemukan' });
    }
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
