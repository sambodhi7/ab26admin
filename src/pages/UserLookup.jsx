import React, { useState } from 'react';
import api from '../../api/api';

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

        const cleanAbid = abid.trim().toUpperCase();
        // Extract numeric part if user types 'AB260042' -> '42'
        // Or if they type just '42', use it.
        // Assuming backend search might need numeric serialId or handling string.
        // Let's assume we filter frontend-side for now or use the existing GetAllUsers logic if no dedicated endpoint exists, 
        // OR better: Create a focused search if the list is huge. 
        // Given current setup, fetching all users locally filter is feasible for <10k users, but let's do it efficiently.
        // ACTUALLY: We have `getAllUsers`. Let's use that and filter locally for now to avoid backend changes if not strictly needed, 
        // BUT for a "Lookup" tool, a specific backend endpoint is better.
        // LET'S TRY local filtering first since we might already have the data in cache or it's fast enough.
        // WAIT, `api.get('/users')` returns everything. This is fine for now.

        try {
            const res = await api.get('/users');
            const users = res.data.users;

            // Logic to match ABID
            // Format: AB26 + 4 digit serial (padded)
            // e.g. Serial 1 -> AB260001

            let targetSerial = null;
            if (cleanAbid.startsWith('AB26')) {
                targetSerial = parseInt(cleanAbid.replace('AB26', ''));
            } else {
                targetSerial = parseInt(cleanAbid);
            }

            if (isNaN(targetSerial)) {
                setError("Invalid ABID format. Enter 'AB26XXXX' or just the number.");
                setLoading(false);
                return;
            }

            const foundUser = users.find(u => u.serialId === targetSerial);

            if (foundUser) {
                setResult(foundUser);
            } else {
                setError("User not found with this ABID.");
            }

        } catch (err) {
            console.error("Lookup failed:", err);
            setError("Failed to fetch user data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">User Lookup</h2>

            <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
                <form onSubmit={handleLookup} className="flex gap-4">
                    <input
                        type="text"
                        value={abid}
                        onChange={(e) => setAbid(e.target.value)}
                        placeholder="Enter ABID (e.g. AB260042) or Number"
                        className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Lookup'}
                    </button>
                </form>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {result && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-green-900 mb-4">User Found!</h3>

                    <div className="grid gap-4">
                        <div className="bg-white p-4 rounded border">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">User ID (System)</label>
                            <div className="flex justify-between items-center">
                                <code className="text-lg font-mono font-bold text-gray-800">{result.id}</code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(result.id)}
                                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-gray-600"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Name</label>
                                <p className="text-lg font-semibold">{result.name}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">ABID</label>
                                <p className="text-lg font-mono">AB26{String(result.serialId).padStart(4, '0')}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Email</label>
                                <p className="text-gray-700">{result.email}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Phone</label>
                                <p className="text-gray-700">{result.phoneNumber || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserLookup;
