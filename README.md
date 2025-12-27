# Co-Garage

A marketplace web application where automotive shops can list available service bays and individuals can browse, book, and rent them.

## Project Structure

This is a monorepo containing:

- `backend/` - Rails 7.1 API-only application
- `frontend/` - React (Vite) with TypeScript and Tailwind CSS

## Tech Stack

### Backend
- **Framework**: Ruby on Rails 7.1 (API-only)
- **Database**: PostgreSQL
- **Authentication**: JWT (bcrypt for password hashing)
- **Testing**: RSpec

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios

## Prerequisites

Before you begin, ensure you have the following installed:

- **Ruby 3.2.2** - Check with `ruby -v`
- **PostgreSQL** - Check with `psql --version`
- **Node.js 18+** - Check with `node -v`
- **npm or yarn** - Check with `npm -v`

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Ruby dependencies:
   ```bash
   bundle install
   ```

3. Create the PostgreSQL database:
   ```bash
   rails db:create
   ```

4. Run database migrations (when available):
   ```bash
   rails db:migrate
   ```

5. Start the Rails server:
   ```bash
   rails server
   ```

The API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory (in a new terminal):
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Development Workflow

1. Start PostgreSQL (if not running as a service)
2. Start the backend server (Terminal 1): `cd backend && rails server`
3. Start the frontend dev server (Terminal 2): `cd frontend && npm run dev`
4. Open your browser to `http://localhost:5173`

## Project Status

🚧 **In Development** - This project is currently being built incrementally.

## Features (Planned)

- User authentication (shop owner / renter roles)
- Automotive shop CRUD operations
- Bay listing with availability
- Booking system
- Pricing per hour

## License

This project is private and proprietary.

# Co-Garage
