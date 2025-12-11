import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import Home from './pages/Home';
import TopRated from './pages/TopRated';
import FanFavourites from './pages/FanFavourites';
import MovieDetail from './pages/MovieDetail';
import Actors from './pages/Actors';
import ActorDetail from './pages/ActorDetail';
import Genres from './pages/Genres';
import Genre from './pages/Genre';
import Search from './pages/Search';
import TVShows from './pages/TVShows';
import TVShowDetail from './pages/TVShowDetail';
import TopRatedTVShows from './pages/TopRatedTVShows';
import TVGenres from './pages/TVGenres';
import TVGenre from './pages/TVGenre';

function App() {
  return (
    <LanguageProvider>
      <Router basename="/cine-scope">
        <div className="min-h-screen bg-stone-950">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/top-rated" element={<TopRated />} />
            <Route path="/fan-favourites" element={<FanFavourites />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/actors" element={<Actors />} />
            <Route path="/actor/:id" element={<ActorDetail />} />
            <Route path="/genres" element={<Genres />} />
            <Route path="/genre/:genreId" element={<Genre />} />
            <Route path="/search" element={<Search />} />
            <Route path="/tv-shows" element={<TVShows />} />
            <Route path="/tv/:id" element={<TVShowDetail />} />
            <Route path="/tv-top-rated" element={<TopRatedTVShows />} />
            <Route path="/tv-genres" element={<TVGenres />} />
            <Route path="/tv-genre/:genreId" element={<TVGenre />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
