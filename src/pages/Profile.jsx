import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, socialService, reviewService, watchlistService } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Footer from '../components/Footer';

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [stats, setStats] = useState({
    watchlistCount: 0,
    reviewsCount: 0,
    followersCount: 0,
    followingCount: 0
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
      fetchSocialData();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setUsername(data?.username || '');
      setAvatarUrl(data?.avatar_url || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [watchlistRes, reviewsRes, followCounts] = await Promise.all([
        supabase
          .from('watchlists')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('reviews')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        socialService.getFollowCounts(user.id)
      ]);

      setStats({
        watchlistCount: watchlistRes.count || 0,
        reviewsCount: reviewsRes.count || 0,
        followersCount: followCounts.followers || 0,
        followingCount: followCounts.following || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSocialData = async () => {
    try {
      const [followersData, followingData, reviewsData, watchlistData] = await Promise.all([
        socialService.getFollowers(user.id),
        socialService.getFollowing(user.id),
        reviewService.getUserReviews(user.id),
        watchlistService.getWatchlist(user.id)
      ]);
      setFollowers(followersData || []);
      setFollowing(followingData || []);
      setReviews(reviewsData || []);
      setWatchlist(watchlistData || []);
    } catch (error) {
      console.error('Error fetching social data:', error);
    }
  };

  const handleUpdateUsername = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);

      if (error) throw error;
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating username:', error);
      alert('Failed to update username');
    }
  };

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  const TabIcon = ({ type }) => {
    switch (type) {
      case 'overview':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case 'watchlist':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        );
      case 'reviews':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case 'followers':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'following':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'watchlist', label: 'Watchlist', count: stats.watchlistCount },
    { id: 'reviews', label: 'Reviews', count: stats.reviewsCount },
    { id: 'followers', label: 'Followers', count: stats.followersCount },
    { id: 'following', label: 'Following', count: stats.followingCount },
  ];

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Hero Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-500">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent"></div>
        <div className="absolute top-4 right-4">
          <span className="bg-yellow-400 text-stone-900 text-xs font-bold px-3 py-1 rounded-full">
            ⭐ PRO MEMBER
          </span>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          
          {/* Left Column - Avatar & Quick Stats */}
          <div className="md:w-64 shrink-0">
            {/* Avatar */}
            <div className="relative group mx-auto md:mx-0 w-40 h-40 md:w-48 md:h-48">
              <div className="w-full h-full rounded-2xl overflow-hidden border-4 border-stone-950 shadow-2xl bg-stone-800">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
                    <span className="text-6xl font-bold text-stone-900">
                      {username ? username[0].toUpperCase() : user.email[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Upload overlay */}
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <div className="text-center">
                    <svg className="w-8 h-8 text-white mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-white text-sm font-medium">Change Photo</span>
                  </div>
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>

            {/* Quick Actions */}
            <div className="mt-6 space-y-3">
              <Link 
                to={`/user/${user.id}`}
                className="flex items-center justify-center gap-2 w-full bg-yellow-500 hover:bg-yellow-400 text-stone-900 font-bold py-3 px-4 rounded-xl transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Public Profile
              </Link>
              <Link 
                to="/watchlist"
                className="flex items-center justify-center gap-2 w-full bg-stone-800 hover:bg-stone-700 text-white font-semibold py-3 px-4 rounded-xl transition border border-stone-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                My Watchlist
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-stone-800/50 rounded-xl p-4 text-center border border-stone-700/50 hover:border-yellow-400/50 transition cursor-pointer" onClick={() => setActiveTab('watchlist')}>
                <div className="text-2xl font-bold text-yellow-400">{stats.watchlistCount}</div>
                <div className="text-xs text-gray-400 mt-1">Watchlist</div>
              </div>
              <div className="bg-stone-800/50 rounded-xl p-4 text-center border border-stone-700/50 hover:border-yellow-400/50 transition cursor-pointer" onClick={() => setActiveTab('reviews')}>
                <div className="text-2xl font-bold text-yellow-400">{stats.reviewsCount}</div>
                <div className="text-xs text-gray-400 mt-1">Reviews</div>
              </div>
              <div className="bg-stone-800/50 rounded-xl p-4 text-center border border-stone-700/50 hover:border-blue-400/50 transition cursor-pointer" onClick={() => setActiveTab('followers')}>
                <div className="text-2xl font-bold text-blue-400">{stats.followersCount}</div>
                <div className="text-xs text-gray-400 mt-1">Followers</div>
              </div>
              <div className="bg-stone-800/50 rounded-xl p-4 text-center border border-stone-700/50 hover:border-green-400/50 transition cursor-pointer" onClick={() => setActiveTab('following')}>
                <div className="text-2xl font-bold text-green-400">{stats.followingCount}</div>
                <div className="text-xs text-gray-400 mt-1">Following</div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="flex-1 min-w-0">
            {/* Username & Edit */}
            <div className="flex items-start justify-between mb-2">
              {editing ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-stone-800 text-white text-2xl md:text-3xl font-bold px-4 py-2 rounded-lg border border-stone-600 focus:border-yellow-400 focus:outline-none"
                    placeholder="Enter username"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateUsername}
                      className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setUsername(profile?.username || '');
                      }}
                      className="bg-stone-700 hover:bg-stone-600 text-white px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">{username || 'User'}</h1>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-stone-800 rounded-lg transition"
                    title="Edit username"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Email & Member Since */}
            <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-6">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {user.email}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Tabs */}
            <div className="border-b border-stone-700 mb-6">
              <div className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition-all border-b-2 ${
                      activeTab === tab.id
                        ? 'text-yellow-400 border-yellow-400'
                        : 'text-gray-400 border-transparent hover:text-white hover:border-stone-600'
                    }`}
                  >
                    <TabIcon type={tab.id} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        activeTab === tab.id ? 'bg-yellow-400/20 text-yellow-400' : 'bg-stone-700 text-gray-400'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="pb-12">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Account Info */}
                  <div className="bg-stone-900/50 rounded-2xl p-6 border border-stone-800">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Account Information
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-stone-800/50 rounded-xl p-4">
                        <p className="text-gray-500 text-sm mb-1">Email Address</p>
                        <p className="text-white">{user.email}</p>
                      </div>
                      <div className="bg-stone-800/50 rounded-xl p-4">
                        <p className="text-gray-500 text-sm mb-1">Last Sign In</p>
                        <p className="text-white">
                          {new Date(user.last_sign_in_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-stone-800/50 rounded-xl p-4 md:col-span-2">
                        <p className="text-gray-500 text-sm mb-1">Account ID</p>
                        <p className="text-white font-mono text-sm">{user.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Reviews */}
                  {reviews.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Recent Reviews</h2>
                        <button 
                          onClick={() => setActiveTab('reviews')}
                          className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                        >
                          View All →
                        </button>
                      </div>
                      <div className="grid gap-4">
                        {reviews.slice(0, 3).map((review) => (
                          <Link
                            key={review.id}
                            to={`/movie/${review.movie_id}`}
                            className="flex gap-4 bg-stone-900/50 rounded-xl p-4 border border-stone-800 hover:border-yellow-400/50 transition group"
                          >
                            {review.movie_poster && (
                              <img
                                src={`https://image.tmdb.org/t/p/w92${review.movie_poster}`}
                                alt={review.movie_title}
                                className="w-16 h-24 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-semibold group-hover:text-yellow-400 transition">{review.movie_title}</h3>
                              <div className="flex items-center gap-2 my-2">
                                <div className="flex items-center bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded text-sm font-medium">
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  {review.rating}/10
                                </div>
                                <span className="text-gray-500 text-sm">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-400 text-sm line-clamp-2">{review.comment}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Watchlist */}
                  {watchlist.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Recently Added to Watchlist</h2>
                        <button 
                          onClick={() => setActiveTab('watchlist')}
                          className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                        >
                          View All →
                        </button>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {watchlist.slice(0, 6).map((item) => (
                          <Link
                            key={item.id}
                            to={item.media_type === 'tv' ? `/tv/${item.movie_id}` : `/movie/${item.movie_id}`}
                            className="group"
                          >
                            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-stone-800">
                              <img
                                src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : 'https://via.placeholder.com/342x513?text=No+Poster'}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                            </div>
                            <p className="text-white text-xs mt-2 line-clamp-1 group-hover:text-yellow-400 transition">
                              {item.title}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {reviews.length === 0 && watchlist.length === 0 && (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">🎬</div>
                      <h3 className="text-xl font-semibold text-white mb-2">Your journey begins here!</h3>
                      <p className="text-gray-400 mb-6">Start exploring movies and TV shows to build your collection.</p>
                      <Link to="/" className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-stone-900 font-bold py-3 px-6 rounded-xl transition">
                        Discover Movies
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Watchlist Tab */}
              {activeTab === 'watchlist' && (
                <div>
                  {watchlist.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">📺</div>
                      <h3 className="text-xl font-semibold text-white mb-2">Your watchlist is empty</h3>
                      <p className="text-gray-400 mb-6">Start adding movies and TV shows you want to watch!</p>
                      <Link to="/" className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-stone-900 font-bold py-3 px-6 rounded-xl transition">
                        Browse Movies
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {watchlist.map((item) => (
                        <Link
                          key={item.id}
                          to={item.media_type === 'tv' ? `/tv/${item.movie_id}` : `/movie/${item.movie_id}`}
                          className="group"
                        >
                          <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-stone-800 shadow-lg">
                            <img
                              src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : 'https://via.placeholder.com/342x513?text=No+Poster'}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <p className="text-white font-medium text-sm">{item.title}</p>
                              </div>
                            </div>
                            <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs px-2 py-1 rounded font-medium">
                              {item.media_type === 'tv' ? 'TV' : 'Movie'}
                            </div>
                            {item.vote_average > 0 && (
                              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {item.vote_average.toFixed(1)}
                              </div>
                            )}
                          </div>
                          <p className="text-white text-sm mt-2 line-clamp-1 group-hover:text-yellow-400 transition">
                            {item.title}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  {reviews.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">⭐</div>
                      <h3 className="text-xl font-semibold text-white mb-2">No reviews yet</h3>
                      <p className="text-gray-400 mb-6">Share your thoughts on movies and TV shows!</p>
                      <Link to="/" className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-stone-900 font-bold py-3 px-6 rounded-xl transition">
                        Find Something to Review
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Link
                          key={review.id}
                          to={`/movie/${review.movie_id}`}
                          className="flex gap-4 bg-stone-900/50 rounded-xl p-5 border border-stone-800 hover:border-yellow-400/50 transition group"
                        >
                          {review.movie_poster && (
                            <img
                              src={`https://image.tmdb.org/t/p/w154${review.movie_poster}`}
                              alt={review.movie_title}
                              className="w-20 h-30 object-cover rounded-lg shadow-lg"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition">{review.movie_title}</h3>
                            <div className="flex items-center gap-3 my-2">
                              <div className="flex items-center bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-lg text-sm font-bold">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {review.rating}/10
                              </div>
                              <span className="text-gray-500 text-sm">
                                {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-gray-300 line-clamp-3">{review.comment}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Followers Tab */}
              {activeTab === 'followers' && (
                <div>
                  {followers.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">👥</div>
                      <h3 className="text-xl font-semibold text-white mb-2">No followers yet</h3>
                      <p className="text-gray-400">When people follow you, they'll appear here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {followers.map((follower) => (
                        <Link
                          key={follower?.id}
                          to={`/user/${follower?.id}`}
                          className="bg-stone-900/50 rounded-xl p-5 text-center border border-stone-800 hover:border-yellow-400/50 transition group"
                        >
                          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-amber-600 mb-3">
                            {follower?.avatar_url ? (
                              <img src={follower.avatar_url} alt={follower.username} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-stone-900">
                                  {follower?.username?.[0]?.toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-white font-semibold group-hover:text-yellow-400 transition">{follower?.username || 'User'}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Following Tab */}
              {activeTab === 'following' && (
                <div>
                  {following.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">➕</div>
                      <h3 className="text-xl font-semibold text-white mb-2">Not following anyone yet</h3>
                      <p className="text-gray-400">Find users to follow and see their activity!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {following.map((followedUser) => (
                        <Link
                          key={followedUser?.id}
                          to={`/user/${followedUser?.id}`}
                          className="bg-stone-900/50 rounded-xl p-5 text-center border border-stone-800 hover:border-yellow-400/50 transition group"
                        >
                          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-amber-600 mb-3">
                            {followedUser?.avatar_url ? (
                              <img src={followedUser.avatar_url} alt={followedUser.username} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-stone-900">
                                  {followedUser?.username?.[0]?.toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-white font-semibold group-hover:text-yellow-400 transition">{followedUser?.username || 'User'}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
