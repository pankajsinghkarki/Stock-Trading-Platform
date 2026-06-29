# Stock Trading Platform

A full-stack stock trading platform inspired by Zerodha. The project includes a public landing website, an authenticated trading dashboard, and an Express/MongoDB backend for auth, holdings, positions, and orders.

## Project Structure

```text
.
├── backend/     # Express API, MongoDB models, auth, orders, holdings
├── dashboard/   # Protected React dashboard for trading workflow
├── frontend/    # Public React landing website
└── README.md
```

## Features

- User signup and login with JWT authentication
- Protected dashboard routes using bearer tokens
- Holdings, positions, and orders APIs
- Create, read, update, and delete order endpoints
- Public landing pages for home, products, pricing, about, signup, and support
- Deployment-ready environment variable setup
- Backend unit tests with Jest

## Tech Stack

- Frontend: React, React Router, Bootstrap/CSS
- Dashboard: React, Material UI, Chart.js, Axios
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT, bcryptjs
- Testing: Jest


## License

This project is for learning and portfolio use.
