import React, { useState, useEffect } from 'react';
import api from '../api/api';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [expandedLogId, setExpandedLogId] = useState(null);

    const fetchLogs = async (page = 1) => {
        try {
            setLoading(true);
            setExpandedLogId(null);
            const res = await api.get(`/logs?page=${page}&limit=50`);
            setLogs(res.data.data || []);
            setPagination(res.data.pagination || null);
            setCurrentPage(page);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching logs:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(1);
    }, []);

    if (loading && logs.length === 0) return (
        <div className="p-12 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-indigo-600 font-bold animate-pulse uppercase tracking-widest text-xs text-center">Auditing Records...</p>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 max-w-[1400px] mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tighter uppercase">Admin Logs</h2>
                    <p className="text-gray-500 font-medium text-xs sm:text-sm">Administrative mutation & security audit trail.</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {pagination && (
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">
                            {pagination.total} ENTRIES
                        </div>
                    )}
                    <button
                        onClick={() => fetchLogs(1)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-indigo-100 transition-all"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stamp & IP</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Identity</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Method</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Activity</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Data</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y divide-gray-100 text-sm ${loading ? 'opacity-50' : ''}`}>
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-[11px] font-mono font-bold text-gray-600">
                                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </div>
                                        <div className="text-[9px] text-gray-400 font-mono mt-0.5">{log.ip || '0.0.0.0'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black border ${log.username === 'lead_admin'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                }`}>
                                                {log.username?.[0]?.toUpperCase() || 'S'}
                                            </div>
                                            <span className="font-bold text-gray-700 text-[13px]">{log.username || 'system'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <code className={`px-1.5 py-0.5 rounded text-[10px] font-black ${log.method === 'DELETE' ? 'bg-red-50 text-red-600' :
                                            log.method === 'POST' ? 'bg-emerald-50 text-emerald-600' :
                                                log.method === 'PUT' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-gray-100 text-gray-500'
                                            }`}>
                                            {log.method}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 max-w-sm">
                                        <div className="text-[10px] font-mono text-gray-400 truncate mb-0.5">{log.endpoint}</div>
                                        <div className="text-[11px] text-gray-600 font-semibold leading-tight">{log.message}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        {log.details ? (
                                            <div>
                                                <button
                                                    onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                                    className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded transition-all ${expandedLogId === log.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-indigo-500 hover:bg-indigo-50'}`}
                                                >
                                                    {expandedLogId === log.id ? 'Close' : 'Payload'}
                                                </button>
                                                {expandedLogId === log.id && (
                                                    <div className="absolute right-6 top-12 w-80 p-4 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 text-left animate-in zoom-in-95 duration-200">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Details View</span>
                                                            <button onClick={() => setExpandedLogId(null)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">&times;</button>
                                                        </div>
                                                        <pre className="text-[10px] font-mono text-gray-500 whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                            {JSON.stringify(log.details, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter">Empty</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-400 text-sm font-medium">
                                        No logs available yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION CONTROLS */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Page {pagination.page} of {pagination.totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1 || loading}
                                onClick={() => fetchLogs(currentPage - 1)}
                                className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all"
                            >
                                Previous
                            </button>
                            <button
                                disabled={currentPage === pagination.totalPages || loading}
                                onClick={() => fetchLogs(currentPage + 1)}
                                className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLogs;
