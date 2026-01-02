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

// Watchlist helpers (supports both movies and TV shows)
export const watchlistService = {
  // Add item to watchlist (movie or TV show)
  async addToWatchlist(userId, itemId, itemData, mediaType = 'movie') {
    const { data, error } = await supabase
      .from('watchlists')
      .insert([
        {
          user_id: userId,
          movie_id: itemId,
          title: itemData.title || itemData.name,
          poster_path: itemData.poster_path,
          vote_average: itemData.vote_average,
          release_date: itemData.release_date || itemData.first_air_date,
          media_type: mediaType,
        },
      ])
      .select();
    if (error) throw error;
    return data;
  },

  // Remove item from watchlist
  async removeFromWatchlist(userId, itemId, mediaType = 'movie') {
    let query = supabase
      .from('watchlists')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', itemId);
    
    // Only filter by media_type if it exists in the database
    if (mediaType) {
      query = query.eq('media_type', mediaType);
    }
    
    const { error } = await query;
    if (error) throw error;
  },

  // Get user's watchlist
  async getWatchlist(userId, mediaType = null) {
    let query = supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (mediaType) {
      query = query.eq('media_type', mediaType);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Check if item is in watchlist
  async isInWatchlist(userId, itemId, mediaType = 'movie') {
    let query = supabase
      .from('watchlists')
      .select('id')
      .eq('user_id', userId)
      .eq('movie_id', itemId);
    
    if (mediaType) {
      query = query.eq('media_type', mediaType);
    }
    
    const { data, error } = await query.single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return !!data;
  },
};

// User Ratings helpers
export const ratingService = {
  // Add or update user rating
  async rateItem(userId, itemId, rating, mediaType = 'movie') {
    const { data, error } = await supabase
      .from('user_ratings')
      .upsert([
        {
          user_id: userId,
          item_id: itemId,
          rating,
          media_type: mediaType,
          updated_at: new Date().toISOString(),
        },
      ], {
        onConflict: 'user_id,item_id,media_type'
      })
      .select();
    if (error) throw error;
    return data;
  },

  // Get user's rating for an item
  async getUserRating(userId, itemId, mediaType = 'movie') {
    const { data, error } = await supabase
      .from('user_ratings')
      .select('rating')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('media_type', mediaType)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data?.rating || null;
  },

  // Delete user rating
  async deleteRating(userId, itemId, mediaType = 'movie') {
    const { error } = await supabase
      .from('user_ratings')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('media_type', mediaType);
    if (error) throw error;
  },

  // Get all user ratings
  async getUserRatings(userId) {
    const { data, error } = await supabase
      .from('user_ratings')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
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

// Social/Follow helpers
export const socialService = {
  // Follow a user
  async followUser(followerId, followingId) {
    const { data, error } = await supabase
      .from('followers')
      .insert([
        {
          follower_id: followerId,
          following_id: followingId,
        },
      ])
      .select();
    if (error) throw error;
    return data;
  },

  // Unfollow a user
  async unfollowUser(followerId, followingId) {
    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    if (error) throw error;
  },

  // Check if user is following another user
  async isFollowing(followerId, followingId) {
    const { data, error } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  // Get user's followers
  async getFollowers(userId) {
    try {
      const { data, error } = await supabase
        .from('followers')
        .select('follower_id')
        .eq('following_id', userId);
      
      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      // Fetch profiles for each follower
      const followerIds = data.map(f => f.follower_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', followerIds);
      
      if (profilesError) throw profilesError;
      return profiles || [];
    } catch (error) {
      console.error('Error getting followers:', error);
      return [];
    }
  },

  // Get users that user is following
  async getFollowing(userId) {
    try {
      const { data, error } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', userId);
      
      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      // Fetch profiles for each following
      const followingIds = data.map(f => f.following_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', followingIds);
      
      if (profilesError) throw profilesError;
      return profiles || [];
    } catch (error) {
      console.error('Error getting following:', error);
      return [];
    }
  },

  // Get follower/following counts
  async getFollowCounts(userId) {
    const [followersRes, followingRes] = await Promise.all([
      supabase
        .from('followers')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userId),
      supabase
        .from('followers')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', userId),
    ]);
    return {
      followers: followersRes.count || 0,
      following: followingRes.count || 0,
    };
  },

  // Get public user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }
      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  },

  // Get user's public watchlist
  async getUserPublicWatchlist(userId, limit = 10) {
    const { data, error } = await supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  // Get user's public reviews
  async getUserPublicReviews(userId, limit = 10) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  // Search users by username
  async searchUsers(query) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${query}%`)
      .limit(20);
    if (error) throw error;
    return data || [];
  },
};
