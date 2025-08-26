const express = require("express");
const { body } = require("express-validator");
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
  getUserOrders,
} = require("./controllers/accountController");
const isAuth = require("./middleware/is-auth");
const User = require("./models/User");

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
Router.get("/user/:userId/orders", getUserOrders);

// Router.post("/books/register", postSomeTest);
Router.post(
  "/books/register/new",
  [
    body("title", "Enter a valid book name").isLength({ min: 10 }),
    body("author", "Enter a valid author name")
      .isEmpty()
      .isLength({ min: 10, max: 100 }),
    body("pub")
      .isEmpty()
      .isDate()
      .withMessage("Enter a valid value for the date"),
    body("isbn", "Enter a valid isbn number").isEmpty().isAlphanumeric().trim(),
  ],
  postProcessBookRegistration
);
Router.post("/books/delete", postDeleteBook);
Router.post(
  "/books/edit",
  [
    body("title", "Enter a valid book name").isLength({ min: 10 }),
    body("author", "Enter a valid author name")
      .isEmpty()
      .isLength({ min: 10, max: 100 }),
    body("pub")
      .isEmpty()
      .isDate()
      .withMessage("Enter a valid value for the date"),
    body("isbn", "Enter a valid isbn number").isEmpty().isAlphanumeric().trim(),
  ],
  postEditBook
);
Router.post(
  "/user/account",
  [
    body("email")
      .isEmail()
      .withMessage("Enter a valid email address")
      .custom((value, { req }) => {
        User.findOne({ emailId: req.body.email })
          .then((user) => {
            if (user) {
              return Promise.reject("This email already exist. Try another");
            }
          })
          .catch((err) => console.error(err));
        return true;
      }),
    body("password")
      .isLength({ min: 6, max: 16 })
      .withMessage("Enter a valid password minimum 6 and max 16 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Your passwords do not match");
      }
      return true;
    }),
  ],
  postSignUpToAccount
);
Router.post(
  "/user/login",
  // [
  //   body("email").isEmail().withMessage("Enter a valid email address"),
  //   body("password", "Enter a valid Password")
  //     .isLength({ min: 6, max: 16 })
  //     .isEmpty(),
  // ],
  postLoginToAccount
);
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
