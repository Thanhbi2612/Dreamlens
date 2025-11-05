import { useAuth } from '../../contexts/AuthContext';
import { useDream } from '../../contexts/DreamContext';
import Hero from '../../components/Hero';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { sidebarCollapsed } = useDream();

  return (
    <div className="home-page">
      {/* Sidebar - chỉ hiển thị khi đã login */}
      {isAuthenticated && <Sidebar />}

      {/* Main content - Hero (form tạo ảnh) */}
      <main className={`home-main-content ${isAuthenticated && !sidebarCollapsed ? 'sidebar-open' : ''} ${isAuthenticated && sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Hero />
      </main>
    </div>
  );
};

export default Home;
