# Movie Recommendations Feature 🎬

## Overview

Advanced recommendation system that provides personalized movie and TV show suggestions based on user behavior and preferences.

## Features Implemented

### 1. **Similar Movies Section** (Enhanced)

- Shows 6 similar movies based on TMDB's similarity algorithm
- Enhanced UI with:
  - Hover effects with ring highlight
  - Rating badges on posters
  - Smooth scale transitions
  - Release year display

### 2. **"You Might Also Like" Section** (New)

- **For Logged-In Users**: Personalized recommendations based on:
  - Watchlist movie genres
  - User's viewing preferences
  - Highly-rated movies (6.5+ rating, 100+ votes)
  - Filters out already-watched movies
- **For Guest Users**: Uses TMDB's recommendation algorithm
- Shows up to 12 recommended movies
- Smart fallback system if personalization fails

### 3. **TV Show Recommendations** (New)

- Similar recommendations for TV shows
- "You Might Also Like" section for TV content
- Consistent UI with movie recommendations

## Technical Implementation

### New Components

#### `RecommendedMovies.jsx`

```javascript
// Intelligent recommendation algorithm:
// 1. Fetches user's watchlist
// 2. Extracts top 3 genres from watchlist movies
// 3. Discovers new movies matching those genres
// 4. Filters out current movie and watchlist items
// 5. Falls back to TMDB recommendations if needed
```

#### `RecommendedTVShows.jsx`

```javascript
// TV show recommendation algorithm:
// Uses TMDB's recommendation endpoint
// Displays up to 12 similar shows
```

### New TMDB API Endpoints

#### Added to `tmdb.js`:

- `getMovieRecommendations(movieId)` - TMDB's recommendation algorithm
- `getTVShowRecommendations(tvId)` - TV show recommendations
- `discoverMovies(params)` - Advanced movie discovery with filters

### Enhanced Pages

#### `MovieDetail.jsx`

- Added personalized "You Might Also Like" section
- Enhanced "Similar Movies" with rating badges
- Better hover effects and transitions

#### `TVShowDetail.jsx`

- Added "You Might Also Like" for TV shows
- Enhanced "Similar TV Shows" section
- Consistent design with movie pages

## User Experience

### Visual Enhancements

- ✨ Sparkle emoji indicator for personalized recommendations
- 🎯 "Based on your watchlist" badge for logged-in users
- ⭐ Rating badges on all recommendation cards
- 🎨 Smooth hover effects with scale and ring animations
- 📅 Release year display on cards

### Smart Features

- Skeleton loading states while fetching
- Graceful error handling with fallbacks
- Automatic hiding if no recommendations available
- Responsive grid layout (2/3/6 columns)

### Personalization Logic

```javascript
// For logged-in users:
1. Get user's watchlist
2. Fetch movie details for watchlist items
3. Extract and count genres
4. Use top 3 genres for discovery
5. Apply quality filters (rating >= 6.5, votes >= 100)
6. Remove duplicates and current movie
7. Return 12 best matches

// Fallback chain:
User Watchlist → Genre Discovery → TMDB Recommendations → Empty State
```

## Benefits

### For Users

- **Personalized Experience**: Recommendations match viewing history
- **Discovery**: Find hidden gems similar to favorites
- **Engagement**: More content to explore on each page
- **Visual Appeal**: Beautiful cards with ratings and hover effects

### For the Platform

- **Increased Engagement**: Users stay longer exploring recommendations
- **Better Retention**: Personalized content keeps users coming back
- **Watchlist Growth**: More movies added from recommendations
- **Session Duration**: Extended browsing time

## Performance Optimizations

- Parallel API calls using `Promise.all`
- Limits on API requests (max 5 watchlist items analyzed)
- Slice results to 12 items max
- Loading skeletons prevent layout shift
- Error boundaries with graceful fallbacks

## Future Enhancements

- Cache recommendations in localStorage
- Machine learning based on user ratings
- Collaborative filtering (users with similar tastes)
- "Not interested" feature to improve suggestions
- Weekly personalized email digests
- Recommendation explanations ("Because you watched...")
