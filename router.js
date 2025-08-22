const express = require("express");
const {} = require('express-validator/check')
const Router = express.Router();
const {
  getAllBooks,
  getProcessBookRegistration,
  getAllBookings,
  getNewBooking,
  postProcessBookRegistration,
  getBookDetails,
  postDeleteBook,
  postEditBook,
  postHandleDeleteBooking,
} = require("./controllers/bookControllers");
const {
  getAllCartItems,
  postAddBookToCart,
  postCheckOutCart,
  postDeleteBookFromCart,
} = require("./controllers/cartController");
const {
  getSignUpToAccount,
  getLoginToAccount,
  postSignUpToAccount,
  postLoginToAccount,
  getUserProfile,
  getEditAccountDetails,
  postEditAccountDetails,
  postDeleteAccount,
  postLogout,
  getResetPassword,
  postResetPassword,
  getUpdatePassword,
  postUpdatePassword,
} = require("./controllers/accountController");
const isAuth = require("./middleware/is-auth");

Router.get("/", (req, res, next) => {
  res.render("main");
});
Router.get("/books", getAllBooks);
Router.get("/books/register", isAuth, getProcessBookRegistration);
Router.get("/books/bookings", isAuth, getAllBookings);
Router.get("/books/bookings/new-booking", isAuth, getNewBooking);
Router.get("/cart", isAuth, getAllCartItems);
Router.get("/user/account", getSignUpToAccount);
Router.get("/user/account/login", getLoginToAccount);
Router.get("/books/:bookId", getBookDetails);
Router.get("/user/profile", isAuth, getUserProfile);
Router.get("/user/edit-profile", isAuth, getEditAccountDetails);
Router.get("/user/account/login/reset-password", getResetPassword);
Router.get("/user/account/login/update-password/:tokenId", getUpdatePassword);

// post configurations
Router.post("/books/register", postProcessBookRegistration);
Router.post("/books/delete", postDeleteBook);
Router.post("/books/edit", postEditBook);
Router.post("/user/account", postSignUpToAccount);
Router.post("/user/login", postLoginToAccount);
Router.post("/user/edit-profile", postEditAccountDetails);
Router.post("/user/delete-profile", postDeleteAccount);
Router.post("/books/book-to-cart", postAddBookToCart);
Router.post("/cart/delete-book", postDeleteBookFromCart);
Router.post("/cart/checkout", postCheckOutCart);
Router.post("/books/bookings/delete-booking", postHandleDeleteBooking);
Router.post("/user/logout", postLogout);
Router.post("/user/account/login/reset-password", postResetPassword);
Router.post("/user/account/login/update-password", postUpdatePassword);

module.exports = Router;
