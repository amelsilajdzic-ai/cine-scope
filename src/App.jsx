import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import TopRated from './pages/TopRated';

function App() {
  return (
    <Router basename="/cine-scope">
      <div className="min-h-screen bg-stone-950">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/top-rated" element={<TopRated />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
