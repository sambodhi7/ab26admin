import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import PassTypeAdmin from './pages/PassTypeAdmin.jsx';
import AccommodationTypeAdmin from './pages/AccommodationTypeAdmin.jsx';
import EventAdmin from './pages/EventAdmin.jsx';
import EventDetails from './pages/EventDetails.jsx';
import TeamAdmin from './pages/TeamAdmin';
import UserAdmin from './pages/UserAdmin';
import SalesAdmin from './pages/SalesAdmin';
import UserLookup from './pages/UserLookup';
import Login from './pages/Login';
import MUNReg from './pages/MUNReg';
import ProtectedRoute from './components/ProtectedRoute';
import ScanPass from './pages/ScanPass.jsx';

const Navbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('admin_user');
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  const navLinks = [
    { to: "/admin/events", label: "Events" },
    { to: "/admin/teams", label: "Teams" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/munreg", label: "abMUN" },
    { to: "/admin/lookup", label: "Lookup" },
    // { to: "/admin/sales", label: "Sales" },
    // { to: "/admin/passes", label: "Passes" },
    // { to: "/admin/accommodation", label: "Accommodation" },
  ];

  return (
    <nav className="bg-white border-b sticky top-0 z-40 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4 text-xs sm:text-base">
          <div className="font-bold text-lg md:text-xl tracking-tighter text-yellow-600">AB26 ADMIN</div>
          <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
          <div className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:block">
            {username ? `Logged in as ${username}` : 'Admin Panel'}
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex gap-4 xl:gap-6 text-sm font-medium text-gray-500">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="hover:text-yellow-600 transition"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="ml-4 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          )}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {isOpen && (
        <div className="lg:hidden mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className="p-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-left p-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {!isLoginPage && <Navbar />}
      <div className={!isLoginPage ? "p-4 md:p-8" : ""}>
        {children}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/admin/lookup" replace />} />
            <Route path="/admin/events" element={<EventAdmin />} />
            <Route path="/admin/events/:id" element={<EventDetails />} />
            <Route path="/admin/teams" element={<TeamAdmin />} />
            <Route path="/admin/users" element={<UserAdmin />} />
            <Route path="/admin/munreg" element={<MUNReg />} />
            <Route path="/admin/lookup" element={<UserLookup />} />
            {/* <Route path="/admin/sales" element={<SalesAdmin />} /> */}
            {/* <Route path="/admin/passes" element={<PassTypeAdmin />} /> */}
            {/* <Route path="/admin/accommodation" element={<AccommodationTypeAdmin />} /> */}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin/lookup" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;

