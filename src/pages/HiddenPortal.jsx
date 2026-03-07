import React from 'react';
import { Link } from 'react-router-dom';

const HiddenPortal = () => {
    const categories = [
        {
            title: "Core Management",
            links: [
                { to: "/admin/events", label: "Event Management", desc: "Create and edit main events" },
                { to: "/admin/teams", label: "Team Management", desc: "View and manage registered teams" },
                { to: "/admin/users", label: "User Database", desc: "Browse all registered users" },
                { to: "/admin/munreg", label: "abMUN Board", desc: "MUN specific delegate allocations" },
            ]
        },
        {
            title: "Finance & Logistics",
            links: [
                { to: "/admin/xyz-sales-69", label: "Sales Dashboard", desc: "Financial tracking and stats" },
                { to: "/admin/quantum-passes-69", label: "Pass Types", desc: "Configure event pass pricing" },
                { to: "/admin/nebula-stay-69", label: "Accommodation", desc: "Manage stay types and allocations" },
                { to: "/admin/omega-manual-entry-69", label: "Manual Entry", desc: "Bypass gateway for offline payments" },
            ]
        },
        {
            title: "Security & Tools",
            links: [
                { to: "/admin/lookup", label: "ABID Lookup", desc: "Quick delegate identification" },
                { to: "/adming/scan-pass", label: "Pass Scanner", desc: "On-ground entry verification" },
                { to: "/admin/portal-security-log-69", label: "Admin Logs", desc: "Security audit trail (Highly Sensitive)" },
                { to: "/admin/god-mode-69", label: "God Mode", desc: "Direct User & Registration Manipulation" },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-8 sm:p-12 font-sans selection:bg-indigo-500/10">
            <div className="max-w-5xl mx-auto space-y-16">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                        Admin Shadow Portal
                    </div>

                    <p className="text-gray-500 max-w-xl text-lg font-medium">
                        Central command center for hidden administrative protocols. Unauthorized access is recorded.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {categories.map((cat, i) => (
                        <div key={i} className="space-y-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] pl-1 border-l-2 border-indigo-500/30">{cat.title}</h3>
                            <div className="space-y-4">
                                {cat.links.map((link, j) => (
                                    <Link
                                        key={j}
                                        to={link.to}
                                        className="group block p-4 rounded-2xl bg-white border border-gray-100 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{link.label}</span>
                                            <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </div>
                                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">{link.desc}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-20 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        System Status: <span className="text-emerald-600">Nominal</span>
                    </div>
                    <div className="text-[10px] font-mono text-gray-300">
                        SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HiddenPortal;
