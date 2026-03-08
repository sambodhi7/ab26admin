import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender
} from '@tanstack/react-table';
import api from '../api/api';
import ExportCsvButton from '../components/ExportCsvButton';

// --- GENERIC READ-ONLY TABLE ---
const ReadOnlyTable = ({ data, columns, loading, emptyMessage, filename = 'data.csv' }) => {
    const [globalFilter, setGlobalFilter] = useState('');

    const table = useReactTable({
        data,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    if (loading) return <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-end pr-0.5">
                <input
                    value={globalFilter ?? ''}
                    onChange={e => setGlobalFilter(e.target.value)}
                    placeholder="Search records..."
                    className="px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-64 text-sm shadow-sm transition-all"
                />
                <ExportCsvButton
                    rows={table.getFilteredRowModel().rows.map(r => r.original)}
                    columns={columns}
                    filename={filename}
                />
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
                            {data.length === 0 && (
                                <tr><td colSpan={columns.length} className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">{emptyMessage}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
    const passCsvColumns = [
        { header: 'User Name', accessorFn: row => row.user?.name },
        { header: 'User Email', accessorFn: row => row.user?.email },
        { header: 'Pass Name', accessorFn: row => row.passType?.name },
        { header: 'Price (₹)', accessorFn: row => row.passType?.price },
        { header: 'Transaction ID', accessorFn: row => row.transaction?.razorpay_payment_id || 'N/A' },
        { header: 'Date', accessorFn: row => new Date(row.created_at).toLocaleString() }
    ];

    const accomCsvColumns = [
        { header: 'User Name', accessorFn: row => row.user?.name },
        { header: 'User Email', accessorFn: row => row.user?.email },
        { header: 'Accommodation Type', accessorFn: row => row.accommodationType?.name },
        { header: 'Price (₹)', accessorFn: row => row.accommodationType?.price },
        { header: 'Days', accessorFn: row => row.days || row.quantity || 1 },
        { header: 'Transaction ID', accessorFn: row => row.transaction?.razorpay_payment_id || 'N/A' },
        { header: 'Date', accessorFn: row => new Date(row.created_at).toLocaleString() }
    ];

    const transCsvColumns = [
        { header: 'Razorpay Payment ID', accessorKey: 'razorpay_payment_id' },
        { header: 'Razorpay Order ID', accessorFn: row => row.order?.razorpayOrderId },
        { header: 'User Name', accessorFn: row => row.order?.user?.name || 'Unknown' },
        { header: 'User Email', accessorFn: row => row.order?.user?.email },
        { header: 'Amount (₹)', accessorFn: row => (row.amount / 100).toFixed(2) },
        { header: 'Status', accessorKey: 'status' },
        { header: 'Date', accessorFn: row => new Date(row.created_at).toLocaleString() }
    ];

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
        {
            header: 'Price',
            accessorFn: row => row.accommodationType?.price,
            cell: info => <span className="font-bold text-gray-700">₹{info.getValue()}</span>
        },
        {
            header: 'Days',
            accessorFn: row => row.days || row.quantity || 1,
            cell: info => (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black border border-blue-100 uppercase">
                    {info.getValue()} Days
                </span>
            )
        },
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
            cell: info => <span className="font-bold text-green-700">₹{(info.getValue() / 100).toFixed(2)}</span>
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
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase">Sales & Transactions</h2>
                    <p className="text-gray-500 font-medium text-sm">Read-only view of all financial activities.</p>
                </div>
                <Link
                    to="/admin/omega-manual-entry-x99"
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-2"
                >
                    <span className="text-lg">+</span> Manual Entry
                </Link>
            </div>

            <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar scroll-smooth">
                <button
                    onClick={() => setActiveTab('passes')}
                    className={`px-6 py-4 font-black text-[10px] uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === 'passes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Sold Passes
                </button>
                <button
                    onClick={() => setActiveTab('accommodation')}
                    className={`px-6 py-4 font-black text-[10px] uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === 'accommodation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Sold Accommodation
                </button>
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={`px-6 py-4 font-black text-[10px] uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === 'transactions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
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
                    filename="sales-passes.csv"
                />
            )}

            {activeTab === 'accommodation' && (
                <ReadOnlyTable
                    data={data.accommodation}
                    columns={accomColumns}
                    loading={loading}
                    emptyMessage="No accommodation booked yet."
                    filename="sales-accommodation.csv"
                />
            )}

            {activeTab === 'transactions' && (
                <ReadOnlyTable
                    data={data.transactions}
                    columns={transColumnsRefined}
                    loading={loading}
                    emptyMessage="No transactions recorded."
                    filename="sales-transactions.csv"
                />
            )}
        </div>
    );
};

export default SalesAdmin;
