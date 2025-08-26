const User = require("../models/User");
const Book = require("../models/Book");
const moment = require("moment");
const Bookings = require("../models/Bookings");
const Order = require("../models/orders");

exports.getAllCartItems = (req, res, next) => {
  const user = req?.user;

  if (!user) {
    return res.redirect("/user/account");
  } else if (req.user.role !== "student") {
    return res.status(422).redirect("/user/account");
  }
  return User.findById(req?.user?._id)
    .then((user) => {
      const cartItems = user.cart.map((item) => {
        return item._id;
      });

      Book.find({
        _id: {
          $in: cartItems,
        },
      }).then((cart) => {
        const dates = {
          bookDate: moment().format("L"),
          returnDate: moment().add(16, "days").calendar(),
        };

        res.render("cart", {
          title: "Cart",
          path: "/cart",
          cart: cart,
          bookDate: dates.bookDate,
          returnDate: dates.returnDate, // assume that the return date is plus 16 days
        });
      });
    })
    .catch((err) => console.error(err));
};

exports.postAddBookToCart = (req, res, next) => {
  const { bookId } = req.body;
  const cartBook = { _id: bookId, qty: 1 };
  User.findById(req?.user?._id)
    .then((user) => {
      const cart = user.cart;
      const bookInCart = cart.find((cartItem) => cartItem._id == bookId);
      if (bookInCart) {
        console.log("Book is already in cart.");
        res.redirect("/cart");
      } else {
        User.findByIdAndUpdate(
          req.user._id,
          {
            $push: { cart: cartBook },
          },
          {
            new: true,
          }
        ).then((result) => {
          console.log("Book has been added to the cart");
          res.redirect("/cart");
        });
      }
    })
    .catch((err) => console.error(err));
};

exports.postDeleteBookFromCart = (req, res, next) => {
  const { bookId } = req.body;
  User.findByIdAndUpdate(req?.user?._id).then((user) => {
    const cart = user.cart;
    const updatedCart = cart.filter((cartItem) => {
      return cartItem._id != bookId;
    });
    User.updateOne(
      { _id: req?.user?._id },
      {
        cart: updatedCart,
      }
    )
      .then((result) => {
        res.redirect("/cart");
      })
      .catch((err) => console.error(err));
  });
};

exports.postCheckOutCart = (req, res, next) => {
  const booking = new Bookings({
    cart: req?.user?.cart,
    bookingDate: moment().format("L"),
    returnDate: moment().add(16, "days").calendar(),
    userId: req?.user?.uid,
    username: req?.user?.name,
    email: req?.user?.emailId,
    faculty: req?.user?.faculty,
    department: req?.user?.department,
  });

  // want to make sure that when the items in the cart
  // checked out the items go the orders

  booking
    .save()
    .then((result) => {
      const bookId = result._id;
      const userId = req.user._id;
      const order = Order({
        userId,
        bookId,
      });
      order.save();
      return User.findByIdAndUpdate(req?.user?._id, {
        cart: [],
      });
    })
    .then((data) => {
      console.log(data);
      return res.redirect("/books");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
