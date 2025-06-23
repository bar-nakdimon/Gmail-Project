import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/SideBar';
import { Outlet } from 'react-router-dom';
import '../styles.css';
/**
 * MainPage layout: fixed header on top, sidebar on the side, and dynamic content in the center.
 * All content in <Outlet /> is rendered dynamically (Inbox, Compose, MailView, etc).
 */
export default function MainPage() {
  return (
            <div className="main-layout">
              <Header />
              <div className="main-content">
                <Sidebar />
                <main className="main-area">
                  <Outlet />
                </main>
              </div>
            </div>

              );
} 
