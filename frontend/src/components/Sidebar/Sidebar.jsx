import { useDream } from '../../contexts/DreamContext';
import SidebarHeader from './SidebarHeader';
import DreamList from './DreamList';
import './Sidebar.css';

const Sidebar = () => {
  const { sidebarCollapsed } = useDream();

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <SidebarHeader />
      <DreamList />
    </aside>
  );
};

export default Sidebar;
