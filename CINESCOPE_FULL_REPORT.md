# **CINESCOPE - COMPREHENSIVE PROJECT REPORT**

## **A Full-Stack Movie & TV Show Database Application**

---

**Project Name:** CineScope  
**Version:** 1.0.0  
**Author:** Amel Silajdzic  
**Date:** January 2, 2026  
**Repository:** https://github.com/amelsilajdzic-ai/cine-scope

---

## **TABLE OF CONTENTS**

1. Executive Summary
2. Introduction & Objectives
3. System Architecture
4. Technology Stack
5. Frontend Implementation
6. Backend Implementation
7. Database Design
8. API Integration
9. Security Implementation
10. User Features
11. Social Features
12. Internationalization
13. UI/UX Design
14. Testing & Quality Assurance
15. Deployment
16. Project Statistics
17. Challenges & Solutions
18. Future Enhancements
19. Conclusion

---

## **1. EXECUTIVE SUMMARY**

CineScope is a comprehensive full-stack web application designed to provide users with an IMDb-like experience for discovering, browsing, and managing movies and TV shows. The application integrates with The Movie Database (TMDB) API to deliver real-time data on over 800,000 movies and TV shows, while leveraging Supabase for user authentication, watchlist management, reviews, and social features.

The project demonstrates proficiency in modern web development technologies including React 19, Next.js 14, TailwindCSS 4, and PostgreSQL (via Supabase), showcasing skills in API integration, state management, responsive design, and full-stack development.

---

## **2. INTRODUCTION & OBJECTIVES**

### **2.1 Project Background**

The entertainment industry has seen exponential growth in streaming platforms and digital content consumption. Users need a centralized platform to discover new content, track what they want to watch, and share recommendations with friends. CineScope addresses these needs by providing:

- A comprehensive movie and TV show database
- Personalized watchlist management
- User reviews and ratings
- Social features for connecting with other movie enthusiasts

### **2.2 Project Objectives**

1. **Primary Objective:** Create a fully functional movie database application inspired by IMDb
2. **User Experience:** Deliver a responsive, visually appealing interface that works across all devices
3. **Authentication:** Implement secure user registration and login functionality
4. **Data Integration:** Successfully integrate with TMDB API for comprehensive movie/TV data
5. **Social Features:** Enable users to follow each other, share content, and view public profiles
6. **Internationalization:** Support multiple languages for global accessibility
7. **Performance:** Ensure fast load times and smooth interactions

---

## **3. SYSTEM ARCHITECTURE**

### **3.1 High-Level Architecture**

The application follows a modern three-tier architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              React 19 Frontend (Vite)                    │    │
│  │    • 19 Page Components    • 11 Reusable Components     │    │
│  │    • React Router 7        • TailwindCSS 4              │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                             │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │   Next.js API        │    │   Supabase           │          │
│  │   (Port 5000)        │    │   (Cloud)            │          │
│  │   • 38 Endpoints     │    │   • Authentication   │          │
│  │   • TMDB Proxy       │    │   • Database         │          │
│  └──────────────────────┘    └──────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │   TMDB API           │    │   PostgreSQL         │          │
│  │   (External)         │    │   (Supabase)         │          │
│  │   • Movies/TV Data   │    │   • User Data        │          │
│  │   • Images/Trailers  │    │   • Watchlists       │          │
│  └──────────────────────┘    │   • Reviews          │          │
│                              │   • Social Data      │          │
│                              └──────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### **3.2 Data Flow**

1. User interacts with React frontend
2. Frontend makes API calls to Next.js backend or directly to Supabase
3. Next.js backend proxies requests to TMDB API (for movie/TV data)
4. Supabase handles authentication and user-generated data
5. Responses are processed and rendered in the UI

---

## **4. TECHNOLOGY STACK**

### **4.1 Frontend Technologies**

| Technology   | Version | Purpose                         |
| ------------ | ------- | ------------------------------- |
| React        | 19.2.1  | UI Component Library            |
| React Router | 7.10.1  | Client-side Routing             |
| Vite         | 7.2.7   | Build Tool & Development Server |
| TailwindCSS  | 4.1.16  | Utility-first CSS Framework     |
| Supabase JS  | 2.88.0  | Database & Auth Client          |

### **4.2 Backend Technologies**

| Technology | Version | Purpose             |
| ---------- | ------- | ------------------- |
| Next.js    | 14.2.0  | API Routes & Server |
| Node.js    | 20.x    | JavaScript Runtime  |
| Express.js | 4.18.2  | Legacy API Server   |

### **4.3 External Services**

| Service                   | Purpose                                                      |
| ------------------------- | ------------------------------------------------------------ |
| TMDB (The Movie Database) | Movie/TV metadata, images, trailers, reviews                 |
| Supabase                  | PostgreSQL database, authentication, real-time subscriptions |
| GitHub Pages              | Frontend hosting                                             |

### **4.4 Development Tools**

| Tool         | Purpose                 |
| ------------ | ----------------------- |
| Git/GitHub   | Version control         |
| VS Code      | Development environment |
| PostCSS      | CSS processing          |
| Autoprefixer | CSS vendor prefixing    |
| gh-pages     | Deployment automation   |

---

## **5. FRONTEND IMPLEMENTATION**

### **5.1 Project Structure**

```
src/
├── components/           # 11 Reusable UI components
│   ├── FilterPanel.jsx      # Advanced filtering controls
│   ├── Footer.jsx            # Site footer
│   ├── Header.jsx            # Navigation with search
│   ├── LoadingSpinner.jsx    # Loading indicator
│   ├── MovieCard.jsx         # Movie display card
│   ├── RecommendedMovies.jsx # Recommendations section
│   ├── RecommendedTVShows.jsx# TV recommendations
│   ├── ScrollToTop.jsx       # Scroll behavior
│   ├── ShareButton.jsx       # Social sharing
│   ├── TVShowCard.jsx        # TV show display card
│   └── WatchProviders.jsx    # Streaming availability
│
├── pages/                # 19 Page components
│   ├── Home.jsx              # Homepage with hero carousel
│   ├── MovieDetail.jsx       # Individual movie page
│   ├── TVShowDetail.jsx      # Individual TV show page
│   ├── ActorDetail.jsx       # Actor profile page
│   ├── Actors.jsx            # Popular actors listing
│   ├── TopRated.jsx          # Top rated movies
│   ├── TopRatedTVShows.jsx   # Top rated TV shows
│   ├── FanFavourites.jsx     # Fan favorite content
│   ├── TVShows.jsx           # TV shows browsing
│   ├── Genres.jsx            # Movie genres overview
│   ├── Genre.jsx             # Single genre movies
│   ├── TVGenres.jsx          # TV genres overview
│   ├── TVGenre.jsx           # Single TV genre
│   ├── Search.jsx            # Search results
│   ├── Login.jsx             # User login
│   ├── Signup.jsx            # User registration
│   ├── Watchlist.jsx         # User's saved content
│   ├── Profile.jsx           # User profile settings
│   └── UserProfile.jsx       # Public user profile
│
├── context/              # React Context providers
│   ├── AuthContext.jsx       # Authentication state
│   └── LanguageContext.jsx   # Internationalization state
│
├── services/             # API service layers
│   ├── tmdb.js               # TMDB API client
│   └── supabase.js           # Supabase client
│
├── i18n/                 # Internationalization
│   └── translations.js       # Language translations
│
├── App.jsx               # Main application component
├── main.jsx              # React entry point
└── input.css             # Tailwind input styles
```

### **5.2 Key Pages Implementation**

#### **Home Page**

- Hero carousel with auto-advancing slides (5 movies)
- Inline YouTube trailer playback
- Trending movies section (6 movies)
- Popular movies grid (40 movies across 2 API pages)
- Featured trailers section
- Upcoming content (movies + TV shows combined)

#### **Movie/TV Detail Pages**

- Full-width backdrop image hero
- Movie poster with watchlist toggle
- Metadata: rating, runtime, release date, genres
- Synopsis/overview
- Trailer playback integration
- Cast carousel with actor links
- Similar content recommendations
- User reviews (TMDB + CineScope)
- Review writing functionality
- Watch providers (streaming availability)

#### **Search Page**

- Multi-category search (All, Titles, Celebs, Keywords)
- Real-time search results
- Category tabs for filtering

### **5.3 State Management**

The application uses React Context API for global state management:

1. **AuthContext**: Manages user authentication state, login/logout, session persistence
2. **LanguageContext**: Manages internationalization, current language, translation function

---

## **6. BACKEND IMPLEMENTATION**

### **6.1 Next.js API Routes Structure**

```
backend-next/app/api/
├── health/route.js           # Health check endpoint
├── movies/
│   ├── popular/route.js
│   ├── top-rated/route.js
│   ├── trending/route.js
│   ├── upcoming/route.js
│   ├── now-playing/route.js
│   ├── genres/route.js
│   ├── discover/route.js
│   ├── recommendations/route.js
│   ├── genre/[genreId]/route.js
│   └── [id]/
│       ├── route.js
│       ├── credits/route.js
│       ├── reviews/route.js
│       ├── similar/route.js
│       ├── recommendations/route.js
│       ├── videos/route.js
│       └── watch-providers/route.js
├── tv/
│   ├── popular/route.js
│   ├── top-rated/route.js
│   ├── trending/route.js
│   ├── upcoming/route.js
│   ├── genres/route.js
│   └── [id]/
│       ├── route.js
│       ├── credits/route.js
│       ├── reviews/route.js
│       ├── similar/route.js
│       ├── recommendations/route.js
│       ├── videos/route.js
│       └── watch-providers/route.js
├── actors/
│   ├── popular/route.js
│   └── [id]/
│       ├── route.js
│       ├── movie-credits/route.js
│       ├── tv-credits/route.js
│       ├── combined-credits/route.js
│       └── images/route.js
└── search/
    ├── movies/route.js
    ├── tv/route.js
    ├── actors/route.js
    └── multi/route.js
```

### **6.2 API Endpoints Summary**

| Category  | Endpoints | Description                                                   |
| --------- | --------- | ------------------------------------------------------------- |
| Movies    | 17        | Popular, trending, top-rated, details, credits, reviews, etc. |
| TV Shows  | 13        | Popular, trending, details, credits, similar, etc.            |
| Actors    | 6         | Popular, details, filmography, images                         |
| Search    | 4         | Multi-search, movies, TV, actors                              |
| Utility   | 1         | Health check                                                  |
| **Total** | **41**    |                                                               |

### **6.3 Error Handling**

Custom error classes for consistent error responses:

| Error Class           | HTTP Status | Use Case                |
| --------------------- | ----------- | ----------------------- |
| AppError              | 500         | Base error class        |
| ValidationError       | 400         | Invalid input data      |
| NotFoundError         | 404         | Resource not found      |
| InvalidParameterError | 400         | Invalid URL parameter   |
| NoDataError           | 404         | Empty search results    |
| RateLimitError        | 429         | API rate limit exceeded |
| ApiError              | Varies      | External API errors     |

---

## **7. DATABASE DESIGN**

### **7.1 Entity Relationship Diagram**

```
┌─────────────────┐     ┌─────────────────┐
│   auth.users    │     │    profiles     │
│ (Supabase Auth) │◄────│                 │
│                 │     │ id (FK)         │
│ id (PK)         │     │ username        │
│ email           │     │ avatar_url      │
│ created_at      │     │ created_at      │
└────────┬────────┘     └─────────────────┘
         │
         │
    ┌────┴────┬──────────────┬──────────────┐
    │         │              │              │
    ▼         ▼              ▼              ▼
┌─────────┐ ┌───────────┐ ┌─────────┐ ┌───────────┐
│watchlist│ │  reviews  │ │followers│ │user_rating│
│         │ │           │ │         │ │           │
│ user_id │ │ user_id   │ │follower │ │ user_id   │
│ movie_id│ │ movie_id  │ │following│ │ item_id   │
│ title   │ │ rating    │ │         │ │ rating    │
│ poster  │ │ content   │ │         │ │ media_type│
│ media   │ │ created_at│ │         │ │           │
│  _type  │ │           │ │         │ │           │
└─────────┘ └───────────┘ └─────────┘ └───────────┘
```

### **7.2 Table Definitions**

#### **profiles**

| Column     | Type      | Constraints         | Description         |
| ---------- | --------- | ------------------- | ------------------- |
| id         | UUID      | PK, FK → auth.users | User identifier     |
| username   | TEXT      | NOT NULL            | Display name        |
| avatar_url | TEXT      | NULLABLE            | Profile picture URL |
| created_at | TIMESTAMP | DEFAULT NOW()       | Creation date       |

#### **watchlists**

| Column       | Type      | Constraints     | Description       |
| ------------ | --------- | --------------- | ----------------- |
| id           | SERIAL    | PK              | Auto-increment ID |
| user_id      | UUID      | FK → auth.users | User reference    |
| movie_id     | INTEGER   | NOT NULL        | TMDB movie/TV ID  |
| title        | TEXT      | NOT NULL        | Content title     |
| poster_path  | TEXT      | NULLABLE        | Poster image path |
| vote_average | DECIMAL   | NULLABLE        | Rating (0-10)     |
| release_date | DATE      | NULLABLE        | Release date      |
| media_type   | TEXT      | DEFAULT 'movie' | 'movie' or 'tv'   |
| created_at   | TIMESTAMP | DEFAULT NOW()   | Date added        |

#### **reviews**

| Column       | Type      | Constraints     | Description       |
| ------------ | --------- | --------------- | ----------------- |
| id           | SERIAL    | PK              | Auto-increment ID |
| user_id      | UUID      | FK → auth.users | User reference    |
| movie_id     | INTEGER   | NOT NULL        | TMDB movie ID     |
| rating       | INTEGER   | CHECK 1-10      | User rating       |
| content      | TEXT      | NOT NULL        | Review text       |
| movie_title  | TEXT      | NOT NULL        | Movie title       |
| movie_poster | TEXT      | NULLABLE        | Poster path       |
| created_at   | TIMESTAMP | DEFAULT NOW()   | Review date       |

#### **followers**

| Column       | Type      | Constraints     | Description         |
| ------------ | --------- | --------------- | ------------------- |
| id           | UUID      | PK              | Unique identifier   |
| follower_id  | UUID      | FK → auth.users | User who follows    |
| following_id | UUID      | FK → auth.users | User being followed |
| created_at   | TIMESTAMP | DEFAULT NOW()   | Follow date         |

#### **user_ratings**

| Column     | Type      | Constraints     | Description       |
| ---------- | --------- | --------------- | ----------------- |
| id         | SERIAL    | PK              | Auto-increment ID |
| user_id    | UUID      | FK → auth.users | User reference    |
| item_id    | INTEGER   | NOT NULL        | TMDB movie/TV ID  |
| rating     | INTEGER   | CHECK 1-10      | User rating       |
| media_type | TEXT      | NOT NULL        | 'movie' or 'tv'   |
| updated_at | TIMESTAMP | DEFAULT NOW()   | Last update       |

### **7.3 Row Level Security (RLS)**

All tables have RLS enabled with policies:

- Users can only read/write their own data
- Watchlists, reviews, and profiles are publicly readable
- Follow relationships are publicly queryable
- Insert/update/delete operations require authentication

---

## **8. API INTEGRATION**

### **8.1 TMDB API Integration**

The application integrates with The Movie Database (TMDB) API v3 for:

- **Movie Data**: Details, credits, reviews, similar movies, recommendations
- **TV Show Data**: Details, seasons, episodes, cast, recommendations
- **Actor Data**: Biography, filmography, images
- **Search**: Multi-search across movies, TV shows, and people
- **Images**: Posters, backdrops, actor photos
- **Videos**: Trailers, teasers, clips
- **Genres**: Movie and TV show genre lists
- **Discover**: Advanced filtering and discovery

### **8.2 API Client Implementation**

```javascript
// Example: TMDB Service Methods
const tmdbService = {
  getPopularMovies: async (page = 1) => { ... },
  getTopRatedMovies: async (page = 1) => { ... },
  getTrendingMovies: async () => { ... },
  getMovieDetails: async (movieId) => { ... },
  getMovieCredits: async (movieId) => { ... },
  getMovieVideos: async (movieId) => { ... },
  searchMovies: async (query) => { ... },
  // ... 30+ additional methods
};
```

### **8.3 Supabase Integration**

The Supabase client handles:

1. **Authentication**

   - Sign up with email/password
   - Sign in with email/password
   - Session management
   - Password reset

2. **Database Operations**
   - CRUD operations for watchlists
   - User reviews
   - User ratings
   - Social features (follow/unfollow)
   - Profile management

---

## **9. SECURITY IMPLEMENTATION**

### **9.1 API Key Protection**

| Measure               | Implementation                                     |
| --------------------- | -------------------------------------------------- |
| Environment Variables | All API keys stored in `.env` files                |
| Git Ignore            | `.env`, `.env.local` excluded from version control |
| Backend Proxy         | TMDB API key never exposed to frontend             |
| Template Files        | `.env.example` files provided for setup            |

### **9.2 Authentication Security**

- Supabase handles password hashing (bcrypt)
- JWT tokens for session management
- Secure HTTP-only cookies
- HTTPS encryption in production

### **9.3 Database Security**

- Row Level Security (RLS) on all tables
- User can only modify their own data
- Anonymous read access for public data
- Service role key kept server-side only

### **9.4 Input Validation**

- Parameter validation on API routes
- SQL injection prevention (Supabase prepared statements)
- XSS prevention (React's built-in escaping)

---

## **10. USER FEATURES**

### **10.1 Authentication**

| Feature             | Description                            |
| ------------------- | -------------------------------------- |
| Sign Up             | Email, password, username registration |
| Sign In             | Email/password authentication          |
| Session Persistence | Automatic session restoration          |
| Sign Out            | Secure logout functionality            |

### **10.2 Watchlist Management**

| Feature               | Description                        |
| --------------------- | ---------------------------------- |
| Add to Watchlist      | Save movies and TV shows           |
| Remove from Watchlist | Quick remove functionality         |
| View Watchlist        | Grid display with filtering        |
| Filter by Type        | All, Movies, TV Shows tabs         |
| Media Type Badges     | Visual indicators for content type |

### **10.3 Reviews & Ratings**

| Feature       | Description                  |
| ------------- | ---------------------------- |
| Write Reviews | Text reviews for movies      |
| Star Ratings  | 1-10 rating scale            |
| Quick Ratings | Rate directly from cards     |
| View Reviews  | Combined TMDB + user reviews |

### **10.4 User Profile**

| Feature          | Description                              |
| ---------------- | ---------------------------------------- |
| Avatar Upload    | Custom profile picture                   |
| Username Display | Editable display name                    |
| View Statistics  | Watchlist count, reviews, followers      |
| Activity Tabs    | Watchlist, reviews, followers, following |

---

## **11. SOCIAL FEATURES**

### **11.1 Follow System**

- Follow/unfollow other users
- View follower count
- View following count
- Browse followers list
- Browse following list

### **11.2 Public Profiles**

- View other users' profiles
- See their public watchlist
- Read their reviews
- View their social connections

### **11.3 Content Sharing**

| Platform     | Implementation               |
| ------------ | ---------------------------- |
| Native Share | Web Share API (mobile)       |
| Twitter/X    | Share with pre-filled text   |
| Facebook     | Share link                   |
| WhatsApp     | Share via messaging          |
| Telegram     | Share via messaging          |
| Reddit       | Share to subreddit           |
| Copy Link    | Clipboard copy functionality |

---

## **12. INTERNATIONALIZATION (i18n)**

### **12.1 Supported Languages**

| Code | Language | Flag |
| ---- | -------- | ---- |
| en   | English  | 🇺🇸   |
| es   | Spanish  | 🇪🇸   |
| fr   | French   | 🇫🇷   |
| de   | German   | 🇩🇪   |

### **12.2 Translated Elements**

- Navigation menu items
- Search placeholder text
- Page titles and headers
- Button labels
- Footer content
- Error messages

### **12.3 Implementation**

```javascript
// Language Context provides:
const { language, setLanguage, t } = useLanguage();

// Usage in components:
<button>{t('watchlist')}</button>
<input placeholder={t('searchPlaceholder')} />
```

---

## **13. UI/UX DESIGN**

### **13.1 Design System**

| Element        | Specification        |
| -------------- | -------------------- |
| Primary Color  | Yellow (#EAB308)     |
| Background     | Stone-950 (#0c0a09)  |
| Text Primary   | White (#FFFFFF)      |
| Text Secondary | Gray-400 (#9CA3AF)   |
| Border Color   | Stone-700 (#44403c)  |
| Border Radius  | 0.75rem (rounded-xl) |

### **13.2 Responsive Breakpoints**

| Breakpoint | Width  | Target        |
| ---------- | ------ | ------------- |
| sm         | 640px  | Large phones  |
| md         | 768px  | Tablets       |
| lg         | 1024px | Laptops       |
| xl         | 1280px | Desktops      |
| 2xl        | 1536px | Large screens |

### **13.3 Animations**

| Animation | Duration | Purpose                |
| --------- | -------- | ---------------------- |
| fadeIn    | 0.5s     | Page transitions       |
| slideDown | 0.3s     | Dropdown menus         |
| scale     | 0.3s     | Hover effects on cards |
| spin      | 1s       | Loading spinners       |

### **13.4 Accessibility Features**

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators
- Alt text for images
- Color contrast compliance

---

## **14. TESTING & QUALITY ASSURANCE**

### **14.1 Manual Testing**

| Test Category  | Coverage                                    |
| -------------- | ------------------------------------------- |
| Authentication | Sign up, login, logout, session persistence |
| Navigation     | All routes, deep linking, back button       |
| Watchlist      | Add, remove, filter, display                |
| Reviews        | Create, read, display                       |
| Social         | Follow, unfollow, view profiles             |
| Search         | Multi-category, results display             |
| Responsive     | Mobile, tablet, desktop layouts             |
| Cross-browser  | Chrome, Firefox, Safari, Edge               |

### **14.2 Error Handling**

- Graceful error messages for API failures
- Empty state displays for no results
- Loading states during data fetching
- Network error recovery

---

## **15. DEPLOYMENT**

### **15.1 Frontend Deployment (GitHub Pages)**

```bash
# Build production bundle
npm run build

# Deploy to GitHub Pages
npm run deploy
```

**Live URL:** https://amelsilajdzic-ai.github.io/cine-scope/

### **15.2 Backend Deployment**

The Next.js backend can be deployed to:

- Vercel (recommended for Next.js)
- Netlify
- Railway
- Render

### **15.3 Environment Configuration**

**Frontend (.env):**

```
VITE_TMDB_API_KEY=your_tmdb_api_key
```

**Backend (.env.local):**

```
TMDB_API_KEY=your_tmdb_api_key
PORT=5000
NODE_ENV=production
```

---

## **16. PROJECT STATISTICS**

| Metric                    | Count      |
| ------------------------- | ---------- |
| Total Files               | 80+        |
| Frontend Pages            | 19         |
| Frontend Components       | 11         |
| Backend API Endpoints     | 41         |
| Database Tables           | 5          |
| Lines of Code (estimated) | 10,000+    |
| Languages Supported       | 4          |
| External API Integrations | 2          |
| Development Time          | ~200 hours |

### **16.1 File Distribution**

| Directory            | Files | Purpose                |
| -------------------- | ----- | ---------------------- |
| src/pages            | 19    | Page components        |
| src/components       | 11    | Reusable UI components |
| src/services         | 2     | API clients            |
| src/context          | 2     | State management       |
| backend-next/app/api | 41    | API route handlers     |

---

## **17. CHALLENGES & SOLUTIONS**

### **Challenge 1: TMDB API Rate Limiting**

**Problem:** TMDB API has rate limits that could affect user experience.  
**Solution:** Implemented caching in the Next.js backend and optimized API calls to reduce redundant requests.

### **Challenge 2: Real-time Watchlist Sync**

**Problem:** Watchlist state needed to be synchronized across components.  
**Solution:** Used React Context and Supabase real-time subscriptions for instant updates.

### **Challenge 3: Follower Display Without Profiles**

**Problem:** Users who followed but hadn't created profiles weren't showing in follower lists.  
**Solution:** Modified the getFollowers/getFollowing functions to return fallback profile data for users without profile entries.

### **Challenge 4: Responsive Hero Carousel**

**Problem:** Creating a responsive hero carousel with inline trailer playback.  
**Solution:** Implemented custom carousel with CSS transitions and conditional YouTube iframe rendering.

### **Challenge 5: Search Performance**

**Problem:** Multi-category search needed to be fast and responsive.  
**Solution:** Implemented debounced search and parallel API calls for different categories.

---

## **18. FUTURE ENHANCEMENTS**

| Priority | Feature                  | Description                                  |
| -------- | ------------------------ | -------------------------------------------- |
| High     | Push Notifications       | Alerts for new releases, watchlist reminders |
| High     | PWA Support              | Offline access, installable app              |
| Medium   | Dark/Light Theme Toggle  | User-selectable theme                        |
| Medium   | More Languages           | Italian, Portuguese, Japanese                |
| Medium   | Advanced Recommendations | ML-based personalized suggestions            |
| Low      | TV Episode Tracking      | Mark episodes as watched                     |
| Low      | Lists Feature            | Create custom movie lists                    |
| Low      | Discussion Forums        | Community discussions                        |

---

## **19. CONCLUSION**

CineScope successfully demonstrates the development of a full-stack web application using modern technologies and best practices. The project showcases:

1. **Technical Proficiency**: React 19, Next.js 14, TailwindCSS, PostgreSQL
2. **API Integration**: Successful integration with TMDB and Supabase
3. **User Experience**: Responsive design, smooth animations, intuitive navigation
4. **Security**: Proper API key protection, authentication, database security
5. **Scalability**: Modular architecture ready for future enhancements

The application provides a comprehensive movie and TV show discovery experience with social features that enhance user engagement. With over 10,000 lines of code, 41 API endpoints, and 19 frontend pages, CineScope represents a significant full-stack development achievement.

---

## **APPENDIX**

### **A. GitHub Repository Structure**

```
cine-scope/
├── README.md
├── .gitignore
├── .env.example
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
├── backend/
├── backend-next/
└── dist/
```

### **B. Installation Instructions**

1. Clone the repository
2. Install frontend dependencies: `npm install`
3. Install backend dependencies: `cd backend-next && npm install`
4. Configure environment variables
5. Start development servers

### **C. API Documentation**

Full API documentation available in the project's README.md file.

---

**Report Prepared By:** Amel Silajdzic  
**Date:** January 2, 2026  
**Version:** 1.0.0

---

_End of Report_
