# Alumni Tracking System

This is a comprehensive Alumni Tracking System designed to manage, connect, and engage with university/school alumni. The platform provides a centralized hub for tracking alumni data, fostering networking opportunities, and maintaining strong relationships between the institution and its graduates.

## 🚀 Technologies Used

This project is built using a modern, full-stack architecture and is fully containerized for easy deployment and development.

*   **Frontend:** HTML5, CSS3, Vanilla JavaScript
*   **Backend:** Node.js
*   **Database:** PostgreSQL
*   **Containerization:** Docker & Docker Compose

## ✨ Key Features (Planned/Implemented)

*   **Alumni Profiles:** Detailed profiles for each alumnus, including contact information, graduation year, current employment, and location.
*   **Directory Search:** Easy-to-use search and filtering capabilities to find specific alumni.
*   **Data Management:** Secure backend API for creating, reading, updating, and deleting alumni records.
*   **Responsive Design:** A clean, accessible, and responsive user interface built with standard web technologies.

## 🐳 Getting Started with Docker

The easiest way to get the project up and running is by using Docker. This ensures that the application runs in a consistent environment regardless of your local setup.

### Prerequisites

*   [Docker](https://docs.docker.com/get-docker/) installed on your machine.
*   [Docker Compose](https://docs.docker.com/compose/install/) installed (usually comes with Docker Desktop).

### Running the Application

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-repository-directory>
    ```

2.  **Start the containers:**
    Run the following command in the root directory of the project:
    ```bash
    docker-compose up --build
    ```
    *(Note: Add the `-d` flag (`docker-compose up -d --build`) to run the containers in detached mode / in the background.)*

3.  **Access the application:**
    *   **Frontend:** Open your browser and navigate to `http://localhost:<frontend-port>` (Replace `<frontend-port>` with the actual port defined in your docker-compose, e.g., 80 or 8080).
    *   **Backend API:** The API will be accessible at `http://localhost:<backend-port>` (e.g., 3000).
    *   **Database:** PostgreSQL will be running on `localhost:5432`.

### Stopping the Application

To stop the running containers, press `Ctrl+C` in the terminal where `docker-compose up` is running. If you ran it in detached mode, use:
```bash
docker-compose down
```

## 📁 Project Structure

```text
├── frontend/          # HTML, CSS, and JS files
├── backend/           # Node.js source code, routes, and controllers
├── db/                # PostgreSQL initialization scripts or schema
├── docker-compose.yml # Docker Compose configuration
└── README.md          # Project documentation
```
