import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socialService, supabase } from '../services/supabase';
import Footer from '../components/Footer';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [watchlist, setWatchlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('watchlist');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    // Redirect to own profile page if viewing own profile
    if (isOwnProfile) {
      navigate('/profile');
      return;
    }
    fetchUserData();
  }, [userId, isOwnProfile]);

  useEffect(() => {
    if (user && userId && !isOwnProfile) {
      checkFollowStatus();
    }
  }, [user, userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // First, try to get the profile
      const profileData = await socialService.getUserProfile(userId);
      
      // If no profile found, try to get just from the ID (user might exist without profile)
      if (!profileData) {
        // Check if user exists in auth (we can check by trying followers table)
        const { count } = await supabase
          .from('watchlists')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        if (count === null) {
          // User truly doesn't exist
          setProfile(null);
          setLoading(false);
          return;
        }
        
        // User exists but no profile, create a minimal profile object
        setProfile({
          id: userId,
          username: 'Anonymous User',
          avatar_url: null
        });
      } else {
        setProfile(profileData);
      }
      
      // Fetch other data
      const [followCounts, watchlistData, reviewsData, followersData, followingData] = await Promise.all([
        socialService.getFollowCounts(userId),
        socialService.getUserPublicWatchlist(userId, 24),
        socialService.getUserPublicReviews(userId, 10),
        socialService.getFollowers(userId),
        socialService.getFollowing(userId),
      ]);

      setStats(followCounts);
      setWatchlist(watchlistData || []);
      setReviews(reviewsData || []);
      setFollowers(followersData || []);
      setFollowing(followingData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const following = await socialService.isFollowing(user.id, userId);
      setIsFollowing(following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await socialService.unfollowUser(user.id, userId);
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await socialService.followUser(user.id, userId);
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">👤</div>
          <h2 className="text-3xl font-bold text-white mb-3">User not found</h2>
          <p className="text-gray-400 mb-8">This user doesn't exist or their profile is private.</p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-stone-900 font-bold py-3 px-6 rounded-xl transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const TabIcon = ({ type }) => {
    switch (type) {
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
    { id: 'watchlist', label: 'Watchlist', count: watchlist.length },
    { id: 'reviews', label: 'Reviews', count: reviews.length },
    { id: 'followers', label: 'Followers', count: stats.followers },
    { id: 'following', label: 'Following', count: stats.following },
  ];

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Hero Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent"></div>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          
          {/* Left Column - Avatar & Stats */}
          <div className="md:w-64 shrink-0">
            {/* Avatar */}
            <div className="relative mx-auto md:mx-0 w-40 h-40 md:w-48 md:h-48">
              <div className="w-full h-full rounded-2xl overflow-hidden border-4 border-stone-950 shadow-2xl bg-stone-800">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
                    <span className="text-6xl font-bold text-stone-900">
                      {profile.username ? profile.username[0].toUpperCase() : '?'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Follow Button */}
            {!isOwnProfile && (
              <div className="mt-6">
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`flex items-center justify-center gap-2 w-full font-bold py-3 px-4 rounded-xl transition ${
                    isFollowing
                      ? 'bg-stone-800 hover:bg-red-500 text-white border border-stone-700 hover:border-red-500'
                      : 'bg-yellow-500 hover:bg-yellow-400 text-stone-900'
                  } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {followLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                  ) : isFollowing ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Following
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Follow
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Stats Cards */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button 
                onClick={() => setActiveTab('watchlist')}
                className={`bg-stone-800/50 rounded-xl p-4 text-center border transition cursor-pointer ${activeTab === 'watchlist' ? 'border-yellow-400/50' : 'border-stone-700/50 hover:border-yellow-400/30'}`}
              >
                <div className="text-2xl font-bold text-yellow-400">{watchlist.length}</div>
                <div className="text-xs text-gray-400 mt-1">Watchlist</div>
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`bg-stone-800/50 rounded-xl p-4 text-center border transition cursor-pointer ${activeTab === 'reviews' ? 'border-yellow-400/50' : 'border-stone-700/50 hover:border-yellow-400/30'}`}
              >
                <div className="text-2xl font-bold text-yellow-400">{reviews.length}</div>
                <div className="text-xs text-gray-400 mt-1">Reviews</div>
              </button>
              <button 
                onClick={() => setActiveTab('followers')}
                className={`bg-stone-800/50 rounded-xl p-4 text-center border transition cursor-pointer ${activeTab === 'followers' ? 'border-blue-400/50' : 'border-stone-700/50 hover:border-blue-400/30'}`}
              >
                <div className="text-2xl font-bold text-blue-400">{stats.followers}</div>
                <div className="text-xs text-gray-400 mt-1">Followers</div>
              </button>
              <button 
                onClick={() => setActiveTab('following')}
                className={`bg-stone-800/50 rounded-xl p-4 text-center border transition cursor-pointer ${activeTab === 'following' ? 'border-green-400/50' : 'border-stone-700/50 hover:border-green-400/30'}`}
              >
                <div className="text-2xl font-bold text-green-400">{stats.following}</div>
                <div className="text-xs text-gray-400 mt-1">Following</div>
              </button>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="flex-1 min-w-0">
            {/* Username */}
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white">{profile.username || 'Anonymous'}</h1>
              {profile.verified && (
                <span className="bg-blue-500 text-white p-1 rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>

            {/* Member Info */}
            <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-6">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                CineScope Member
              </span>
              {profile.created_at && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="bg-stone-900/50 rounded-xl p-4 mb-6 border border-stone-800">
                <p className="text-gray-300">{profile.bio}</p>
              </div>
            )}

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
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-yellow-400/20 text-yellow-400' : 'bg-stone-700 text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="pb-12">
              {/* Watchlist Tab */}
              {activeTab === 'watchlist' && (
                <div>
                  {watchlist.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">📺</div>
                      <h3 className="text-xl font-semibold text-white mb-2">No items in watchlist</h3>
                      <p className="text-gray-400">This user hasn't added any movies or shows yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {watchlist.map((item) => {
                        const mediaType = item.media_type || 'movie';
                        const linkPath = mediaType === 'tv' ? `/tv/${item.movie_id}` : `/movie/${item.movie_id}`;
                        return (
                          <Link key={item.id} to={linkPath} className="group">
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
                                {mediaType === 'tv' ? 'TV' : 'Movie'}
                              </div>
                            </div>
                            <p className="text-white text-sm mt-2 line-clamp-1 group-hover:text-yellow-400 transition">
                              {item.title}
                            </p>
                          </Link>
                        );
                      })}
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
                      <p className="text-gray-400">This user hasn't written any reviews.</p>
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
                      <p className="text-gray-400">Be the first to follow this user!</p>
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
                      <h3 className="text-xl font-semibold text-white mb-2">Not following anyone</h3>
                      <p className="text-gray-400">This user hasn't followed anyone yet.</p>
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
