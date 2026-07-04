# RailBoard — Train Ticket Booking System

A full-stack train booking system:
- **Backend:** Spring Boot 3 (Java 17), REST API
- **Database:** MongoDB
- **Frontend:** Plain HTML, CSS, JS (served as static files by Spring Boot — no separate frontend server needed)

## Features

- Search trains by source/destination (sample data seeded automatically)
- Live "departure board" style results with seat availability
- Book tickets for multiple passengers, auto-generated PNR and seat numbers
- Retrieve a booking by PNR or by email, view it as a visual ticket stub
- Cancel a booking (releases seats back to the train)

## Prerequisites

- Java 17+
- Maven 3.6+
- MongoDB running locally on `mongodb://localhost:27017` (or update the URI)

## Project structure

```
train-booking-system/
├── pom.xml
├── src/main/java/com/trainbooking/
│   ├── TrainBookingApplication.java
│   ├── config/          # CORS config + sample-data seeder
│   ├── model/            # Train, Booking, Passenger documents
│   ├── repository/       # Spring Data MongoDB repositories
│   ├── service/          # Business logic (search, booking, cancellation)
│   └── controller/       # REST controllers (/api/trains, /api/bookings)
└── src/main/resources/
    ├── application.properties
    └── static/            # index.html, css/style.css, js/app.js
```

## Running it

1. **Start MongoDB** (if not already running):
   ```bash
   mongod --dbpath /path/to/your/data/db
   ```
   Or use a MongoDB Atlas connection string — just edit
   `src/main/resources/application.properties`:
   ```properties
   spring.data.mongodb.uri=mongodb://localhost:27017/trainbooking
   ```

2. **Run the Spring Boot app:**
   ```bash
   cd train-booking-system
   mvn spring-boot:run
   ```
   On first startup, 10 sample trains are automatically seeded into the
   `trains` collection (only if the collection is empty).

3. **Open the app:**
   Go to [http://localhost:8080](http://localhost:51438) in your browser.
   The HTML/CSS/JS frontend is served directly from Spring Boot's
   `static` folder, so there's nothing else to start.

## API reference

| Method | Endpoint                          | Description                          |
|--------|------------------------------------|---------------------------------------|
| GET    | `/api/trains`                      | List all trains                       |
| GET    | `/api/trains/{id}`                 | Get a single train                    |
| GET    | `/api/trains/search?source=&destination=` | Search trains between two stations |
| POST   | `/api/trains`                      | Add a new train                       |
| PUT    | `/api/trains/{id}`                 | Update a train                        |
| DELETE | `/api/trains/{id}`                 | Delete a train                        |
| POST   | `/api/bookings`                    | Create a booking (see payload below)  |
| GET    | `/api/bookings/{pnr}`              | Get a booking by PNR                  |
| GET    | `/api/bookings/user/{email}`       | List bookings for an email            |
| DELETE | `/api/bookings/{pnr}`              | Cancel a booking                      |

### Sample booking payload

```json
{
  "userName": "Asha Rao",
  "userEmail": "asha@example.com",
  "trainId": "<train id from search results>",
  "journeyDate": "2026-07-20",
  "passengers": [
    { "name": "Asha Rao", "age": 29, "gender": "F" },
    { "name": "Kiran Rao", "age": 32, "gender": "M" }
  ]
}
```

## Notes / next steps for production use

- There's no authentication yet — anyone can look up bookings by email/PNR.
  Add Spring Security + JWT if this needs to be internet-facing.
- Seat allocation uses a simple synchronized service method, which is fine
  for a demo but should be replaced with an atomic MongoDB
  `findOneAndUpdate` (with a seat-count guard) under real concurrent load.
- Add pagination to `/api/trains` and `/api/bookings/user/{email}` once
  the data set grows.
