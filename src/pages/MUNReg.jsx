import React, { useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender
} from '@tanstack/react-table';
import api from '../api/api';
import ExportCsvButton from '../components/ExportCsvButton';
import UserDetailsModal from '../components/UserDetailsModal';

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
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tighter uppercase">Board Entry</h2>
                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-[0.2em] mt-1">Direct Upsert System</p>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-600 text-3xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* SECTION 1: SYSTEM IDENTIFIERS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Event Identifier</label>
                            <input
                                value={formData.eventId}
                                onChange={e => setFormData({ ...formData, eventId: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-sm font-bold text-gray-700"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Target User ID</label>
                            <input
                                value={formData.userId}
                                onChange={e => setFormData({ ...formData, userId: e.target.value })}
                                placeholder="User UUID"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-sm font-mono"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Main Delegate ABID</label>
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
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Committee 1</label>
                                <input
                                    value={formData.committee1}
                                    onChange={e => setFormData({ ...formData, committee1: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-sm font-medium"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Portfolios 1</label>
                                <input
                                    value={formData.portfolios1}
                                    onChange={e => setFormData({ ...formData, portfolios1: e.target.value })}
                                    placeholder="e.g. Netherlands, UK, Germany"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-sm font-medium"
                                />
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Co-Delegate 1 ABID</label>
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
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Committee 2</label>
                                <input
                                    value={formData.committee2}
                                    onChange={e => setFormData({ ...formData, committee2: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Portfolios 2</label>
                                <input
                                    value={formData.portfolios2}
                                    onChange={e => setFormData({ ...formData, portfolios2: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-sm font-medium"
                                />
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Co-Delegate 2 ABID</label>
                            <input
                                value={formData.coDelegate2AbId}
                                onChange={e => setFormData({ ...formData, coDelegate2AbId: e.target.value })}
                                placeholder="AB0000"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-sm font-mono"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-8 py-3 bg-white border border-gray-200 rounded-lg text-gray-500 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">Cancel</button>
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
    const [allRegistrations, setAllRegistrations] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingReg, setEditingReg] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [showMissing, setShowMissing] = useState(false);
    const [munEvent, setMunEvent] = useState(null);
    const [passFilter, setPassFilter] = useState('all'); // 'all', 'purchased', 'not-purchased'
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchMainRegistrations = async () => {
        try {
            // Finding the event ID - conventionally 'speaking_art_1' for MUN based on initial state
            // Let's also fetch events to verify name just in case
            const eventsRes = await api.get('/events');
            const target = eventsRes.data.events.find(e => e.name.toLowerCase().includes('mun')) || eventsRes.data.events.find(e => e.id === 'speaking_art_1');

            if (target) {
                setMunEvent(target);
                const regRes = await api.get(`/events/${target.id}/registrations`);
                setAllRegistrations(regRes.data.registrations || []);
            }
        } catch (err) {
            console.error("Error fetching main event registrations:", err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data.users || []);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

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

    const handleDeleteEventRegistration = async (reg) => {
        const isTeam = !!reg.team;
        const label = isTeam ? `Team: ${reg.team.name}` : `User: ${reg.user?.name}`;

        if (!window.confirm(`Are you sure you want to permanently delete the registration for ${label} (ID: ${reg.id})?`)) return;

        try {
            await api.delete(`/registrations/${reg.id}`);
            fetchMainRegistrations();
        } catch (err) {
            console.error("Deletion failed:", err);
            alert(err.response?.data?.error || "Failed to delete this registration record.");
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchRegistrations(), fetchUsers(), fetchMainRegistrations()]);
            setLoading(false);
        };
        loadData();
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

    const userMap = React.useMemo(() => {
        const map = new Map();
        users.forEach(u => {
            map.set(u.serialId, u);
        });
        return map;
    }, [users]);

    const getUserInfoByAbId = (abid) => {
        if (!abid) return null;
        const numericPart = abid.replace(/[^0-9]/g, '');
        const targetSerial = parseInt(numericPart, 10);
        return userMap.get(targetSerial);
    };

    const missingUsers = React.useMemo(() => {
        if (!allRegistrations.length) return [];
        const boardUserIds = new Set(registrations.map(r => r.userId).filter(Boolean));
        const boardEmails = new Set(registrations.map(r => r.user?.email?.toLowerCase()).filter(Boolean));

        return allRegistrations.filter(r => {
            const user = r.user || r.team?.leader;
            const email = user?.email?.toLowerCase();
            const userId = r.userId || r.team?.leaderId;
            return !boardEmails.has(email) && !boardUserIds.has(userId);
        });
    }, [allRegistrations, registrations]);

    const filteredRegistrations = React.useMemo(() => {
        return registrations.filter(r => {
            const user = getUserInfoByAbId(r.d1AbId) || r.user;
            const hasPass = user?.purchasedPasses?.length > 0;
            if (passFilter === 'purchased') return hasPass;
            if (passFilter === 'not-purchased') return !hasPass;
            return true;
        });
    }, [registrations, passFilter, userMap]);

    const purchaseCounts = React.useMemo(() => {
        let purchased = 0;
        let notPurchased = 0;
        registrations.forEach(r => {
            const user = getUserInfoByAbId(r.d1AbId) || r.user;
            if (user?.purchasedPasses?.length > 0) purchased++;
            else notPurchased++;
        });
        return { purchased, notPurchased, total: registrations.length };
    }, [registrations, userMap]);

    const renderCoDelegateCell = (abid) => {
        if (!abid) return <span className="text-gray-300 text-[10px] italic">None</span>;
        const coDel = getUserInfoByAbId(abid);

        if (!coDel) return (
            <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 shadow-sm inline-block">
                    {abid}
                </span>
                <div className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter">Not Found</div>
            </div>
        );

        const hasPass = coDel.purchasedPasses?.length > 0;

        return (
            <div className="space-y-1.5 min-w-[140px]">
                <div className="flex flex-col gap-0.5">
                    <span
                        className="text-xs font-bold text-gray-900 leading-tight cursor-pointer hover:text-blue-600 transition-colors uppercase tracking-tight"
                        onClick={() => setSelectedUser(coDel)}
                    >
                        {coDel.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-tighter">
                        AB{String(coDel.serialId).padStart(5, '0')}
                    </span>
                </div>
                <div className="flex flex-col gap-0.5">
                    <div className="text-[10px] text-gray-600 font-medium">{coDel.phoneNumber || 'N/A PHONE'}</div>
                </div>
                <div>
                    {hasPass ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500 text-white px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest shadow-sm">
                            <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                            Yes Pass
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-500 text-white px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest shadow-sm">
                            <span className="w-1 h-1 bg-white rounded-full"></span>
                            No Pass
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const csvColumns = [
        {
            header: 'ABID',
            accessorKey: 'd1AbId'
        },
        {
            header: 'Delegate Name',
            accessorKey: 'd1Name'
        },
        {
            header: 'Email',
            accessorFn: row => row.user?.email || ''
        },
        {
            header: 'Phone',
            accessorFn: row => row.user?.phoneNumber || ''
        },
        // {
        //     header: 'College',
        //     accessorFn: row => row.user?.collegeName || ''
        // },
        {
            header: 'Committee 1',
            accessorKey: 'committee1'
        },
        {
            header: 'Portfolios 1',
            accessorFn: row => (row.portfolios1 || []).slice(0, 3).join(', ')
        },
        {
            header: 'Co-Delegate 1',
            accessorKey: 'coDelegate1AbId'
        },
        {
            header: 'Committee 2',
            accessorKey: 'committee2'
        },
        {
            header: 'Portfolios 2',
            accessorFn: row => (row.portfolios2 || []).slice(0, 3).join(', ')
        },
        {
            header: 'Co-Delegate 2',
            accessorKey: 'coDelegate2AbId'
        },
        {
            header: 'Experience',
            accessorFn: row => {
                const p1 = (row.portfolios1 || [])[3];
                const p2 = (row.portfolios2 || [])[3];
                const items = [p1, p2].filter(Boolean);
                return items.join('; ');
            }
        }
    ];

    const columns = [
        {
            header: 'Delegate Info',
            accessorFn: row => `${row.d1Name} ${row.d1AbId} ${row.user?.email}`,
            cell: info => {
                const reg = info.row.original;
                const user = getUserInfoByAbId(reg.d1AbId) || reg.user;
                const hasPass = user?.purchasedPasses?.length > 0;
                return (
                    <div className="space-y-1.5 min-w-[200px]">
                        <div
                            className="flex items-center gap-2 cursor-pointer group/name"
                            onClick={() => setSelectedUser(user)}
                        >
                            <span className="text-sm font-bold text-gray-900 group-hover/name:text-blue-600 transition-colors uppercase tracking-tight">{reg.d1Name}</span>
                            <span className="text-[10px] font-black text-gray-400 group-hover/name:text-blue-400 transition-colors">({reg.d1AbId})</span>
                            <button className="opacity-0 group-hover/name:opacity-100 bg-blue-50 text-blue-600 p-1 rounded transition-all text-[8px] font-black uppercase tracking-widest">
                                Details
                            </button>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <div className="text-xs text-gray-600 font-medium">{user?.phoneNumber || reg.user?.phoneNumber}</div>
                            <div className="text-xs text-gray-400 font-mono">{user?.email || reg.user?.email}</div>
                        </div>
                        <div className="text-[10px] font-semibold text-gray-400 uppercase">{user?.collegeName || reg.user?.collegeName || 'N/A COLLEGE'}</div>
                        <div className="mt-1">
                            {hasPass ? (
                                <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest shadow-sm shadow-emerald-500/20">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                    Yes Pass
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 bg-rose-500 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest shadow-sm shadow-rose-500/20">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                    No Pass
                                </span>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Preference 1',
            accessorKey: 'committee1',
            cell: info => {
                const reg = info.row.original;
                const portfolios = reg.portfolios1 || [];
                return (
                    <div className="space-y-2 min-w-[160px]">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border uppercase tracking-widest ${getBadgeColor(info.getValue())}`}>
                            {info.getValue()}
                        </span>
                        <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                                {portfolios.slice(0, 3).map((p, i) => (
                                    <span key={i} className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-400 ">{p}</span>
                                ))}
                            </div>
                            {portfolios.length > 3 && (
                                <div className="flex flex-wrap gap-1">
                                    {portfolios.slice(3).map((p, i) => (
                                        <span key={i} className="text-xs text-gray-500 bg-gray-50/50 px-1.5 py-0.5 rounded border border-gray-100 ">{p}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Co-Del 1',
            accessorKey: 'coDelegate1AbId',
            cell: info => renderCoDelegateCell(info.getValue())
        },
        {
            header: 'Preference 2',
            accessorKey: 'committee2',
            cell: info => info.getValue() ? (
                <div className="space-y-2 min-w-[160px]">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border uppercase tracking-widest ${getBadgeColor(info.getValue())}`}>
                        {info.getValue()}
                    </span>
                    <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                            {(info.row.original.portfolios2 || []).slice(0, 3).map((p, i) => (
                                <span key={i} className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-400 ">{p}</span>
                            ))}
                        </div>
                        {(info.row.original.portfolios2 || []).length > 3 && (
                            <div className="flex flex-wrap gap-1">
                                {(info.row.original.portfolios2 || []).slice(3).map((p, i) => (
                                    <span key={i} className="text-xs text-gray-500 bg-gray-50/50 px-1.5 py-0.5 rounded border border-gray-100 ">{p}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : <span className="text-gray-300 text-xs">None</span>
        },
        {
            header: 'Co-Del 2',
            accessorKey: 'coDelegate2AbId',
            cell: info => renderCoDelegateCell(info.getValue())
        },
        {
            header: 'Actions',
            cell: info => (
                <div className="flex gap-2">
                    <button
                        onClick={() => setEditingReg(info.row.original)}
                        className="px-3 py-1.5 bg-amber-600 text-white rounded-md text-xs font-bold uppercase hover:bg-amber-700 transition shadow-md shadow-amber-600/10"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(info.row.original.id)}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-md text-xs font-bold uppercase hover:bg-red-700 transition shadow-md shadow-red-600/10"
                    >
                        Delete
                    </button>
                </div>
            )
        }
    ];

    const table = useReactTable({
        data: filteredRegistrations,
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
        <div className="p-4 sm:p-6 max-w-[1400px] mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tighter uppercase">MUN Board</h2>
                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold border border-amber-200">
                            {table.getFilteredRowModel().rows.length} RECORDS
                        </span>
                        {missingUsers.length > 0 && (
                            <button
                                onClick={() => setShowMissing(!showMissing)}
                                className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all border shadow-sm ${showMissing ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-rose-600 border-rose-100 hover:border-rose-400'}`}
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${showMissing ? 'bg-white' : 'bg-rose-400'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${showMissing ? 'bg-white' : 'bg-rose-500'}`}></span>
                                </span>
                                {missingUsers.length} MISSING
                                <svg className={`w-3 h-3 transition-transform duration-300 ml-1 ${showMissing ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <p className="text-gray-500 font-medium text-sm">Model United Nations delegate management system.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="flex bg-gray-100 p-1 rounded-lg gap-1 border border-gray-200">
                        <button
                            onClick={() => setPassFilter('all')}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${passFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            All ({purchaseCounts.total})
                        </button>
                        <button
                            onClick={() => setPassFilter('purchased')}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${passFilter === 'purchased' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-gray-500 hover:text-emerald-600'}`}
                        >
                            Pass ({purchaseCounts.purchased})
                        </button>
                        <button
                            onClick={() => setPassFilter('not-purchased')}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${passFilter === 'not-purchased' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' : 'text-gray-500 hover:text-rose-600'}`}
                        >
                            No Pass ({purchaseCounts.notPurchased})
                        </button>
                    </div>
                    <div className="relative flex-1 md:w-64">
                        <input
                            value={globalFilter ?? ''}
                            onChange={e => setGlobalFilter(e.target.value)}
                            placeholder="Find records..."
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-amber-500 transition-all font-medium text-sm shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <ExportCsvButton
                            rows={table.getFilteredRowModel().rows.map(r => r.original)}
                            columns={csvColumns}
                            filename="mun_registrations.csv"
                            className="bg-emerald-600 text-white px-4 py-3 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 whitespace-nowrap"
                        />
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-amber-600 text-white px-4 py-3 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm hover:bg-amber-700 transition shadow-lg shadow-amber-600/20 whitespace-nowrap uppercase"
                        >
                            + NEW
                        </button>
                    </div>
                </div>
            </div>

            {/* SYNC DIFFERENCE DRAWER/COLUM */}
            {showMissing && missingUsers.length > 0 && (
                <div className="bg-rose-50/20 border border-rose-100 rounded-xl p-6 animate-in slide-in-from-top-4 fade-in duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-rose-900 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Sync Alert: Missing Board Entries
                            </h3>
                            <p className="text-xs text-rose-600 font-medium mt-1">These users are registered in <span className="font-bold underline uppercase">{munEvent?.name || 'abMUN'}</span> but haven't filled the detailed selection form.</p>
                        </div>
                        <button onClick={() => setShowMissing(false)} className="text-rose-400 hover:text-rose-600 text-2xl font-bold">&times;</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {missingUsers.map(reg => {
                            const user = reg.user || reg.team?.leader;
                            const isTeam = !!reg.team;
                            const abId = user?.serialId ? `AB${String(user.serialId).padStart(5, '0')}` : 'N/A';

                            return (
                                <div key={reg.id} className="bg-white border border-rose-100 p-3 rounded-lg shadow-sm hover:shadow-md transition-all group relative">
                                    <div className="flex flex-col gap-0.5 pr-12">
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            {isTeam && (
                                                <span className="bg-amber-100 text-amber-700 text-[8px] font-bold px-1 rounded uppercase flex-shrink-0">Team</span>
                                            )}
                                            <p className="font-bold text-gray-900 text-sm truncate">{isTeam ? reg.team.name : user?.name || 'Unknown'}</p>
                                        </div>
                                        <p className="text-[10px] font-mono text-gray-500 truncate">{user?.email || 'No email'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{abId}</p>
                                            <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
                                            <p className="text-[10px] text-indigo-500 font-bold">ID: {reg.id}</p>
                                            <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
                                            <p className="text-[10px] text-emerald-600 font-bold">{user?.phoneNumber || 'No phone'}</p>
                                        </div>
                                    </div>
                                    <div className="absolute right-3 top-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => {
                                                setEditingReg({
                                                    userId: reg.userId || reg.team?.leaderId,
                                                    eventId: munEvent?.id || 'speaking_art_1',
                                                    d1AbId: abId !== 'N/A' ? abId : '',
                                                    committee1: '',
                                                    portfolios1: '',
                                                    coDelegate1AbId: '',
                                                    committee2: '',
                                                    portfolios2: '',
                                                    coDelegate2AbId: '',
                                                });
                                            }}
                                            className="bg-rose-600 text-white p-1.5 rounded-md transition-all shadow-lg shadow-rose-600/20 hover:bg-rose-700"
                                            title="Quick Add to Board"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEventRegistration(reg)}
                                            className="bg-gray-100 text-gray-400 p-1.5 rounded-md hover:bg-rose-50 hover:text-rose-600 transition-all"
                                            title="Delete Event Entry"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="bg-white border border-gray-100 rounded-lg shadow-xl shadow-gray-200/40 overflow-hidden">
                <div className="overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            {table.getHeaderGroups().map(hg => (
                                <tr key={hg.id}>
                                    {hg.headers.map(h => (
                                        <th key={h.id} className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                                            {flexRender(h.column.columnDef.header, h.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-300">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-amber-50/10 transition-colors group">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {table.getRowModel().rows.length === 0 && (
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

            {selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
};

export default MUNReg;
