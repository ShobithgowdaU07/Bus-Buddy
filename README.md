# BUS BUDDY: Bus Ticket Reservation System

A role-based web application for online bus seat booking (CSC203B Software Development Fundamentals, Part A).

## Features
- **Passenger portal:** dashboard, search and book with a live seat map, my bookings, cancellation with 80% refund, notifications, profile
- **Admin console:** operations overview with insights, manage buses, all bookings, reports and analytics (charts)
- Registration and login with role-based access (passwords stored as SHA-256 hashes)
- Input validation and double-booking prevention
- Pure HTML, CSS and JavaScript. No install and no server needed. Data is kept in the browser (localStorage).

## Demo accounts
| Role | Email | Password |
|---|---|---|
| Passenger | demo@routerider.com | Demo@123 |
| Admin | admin@routerider.com | Admin@123 |

## Run in VS Code
1. Open the `BUS BUDDY` folder in VS Code.
2. Right-click `index.html` and choose **Open with Live Server**. (Double-clicking `index.html` also works.)
3. Run the automated tests with Node.js: `node test_core.js`

## Project structure
```
BUS BUDDY/
├── index.html          # page shell
├── css/style.css       # blue and teal design
├── js/core.js          # business logic
├── js/app.js           # screens and navigation
├── test_core.js        # automated test cases
└── docs/diagrams/
```

## Push to GitHub and publish
```
git init
git add .
git commit -m "RouteRider bus ticket reservation system"
git branch -M main
git remote add origin https://github.com/<your-username>/RouteRider.git
git push -u origin main
```
Then on GitHub: **Settings > Pages > Deploy from a branch > main / (root) > Save**. Your site will be live at `https://<your-username>.github.io/RouteRider/`.

## Note
This is a front-end prototype: data lives only in each browser and password hashing is client-side. A production system would use a server and database (for example Node.js with PostgreSQL), salted password hashing and a payment gateway.
