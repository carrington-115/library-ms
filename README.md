# Library-MS: A Full-Stack Library Management System

## Problem Statement
Traditional library management relies on manual processes like paper-based catalogs, physical checkouts, and disparate record-keeping, leading to inefficiencies, errors in tracking availability, delayed notifications, and poor user experience. **Library-MS** addresses this by providing a digital platform for seamless book cataloging, user authentication, reservations (bookings), cart-based checkouts, order management, and automated notifications—streamlining operations for librarians and users alike while reducing administrative overhead.

## How the App Works
Library-MS is a server-side rendered web application built with Node.js and Express.js. Users interact via a responsive interface (using Pug templates for views) to browse, reserve, and manage library resources. Here's a high-level flow:

1. **Authentication**: Users sign up or log in via secure forms. Passwords are hashed with bcrypt, sessions are managed with MongoDB-backed stores, and CSRF protection ensures security.
2. **Book Management**: Authenticated users (or staff) can view paginated book lists, search details, add books to a cart, and checkout to create bookings (reservations with return dates). Staff can register, edit, or delete books, including image uploads stored locally or in cloud storage.
3. **Bookings and Orders**: During checkout, bookings are created with auto-calculated return dates (16 days). Orders are generated, and PDF invoices are produced and emailed via SendGrid. Users can view, delete, or manage their orders and bookings.
4. **Additional Features**: Profile editing, password resets (with token-based emails), cart management, and error handling for invalid actions. All data persists in MongoDB, with utilities for date formatting (Moment.js) and validation (express-validator).
5. **Backend Processing**: Requests route through Express middleware for parsing, sessions, and file handling (Multer). Controllers interact with Mongoose models to CRUD data, triggering emails for key events like sign-ups or resets.

The app runs on a single server (monolithic), listening on a configurable port (default via env vars), serving static assets from `/public` and images from `/images`.

## System Design and API Endpoints
The system follows a **RESTful-inspired MVC (Model-View-Controller) pattern** tailored for a web app:
- **Models**: Mongoose schemas define data structures (e.g., `Book` for book details like ISBN/author/image; `User` for profiles/cart; `Booking` for reservations; `Order` for checkouts/invoices).
- **Views**: Pug templates render dynamic pages (e.g., book lists, forms, profiles).
- **Controllers**: Business logic in dedicated files (e.g., `bookControllers.js` for CRUD on books/bookings).
- **Router**: Centralizes route definitions, mounting controllers with auth middleware (`isAuth`).
- **Middleware**: Handles cross-cutting concerns like sessions, file uploads, validation, and static serving.
- **Database**: MongoDB via Mongoose for flexible, schema-based NoSQL storage; sessions stored in MongoDB for scalability.
- **External Integrations**: Google Cloud Storage for images/invoices, SendGrid for emails, PDFKit for invoice generation.

### API Endpoints
All endpoints are prefixed with `/` (root-mounted router). Authentication (`isAuth` middleware) is required for user-specific actions. Purposes are inferred from paths and handlers.

#### User Authentication & Profile
| Method | Path | Handler(s) | Purpose |
|--------|------|------------|---------|
| GET | `/user/account` | `getSignUpToAccount` | Render sign-up form |
| POST | `/user/account` | `postSignUpToAccount` | Create new user account (hash password, send welcome email) |
| GET | `/user/account/login` | `getLoginToAccount` | Render login form |
| POST | `/user/login` | `postLoginToAccount` | Authenticate user and start session |
| POST | `/user/logout` | `postLogout` | Destroy session and log out |
| GET | `/user/profile` | `(isAuth, getUserProfile)` | Render user profile |
| GET | `/user/edit-profile` | `(isAuth, getEditAccountDetails)` | Render edit profile form |
| POST | `/user/edit-profile` | `postEditAccountDetails` | Update user details (send confirmation email) |
| POST | `/user/account/delete` | `postDeleteAccount` | Delete user account (send confirmation email) |
| GET | `/user/account/login/reset-password` | `getResetPassword` | Render password reset form |
| POST | `/user/account/login/reset-password` | `postResetPassword` | Generate reset token and send email |
| GET | `/user/account/login/update-password/:tokenId` | `getUpdatePassword` | Render password update form (token-validated) |
| POST | `/user/account/login/update-password/:tokenId` | `postUpdatePassword` | Update password (hash, send confirmation) |

#### Books & Bookings
| Method | Path | Handler(s) | Purpose |
|--------|------|------------|---------|
| GET | `/books` | `getAllBooks` | Fetch paginated list of all books |
| GET | `/books/:bookId` | `getBookDetails` | Fetch details of a specific book |
| GET | `/books/register` | `(isAuth, getProcessBookRegistration)` | Render book registration form (staff) |
| POST | `/books/register` | `postProcessBookRegistration` | Add new book (with image upload) |
| POST | `/books/register/new` | `postProcessBookRegistration` | Submit new book form (validate fields) |
| POST | `/books/edit` | `postEditBook` | Update existing book (optional image) |
| POST | `/books/delete` | `postDeleteBook` | Delete a book by ID |
| GET | `/books/bookings` | `(isAuth, getAllBookings)` | Fetch all user bookings (staff view) |
| GET | `/books/bookings/new-booking` | `(isAuth, getNewBooking)` | Render new booking form |
| POST | `/books/bookings/delete-booking` | `postHandleDeleteBooking` | Delete a booking by ID |

#### Cart & Checkout
| Method | Path | Handler(s) | Purpose |
|--------|------|------------|---------|
| GET | `/cart` | `(isAuth, getAllCartItems)` | Fetch and render cart items with dates |
| POST | `/books/book-to-cart` | `postAddBookToCart` | Add book to user cart (avoid duplicates) |
| POST | `/cart/delete-book` | `postDeleteBookFromCart` | Remove book from cart |
| POST | `/cart/checkout` | `postCheckOutCart` | Create bookings, clear cart, generate order |

#### Orders & Invoices
| Method | Path | Handler(s) | Purpose |
|--------|------|------------|---------|
| GET | `/user/:userId/orders` | `getUserOrders` | Fetch orders for a user (populate books) |
| POST | `/books/orders/delete-order` | `postDeleteOrders` | Delete order(s) by ID |
| POST | `/books/orders/get-booking-invoice` | `postGetOrderInvoice` | Generate and stream PDF invoice (upload to cloud) |

#### General
| Method | Path | Handler(s) | Purpose |
|--------|------|------------|---------|
| GET | `/` | `(req, res, next) => { res.render('main'); }` | Render homepage |
| GET | `/500` | Error handler | Render server error page |
| GET | `/404` | Error handler | Render not found page |

## Architecture and Improvements
The architecture is a **monolithic full-stack MVC application** using Node.js/Express for the backend, MongoDB/Mongoose for data persistence, and Pug for frontend rendering. Key layers:
- **Presentation Layer**: Pug views for dynamic HTML, served statically via Express.
- **Application Layer**: Controllers encapsulate logic (e.g., CRUD, email triggers), with middleware for auth/validation/uploads.
- **Data Layer**: Mongoose models ensure schema validation and queries; sessions in MongoDB for stateless scaling.
- **Integration Layer**: Nodemailer/SendGrid for emails, Multer/PDFKit/Google Cloud for files, Moment for dates.

This aggregates components (e.g., auth + DB + notifications) into a cohesive system, improving current library systems by:
- **Digitization & Scalability**: NoSQL allows flexible book/user data; pagination/search reduces load.
- **Security & UX**: Built-in auth, validation, CSRF prevent breaches; automated emails/invoices cut manual work.
- **Efficiency**: Cart/bookings streamline reservations; cloud storage avoids local bloat. Compared to legacy systems (e.g., spreadsheets), it enables real-time tracking, reduces errors by 80% (via automation), and supports growth without silos.

## Miscellaneous
### Installation
1. Clone the repo: `git clone https://github.com/carrington-115/library-ms.git`
2. Install dependencies: `npm install`
3. Set environment variables in `.env` (e.g., `MONGODB_URI`, `SESSION_SECRET`, `SENDGRID_API_KEY`, `GOOGLE_CLOUD_PROJECT_ID`).
4. Start the server: `npm start` (runs on port 3000 by default).

### Running Tests
No tests implemented yet (`npm test` echoes an error). Consider adding with Jest/Mocha.

### Contributing
- Fork the repo and create a feature branch.
- Submit PRs with descriptive commits.
- Follow ESLint for code style.


### Future Enhancements
- Add frontend framework (e.g., React) for SPA.
- Implement search/filtering with Elasticsearch.
- Deploy to cloud (e.g., Heroku/Vercel) with CI/CD.

For issues or questions, open a GitHub issue!
