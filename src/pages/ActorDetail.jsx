import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import Footer from '../components/Footer';

export default function ActorDetail() {
  const { id } = useParams();
  const [actor, setActor] = useState(null);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActorData = async () => {
      try {
        const [actorData, creditsData] = await Promise.all([
          tmdbService.getActorDetails(id),
          tmdbService.getActorMovieCredits(id),
        ]);
        
        setActor(actorData);
        // Sort by popularity and get top movies with posters
        const sortedCredits = creditsData.cast?.sort((a, b) => b.popularity - a.popularity) || [];
        setCredits(sortedCredits.filter(movie => movie.poster_path).slice(0, 20));
      } catch (error) {
        console.error('Error fetching actor details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActorData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-yellow-400 text-2xl">Loading...</div>
      </div>
    );
  }

  if (!actor) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-white text-2xl">Actor not found</div>
      </div>
    );
  }

  const profileUrl = tmdbService.getImageUrl(actor.profile_path, 'h632');
  const age = actor.birthday ? new Date().getFullYear() - new Date(actor.birthday).getFullYear() : null;

  return (
    <div className="bg-stone-950 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Photo */}
          <div className="md:w-1/3">
            <img
              src={profileUrl}
              alt={actor.name}
              className="w-full rounded-lg shadow-2xl"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/500x750?text=No+Photo';
              }}
            />
          </div>

          {/* Actor Info */}
          <div className="md:w-2/3 text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{actor.name}</h1>

            {/* Personal Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              {actor.birthday && (
                <div>
                  <span className="text-gray-400">Born:</span>
                  <span className="ml-2">{new Date(actor.birthday).toLocaleDateString()}</span>
                  {age && <span className="text-gray-400"> ({age} years old)</span>}
                </div>
              )}
              {actor.place_of_birth && (
                <div>
                  <span className="text-gray-400">Birthplace:</span>
                  <span className="ml-2">{actor.place_of_birth}</span>
                </div>
              )}
              {actor.known_for_department && (
                <div>
                  <span className="text-gray-400">Known For:</span>
                  <span className="ml-2">{actor.known_for_department}</span>
                </div>
              )}
              {actor.popularity && (
                <div>
                  <span className="text-gray-400">Popularity:</span>
                  <span className="ml-2">{actor.popularity.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Biography */}
            {actor.biography && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-3">Biography</h2>
                <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                  {actor.biography}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Filmography */}
        {credits.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-white mb-6">Known For</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {credits.map((movie) => (
                <Link key={movie.id} to={`/movie/${movie.id}`}>
                  <div className="bg-stone-800 rounded-lg overflow-hidden hover:scale-105 transition-transform">
                    <img
                      src={tmdbService.getImageUrl(movie.poster_path)}
                      alt={movie.title}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                      }}
                    />
                    <div className="p-3">
                      <p className="text-white font-semibold text-sm line-clamp-2">
                        {movie.title}
                      </p>
                      {movie.character && (
                        <p className="text-gray-400 text-xs mt-1">
                          as {movie.character}
                        </p>
                      )}
                      {movie.release_date && (
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(movie.release_date).getFullYear()}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
