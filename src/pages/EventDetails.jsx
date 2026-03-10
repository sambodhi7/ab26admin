import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender
} from '@tanstack/react-table';
import api from '../api/api';
import ExportCsvButton from '../components/ExportCsvButton';

// --- SUB-COMPONENT: ADD ROUND 2 MODAL ---
const AddRound2Modal = ({ eventId, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ email: '', teamCode: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post(`/events/${eventId}/round2`, formData);
            onSuccess(res.data.entry);
        } catch (err) {
            console.error("Failed to add to Round 2:", err);
            alert(err.response?.data?.error || "Failed to add to Round 2");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Add directly to Round 2</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Enter User Email OR Team Code</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">User Email</label>
                        <input
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value, teamCode: '' })}
                            placeholder="user@example.com"
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled={!!formData.teamCode}
                        />
                    </div>
                    <div className="text-center text-gray-400 font-bold">- OR -</div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Team Code</label>
                        <input
                            value={formData.teamCode}
                            onChange={e => setFormData({ ...formData, teamCode: e.target.value, email: '' })}
                            placeholder="TEAM123"
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled={!!formData.email}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-100 rounded-lg text-gray-600">Cancel</button>
                        <button
                            type="submit"
                            disabled={isSubmitting || (!formData.email && !formData.teamCode)}
                            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {isSubmitting ? "Adding..." : "Add"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RegistrationDetailsModal = ({ registration, onClose }) => {
    if (!registration) return null;
    const isTeam = !!registration.team;

    // Helper to get pass info
    const getPassInfo = (user) => {
        if (!user?.purchasedPasses?.length) return <span className="text-red-500">No Pass</span>;
        return <span className="text-green-600 font-semibold">{user.purchasedPasses.map(p => p.passType.name).join(", ")}</span>;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-2xl p-6 bg-white rounded-xl shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>

                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                    {isTeam ? `Team: ${registration.team?.name}` : "Registration Details"}
                </h2>

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Registration ID</label>
                            <p className="font-mono text-gray-700">{registration.id}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                            <p className="text-gray-700">{new Date(registration.createdAt).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Submission String */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Submission / Drive Link</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200 break-all text-sm">
                            {registration.submissionString ? (
                                registration.submissionString.startsWith('http') ?
                                    <a href={registration.submissionString} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{registration.submissionString}</a> :
                                    registration.submissionString
                            ) : (
                                <span className="text-gray-400 italic">No submission provided</span>
                            )}
                        </div>
                    </div>

                    {/* Team Members List (Only for Teams) */}
                    {isTeam && registration.team && (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Team Members</label>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-2 font-semibold text-gray-600">Name</th>
                                            <th className="p-2 font-semibold text-gray-600">Phone</th>
                                            <th className="p-2 font-semibold text-gray-600">Role</th>
                                            <th className="p-2 font-semibold text-gray-600">Pass Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {registration.team.leader && (
                                            <tr className="bg-blue-50/30">
                                                <td className="p-2">{registration.team.leader.name} <span className="text-xs text-gray-500">({registration.team.leader.email})</span></td>
                                                <td className="p-2 font-mono text-sm">{registration.team.leader.phoneNumber || 'N/A'}</td>
                                                <td className="p-2"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">Leader</span></td>
                                                <td className="p-2">{getPassInfo(registration.team.leader)}</td>
                                            </tr>
                                        )}
                                        {registration.team.members?.map(m => (
                                            <tr key={m.id}>
                                                <td className="p-2">{m.user?.name} <span className="text-xs text-gray-500">({m.user?.email})</span></td>
                                                <td className="p-2 font-mono text-sm">{m.user?.phoneNumber || 'N/A'}</td>
                                                <td className="p-2"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">Member</span></td>
                                                <td className="p-2">{getPassInfo(m.user)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Individual User Info */}
                    {!isTeam && registration.user && (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Participant</label>
                            <div className="flex items-center justify-between p-3 border rounded mt-1">
                                <div>
                                    <p className="font-bold">{registration.user.name}</p>
                                    <p className="text-sm text-gray-500">{registration.user.email}</p>
                                </div>
                                <div>
                                    {getPassInfo(registration.user)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState({ event: null, registrations: [], round2: [] });
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null); // Track which item is being processed
    const [showRound2Modal, setShowRound2Modal] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState(null);

    // Filters
    const [regFilter, setRegFilter] = useState('');
    const [round2Filter, setRound2Filter] = useState('');

    const fetchData = async () => {
        try {
            const res = await api.get(`/events/${id}/registrations`);
            setData(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching event details:", err);
            // alert("Failed to fetch event details");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handlePromote = async (reg) => {
        if (!window.confirm("Promote this user/team to Round 2?")) return;
        setProcessingId(`promote-${reg.id}`);
        try {
            const res = await api.post(`/events/${id}/promote`, {
                userId: reg.userId,
                teamId: reg.teamId
            });
            setData(prev => ({
                ...prev,
                round2: [...prev.round2, res.data.entry]
            }));
        } catch (err) {
            alert(err.response?.data?.error || "Promotion failed");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDowngrade = async (round2Id) => {
        if (!window.confirm("Remove from Round 2?")) return;
        setProcessingId(`downgrade-${round2Id}`);
        try {
            await api.post(`/events/${id}/downgrade/${round2Id}`);
            setData(prev => ({
                ...prev,
                round2: prev.round2.filter(r => r.id !== round2Id)
            }));
        } catch (err) {
            alert(err.response?.data?.error || "Downgrade failed");
        } finally {
            setProcessingId(null);
        }
    };

    // --- CSV Export Columns ---
    const regCsvColumns = [
        {
            header: 'Event Name',
            accessorFn: () => data.event?.name
        },
        {
            header: 'Participant Type',
            accessorFn: row => row.team ? 'Team' : 'Individual'
        },
        {
            header: 'Participant Name',
            accessorFn: row => row.team ? row.team.name : row.user?.name
        },
        {
            header: 'Team Code',
            accessorFn: row => row.team?.teamcode || '-'
        },
        {
            header: 'Leader/User Name',
            accessorFn: row => row.team ? row.team.leader?.name : row.user?.name
        },
        {
            header: 'Leader/User Email',
            accessorFn: row => row.team ? row.team.leader?.email : row.user?.email
        },
        {
            header: 'Leader/User Phone',
            accessorFn: row => row.team ? row.team.leader?.phoneNumber : row.user?.phoneNumber
        },
        {
            header: 'Members',
            accessorFn: row => {
                if (row.team) {
                    return row.team.members?.map(m => m.user?.name ? `${m.user?.name} (${m.user?.phoneNumber || 'N/A'})` : null).filter(Boolean).join('; ') || 'None';
                }
                return 'N/A';
            }
        },
        {
            header: 'Has Pass',
            accessorFn: row => {
                if (row.team) {
                    return row.team.leader?.purchasedPasses?.length > 0 ? 'Yes' : 'No';
                }
                return row.user?.purchasedPasses?.length > 0 ? 'Yes' : 'No';
            }
        },
        {
            header: 'In Round 2',
            accessorFn: row => {
                const isInRound2 = data.round2?.some(r2 => r2.registrationId === row.id);
                return isInRound2 ? 'Yes' : 'No';
            }
        }
    ];

    const round2CsvColumns = [
        {
            header: 'Event Name',
            accessorFn: () => data.event?.name
        },
        {
            header: 'Participant Type',
            accessorFn: row => row.team ? 'Team' : 'Individual'
        },
        {
            header: 'Participant Name',
            accessorFn: row => row.team ? row.team.name : row.user?.name
        },
        {
            header: 'Team Code',
            accessorFn: row => row.team?.teamcode || '-'
        },
        {
            header: 'Leader/User Name',
            accessorFn: row => row.team ? row.team.leader?.name : row.user?.name
        },
        {
            header: 'Leader/User Email',
            accessorFn: row => row.team ? row.team.leader?.email : row.user?.email
        },
        {
            header: 'Leader/User Phone',
            accessorFn: row => row.team ? row.team.leader?.phoneNumber : row.user?.phoneNumber
        },
        {
            header: 'Members',
            accessorFn: row => {
                if (row.team) {
                    return row.team.members?.map(m => m.user?.name ? `${m.user?.name} (${m.user?.phoneNumber || 'N/A'})` : null).filter(Boolean).join('; ') || 'None';
                }
                return 'N/A';
            }
        }
    ];

    // --- Registrations Table Columns ---
    const regColumns = [
        {
            header: 'Participant',
            accessorFn: row => {
                if (row.team) {
                    return `${row.team.name} ${row.team.teamcode} ${row.team.leader?.name} ${row.team.leader?.email}`;
                }
                return `${row.user?.name} ${row.user?.email}`;
            },
            cell: info => {
                const row = info.row.original;
                return (
                    <div
                        onClick={() => setSelectedRegistration(row)}
                        className="cursor-pointer hover:bg-gray-100 p-2 -m-2 rounded transition-colors group"
                    >
                        {row.team ? (
                            <div>
                                <div className="font-bold text-yellow-600 group-hover:text-yellow-800 underline decoration-dotted">Team: {row.team.name} ({row.team.teamcode})</div>
                                <div className="text-xs text-gray-500">Leader: {row.team.leader.name} | {row.team.leader.phoneNumber || 'N/A'}</div>
                            </div>
                        ) : (
                            <div>
                                <div className="font-bold group-hover:text-gray-900 underline decoration-dotted">{row.user?.name}</div>
                                <div className="text-xs text-gray-500">{row.user?.email} | {row.user?.phoneNumber || 'N/A'}</div>
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Pass Status',
            cell: info => {
                const row = info.row.original;

                // Helper to render pass badge
                const OnePass = ({ user, label }) => {
                    const hasPass = user?.purchasedPasses?.length > 0;
                    return (
                        <div className="text-xs mb-1 flex items-center justify-between gap-2">
                            <span className="text-gray-500 truncate max-w-[80px]" title={user.name}>{user.name.split(' ')[0]}</span>
                            {hasPass ?
                                <span className="text-green-600 font-bold bg-green-50 px-1 rounded">Yes</span> :
                                <span className="text-red-400 bg-red-50 px-1 rounded">No</span>
                            }
                        </div>
                    )
                }

                if (row.team) {
                    return (
                        <div className="flex flex-col min-w-[120px]">
                            <OnePass user={row.team.leader} />
                            {row.team.members.map(m => <OnePass key={m.id} user={m.user} />)}
                        </div>
                    );
                }

                const user = row.user;
                const passes = user?.purchasedPasses || [];
                if (passes.length > 0) {
                    return <span className="text-green-600 font-bold text-sm">{passes.map(p => p.passType.name).join(", ")}</span>
                }
                return <span className="text-red-400 font-bold text-sm">No Pass</span>;
            }
        },
        {
            header: 'Accommodation',
            cell: info => {
                const row = info.row.original;
                const user = row.user || row.team?.leader;
                const accs = user?.accomodationBookings || [];
                if (accs.length > 0) {
                    return <span className="text-green-600 font-semibold">{accs.map(a => a.accommodationType.name).join(", ")}</span>
                }
                return <span className="text-gray-400 text-xs">None</span>;
            }
        },
        {
            header: 'Actions',
            cell: info => {
                const row = info.row.original;
                // Check if already in Round 2 to disable button?
                // Ideally we check `data.round2` list.
                const isInRound2 = data.round2.some(r2 =>
                    (row.userId && r2.userId === row.userId) ||
                    (row.teamId && r2.teamId === row.teamId)
                );

                if (isInRound2) return <span className="text-xs text-green-600 font-bold border border-green-200 bg-green-50 px-2 py-1 rounded">In Round 2</span>;

                const isProcessing = processingId === `promote-${row.id}`;
                return (
                    <button
                        onClick={() => handlePromote(row)}
                        disabled={isProcessing}
                        className={`px-3 py-1 rounded text-xs text-white ${isProcessing ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                    >
                        {isProcessing ? 'Processing...' : 'Promote'}
                    </button>
                )
            }
        }
    ];

    // --- Round 2 Table Columns ---
    const round2Columns = [
        {
            header: 'Participant',
            accessorFn: row => {
                if (row.team) {
                    return `${row.team.name} ${row.team.teamcode} ${row.team.leader?.name} ${row.team.leader?.email}`;
                }
                return `${row.user?.name} ${row.user?.email}`;
            },
            cell: info => {
                const row = info.row.original;

                const handleRowClick = () => {
                    // Try to find the matching registration object which has full details (passes, submission string)
                    const matchingReg = data.registrations.find(reg => {
                        if (row.teamId) return reg.teamId === row.teamId;
                        if (row.userId) return reg.userId === row.userId;
                        return false;
                    });

                    if (matchingReg) {
                        setSelectedRegistration(matchingReg);
                    } else {
                        // Fallback: Create a temporary object with available info if no registration found
                        // This might happen if added directly to Round 2 without registration (rare but possible)
                        // Note: Passes/Accommodation info will be missing in this fallback as Round 2 fetch doesn't include them deep enough
                        setSelectedRegistration({
                            ...row,
                            id: `R2-${row.id}`, // Distinguish ID
                            submissionString: null, // No submission if no registration
                            // Team/User structure is compatible
                        });
                    }
                };

                return (
                    <div
                        onClick={handleRowClick}
                        className="cursor-pointer hover:bg-gray-100 p-2 -m-2 rounded transition-colors group"
                    >
                        {row.team ? (
                            <div>
                                <div className="font-bold text-yellow-600 group-hover:text-yellow-800 underline decoration-dotted">Team: {row.team.name}</div>
                                <div className="text-xs text-gray-500">Leader: {row.team.leader?.name} | {row.team.leader?.phoneNumber || 'N/A'}</div>
                            </div>
                        ) : (
                            <div>
                                <div className="font-bold group-hover:text-gray-900 underline decoration-dotted">{row.user?.name}</div>
                                <div className="text-xs text-gray-500">{row.user?.email} | {row.user?.phoneNumber || 'N/A'}</div>
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Actions',
            cell: info => {
                const isProcessing = processingId === `downgrade-${info.row.original.id}`;
                return (
                    <button
                        onClick={() => handleDowngrade(info.row.original.id)}
                        disabled={isProcessing}
                        className={`px-3 py-1 rounded text-xs border ${isProcessing ? 'bg-red-50 text-red-400 border-red-100 cursor-not-allowed' : 'bg-red-100 text-red-600 border-red-200 hover:bg-red-200'}`}
                    >
                        {isProcessing ? 'Removing...' : 'Remove / Downgrade'}
                    </button>
                )
            }
        }
    ];

    const regTable = useReactTable({
        data: data.registrations,
        columns: regColumns,
        state: { globalFilter: regFilter },
        onGlobalFilterChange: setRegFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const round2Table = useReactTable({
        data: data.round2,
        columns: round2Columns,
        state: { globalFilter: round2Filter },
        onGlobalFilterChange: setRound2Filter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    if (loading) return <div className="p-8 text-center">Loading event details...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <button onClick={() => navigate('/admin/events')} className="mb-4 text-gray-500 hover:text-gray-800">
                &larr; Back to Events
            </button>

            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900">{data.event?.name}</h1>
                <p className="text-gray-500">{data.event?.club} | {data.event?.isTeamEvent ? "Team Event" : "Individual Event"}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SECTION 1: REGISTRATIONS */}
                <div className="bg-white border rounded-2xl shadow-sm flex flex-col h-[600px]">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                        <h3 className="font-bold text-lg text-gray-800">Registrations ({data.registrations.length})</h3>
                        <div className="flex items-center gap-2">
                            <input
                                placeholder="Search..."
                                className="px-3 py-1 text-sm border rounded hover:border-blue-400 outline-none"
                                value={regFilter ?? ''}
                                onChange={e => setRegFilter(e.target.value)}
                            />
                            <ExportCsvButton
                                rows={regTable.getFilteredRowModel().rows.map(r => r.original)}
                                columns={regCsvColumns}
                                filename={`${data.event?.name?.toLowerCase().replace(/\s+/g, '-')}-registrations.csv` || 'event-registrations.csv'}
                            />
                        </div>
                    </div>
                    <div className="overflow-auto flex-1 p-0">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 sticky top-0">
                                {regTable.getHeaderGroups().map(hg => (
                                    <tr key={hg.id}>
                                        {hg.headers.map(h => (
                                            <th key={h.id} className="p-3 text-xs font-bold text-gray-500 uppercase">
                                                {flexRender(h.column.columnDef.header, h.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {regTable.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-blue-50/50">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="p-3 text-sm text-gray-700">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                {data.registrations.length === 0 && (
                                    <tr><td colSpan={4} className="p-4 text-center text-gray-400">No registrations yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SECTION 2: ROUND 2 */}
                <div className="bg-white border rounded-2xl shadow-sm flex flex-col h-[600px]">
                    <div className="p-4 border-b flex justify-between items-center bg-purple-50 rounded-t-2xl">
                        <h3 className="font-bold text-lg text-purple-900">Round 2 Selected ({data.round2.length})</h3>
                        <div className="flex gap-2">
                            <input
                                placeholder="Search..."
                                className="px-3 py-1 text-sm border rounded hover:border-purple-400 outline-none w-32"
                                value={round2Filter ?? ''}
                                onChange={e => setRound2Filter(e.target.value)}
                            />
                            <ExportCsvButton
                                rows={round2Table.getFilteredRowModel().rows.map(r => r.original)}
                                columns={round2CsvColumns}
                                filename={`${data.event?.name?.toLowerCase().replace(/\s+/g, '-')}-round2.csv` || 'event-round2.csv'}
                            />
                            <button
                                onClick={() => setShowRound2Modal(true)}
                                className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                            >
                                + Add
                            </button>
                        </div>
                    </div>
                    <div className="overflow-auto flex-1 p-0">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 sticky top-0">
                                {round2Table.getHeaderGroups().map(hg => (
                                    <tr key={hg.id}>
                                        {hg.headers.map(h => (
                                            <th key={h.id} className="p-3 text-xs font-bold text-gray-500 uppercase">
                                                {flexRender(h.column.columnDef.header, h.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {round2Table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-purple-50/50">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="p-3 text-sm text-gray-700">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                {data.round2.length === 0 && (
                                    <tr><td colSpan={2} className="p-4 text-center text-gray-400">No participants in Round 2 yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showRound2Modal && (
                <AddRound2Modal
                    eventId={id}
                    onClose={() => setShowRound2Modal(false)}
                    onSuccess={(newEntry) => {
                        setShowRound2Modal(false);
                        if (newEntry) {
                            setData(prev => ({ ...prev, round2: [...prev.round2, newEntry] }));
                        } else {
                            fetchData();
                        }
                    }}
                />
            )}

            {selectedRegistration && (
                <RegistrationDetailsModal
                    registration={selectedRegistration}
                    onClose={() => setSelectedRegistration(null)}
                />
            )}

        </div>
    );
};

export default EventDetails;
