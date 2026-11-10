# Co-Garage

A marketplace web application where automotive shops can list available service bays and individuals can browse, book, and rent them.

Shop owners manage bays, tools, booking requests, and Stripe Connect onboarding. Guests browse active shops and request half-day or full-day rentals without an account; payment follows owner confirmation.

This is an in-development portfolio project, not a production-ready payment platform. See [Known limitations](#known-limitations) before testing payments.

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

- **Ruby 3.2.2** and **Bundler 2.7.2** (the versions pinned in `backend/`). Select the Ruby version before running `bundle install`; `ruby -v` must report `3.2.2`.
- **PostgreSQL**, running locally. Development/test use a local socket and your operating-system username by default; that PostgreSQL role needs permission to create databases. If needed, an administrator can run `createuser --createdb "$USER"`. Use `PGUSER`, `PGPASSWORD`, and `PGHOST` for a different local connection.
- **Node.js 22 LTS** and **npm**. The frontend lockfile is npm-managed.

Clone the repository and run the commands below from its root. No Stripe keys or `.env` file are required to browse, sign in, or submit booking requests locally. Rails does not automatically load the root `.env`; export optional settings in the backend shell.

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

3. Prepare the database and load demo data:
   ```bash
   bundle exec rails db:prepare
   bundle exec rails db:seed
   ```
   Demo seeds are restricted to development/test and can be rerun without duplicating the sample records.

4. Start the Rails server:
   ```bash
   bundle exec rails server
   ```

The API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory (in a new terminal):
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm ci
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

### Try the demo

1. Open `http://localhost:5173/login` and sign in as `alice@example.com` with password `password123` (local demo credentials only).
2. Inspect the owner dashboard, seeded bays, tools, and sample booking.
3. Sign out and open **Book a Shop** to browse Alice's Garage and submit a guest request for a future date.
4. Sign back in to review the request. Accepting it and generating a payment link requires Stripe test credentials and a connected shop with charges/payouts enabled. Development payment emails open through Letter Opener.

Vite proxies `/api` to Rails on port 3000. Run both servers; frontend preview alone does not provide the API. If port 5173 is occupied, stop the conflicting process so the documented URLs remain consistent.

### Checks

```bash
# From the repository root
cd frontend
npm run build
npm test -- --runInBand
npm run lint

cd ../backend
RAILS_ENV=test bundle exec rails db:create db:migrate
bundle exec rspec
```

Frontend tests use Jest/Testing Library; backend model/request specs use RSpec and a separate PostgreSQL test database. Stripe request specs stub the external API; they do not prove live payment settlement.

## Production configuration

Production requires:

- `SECRET_KEY_BASE` or Rails credentials containing `secret_key_base`. The development JWT fallback is disabled in production.
- `DATABASE_HOST`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD` for the PostgreSQL connection in `backend/config/database.yml`.
- `FRONTEND_BASE_URL`, the public frontend origin (for example, `https://cogarage.example`). It is used for Stripe Checkout and Connect return URLs.
- `STRIPE_SECRET_KEY` (or credentials containing `stripe.secret_key`) and `STRIPE_WEBHOOK_SECRET`. Configure Stripe to send `checkout.session.completed` and `account.updated` events to `/api/v1/stripe/webhook`; unsigned events are rejected.
- `SMTP_ADDRESS` and the applicable SMTP settings (`SMTP_PORT`, `SMTP_DOMAIN`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_AUTH`, and `SMTP_STARTTLS`) for booking payment emails. Email delivery is disabled when `SMTP_ADDRESS` is unset.

`PLATFORM_FEE_PERCENT` defaults to `10`. Keep secrets in the deployment environment or Rails credentials; never commit `.env` or secret values.

Build the frontend with `cd frontend && npm run build`. Serve its `dist/` assets and route `/api/v1` requests to Rails under the same public origin; the frontend uses relative `/api/v1` URLs. Production CORS permits only `FRONTEND_BASE_URL`. Set `RAILS_SERVE_STATIC_FILES=true` only when Rails should serve files from `public/`. Use HTTPS for the public origin and Stripe webhook.

## Development Workflow

1. Start PostgreSQL (if not running as a service)
2. Start the backend server (Terminal 1): `cd backend && bundle exec rails server`
3. Start the frontend dev server (Terminal 2): `cd frontend && npm run dev`
4. Open your browser to `http://localhost:5173`

## Project Status

🚧 **In Development** - This project is currently being built incrementally.

## Current Features

- Shop-owner registration and JWT authentication; renters book as guests
- Automotive shop CRUD operations
- Bay listing with availability
- Owner dashboard with booking review, inventory management, and Stripe payout status
- Guest half/full-day requests with optional tools and an itemized estimate
- Shop search by name/location, maximum starting hourly rate, and available bays
- Home section links and responsive navigation
- Bay hourly rates used to calculate half/full-day rental prices

## Known limitations

- Before using real money, review cancellation/refund handling: destination-charge refunds do not currently reverse shop transfers, and canceled unpaid bookings can retain payable Checkout links.
- Public bay/tool endpoints and booking creation do not consistently enforce shop activation; booking requests also lack a server-side past-date check.
- `npm run lint` currently fails on existing typing, mixed-indentation, and Fast Refresh issues. The frontend build and tests are separate checks.
- Dependencies have known audit findings; review and update them before deployment. Do not run a forced audit upgrade without checking compatibility.
- The pinned Ruby 3.2.2 runtime is end-of-life. Move to a supported Ruby release and rerun backend checks before deployment.
- Some unused legacy controllers/pages remain, including an unrouted renter-registration page. The supported UI uses owner signup and guest booking.

## Future Features

- Bay and tool image galleries
- Advanced calendar with blocked-out dates
- Stripe Connect payout history for shop owners
- Automated reminders (email/SMS) for upcoming bookings
- Reviews and ratings for shops and bays
- Saved searches

## App Demo Photos

| Home Page | Call to Action | Dashboard |
| --- | --- | --- |
| ![Home Page](AppPhotos/HomePage.png) | ![Call to Action](AppPhotos/CTA.png) | ![Dashboard](AppPhotos/Dashboard.png) |

| Request Booking | Paid Booking |
| --- | --- |
| ![Request Booking](AppPhotos/RequestBooking.png) | ![Paid Booking](AppPhotos/PaidBooking.png) |

## License

This project is private and proprietary. No open-source license is granted.
