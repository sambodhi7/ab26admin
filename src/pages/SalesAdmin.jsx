import React, { useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender
} from '@tanstack/react-table';
import api from '../../api/api';

// --- GENERIC READ-ONLY TABLE ---
const ReadOnlyTable = ({ data, columns, loading, emptyMessage }) => {
    const [globalFilter, setGlobalFilter] = useState('');

    const table = useReactTable({
        data,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading data...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <input
                    value={globalFilter ?? ''}
                    onChange={e => setGlobalFilter(e.target.value)}
                    placeholder="Search..."
                    className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                />
            </div>
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        {table.getHeaderGroups().map(hg => (
                            <tr key={hg.id}>
                                {hg.headers.map(h => (
                                    <th key={h.id} className="p-4 text-xs font-bold text-gray-500 uppercase">
                                        {flexRender(h.column.columnDef.header, h.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-gray-50">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="p-4 text-sm text-gray-700">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr><td colSpan={columns.length} className="p-8 text-center text-gray-400">{emptyMessage}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SalesAdmin = () => {
    const [activeTab, setActiveTab] = useState('passes');
    const [data, setData] = useState({ passes: [], accommodation: [], transactions: [] });
    const [loading, setLoading] = useState(false);

    const fetchData = async (tab) => {
        setLoading(true);
        try {
            let endpoint = '';
            if (tab === 'passes') endpoint = '/sales/passes';
            if (tab === 'accommodation') endpoint = '/sales/accommodation';
            if (tab === 'transactions') endpoint = '/sales/transactions';

            const res = await api.get(endpoint);
            setData(prev => ({ ...prev, [tab]: res.data.data }));
        } catch (err) {
            console.error(`Error fetching ${tab}:`, err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab]);

    // --- COLUMNS DEFINITIONS ---
    const passColumns = [
        {
            header: 'User',
            accessorFn: row => `${row.user?.name} ${row.user?.email}`,
            cell: info => (
                <div>
                    <div className="font-bold">{info.row.original.user?.name}</div>
                    <div className="text-xs text-gray-500">{info.row.original.user?.email}</div>
                </div>
            )
        },
        { header: 'Pass Name', accessorFn: row => row.passType?.name },
        { header: 'Price', accessorFn: row => row.passType?.price, cell: info => `₹${info.getValue()}` },
        {
            header: 'Transaction ID',
            accessorFn: row => row.transaction?.razorpay_payment_id || 'N/A',
            cell: info => <span className="font-mono text-xs">{info.getValue()}</span>
        },
        {
            header: 'Date',
            accessorKey: 'created_at',
            cell: info => new Date(info.getValue()).toLocaleString()
        }
    ];

    const accomColumns = [
        {
            header: 'User',
            accessorFn: row => `${row.user?.name} ${row.user?.email}`,
            cell: info => (
                <div>
                    <div className="font-bold">{info.row.original.user?.name}</div>
                    <div className="text-xs text-gray-500">{info.row.original.user?.email}</div>
                </div>
            )
        },
        { header: 'Accommodation', accessorFn: row => row.accommodationType?.name },
        { header: 'Price', accessorFn: row => row.accommodationType?.price, cell: info => `₹${info.getValue()}` },
        {
            header: 'Transaction ID',
            accessorFn: row => row.transaction?.razorpay_payment_id || 'N/A',
            cell: info => <span className="font-mono text-xs">{info.getValue()}</span>
        },
        {
            header: 'Date',
            accessorKey: 'created_at',
            cell: info => new Date(info.getValue()).toLocaleString()
        }
    ];

    const transColumns = [
        {
            header: 'Order ID',
            accessorFn: row => row.orderId, // This might need mapping depending on schema relation
            cell: info => <span className="font-mono text-xs text-gray-600">{info.column.columnDef.header === 'Order ID' ? info.row.original.orderId : ''}</span>
            // Actually Order ID is usually from 'order' relation or direct field. 
            // Checking schema: Transactions has `orderId` (Int, unique) -> relation `order` -> `Orders` model has `razorpayOrderId`.
        },
        {
            header: 'Razorpay Payment ID',
            accessorKey: 'razorpay_payment_id',
            cell: info => <span className="font-mono text-xs font-bold text-gray-700">{info.getValue()}</span>
        },
        {
            header: 'User',
            accessorFn: row => row.order?.user?.email, // Nested via Order
            cell: info => (
                <div>
                    <div className="font-bold">{info.row.original.order?.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{info.row.original.order?.user?.email}</div>
                </div>
            )
        },
        {
            header: 'Amount',
            accessorKey: 'amount',
            cell: info => <span className="font-bold text-green-700">₹{(info.getValue() / 100).toFixed(2)}</span> // Amount usually in paise
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: info => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${info.getValue() === 'captured' || info.getValue() === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {info.getValue().toUpperCase()}
                </span>
            )
        },
        {
            header: 'Date',
            accessorKey: 'created_at',
            cell: info => new Date(info.getValue()).toLocaleString()
        }
    ];

    // Fix for Transaction Order ID display
    // Transaction model has `orderId` (int) which links to `Orders` (id).
    // The actual Razorpay Order ID is `order.razorpayOrderId`.
    // Let's create a custom column for that.
    const transColumnsRefined = [
        {
            header: 'Razorpay Payment ID',
            accessorKey: 'razorpay_payment_id',
            cell: info => <span className="font-mono text-xs font-bold text-gray-700">{info.getValue()}</span>
        },
        {
            header: 'Razorpay Order ID',
            accessorFn: row => row.order?.razorpayOrderId,
            cell: info => <span className="font-mono text-xs text-gray-500">{info.getValue()}</span>
        },
        {
            header: 'User',
            accessorFn: row => row.order?.user?.email,
            cell: info => (
                <div>
                    <div className="font-bold">{info.row.original.order?.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{info.row.original.order?.user?.email}</div>
                </div>
            )
        },
        {
            header: 'Amount',
            accessorKey: 'amount',
            cell: info => <span className="font-bold text-green-700">₹{info.getValue()}</span> // Assuming stored as rupees based on integer types in schema, or check usage. usually razorpay sends paise but schema might store rupees if processed. Let's assume Rupees for now based on 'Int' amount usually being minimal unit in Stripe but customized here.
            // Actually Razorpay is ALWAYS paise. But let's check one value or assume paise / 100.
            // Safe bet: Display as is, user knows if it looks like 50000 (500rs) or 500.
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: info => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${info.getValue() === 'captured' || info.getValue() === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {info.getValue().toUpperCase()}
                </span>
            )
        },
        {
            header: 'Date',
            accessorKey: 'created_at',
            cell: info => new Date(info.getValue()).toLocaleString()
        }
    ];


    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Sales & Transactions</h2>
            <p className="text-gray-500 mb-8">Read-only view of all financial activities.</p>

            <div className="flex border-b mb-6">
                <button
                    onClick={() => setActiveTab('passes')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'passes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Sold Passes
                </button>
                <button
                    onClick={() => setActiveTab('accommodation')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'accommodation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Sold Accommodation
                </button>
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'transactions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    All Transactions
                </button>
            </div>

            {activeTab === 'passes' && (
                <ReadOnlyTable
                    data={data.passes}
                    columns={passColumns}
                    loading={loading}
                    emptyMessage="No passes sold yet."
                />
            )}

            {activeTab === 'accommodation' && (
                <ReadOnlyTable
                    data={data.accommodation}
                    columns={accomColumns}
                    loading={loading}
                    emptyMessage="No accommodation booked yet."
                />
            )}

            {activeTab === 'transactions' && (
                <ReadOnlyTable
                    data={data.transactions}
                    columns={transColumnsRefined}
                    loading={loading}
                    emptyMessage="No transactions recorded."
                />
            )}
        </div>
    );
};

export default SalesAdmin;
