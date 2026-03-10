import React, { useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender
} from '@tanstack/react-table';
import api from '../api/api';
import ExportCsvButton from '../components/ExportCsvButton';

// --- SUB-COMPONENT: CREATE/EDIT TEAM MODAL ---
const TeamModal = ({ team, onClose, onSuccess }) => {
    const [events, setEvents] = useState([]);
    const [formData, setFormData] = useState({
        name: team?.name || '',
        eventId: team?.eventId || '',
        leaderEmail: team?.leader?.email || ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(false);

    useEffect(() => {
        // Fetch events for the dropdown
        const fetchEvents = async () => {
            setLoadingEvents(true);
            try {
                const res = await api.get('/events');
                // Filter only team events? User might want to create team for any event, 
                // but usually teams are for team events. Let's show all for now or filter if needed.
                // Assuming logic: only team events allow teams.
                setEvents(res.data.events.filter(e => e.isTeamEvent));
            } catch (err) {
                console.error("Failed to fetch events");
            } finally {
                setLoadingEvents(false);
            }
        };
        if (!team) fetchEvents(); // Only need events for creation mostly, but maybe for editing too if we allow changing event (unlikely)
    }, [team]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (team) {
                await api.put(`/teams/${team.id}`, {
                    name: formData.name,
                    leaderEmail: formData.leaderEmail
                });
            } else {
                await api.post('/teams', formData);
            }
            onSuccess();
        } catch (err) {
            console.error("Operation failed:", err);
            alert(err.response?.data?.error || "Failed to save team");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg p-6 bg-white rounded-xl shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">{team ? 'Edit Team' : 'Create New Team'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Team Name</label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>

                    {!team && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Event</label>
                            <select
                                value={formData.eventId}
                                onChange={e => setFormData({ ...formData, eventId: e.target.value })}
                                className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                                disabled={loadingEvents}
                            >
                                <option value="">Select Event</option>
                                {events.map(ev => (
                                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Leader Email</label>
                        <input
                            type="email"
                            value={formData.leaderEmail}
                            onChange={e => setFormData({ ...formData, leaderEmail: e.target.value })}
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                            placeholder="leader@example.com"
                        />
                        {team && <p className="text-xs text-yellow-600 mt-1">Warning: Changing leader will update team structure.</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-100 rounded-lg text-gray-600">Cancel</button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : (team ? "Update Team" : "Create Team")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: MANAGE MEMBERS MODAL ---
const ManageMembersModal = ({ team, onClose, onSuccess }) => {
    const [teamDetails, setTeamDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Fetch fresh team details
    const fetchTeamDetails = async () => {
        try {
            // We need a way to get a single team's details. 
            // Since we don't have a specific GET /teams/:id endpoint in controller yet (only getTeams and updateTeam),
            // we can reuse getTeams but client-side filtering is inefficient. 
            // OR we can add GET /teams/:id. 
            // For now, let's assume we can filter from the main list if we had it, but we don't.
            // Actually, `getTeams` returns all teams with members. 
            // Let's rely on the parent to pass fresh data OR implement a fetch here.

            // Better approach without changing backend: 
            // We'll trigger the parent to refresh, and the parent will pass new props.
            // BUT parent only passes `managingTeam` which is a snapshot.

            // Let's implement a quick fetch for this team. 
            // Validating: do we have GET /teams/:id?
            // Routes: router.get('/teams', adminTeamsController.getTeams);
            // We don't have a single team fetch.

            // WORKAROUND: Re-fetch all teams and find this one. (Not ideal but works for now)
            // OR ADD getTeamById.

            // Let's try to just use the response from operations to update local state.

            // INITIAL LOAD: Use the prop `team`.
            if (!teamDetails) setTeamDetails(team);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setTeamDetails(team);
        setLoading(false);
    }, [team]);

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberEmail) return;
        setIsAdding(true);
        try {
            const res = await api.post(`/teams/${team.id}/members`, { email: newMemberEmail });
            // The API returns { message, member: {...} }
            // We can update local state manually.

            setTeamDetails(prev => ({
                ...prev,
                members: [...prev.members, res.data.member]
            }));

            setNewMemberEmail('');
            // Notify parent to update main list count, but DON'T close modal
            if (onSuccess) onSuccess(false); // false = don't close
        } catch (err) {
            alert(err.response?.data?.error || "Failed to add member");
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm("Remove this member?")) return;
        try {
            await api.delete(`/teams/${team.id}/members/${userId}`);

            setTeamDetails(prev => ({
                ...prev,
                members: prev.members.filter(m => m.userId !== userId) // m.userId might be needed check schema
                // Wait, members array has structure: { id, teamId, userId, user: {...} }
                // filter by m.user.id or m.userId
            }));

            if (onSuccess) onSuccess(false);
        } catch (err) {
            alert("Failed to remove member");
        }
    };

    if (loading || !teamDetails) return <div>Loading...</div>;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl p-6 bg-white rounded-xl shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Manage Members</h2>
                        <p className="text-sm text-gray-500">Team: {teamDetails.name} ({teamDetails.teamcode})</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                {/* Add Member Form */}
                <form onSubmit={handleAddMember} className="flex gap-2 mb-6 p-4 bg-gray-50 rounded-lg">
                    <input
                        value={newMemberEmail}
                        onChange={e => setNewMemberEmail(e.target.value)}
                        placeholder="Enter user email to add..."
                        className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        type="email"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isAdding}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {isAdding ? "Adding..." : "Add Member"}
                    </button>
                </form>

                <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th className="p-3 text-xs font-bold text-gray-500 uppercase">Name</th>
                                <th className="p-3 text-xs font-bold text-gray-500 uppercase">Email</th>
                                <th className="p-3 text-xs font-bold text-gray-500 uppercase">Phone</th>
                                <th className="p-3 text-xs font-bold text-gray-500 uppercase">Role</th>
                                <th className="p-3 text-xs font-bold text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {teamDetails.leader && (
                                <tr className="bg-blue-50/50">
                                    <td className="p-3">{teamDetails.leader.name}</td>
                                    <td className="p-3 font-mono text-sm">{teamDetails.leader.email}</td>
                                    <td className="p-3 font-mono text-sm">{teamDetails.leader.phoneNumber || 'N/A'}</td>
                                    <td className="p-3"><span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">LEADER</span></td>
                                    <td className="p-3 text-gray-400 text-xs italic">Cannot Remove</td>
                                </tr>
                            )}
                            {teamDetails.members.map(m => (
                                <tr key={m.id}>
                                    <td className="p-3">{m.user?.name}</td>
                                    <td className="p-3 font-mono text-sm">{m.user?.email}</td>
                                    <td className="p-3 font-mono text-sm">{m.user?.phoneNumber || 'N/A'}</td>
                                    <td className="p-3"><span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">MEMBER</span></td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleRemoveMember(m.user?.id)}
                                            className="text-red-500 hover:text-red-700 hover:underline text-xs"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {teamDetails.members.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-gray-400">No additional members</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


const TeamAdmin = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');

    // Modals state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [managingTeam, setManagingTeam] = useState(null);

    const fetchTeams = async () => {
        try {
            const res = await api.get('/teams');
            setTeams(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching teams:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this team? This will remove all members relations.")) return;
        try {
            await api.delete(`/teams/${id}`);
            fetchTeams();
        } catch (err) {
            alert("Failed to delete team");
        }
    };

    const csvColumns = [
        {
            header: 'Team Name',
            accessorKey: 'name'
        },
        {
            header: 'Team Code',
            accessorKey: 'teamcode'
        },
        {
            header: 'Event',
            accessorFn: row => row.event?.name
        },
        {
            header: 'Leader',
            accessorFn: row => row.leader?.name
        },
        {
            header: 'Leader Email',
            accessorFn: row => row.leader?.email
        },
        {
            header: 'Leader Phone',
            accessorFn: row => row.leader?.phoneNumber || 'N/A'
        },
        {
            header: 'Members',
            accessorFn: row => {
                const memberNames = row.members?.map(m => m.user?.name ? `${m.user?.name} (${m.user?.phoneNumber || 'N/A'})` : null).filter(Boolean).join('; ') || 'None';
                return memberNames;
            }
        },
        {
            header: 'Member Count',
            accessorFn: row => row._count?.members || 0
        }
    ];

    const columns = [
        {
            header: 'Team Details',
            accessorFn: row => `${row.name} ${row.teamcode}`,
            cell: info => (
                <div>
                    <div className="font-bold text-gray-900">{info.row.original.name}</div>
                    <div className="text-xs font-mono text-gray-500">{info.row.original.teamcode}</div>
                </div>
            )
        },
        {
            header: 'Event',
            accessorFn: row => row.event?.name,
            cell: info => <span className="text-sm text-gray-600">{info.getValue()}</span>
        },
        {
            header: 'Leader',
            accessorFn: row => `${row.leader?.name} ${row.leader?.email}`,
            cell: info => (
                <div>
                    <div className="font-semibold text-sm">{info.row.original.leader?.name}</div>
                    <div className="text-xs text-gray-500">{info.row.original.leader?.email}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{info.row.original.leader?.phoneNumber || 'No phone'}</div>
                </div>
            )
        },
        {
            header: 'Members',
            cell: info => (
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {info.row.original._count.members} Members
                </span>
            )
        },
        {
            header: 'Actions',
            cell: info => (
                <div className="flex gap-2">
                    <button
                        onClick={() => setManagingTeam(info.row.original)}
                        className="bg-teal-600 text-white px-3 py-1.5 rounded hover:bg-teal-700 text-xs shadow-sm"
                    >
                        Members
                    </button>
                    <button
                        onClick={() => setEditingTeam(info.row.original)}
                        className="bg-yellow-600 text-white px-3 py-1.5 rounded hover:bg-yellow-700 text-xs shadow-sm"
                    >
                        Edit
                    </button>
                    {/* <button
                        onClick={() => handleDelete(info.row.original.id)}
                        className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 text-xs shadow-sm"
                    >
                        Delete
                    </button> */}
                </div>
            )
        }
    ];

    const table = useReactTable({
        data: teams,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    if (loading) return <div className="p-8 text-center">Loading teams...</div>;

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase">Team Management</h2>
                    <p className="text-gray-500 font-medium text-sm">Create teams, assign leaders, and manage members.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <input
                        value={globalFilter ?? ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder="Search teams, leaders..."
                        className="px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 shadow-sm text-sm"
                    />
                    <ExportCsvButton
                        rows={table.getFilteredRowModel().rows.map(r => r.original)}
                        columns={csvColumns}
                        filename="teams.csv"
                    />
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-black text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 whitespace-nowrap"
                    >
                        + CREATE TEAM
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-lg shadow-xl shadow-gray-200/40 overflow-hidden">
                <div className="overflow-x-auto overflow-y-hidden cursor-move active:cursor-grabbing">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            {table.getHeaderGroups().map(hg => (
                                <tr key={hg.id}>
                                    {hg.headers.map(h => (
                                        <th key={h.id} className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            {flexRender(h.column.columnDef.header, h.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-blue-50/10 transition-colors group">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="p-4 text-sm text-gray-700">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {teams.length === 0 && (
                                <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No teams found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODALS */}
            {(showCreateModal || editingTeam) && (
                <TeamModal
                    team={editingTeam} // If null, it's create mode
                    onClose={() => { setShowCreateModal(false); setEditingTeam(null); }}
                    onSuccess={() => { setShowCreateModal(false); setEditingTeam(null); fetchTeams(); }}
                />
            )}

            {managingTeam && (
                <ManageMembersModal
                    team={managingTeam}
                    onClose={() => setManagingTeam(null)}
                    onSuccess={(shouldClose = true) => {
                        if (shouldClose) setManagingTeam(null);
                        fetchTeams();
                    }}
                />
            )}

        </div>
    );
};

export default TeamAdmin;
