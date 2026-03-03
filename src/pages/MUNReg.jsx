import React, { useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender
} from '@tanstack/react-table';
import api from '../api/api';

// --- SUB-COMPONENT: ADD/EDIT MUN REGISTRATION MODAL ---
const MUNRegModal = ({ registration, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        userId: registration?.userId || '',
        eventId: registration?.eventId || 'speaking_art_1',
        d1AbId: registration?.d1AbId || '',
        committee1: registration?.committee1 || '',
        portfolios1: Array.isArray(registration?.portfolios1) ? registration.portfolios1.join(', ') : '',
        coDelegate1AbId: registration?.coDelegate1AbId || '',
        committee2: registration?.committee2 || '',
        portfolios2: Array.isArray(registration?.portfolios2) ? registration.portfolios2.join(', ') : '',
        coDelegate2AbId: registration?.coDelegate2AbId || '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                portfolios1: formData.portfolios1.split(',').map(s => s.trim()).filter(Boolean),
                portfolios2: formData.portfolios2.split(',').map(s => s.trim()).filter(Boolean),
            };

            await api.post('/mun/registrations', payload);
            onSuccess();
        } catch (err) {
            console.error("Operation failed:", err);
            alert(err.response?.data?.error || "Failed to save registration");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-lg shadow-2xl overflow-y-auto max-h-[90vh] sm:max-h-[95vh] p-6">
                <div className="flex items-center justify-between mb-8 border-b pb-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter uppercase">Board Entry</h2>
                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-[0.2em] mt-1">Direct Upsert System</p>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-600 text-3xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* SECTION 1: SYSTEM IDENTIFIERS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Event Identifier</label>
                            <input
                                value={formData.eventId}
                                onChange={e => setFormData({ ...formData, eventId: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-sm font-bold text-gray-700"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Target User ID</label>
                            <input
                                value={formData.userId}
                                onChange={e => setFormData({ ...formData, userId: e.target.value })}
                                placeholder="User UUID"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-sm font-mono"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Main Delegate ABID</label>
                            <input
                                value={formData.d1AbId}
                                onChange={e => setFormData({ ...formData, d1AbId: e.target.value })}
                                placeholder="AB0000"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-sm font-mono font-bold"
                                required
                            />
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 w-full"></div>

                    {/* SECTION 2: PREFERENCE 1 FLOW */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Committee 1</label>
                                <input
                                    value={formData.committee1}
                                    onChange={e => setFormData({ ...formData, committee1: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-sm font-medium"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Portfolios 1</label>
                                <input
                                    value={formData.portfolios1}
                                    onChange={e => setFormData({ ...formData, portfolios1: e.target.value })}
                                    placeholder="e.g. Netherlands, UK, Germany"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-sm font-medium"
                                />
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Co-Delegate 1 ABID</label>
                            <input
                                value={formData.coDelegate1AbId}
                                onChange={e => setFormData({ ...formData, coDelegate1AbId: e.target.value })}
                                placeholder="AB0000"
                                className="w-full px-4 py-3 bg-amber-50/30 border border-amber-100 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-sm font-mono"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 w-full"></div>

                    {/* SECTION 3: PREFERENCE 2 FLOW */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Committee 2</label>
                                <input
                                    value={formData.committee2}
                                    onChange={e => setFormData({ ...formData, committee2: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Portfolios 2</label>
                                <input
                                    value={formData.portfolios2}
                                    onChange={e => setFormData({ ...formData, portfolios2: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-sm font-medium"
                                />
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Co-Delegate 2 ABID</label>
                            <input
                                value={formData.coDelegate2AbId}
                                onChange={e => setFormData({ ...formData, coDelegate2AbId: e.target.value })}
                                placeholder="AB0000"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-sm font-mono"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-8 py-3 bg-white border border-gray-200 rounded-lg text-gray-500 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all">Cancel</button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 font-bold shadow-md shadow-amber-600/20"
                        >
                            {isSubmitting ? "Saving..." : "Upsert Registration"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT: MUN REGISTRATION ADMIN ---
const MUNReg = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingReg, setEditingReg] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');

    const fetchRegistrations = async () => {
        try {
            const res = await api.get('/mun/registrations');
            setRegistrations(res.data.registrations || []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching registrations:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this registration?")) return;
        try {
            await api.delete(`/mun/registrations/${id}`);
            fetchRegistrations();
        } catch (err) {
            alert("Failed to delete registration");
        }
    };

    const getBadgeColor = (text) => {
        const colors = [
            'bg-blue-50 text-blue-700 border-blue-100',
            'bg-purple-50 text-purple-700 border-purple-100',
            'bg-amber-50 text-amber-700 border-amber-100',
            'bg-emerald-50 text-emerald-700 border-emerald-100',
            'bg-rose-50 text-rose-700 border-rose-100',
        ];
        // Simple hash to keep colors consistent for the same text
        const index = Math.abs(text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
        return colors[index];
    };

    const columns = [
        {
            header: 'Delegate Info',
            accessorFn: row => `${row.d1Name} ${row.d1AbId} ${row.user?.email}`,
            cell: info => (
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{info.row.original.d1Name}</span>
                        <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">{info.row.original.d1AbId}</span>
                    </div>
                    <div className="text-xs text-gray-500">{info.row.original.user?.email}</div>
                    <div className="text-[11px] text-gray-400">{info.row.original.user?.collegeName} • {info.row.original.user?.phoneNumber}</div>
                </div>
            )
        },
        {
            header: 'Preference 1',
            accessorKey: 'committee1',
            cell: info => (
                <div className="space-y-1.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${getBadgeColor(info.getValue())}`}>
                        {info.getValue()}
                    </span>
                    <div className="flex flex-wrap gap-1">
                        {(info.row.original.portfolios1 || []).map((p, i) => (
                            <span key={i} className="text-xs text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{p}</span>
                        ))}
                    </div>
                </div>
            )
        },
        {
            header: 'Preference 2',
            accessorKey: 'committee2',
            cell: info => info.getValue() ? (
                <div className="space-y-1.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${getBadgeColor(info.getValue())}`}>
                        {info.getValue()}
                    </span>
                    <div className="flex flex-wrap gap-1">
                        {(info.row.original.portfolios2 || []).map((p, i) => (
                            <span key={i} className="text-xs text-gray-400 bg-gray-50/50 px-1.5 py-0.5 rounded border border-gray-100">{p}</span>
                        ))}
                    </div>
                </div>
            ) : <span className="text-gray-300 text-xs">None</span>
        },
        {
            header: 'Event',
            accessorKey: 'eventId',
            cell: info => (
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {info.getValue()?.replace(/_/g, ' ')}
                </span>
            )
        },
        {
            header: 'Actions',
            cell: info => (
                <div className="flex gap-2">
                    <button
                        onClick={() => setEditingReg(info.row.original)}
                        className="p-1 px-3 bg-white border border-amber-200 rounded-lg text-xs font-bold text-amber-600 hover:bg-amber-50 transition shadow-sm"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(info.row.original.id)}
                        className="p-1 px-3 bg-red-50 border border-red-100 rounded-lg text-xs font-bold text-red-600 hover:bg-red-100 transition"
                    >
                        Delete
                    </button>
                </div>
            )
        }
    ];

    const table = useReactTable({
        data: registrations,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    if (loading) return (
        <div className="p-12 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-amber-100 border-t-amber-600 rounded-full animate-spin"></div>
            <p className="text-amber-600 font-bold animate-pulse uppercase tracking-widest text-xs">Loading registrations...</p>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase">MUN Board</h2>
                    <p className="text-gray-500 font-medium text-sm">Model United Nations delegate management system.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            value={globalFilter ?? ''}
                            onChange={e => setGlobalFilter(e.target.value)}
                            placeholder="Find records..."
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-amber-500 transition-all font-medium text-sm shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-amber-600 text-white px-6 py-3 rounded-lg font-black text-sm hover:bg-amber-700 transition shadow-lg shadow-amber-600/20 whitespace-nowrap"
                    >
                        + NEW ENTRY
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-lg shadow-xl shadow-gray-200/40 overflow-hidden">
                <div className="overflow-x-auto overflow-y-hidden cursor-move active:cursor-grabbing">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            {table.getHeaderGroups().map(hg => (
                                <tr key={hg.id}>
                                    {hg.headers.map(h => (
                                        <th key={h.id} className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                            {flexRender(h.column.columnDef.header, h.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-amber-50/10 transition-colors group">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {registrations.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-200 text-xl border border-gray-100">∅</div>
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No records found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAddModal && (
                <MUNRegModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => { setShowAddModal(false); fetchRegistrations(); }}
                />
            )}

            {editingReg && (
                <MUNRegModal
                    registration={editingReg}
                    onClose={() => setEditingReg(null)}
                    onSuccess={() => { setEditingReg(null); fetchRegistrations(); }}
                />
            )}
        </div>
    );
};

export default MUNReg;
