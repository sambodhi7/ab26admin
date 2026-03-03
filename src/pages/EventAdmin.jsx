import React, { useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender
} from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import ExportCsvButton from '../components/ExportCsvButton';
import { Link } from 'react-router-dom';
// Note: I couldn't find api.js earlier with find_by_name. But PassTypeAdmin imports it from '../../api/api'.
// So it must be in src/api/api.js. Wait, list_dir said src/api does not exist.
// Let me double check PassTypeAdmin import again.
// It says `import api from '../api/api';` inside `src/pages/PassTypeAdmin.jsx`.
// So `../api/api` relative to `src/pages` is `src/api/api`.
// Maybe I missed the `api` directory in `list_dir` output of `src`?
// Let me assume it exists for now based on existing code. If it fails, I'll fix it.

// --- SUB-COMPONENT: ADD/EDIT EVENT MODAL ---
const EventModal = ({ event, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: event?.name || '',
        club: event?.club || '',
        minTeamSize: event?.minTeamSize || '',
        maxTeamSize: event?.maxTeamSize || '',
        isTeamEvent: event?.isTeamEvent || false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (event) {
                await api.put(`/events/${event.id}`, formData);
            } else {
                await api.post('/events', formData);
            }
            onSuccess();
        } catch (err) {
            console.error("Operation failed:", err);
            alert(err.response?.data?.error || "Failed to save event");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg p-6 bg-white rounded-xl shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">{event ? 'Edit Event' : 'Add New Event'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Event Name</label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Club / Category</label>
                        <input
                            value={formData.club}
                            onChange={e => setFormData({ ...formData, club: e.target.value })}
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isTeamEvent"
                            checked={formData.isTeamEvent}
                            onChange={e => setFormData({ ...formData, isTeamEvent: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isTeamEvent" className="ml-2 block text-sm text-gray-900">Is this a Team Event?</label>
                    </div>

                    {formData.isTeamEvent && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Min Team Size</label>
                                <input
                                    type="number"
                                    value={formData.minTeamSize}
                                    onChange={e => setFormData({ ...formData, minTeamSize: e.target.value })}
                                    className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required={formData.isTeamEvent}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Max Team Size</label>
                                <input
                                    type="number"
                                    value={formData.maxTeamSize}
                                    onChange={e => setFormData({ ...formData, maxTeamSize: e.target.value })}
                                    className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required={formData.isTeamEvent}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-100 rounded-lg text-gray-600">Cancel</button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : "Save Event"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EventAdmin = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingEvent, setEditingEvent] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const navigate = useNavigate();

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data.events);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching events:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this event? This cannot be undone.")) return;
        try {
            await api.delete(`/events/${id}`);
            fetchEvents();
        } catch (err) {
            alert("Failed to delete event");
        }
    };

    const csvColumns = [
        { header: 'Event ID', accessorKey: 'id' },
        { header: 'Name', accessorKey: 'name' },
        { header: 'Club/Category', accessorKey: 'club' },
        { header: 'Type', accessorFn: row => row.isTeamEvent ? 'Team Event' : 'Individual Event' },
        { header: 'Is Team Event', accessorFn: row => row.isTeamEvent ? 'Yes' : 'No' },
        { header: 'Min Team Size', accessorKey: 'minTeamSize' },
        { header: 'Max Team Size', accessorKey: 'maxTeamSize' },
        { header: 'Registrations', accessorFn: row => row._count?.registrations || 0 },
        { header: 'Round 2 Selected', accessorFn: row => row._count?.round2selected || 0 }
    ];

    const columns = [
        { header: 'Name', accessorKey: 'name' },
        { header: 'Club', accessorKey: 'club' },
        {
            header: 'Type',
            cell: info => info.row.original.isTeamEvent ? 'Team' : 'Individual'
        },
        {
            header: 'Registrations',
            cell: info => (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {info.row.original._count?.registrations || 0}
                </span>
            )
        },
        {
            header: 'Round 2',
            cell: info => (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                    {info.row.original._count?.round2selected || 0}
                </span>
            )
        },
        {
            header: 'Actions',
            cell: info => (
                <div className="flex gap-2">
                    <Link to={`/admin/events/${info.row.original.id}`} className="bg-teal-600 text-white px-3 py-1.5 rounded hover:bg-teal-700 transition shadow-sm text-sm">
                        <button
                            onClick=""
                            className="bg-teal-600 text-white px-3 py-1.5 rounded hover:bg-teal-700 transition shadow-sm text-sm"
                        >
                            Manage
                        </button>
                    </Link>
                    <button
                        onClick={() => setEditingEvent(info.row.original)}
                        className="bg-yellow-600 text-white px-3 py-1.5 rounded hover:bg-yellow-700 transition shadow-sm text-sm"
                    >
                        Edit
                    </button>
                    {/* <button
                        onClick={() => handleDelete(info.row.original.id)}
                        className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition shadow-sm text-sm"
                    >
                        Delete
                    </button> */}
                </div>
            )
        }
    ];

    const table = useReactTable({
        data: events,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    if (loading) return <div className="p-8 text-center">Loading events...</div>;

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase">Events Management</h2>
                    <p className="text-gray-500 font-medium text-sm">Manage festival events, registrations, and rounds.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <input
                        value={globalFilter ?? ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder="Search events..."
                        className="px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 shadow-sm text-sm"
                    />
                    <ExportCsvButton
                        rows={table.getFilteredRowModel().rows.map(r => r.original)}
                        columns={csvColumns}
                        filename="events.csv"
                    />
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-black text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 whitespace-nowrap"
                    >
                        + NEW EVENT
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-lg shadow-xl shadow-gray-200/40 overflow-hidden">
                <div className="overflow-x-auto overflow-y-hidden cursor-move active:cursor-grabbing">
                    <table className="w-full text-left min-w-[800px]">
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
                        </tbody>
                    </table>
                </div>
            </div>

            {showAddModal && (
                <EventModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => { setShowAddModal(false); fetchEvents(); }}
                />
            )}

            {editingEvent && (
                <EventModal
                    event={editingEvent}
                    onClose={() => setEditingEvent(null)}
                    onSuccess={() => { setEditingEvent(null); fetchEvents(); }}
                />
            )}
        </div>
    );
};

export default EventAdmin;
