const express = require("express");
const { Router } = require("express");
const router = Router(); 

const Book = require('../models/book.model');

// MIDDLEWARE
const getBook = async(req, res ,next) => {
  let book;
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA]{24}$/)) {
    return res.status(404).json(
      {
        message: 'El id del libro no es valido'
      }
    )
  }

  try {
    book = await Book.findById(id)
    if (!book){
      return res.status(404).json(
        {
          message: 'El libro no fue encontrado'
        }
      )
    }
  } catch (error) {
    res.status(500).json(
      {
        message: error.message
      }
    )
  }

  res.book = book;
  next()
}

// Obtener todos los libros [GET ALL]
router.get('/', async(req, res) => {
  try {
    const books = await Book.find()
    console.log('GET ALL', books);

    if (books.length == 0) {
      return res.status(204).json([])
    }
    res.json(books)

  } catch (error) {
    res.status(500).json({message: error.message})
  }
})

// Crear un nuevo libro (recurso) [POST]
router.post('/', async(req, res) => {
  const { title, author, gender, publication_date} = req?.body

  if (!title || !author || !gender || !publication_date) {
    return res.status(400).json({message: 'Los campos son necesarios'})
  }

  const book = new Book(
    {
      title, 
      author, 
      gender, 
      publication_date
    }
  )

  try {
    const newBook = await book.save()
    console.log(newBook);
    res.status(201).json(newBook)
  } catch (error) {
    res.status(400).json({message: error.message})
  }
})

router.get('/:id', getBook, async(req, res) => {
  res.json(res.book)
})

router.put('/:id', getBook, async(req, res) => {
  try {
    const book = res.book
    book.title = req.body.title || book.title
    book.author = req.body.author || book.author
    book.gender = req.body.gender || book.gender
    book.publication_date = req.body.publication_date || book.publication_date;

    const updatedBook = await book.save()
    res.json(updatedBook)

  }catch (error) {
    res.status(400).json({message: error.message})
  }
})

router.patch('/:id', getBook, async(req, res) => {
  if (!req.body.title && !req.body.author && !req.body.gender && !req.body.publication_date ) {
    res.status(400).json({message: 'almenos unos de los campos debe ser enviado'})
  }

  try {
    const book = res.book
    book.title = req.body.title || book.title
    book.author = req.body.author || book.author
    book.gender = req.body.gender || book.gender
    book.publication_date = req.body.publication_date || book.publication_date;

    const updatedBook = await book.save()
    res.json(updatedBook)

  }catch (error) {
    res.status(400).json({message: error.message})
  }
})

router.delete('/:id', getBook, async(req, res) => {
  try {
    const book = res.book
    await book.deleteOne({
      _id: book._id
    })
    res.json({
      message: 'El libro fue eliminado correctamente'
    })
  } catch (error) {
    res.status(500).json({message: error.message})
  }
})

module.exports = router