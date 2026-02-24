import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Layout = ({ children }) => <div className="p-10">{children}</div>;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <nav className="p-4 border-b border-gray-800">StoryVerse Alpha</nav>
        <Layout>
          <Routes>
            <Route path="/" element={<h1>Dashboard: Analysis Overview</h1>} />
            <Route path="/library" element={<h1>Media & Library Management</h1>} />
            <Route path="/analyzer" element={<h1>AI Character Psychology</h1>} />
            <Route path="/forum" element={<h1>Community Intelligence</h1>} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}
export default App;