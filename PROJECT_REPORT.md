# CineScope - Complete Project Report

## 📋 Project Overview

**Project Name:** CineScope (IMDB Wannabe)  
**Version:** 1.0.0  
**Repository:** https://github.com/amelsilajdzic-ai/cine-scope  
**Author:** Amel Silajdzic  
**Date:** January 2, 2026

### Description

CineScope is a full-stack movie and TV show database application inspired by IMDb. It provides users with the ability to browse, search, and discover movies and TV shows, view detailed information including cast, reviews, and trailers, manage a personal watchlist, and write reviews.

---

## 🏗️ Architecture

### Tech Stack

#### Frontend

| Technology   | Version | Purpose                   |
| ------------ | ------- | ------------------------- |
| React        | 19.2.1  | UI Framework              |
| React Router | 7.10.1  | Client-side routing       |
| Vite         | 7.2.7   | Build tool & dev server   |
| TailwindCSS  | 4.1.16  | Styling                   |
| Supabase     | 2.88.0  | Authentication & Database |

#### Backend (Express - Legacy)

| Technology | Version | Purpose               |
| ---------- | ------- | --------------------- |
| Express.js | 4.18.2  | API Server            |
| Node.js    | -       | Runtime               |
| dotenv     | 16.3.1  | Environment variables |
| cors       | 2.8.5   | Cross-origin requests |

#### Backend (Next.js - Current)

| Technology | Version | Purpose             |
| ---------- | ------- | ------------------- |
| Next.js    | 14.2.0  | API Routes Server   |
| React      | 18.2.0  | Required by Next.js |

#### External APIs

| Service                   | Purpose                                  |
| ------------------------- | ---------------------------------------- |
| TMDB (The Movie Database) | Movie/TV data, images, trailers          |
| Supabase                  | User authentication, watchlists, reviews |

---

## 📁 Project Structure

```
IMBD WANNA BE/
├── 📂 src/                          # Frontend source code
│   ├── 📂 components/               # Reusable UI components
│   │   ├── FilterPanel.jsx          # Advanced filtering (year, rating, genre)
│   │   ├── Footer.jsx               # Site footer
│   │   ├── Header.jsx               # Navigation header with search
│   │   ├── LoadingSpinner.jsx       # Loading indicator
│   │   ├── MovieCard.jsx            # Movie display card with rating
│   │   ├── RecommendedMovies.jsx    # Movie recommendations section
│   │   ├── RecommendedTVShows.jsx   # TV recommendations section
│   │   ├── ScrollToTop.jsx          # Scroll behavior component
│   │   ├── ShareButton.jsx          # Social sharing component
│   │   ├── TVShowCard.jsx           # TV show card with watchlist + rating
│   │   └── WatchProviders.jsx       # Streaming availability
│   │
│   ├── 📂 pages/                    # Page components (19 pages)
│   │   ├── Home.jsx                 # Homepage with hero carousel
│   │   ├── MovieDetail.jsx          # Movie details page
│   │   ├── TVShowDetail.jsx         # TV show details page
│   │   ├── ActorDetail.jsx          # Actor profile page
│   │   ├── Actors.jsx               # Popular actors list
│   │   ├── TopRated.jsx             # Top rated movies
│   │   ├── TopRatedTVShows.jsx      # Top rated TV shows
│   │   ├── FanFavourites.jsx        # Fan favorite content
│   │   ├── TVShows.jsx              # TV shows listing
│   │   ├── Genres.jsx               # Movie genres
│   │   ├── Genre.jsx                # Single genre movies
│   │   ├── TVGenres.jsx             # TV show genres
│   │   ├── TVGenre.jsx              # Single TV genre
│   │   ├── Search.jsx               # Search results page
│   │   ├── Login.jsx                # User login
│   │   ├── Signup.jsx               # User registration
│   │   ├── Watchlist.jsx            # User's saved movies
│   │   ├── Profile.jsx              # User profile settings
│   │   └── UserProfile.jsx          # Public user profile (social)
│   │
│   ├── 📂 context/                  # React Context providers
│   │   ├── AuthContext.jsx          # Authentication state
│   │   └── LanguageContext.jsx      # i18n language state
│   │
│   ├── 📂 services/                 # API service layers
│   │   ├── tmdb.js                  # TMDB API client (290 lines)
│   │   └── supabase.js              # Supabase auth & data (205 lines)
│   │
│   ├── 📂 i18n/                     # Internationalization
│   │   └── translations.js          # EN, ES, FR, DE translations
│   │
│   ├── App.jsx                      # Main app component with routes
│   ├── main.jsx                     # React entry point
│   └── input.css                    # Tailwind input styles
│
├── 📂 backend/                      # Express.js backend (legacy)
│   ├── server.js                    # Express server entry
│   ├── 📂 config/
│   │   └── tmdb.js                  # TMDB configuration
│   ├── 📂 controllers/
│   │   ├── movieController.js       # Movie endpoints logic
│   │   ├── tvController.js          # TV show endpoints logic
│   │   ├── actorController.js       # Actor endpoints logic
│   │   └── searchController.js      # Search endpoints logic
│   ├── 📂 routes/
│   │   ├── movieRoutes.js           # Movie API routes
│   │   ├── tvRoutes.js              # TV API routes
│   │   ├── actorRoutes.js           # Actor API routes
│   │   └── searchRoutes.js          # Search API routes
│   ├── 📂 services/
│   │   └── recommendationService.js # Custom recommendation engine
│   ├── 📂 utils/
│   │   ├── errors.js                # Error classes (165 lines)
│   │   └── errorPages.js            # HTML error pages
│   └── package.json
│
├── 📂 backend-next/                 # Next.js API backend (current)
│   ├── 📂 app/api/                  # API route handlers
│   │   ├── health/route.js          # Health check endpoint
│   │   ├── 📂 movies/               # 15 movie endpoints
│   │   ├── 📂 tv/                   # 13 TV show endpoints
│   │   ├── 📂 actors/               # 6 actor endpoints
│   │   └── 📂 search/               # 4 search endpoints
│   ├── 📂 lib/
│   │   ├── tmdb.js                  # TMDB client with caching
│   │   └── errors.js                # Error handling utilities
│   ├── next.config.js               # CORS & redirects config
│   └── package.json
│
├── 📂 dist/                         # Production build output
├── .env                             # Environment variables (gitignored)
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── index.html                       # HTML entry point
├── package.json                     # Frontend dependencies
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind configuration
└── postcss.config.js                # PostCSS configuration
```

---

## 🔐 Security Implementation

### API Key Protection

- ✅ **Environment Variables**: All API keys stored in `.env` files
- ✅ **Git Ignored**: `.env`, `.env.local`, `backend/.env` excluded from version control
- ✅ **Template Files**: `.env.example` files provided for setup guidance

### Environment Variables

```env
# Frontend (Vite)
VITE_TMDB_API_KEY=your_key_here

# Backend
TMDB_API_KEY=your_key_here
PORT=5000
NODE_ENV=development
```

### Supabase Security

- Row Level Security (RLS) enabled on all tables
- Anonymous key used (safe for client-side)
- User authentication required for protected actions

---

## 🌐 API Endpoints

### Backend API (Port 5000)

#### Movies

| Method | Endpoint                          | Description                  |
| ------ | --------------------------------- | ---------------------------- |
| GET    | `/api/movies/popular`             | Popular movies (paginated)   |
| GET    | `/api/movies/top-rated`           | Top rated movies             |
| GET    | `/api/movies/trending`            | Weekly trending movies       |
| GET    | `/api/movies/upcoming`            | Upcoming releases            |
| GET    | `/api/movies/now-playing`         | Currently in theaters        |
| GET    | `/api/movies/genres`              | All movie genres             |
| GET    | `/api/movies/discover`            | Filtered movie discovery     |
| GET    | `/api/movies/genre/:genreId`      | Movies by genre              |
| GET    | `/api/movies/:id`                 | Movie details                |
| GET    | `/api/movies/:id/credits`         | Cast & crew                  |
| GET    | `/api/movies/:id/reviews`         | User reviews                 |
| GET    | `/api/movies/:id/similar`         | Similar movies               |
| GET    | `/api/movies/:id/recommendations` | Recommended movies           |
| GET    | `/api/movies/:id/videos`          | Trailers & clips             |
| GET    | `/api/movies/:id/watch-providers` | Streaming availability       |
| GET    | `/api/movies/recommendations`     | Trending recommendations     |
| POST   | `/api/movies/recommendations`     | Personalized recommendations |

#### TV Shows

| Method | Endpoint                      | Description            |
| ------ | ----------------------------- | ---------------------- |
| GET    | `/api/tv/popular`             | Popular TV shows       |
| GET    | `/api/tv/top-rated`           | Top rated shows        |
| GET    | `/api/tv/trending`            | Weekly trending        |
| GET    | `/api/tv/upcoming`            | Currently airing       |
| GET    | `/api/tv/genres`              | All TV genres          |
| GET    | `/api/tv/genre/:genreId`      | Shows by genre         |
| GET    | `/api/tv/:id`                 | Show details           |
| GET    | `/api/tv/:id/credits`         | Cast & crew            |
| GET    | `/api/tv/:id/reviews`         | Reviews                |
| GET    | `/api/tv/:id/similar`         | Similar shows          |
| GET    | `/api/tv/:id/recommendations` | Recommendations        |
| GET    | `/api/tv/:id/videos`          | Trailers               |
| GET    | `/api/tv/:id/watch-providers` | Streaming availability |

#### Actors

| Method | Endpoint                           | Description       |
| ------ | ---------------------------------- | ----------------- |
| GET    | `/api/actors/popular`              | Popular actors    |
| GET    | `/api/actors/:id`                  | Actor details     |
| GET    | `/api/actors/:id/movie-credits`    | Movie filmography |
| GET    | `/api/actors/:id/tv-credits`       | TV filmography    |
| GET    | `/api/actors/:id/combined-credits` | All credits       |
| GET    | `/api/actors/:id/images`           | Photo gallery     |

#### Search

| Method | Endpoint                    | Description        |
| ------ | --------------------------- | ------------------ |
| GET    | `/api/search/movies?query=` | Search movies      |
| GET    | `/api/search/tv?query=`     | Search TV shows    |
| GET    | `/api/search/actors?query=` | Search actors      |
| GET    | `/api/search/multi?query=`  | Search all content |

#### Utility

| Method | Endpoint      | Description         |
| ------ | ------------- | ------------------- |
| GET    | `/api/health` | Server health check |

---

## 📱 Frontend Features

### Pages & Functionality

#### 1. Home Page (`/`)

- Hero carousel with backdrop images and trailers
- Auto-advancing slides with manual navigation
- Inline YouTube trailer playback
- Trending movies section
- Popular movies grid (40 movies)
- Featured trailers section
- Upcoming content (movies + TV shows)

#### 2. Movie Detail (`/movie/:id`)

- Full backdrop hero image
- Movie poster with watchlist button
- Rating, runtime, release date
- Genre tags
- Overview/synopsis
- Watch trailer button
- Cast carousel with actor links
- Similar movies recommendations
- User reviews (TMDB + CineScope users)
- Write review functionality
- Watch providers (streaming availability)

#### 3. TV Show Detail (`/tv/:id`)

- Similar to movie detail
- Season/episode information
- Network information

#### 4. Actor Detail (`/actor/:id`)

- Biography
- Photo gallery
- Known for section
- Complete filmography

#### 5. Search (`/search`)

- Multi-category search (All, Titles, Celebs, Keywords)
- Real-time results
- Category filtering

#### 6. Watchlist (`/watchlist`)

- Grid of saved movies and TV shows
- Tab filtering (All, Movies, TV Shows)
- Media type badges (Movie/TV)
- Quick remove functionality
- Empty state with CTA
- Requires authentication

#### 7. User Profile (`/profile`)

- Avatar upload
- Username display
- Account settings

#### 8. Public User Profile (`/user/:userId`)

- View other users' public profiles
- Follow/unfollow users
- View follower/following counts
- Browse user's public watchlist
- Browse user's reviews
- See followers and following lists

#### 9. Authentication

- Login page with email/password
- Signup with username
- Session persistence
- Protected routes

### Social Features

- **Share Button**: Native Web Share API with fallback
- **Social Media Sharing**: Twitter/X, Facebook, WhatsApp, Telegram, Reddit
- **Copy Link**: Quick clipboard copy functionality
- **Follow System**: Follow/unfollow other users
- **Public Profiles**: View other users' activity
- **Activity Feed**: See watchlists and reviews from followed users

### UI/UX Features

- **Dark Theme**: Stone-950 background with yellow accents
- **Responsive Design**: Mobile-first with breakpoints
- **Loading States**: Spinners and skeleton loaders
- **Error Handling**: Graceful error messages
- **Hover Effects**: Scale and brightness transitions
- **Smooth Animations**: Fade, slide, and scale transitions

---

## 🌍 Internationalization (i18n)

### Supported Languages

| Code | Language | Flag |
| ---- | -------- | ---- |
| en   | English  | 🇺🇸   |
| es   | Spanish  | 🇪🇸   |
| fr   | French   | 🇫🇷   |
| de   | German   | 🇩🇪   |

### Translated Elements

- Navigation menu
- Search placeholder
- Page titles
- Section headers
- Button labels
- Footer text

---

## 🗄️ Database Schema (Supabase)

### Tables

#### `profiles`

| Column     | Type      | Description                |
| ---------- | --------- | -------------------------- |
| id         | uuid      | User ID (FK to auth.users) |
| username   | text      | Display name               |
| avatar_url | text      | Profile picture URL        |
| created_at | timestamp | Account creation date      |

#### `watchlists`

| Column       | Type      | Description            |
| ------------ | --------- | ---------------------- |
| id           | serial    | Primary key            |
| user_id      | uuid      | User reference         |
| movie_id     | integer   | TMDB movie/TV ID       |
| title        | text      | Title                  |
| poster_path  | text      | Poster image path      |
| vote_average | decimal   | Rating                 |
| release_date | date      | Release/first air date |
| media_type   | text      | 'movie' or 'tv'        |
| created_at   | timestamp | Date added             |

#### `user_ratings`

| Column     | Type      | Description      |
| ---------- | --------- | ---------------- |
| id         | serial    | Primary key      |
| user_id    | uuid      | User reference   |
| item_id    | integer   | TMDB movie/TV ID |
| rating     | integer   | 1-10 rating      |
| media_type | text      | 'movie' or 'tv'  |
| updated_at | timestamp | Last update      |

#### `reviews`

| Column       | Type      | Description    |
| ------------ | --------- | -------------- |
| id           | serial    | Primary key    |
| user_id      | uuid      | User reference |
| movie_id     | integer   | TMDB movie ID  |
| rating       | integer   | 1-10 rating    |
| content      | text      | Review text    |
| movie_title  | text      | Movie title    |
| movie_poster | text      | Poster path    |
| created_at   | timestamp | Review date    |

#### `followers`

| Column       | Type      | Description         |
| ------------ | --------- | ------------------- |
| id           | uuid      | Primary key         |
| follower_id  | uuid      | User who follows    |
| following_id | uuid      | User being followed |
| created_at   | timestamp | Follow date         |

#### `user_profiles`

| Column       | Type      | Description                |
| ------------ | --------- | -------------------------- |
| id           | uuid      | User ID (FK to auth.users) |
| display_name | text      | Display name               |
| avatar_url   | text      | Profile picture URL        |
| bio          | text      | User biography             |
| is_public    | boolean   | Profile visibility         |
| created_at   | timestamp | Profile creation date      |
| updated_at   | timestamp | Last update                |

---

## 🚀 Development & Deployment

### Local Development

#### Frontend

```bash
cd "IMBD WANNA BE"
npm install
npm run dev
# Runs on http://localhost:5173/cine-scope/
```

#### Backend (Next.js)

```bash
cd backend-next
npm install
npm run dev
# Runs on http://localhost:5000
```

#### Backend (Express - Legacy)

```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### Build Commands

```bash
# Frontend production build
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Add your TMDB API key
3. Copy `backend-next/.env.example` to `backend-next/.env.local`
4. Add your TMDB API key

---

## ⚠️ Error Handling

### Error Classes (Backend)

| Class                   | Status | Use Case              |
| ----------------------- | ------ | --------------------- |
| `AppError`              | 500    | Base error class      |
| `ValidationError`       | 400    | Invalid input         |
| `NotFoundError`         | 404    | Resource not found    |
| `InvalidParameterError` | 400    | Invalid URL parameter |
| `NoDataError`           | 404    | Empty search results  |
| `RateLimitError`        | 429    | API rate limit hit    |
| `ApiError`              | varies | External API errors   |

### Error Response Format

```json
{
  "error": {
    "message": "Invalid parameter: id",
    "type": "InvalidParameterError",
    "statusCode": 400,
    "details": {
      "parameter": "id",
      "provided": "abc",
      "expectedType": "positive integer",
      "hint": "id should be of type positive integer"
    },
    "timestamp": "2026-01-02T00:00:00.000Z"
  }
}
```

---

## 📊 Project Statistics

| Metric               | Count   |
| -------------------- | ------- |
| Total Files          | 80+     |
| Frontend Pages       | 19      |
| Frontend Components  | 11      |
| API Endpoints        | 38      |
| Lines of Code (est.) | 10,000+ |
| Languages Supported  | 4       |
| External APIs        | 2       |

---

## 🔮 Future Enhancements

1. ~~**TV Show Watchlist** - Currently only movies supported~~ ✅ **IMPLEMENTED**
2. ~~**Advanced Filtering** - Year, rating, genre combinations~~ ✅ **IMPLEMENTED**
3. ~~**User Ratings** - Quick star rating on cards~~ ✅ **IMPLEMENTED**
4. ~~**Social Features** - Share movies, follow users~~ ✅ **IMPLEMENTED**
5. **Push Notifications** - New releases, watchlist reminders
6. **PWA Support** - Offline access, installable app
7. **Dark/Light Theme Toggle**
8. **More Languages** - Italian, Portuguese, Japanese

---

## 📄 License

ISC License

---

## 👨‍💻 Author

**Amel Silajdzic**  
GitHub: [@amelsilajdzic-ai](https://github.com/amelsilajdzic-ai)

---

_Report generated: January 2, 2026_
