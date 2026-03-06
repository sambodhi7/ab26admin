import React, { useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender
} from '@tanstack/react-table';
import api from '../api/api';
import ExportCsvButton from '../components/ExportCsvButton';

// --- SUB-COMPONENT: USER DETAILS MODAL ---
const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-3xl p-6 bg-white rounded-xl shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>

                <div className="mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                    <p className="text-gray-500 font-mono">{user.email}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>{user.collegeName || 'N/A College'}</span>
                        <span>•</span>
                        <span>{user.phoneNumber || 'N/A Phone'}</span>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* SECTION: PASSES */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 border-l-4 border-green-500 pl-2">Purchased Passes</h3>
                        {user.purchasedPasses?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {user.purchasedPasses.map(p => (
                                    <div key={p.id} className="bg-green-50 border border-green-100 p-3 rounded-lg">
                                        <div className="font-bold text-green-800">{p.passType.name}</div>
                                        <div className="text-xs text-green-600">Price: ₹{p.passType.price}</div>
                                        <div className="text-xs text-gray-400 mt-1">Order: {p.transaction?.orderId || 'N/A'}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic text-sm">No passes purchased.</p>
                        )}
                    </div>

                    {/* SECTION: ACCOMMODATION */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 border-l-4 border-blue-500 pl-2">Accommodation</h3>
                        {user.accomodationBookings?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div key={acc.id} className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-blue-800">{acc.accommodationType.name}</div>
                                        <div className="text-xs text-blue-600">Price: ₹{acc.accommodationType.price}</div>
                                    </div>
                                    <div className="text-[10px] font-black bg-white/50 px-2 py-1 rounded border border-blue-200 text-blue-700 uppercase">
                                        {acc.quantity || 1} Days
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 italic text-sm">No accommodation booked.</p>
                        )}
                    </div>

                    {/* SECTION: EVENT REGISTRATIONS */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 border-l-4 border-purple-500 pl-2">Event Registrations</h3>
                        {user.registrations?.length > 0 ? (
                            <div className="space-y-2">
                                {user.registrations.map(reg => (
                                    <div key={reg.id} className="bg-purple-50 border border-purple-100 p-3 rounded-lg flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-gray-800">{reg.event.name}</div>
                                            <div className="text-xs text-gray-500">{reg.event.isTeamEvent ? 'Team Event' : 'Individual Event'}</div>
                                        </div>
                                        {reg.team ? (
                                            <div className="text-xs bg-white px-2 py-1 rounded border">
                                                Team: <strong>{reg.team.name}</strong>
                                            </div>
                                        ) : (
                                            <span className="text-xs bg-white px-2 py-1 rounded border">Individual</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic text-sm">No registrations found.</p>
                        )}
                    </div>

                    {/* SECTION: TEAMS */}
                    {(user.teamsLeading?.length > 0 || user.teamsMember?.length > 0) && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2 border-l-4 border-yellow-500 pl-2">Teams</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {user.teamsLeading?.map(t => (
                                    <div key={t.id} className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg">
                                        <div className="font-bold text-yellow-800">{t.name} <span className="text-xs bg-yellow-200 px-1 rounded text-yellow-800 ml-2">LEADER</span></div>
                                        <div className="text-xs text-yellow-600">Code: {t.teamcode}</div>
                                    </div>
                                ))}
                                {user.teamsMember?.map(tm => (
                                    <div key={tm.id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                                        <div className="font-bold text-gray-800">{tm.team.name} <span className="text-xs bg-gray-200 px-1 rounded text-gray-800 ml-2">MEMBER</span></div>
                                        <div className="text-xs text-gray-500">Code: {tm.team.teamcode}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECTION: ROUND 2 */}
                    {user.round2Selected?.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2 border-l-4 border-yellow-500 pl-2">Round 2 Promotions</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.round2Selected.map(r2 => (
                                    <span key={r2.id} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-200">
                                        {r2.event.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-4 border-t flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT: USER ADMIN ---
const UserAdmin = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data.users);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching users:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const csvColumns = [
        {
            header: 'ABID',
            accessorFn: row => `AB${String(row.serialId).padStart(5, '0')}`
        },
        {
            header: 'User ID',
            accessorKey: 'id'
        },
        {
            header: 'Name',
            accessorKey: 'name'
        },
        {
            header: 'Email',
            accessorKey: 'email'
        },
        {
            header: 'College',
            accessorKey: 'collegeName'
        },
        {
            header: 'Phone',
            accessorKey: 'phoneNumber'
        },
        {
            header: 'Pass Status',
            accessorFn: row => row.purchasedPasses?.length > 0 ? `${row.purchasedPasses.length} Pass(es)` : 'No Pass'
        },
        {
            header: 'Pass Sold IDs',
            accessorFn: row => row.purchasedPasses?.map(p => p.id).join('; ') || '-'
        },
        {
            header: 'Accommodation Count',
            accessorFn: row => row.accomodationBookings?.length || 0
        },
        {
            header: 'Accommodation Booking IDs',
            accessorFn: row => row.accomodationBookings?.map(a => a.id).join('; ') || '-'
        }
    ];

    const columns = [
        {
            header: 'ABID',
            accessorFn: row => `AB${String(row.serialId).padStart(5, '0')}`,
            cell: info => <span className="font-mono font-bold text-gray-700">{info.getValue()}</span>
        },
        {
            header: 'User ID',
            accessorKey: 'id',
            cell: info => (
                <div
                    onClick={() => {
                        navigator.clipboard.writeText(info.getValue());
                        // Optional: Show a toast notification here
                    }}
                    className="font-mono text-xs text-blue-600 cursor-pointer hover:underline hover:text-blue-800"
                    title="Click to copy User ID"
                >
                    {info.getValue()}
                </div>
            )
        },
        {
            header: 'User',
            accessorFn: row => `${row.name} ${row.email}`,
            cell: info => (
                <div>
                    <div className="font-bold text-gray-900">{info.row.original.name}</div>
                    <div className="text-xs font-mono text-gray-500">{info.row.original.email}</div>
                </div>
            )
        },
        {
            header: 'Info',
            accessorFn: row => `${row.collegeName} ${row.phoneNumber}`,
            cell: info => (
                <div className="text-sm text-gray-600">
                    <div>{info.row.original.collegeName || '-'}</div>
                    <div className="text-xs text-gray-400">{info.row.original.phoneNumber}</div>
                </div>
            )
        },
        {
            header: 'Pass',
            accessorFn: row => row.purchasedPasses?.length > 0 ? "Has Pass" : "No Pass",
            cell: info => {
                const count = info.row.original.purchasedPasses?.length || 0;
                return count > 0 ?
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{count} Pass(es)</span> :
                    <span className="text-gray-400 text-xs">-</span>
            }
        },
        {
            header: 'Actions',
            cell: info => (
                <button
                    onClick={() => setSelectedUser(info.row.original)}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-xs shadow-sm font-medium"
                >
                    View Details
                </button>
            )
        }
    ];

    const table = useReactTable({
        data: users,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    if (loading) return <div className="p-8 text-center">Loading users...</div>;

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase">User Management</h2>
                    <p className="text-gray-500 font-medium text-sm">View and manage all registered users.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <input
                        value={globalFilter ?? ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder="Search users..."
                        className="w-full md:w-64 px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 shadow-sm text-sm"
                    />
                    <ExportCsvButton
                        rows={table.getFilteredRowModel().rows.map(r => r.original)}
                        columns={csvColumns}
                        filename="users.csv"
                    />
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-lg shadow-xl shadow-gray-200/40 overflow-hidden">
                <div className="overflow-x-auto overflow-y-hidden cursor-move active:cursor-grabbing">
                    <table className="w-full text-left min-w-[1000px]">
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
                            {users.length === 0 && (
                                <tr><td colSpan={6} className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
};

export default UserAdmin;
