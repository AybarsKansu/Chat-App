## 💬 Chat Application
A full-stack chat application where both frontend and backend are hosted in a single repository. The backend is built with Java Spring Boot and connects to a PostgreSQL database running in Docker, along with a pgAdmin container for managing the database visually.

## 🚀 Getting Started
### Prerequisites

Node.js and npm (for frontend)

JDK 17+ and Maven (for backend)

Docker (user must run PostgreSQL and pgAdmin manually)

## 🧭 Backend Setup
Go to the chat/ directory.

Configure your database connection in application.properties.

Example:

properties
spring.datasource.url=jdbc:postgresql://localhost:5432/your_database
spring.datasource.username=your_user
spring.datasource.password=your_password
Run the backend:

bash
mvn clean install
mvn spring-boot:run
## 📦 Frontend Setup
Go to the ChatApp-ui/ directory.

Install dependencies:

npm install

Start the development server:

npm run
## 🐳 Database
You need to manually run your own Docker setup for:

PostgreSQL (port 5432)

pgAdmin (port 5050)

Make sure your Spring Boot backend is configured to connect to your running PostgreSQL container.
