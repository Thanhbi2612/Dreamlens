import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { DreamProvider } from './contexts/DreamContext';
import Layout from './components/Layout';
import Header from './components/Header';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Settings from './pages/Settings/Settings';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <DreamProvider>
            <Layout>
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/settings" element={<Settings />} />
                {/* Generate page đã được tích hợp vào Home page */}
              </Routes>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
              />
            </Layout>
          </DreamProvider>
        </AuthProvider>
      </Router>
      <Analytics />
    </ThemeProvider>
  );
}

export default App;
