const Book = require("../models/Book");
const Bookings = require("../models/Bookings");
const moment = require("moment");

exports.getAllBooks = (req, res, next) => {
  const { page } = req.query;
  const booksPerPage = 10;
  Book.find()
    .countDocuments()
    .then((total) => {
      return total;
    })
    .then((totalBooks) => {
      Book.find()
        .limit((page - 1) * booksPerPage)
        .then((books) => {
          if (books.length === 0) {
            return res.render("index", {
              title: "All available books",
              path: "/books",
              books: null,
              noBooks: true,
              cart: req?.user?.cart,
            });
          }
          const finalPage = Math.ceil(totalBooks / booksPerPage);
          res.render("index", {
            title: "All available books",
            path: "/books",
            books: books,
            noBooks: false,
            cart: req?.user?.cart,
            pagination: {
              pageNext: page === 1 && page < finalPage,
              pagePrev: page > 1,
              totalPages: Math.ceil(finalPage),
              page: page,
              nextPage: page + 1,
              prevPage: page - 1,
            },
          });
        });
    })
    .catch((err) => {
      return next(err);
    });
};

exports.getProcessBookRegistration = (req, res, next) => {
  res.render("book-registration", {
    title: "Register a book",
    path: "/books/register",
    cart: req?.user?.cart,
  });
};

exports.getAllBookings = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/user/account");
  } else if (req.user.role !== "staff") {
    return res.status(422).redirect("/books");
  }
  Bookings.find()
    .then((bookings) => {
      const currentDate = moment().format("L");
      const newBookings = bookings.map((booking) => {
        return { ...booking, currentDate };
      });

      return res.render("bookings", {
        title: "All bookings",
        path: "/books/bookings",
        cart: req?.user?.cart,
        bookings: newBookings,
      });
    })
    .catch((err) => console.error(err));
};

exports.getNewBooking = (req, res, next) => {
  res.render("new-booking", {
    title: "New booking",
    path: "/books/bookings",
    cart: req?.user?.cart,
  });
};

exports.getBookDetails = (req, res, next) => {
  const { bookId } = req.params;
  const { editMode } = req.query;

  // this is for getting the specific details
  if (!editMode) {
    return Book.findById(bookId).then((book) => {
      if (!book) {
        return res.status(404).render("404.pug", {
          message: "Book not found",
          cart: req?.user?.cart,
        });
      }
      return res.render("book.pug", {
        title: "Book for now",
        path: "/books",
        book: book,
        cart: req?.user?.cart,
      });
    });
  }

  // this is for going to the book edit mode
  else {
    return Book.findById(bookId).then((book) => {
      if (!book) {
        return res
          .status(404)
          .render("404.pug", { message: "Book not found", user: req?.user });
      }
      return res.render("edit-book.pug", {
        title: `Edit book ${bookId}`,
        path: "/books/register",
        book: book,
        cart: req?.user?.cart,
      });
    });
  }
};

/* The following routes are for managing post requests */

exports.postProcessBookRegistration = (req, res, next) => {
  const { title, author, pub, isbn, size, position, description } = req.body;
  const image = req.file;

  if (!image) {
    return res.status(422).redirect("/books/register");
  }

  const imageUrl = "/" + image.path;
  const newBook = new Book({
    name: title,
    image: imageUrl,
    author: author,
    ISBN: isbn,
    publishedDate: pub,
    shelfNumber: position,
    amountAvailable: size,
    description: description,
  });

  newBook
    .save()
    .then((result) => {
      res.status(201).redirect("/books");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditBook = (req, res, next) => {
  const { bookId, title, author, pub, isbn, size, position, description } =
    req.body;
  const image = req.file;

  console.log(image);

  if (!image) {
    return res.status(422).redirect("/books/register");
  }

  const imageUrl = image.path;
  Book.updateOne(
    { _id: bookId },
    {
      name: title,
      image: imageUrl,
      author: author,
      ISBN: isbn,
      publishedDate: pub,
      shelfNumber: position,
      amountAvailable: size,
      description: description,
    }
  )
    .then((data) => {
      res.redirect(`/books/${bookId}`);
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.postDeleteBook = (req, res, next) => {
  const { bookId } = req.body;
  Book.findByIdAndDelete(bookId)
    .then((result) => {
      res.redirect("/books");
    })
    .catch((err) => console.error(err));
};

exports.postHandleDeleteBooking = (req, res, next) => {
  const { bookingId } = req.body;
  Bookings.findByIdAndDelete(bookingId)
    .then((results) => {
      res.redirect("/books/bookings");
    })
    .catch((err) => console.error(err));
};
