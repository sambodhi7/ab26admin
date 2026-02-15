import { useState } from 'react'
import reactLogo from './assets/react.svg'


import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import viteLogo from '/vite.svg'
import './App.css'
import PassTypeAdmin from './pages/PassTypeAdmin.jsx';
import AccommodationTypeAdmin from './pages/AccommodationTypeAdmin.jsx';
import EventAdmin from './pages/EventAdmin.jsx';
import EventDetails from './pages/EventDetails.jsx';
import TeamAdmin from './pages/TeamAdmin';
import UserAdmin from './pages/UserAdmin';
import SalesAdmin from './pages/SalesAdmin';
import UserLookup from './pages/UserLookup';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <nav className="bg-white border-b sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tighter text-indigo-600">AB26 ADMIN</div>
          <div className="flex gap-6 text-sm font-medium text-gray-500">
            <Link to="/admin/events" className="hover:text-indigo-600 transition">Events</Link>
            <Link to="/admin/teams" className="hover:text-indigo-600 transition">Teams</Link>
            <Link to="/admin/users" className="hover:text-indigo-600 transition">Users</Link>
            <Link to="/admin/lookup" className="hover:text-amber-600 transition text-amber-600 font-bold bg-amber-50 px-2 rounded">Lookup</Link>
            <Link to="/admin/sales" className="hover:text-indigo-600 transition">Sales</Link>
            <Link to="/admin/passes" className="hover:text-indigo-600 transition">Passes</Link>
            <Link to="/admin/accommodation" className="hover:text-indigo-600 transition">Accommodation</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/admin/lookup" replace />} />
          <Route path="/admin/events" element={<EventAdmin />} />
          <Route path="/admin/events/:id" element={<EventDetails />} />
          <Route path="/admin/teams" element={<TeamAdmin />} />
          <Route path="/admin/users" element={<UserAdmin />} />
          <Route path="/admin/lookup" element={<UserLookup />} />
          <Route path="/admin/sales" element={<SalesAdmin />} />
          <Route path="/admin/passes" element={<PassTypeAdmin />} />
          <Route path="/admin/accommodation" element={<AccommodationTypeAdmin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

