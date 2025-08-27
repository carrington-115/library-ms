const Book = require("../models/Book");
const Order = require("../models/orders");
const Booking = require("../models/Bookings");

exports.getUserOrders = (req, res, next) => {
  const { userId } = req.params;
  if (!req.user) {
    return res.status(422).redirect("/user/account");
  } else if (req.user.role === "staff") {
    return res.status(422).redirect("/books");
  }

  Order.find({ userId: userId })
    .then((orders) => {
      if (orders.length < 1) {
        return res.render("orders", {
          title: `${req.user.name} orders`,
          path: `/users/${userId}/orders`,
          orders: [],
        });
      }

      // make it work for multiple orders
      const bookingIds = orders.map((order) => {
        return order.bookId;
      });

      Booking.find({
        _id: {
          $in: bookingIds,
        },
      }).then((bookings) => {
        const allCarts = bookings.map((booking) => {
          return booking.cart;
        });
        // for each cart pull the _id
        let testSet = [];
        allCarts.forEach((cart) => {
          const thisCart = cart.map((c) => {
            return c._id;
          });
          testSet = [...testSet, ...thisCart];
        });

        Book.find({
          _id: {
            $in: testSet,
          },
        }).then((allBooks) => {
          let updatedOrders = allBooks.map((book) => {
            return {
              orderId: null,
              book: book,
            };
          });
          for (let i = 0; i < updatedOrders.length; i++) {
            updatedOrders[i].orderId = bookingIds[i];
          }

          return res.render("orders", {
            title: `${req.user.name} orders`,
            path: `/users/${userId}/orders`,
            orders: updatedOrders,
          });
        });
      });
    })
    .catch((err) => {
      console.error(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.postDeleteOrders = (req, res, next) => {};

exports.postGetOrderInvoice = (req, res, next) => {};
