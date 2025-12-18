import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zzrchoibfdlymbqfemfb.supabase.co';
const supabaseAnonKey = 'sb_publishable_zBQx2EJFUurcGlbXE-Q-eA_q4I7JzQD';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const authService = {
  // Sign up new user
  async signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  // Sign in existing user
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Get session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },
};

// Watchlist helpers
export const watchlistService = {
  // Add movie to watchlist
  async addToWatchlist(userId, movieId, movieData) {
    const { data, error } = await supabase
      .from('watchlists')
      .insert([
        {
          user_id: userId,
          movie_id: movieId,
          title: movieData.title,
          poster_path: movieData.poster_path,
          vote_average: movieData.vote_average,
          release_date: movieData.release_date,
        },
      ])
      .select();
    if (error) throw error;
    return data;
  },

  // Remove movie from watchlist
  async removeFromWatchlist(userId, movieId) {
    const { error } = await supabase
      .from('watchlists')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', movieId);
    if (error) throw error;
  },

  // Get user's watchlist
  async getWatchlist(userId) {
    const { data, error } = await supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Check if movie is in watchlist
  async isInWatchlist(userId, movieId) {
    const { data, error } = await supabase
      .from('watchlists')
      .select('id')
      .eq('user_id', userId)
      .eq('movie_id', movieId)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return !!data;
  },
};

// Reviews helpers
export const reviewService = {
  // Add or update review
  async addReview(userId, movieId, rating, comment, movieData) {
    const { data, error } = await supabase
      .from('reviews')
      .upsert([
        {
          user_id: userId,
          movie_id: movieId,
          rating,
          comment,
          movie_title: movieData.title,
          movie_poster: movieData.poster_path,
          updated_at: new Date().toISOString(),
        },
      ], {
        onConflict: 'user_id,movie_id'
      })
      .select();
    if (error) throw error;
    return data;
  },

  // Update review
  async updateReview(reviewId, rating, comment) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ rating, comment, updated_at: new Date().toISOString() })
      .eq('id', reviewId)
      .select();
    if (error) throw error;
    return data;
  },

  // Delete review
  async deleteReview(reviewId) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);
    if (error) throw error;
  },

  // Get reviews for a movie
  async getMovieReviews(movieId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('movie_id', movieId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    // Manually fetch usernames for each review
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(review => review.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);
      
      if (!profilesError && profilesData) {
        const profilesMap = Object.fromEntries(
          profilesData.map(p => [p.id, p.username])
        );
        data.forEach(review => {
          review.username = profilesMap[review.user_id] || 'Anonymous';
        });
      }
    }
    return data || [];
  },

  // Get user's reviews
  async getUserReviews(userId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Get user's review for a specific movie
  async getUserMovieReview(userId, movieId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('movie_id', movieId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
};
