import React, { useState } from 'react';
import api from '../api/api';

const UserLookup = () => {
    const [abid, setAbid] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLookup = async (e) => {
        e.preventDefault();
        setError(null);
        setResult(null);
        setLoading(true);

        const input = abid.trim().toUpperCase();

        // Extract numeric part robustly: strip 'AB', 'AB26', 'AB00', etc.
        // This handles cases like 'AB0042', 'AB260042', or just '42'
        const numericPart = input.replace(/[^0-9]/g, '');
        const targetSerial = parseInt(numericPart, 10);

        if (isNaN(targetSerial)) {
            setError("Invalid format. Please enter a numerical ID or ABID.");
            setLoading(false);
            return;
        }

        try {
            const res = await api.get('/users');
            const users = res.data.users;

            const foundUser = users.find(u => u.serialId === targetSerial);

            if (foundUser) {
                setResult(foundUser);
            } else {
                setError(`No user found with Serial ID: ${targetSerial}`);
            }

        } catch (err) {
            console.error("Lookup failed:", err);
            setError("Failed to connect to server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase">User Finder</h2>
                <p className="text-gray-500 font-medium text-sm">Quickly locate participants using their ABID or Serial Number.</p>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-2 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
                <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-gray-400 font-black text-[10px] sm:text-xs tracking-widest uppercase">ID</span>
                        </div>
                        <input
                            type="text"
                            value={abid}
                            onChange={(e) => setAbid(e.target.value)}
                            placeholder="e.g. AB0042 or 42"
                            className="w-full pl-12 sm:pl-16 pr-4 py-3 sm:py-4 bg-gray-50 border-0 rounded-xl focus:ring-1 focus:ring-yellow-500 outline-none font-mono text-base sm:text-lg font-bold text-gray-800 transition-all"
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-yellow-500 text-black px-8 py-3 sm:py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-yellow-600 transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        )}
                        <span>{loading ? 'Searching...' : 'Find User'}</span>
                    </button>
                </form>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-700 font-medium text-sm">{error}</span>
                </div>
            )}

            {result && (
                <div className="bg-white border border-gray-100 border-l-4 border-l-yellow-500 rounded-2xl shadow-lg shadow-gray-200/40 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50/30 gap-4">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">{result.name}</h3>
                            <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-widest">Verified Participant</p>
                        </div>
                        <div className="px-4 py-2 bg-yellow-50 border border-yellow-100 rounded-xl text-sm font-mono font-bold text-yellow-700 shadow-sm">
                            AB{String(result.serialId).padStart(5, '0')}
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-sm">
                        <div className="space-y-6">
                            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">
                                <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-black mb-2">Contact Details</label>
                                <div className="space-y-1">
                                    <p className="text-gray-900 font-bold truncate">{result.email}</p>
                                    <p className="text-gray-600 font-medium">{result.phoneNumber || 'No phone provided'}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">
                                <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-black mb-2">Institutional Info</label>
                                <p className="text-gray-900 font-bold">{result.collegeName || 'Not Specified'}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">
                                <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-black mb-2">Activity Tracking</label>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
                                        <span className="text-gray-400">Pass Status</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${result.purchasedPasses?.length > 0 ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
                                            {result.purchasedPasses?.length > 0 ? "Active" : "None"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
                                        <span className="text-gray-400">Registrations</span>
                                        <span className="font-black text-gray-900 text-lg">{result.registrations?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 py-3">
                                <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-black mb-2">System Identifier</label>
                                <div className="flex items-center gap-2 group">
                                    <code className="text-[10px] font-mono text-gray-400 truncate flex-1">{result.id}</code>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(result.id);
                                            alert("Copied to clipboard");
                                        }}
                                        className="p-1.5 text-gray-300 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-all flex-shrink-0"
                                        title="Copy UID"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserLookup;

