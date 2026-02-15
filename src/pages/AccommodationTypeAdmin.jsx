import React, { useState, useEffect } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel,
  flexRender 
} from '@tanstack/react-table';
import api from '../../api/api';

// --- SUB-COMPONENT: ADD ACCOMMODATION MODAL ---
const AddAccModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', price: '', count: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/accommodation/type', {
        ...formData,
        price: Number(formData.price),
        count: Number(formData.count)
      });
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create accommodation type");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Add Accommodation Type</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            placeholder="Name (e.g. Elite Room)" 
            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />
          <input 
            type="number" 
            placeholder="Price (₹)" 
            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
            onChange={e => setFormData({...formData, price: e.target.value})}
            required
          />
          <input 
            type="number" 
            placeholder="Total Capacity (Beds)" 
            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
            onChange={e => setFormData({...formData, count: e.target.value})}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-100 rounded-lg text-gray-600">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: EDIT ACCOMMODATION MODAL ---
const EditAccModal = ({ acc, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: acc.name,
    price: acc.price,
    count: acc.count
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/accommodation/type/${acc.id}`, {
        name: formData.name,
        price: Number(formData.price),
        count: Number(formData.count)
      });
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update accommodation type");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Edit Accommodation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="number"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
          <input
            type="number"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.count}
            onChange={(e) => setFormData({ ...formData, count: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-100 rounded-lg text-gray-600">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const AccommodationTypeAdmin = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAcc, setEditingAcc] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.get('/accommodation/types');
      setData(res.data.accommodationTypes || []); // Match backend key
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Type Name', accessorKey: 'name' },
    { header: 'Price (₹)', accessorKey: 'price' },
    { 
      header: 'Occupancy (Booked / Total)', 
      cell: info => {
        // Matching your exact backend keys
        const booked = info.row.original.countBooked || 0;
        const total = info.row.original.count || 0;
        const isFull = total > 0 && booked >= total;

        return (
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isFull ? 'text-red-600' : 'text-green-600'}`}>
              {booked}
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 font-medium">{total}</span>
            {isFull && <span className="ml-2 px-2 py-0.5 text-[10px] bg-red-100 text-red-600 rounded uppercase font-bold text-center">Full</span>}
          </div>
        );
      }
    },
    {
      header: 'Actions',
      cell: info => (
        <button 
          onClick={() => setEditingAcc(info.row.original)}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium text-sm"
        >
          Edit
        </button>
      )
    }
  ];

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-lg font-semibold text-indigo-600">Syncing Accommodation Inventory...</div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Accommodation</h2>
          <p className="text-gray-500">Manage rooms, hostel capacity, and pricing.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <input
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Search rooms..."
              className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <span className="absolute right-3 top-3 text-gray-400">🔍</span>
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition shadow-lg whitespace-nowrap"
          >
            + Add Type
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className="bg-gray-50/50">
                {hg.headers.map(h => (
                  <th key={h.id} className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-indigo-50/30 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-4 text-gray-700 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-12 text-center text-gray-400 italic">
                  No matching accommodation types found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddAccModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => { setShowAddModal(false); fetchData(); }}
        />
      )}

      {editingAcc && (
        <EditAccModal 
          acc={editingAcc} 
          onClose={() => setEditingAcc(null)} 
          onSuccess={() => { setEditingAcc(null); fetchData(); }}
        />
      )}
    </div>
  );
};

export default AccommodationTypeAdmin;