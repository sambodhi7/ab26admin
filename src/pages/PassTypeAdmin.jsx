import React, { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender
} from '@tanstack/react-table';
import api from '../api/api';

// --- SUB-COMPONENT: ADD PASS MODAL ---
const AddPassModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', price: '', count: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/passes/type', {
        ...formData,
        price: Number(formData.price),
        count: Number(formData.count)
      });
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create pass type");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Add New Pass Type</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Pass Name (e.g. Gold)"
            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Price (₹)"
            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
            onChange={e => setFormData({ ...formData, price: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Total Inventory"
            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
            onChange={e => setFormData({ ...formData, count: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-100 rounded-lg text-gray-600">Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Pass"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: EDIT PASS MODAL ---
const EditPassModal = ({ pass, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: pass.name,
    price: pass.price,
    count: pass.count
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/passes/type/${pass.id}`, {
        name: formData.name,
        price: Number(formData.price),
        count: Number(formData.count)
      });
      onSuccess();
    } catch (err) {
      console.error("Update failed:", err);
      alert(err.response?.data?.error || "Failed to update pass type");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Edit Pass Type</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name</label>
            <input
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Price (₹)</label>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Total Capacity</label>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.count}
              onChange={(e) => setFormData({ ...formData, count: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-100 rounded-lg text-gray-600">Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT: PASS TYPE ADMIN ---
const PassTypeAdmin = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPass, setEditingPass] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');

  const fetchPasses = async () => {
    try {
      const res = await api.get('/passes/types');
      setPasses(res.data.passesTypes);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching pass types:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, []);

  const columns = [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Pass Name', accessorKey: 'name' },
    { header: 'Price (₹)', accessorKey: 'price' },
    {
      header: 'Inventory (Sold/Total)',
      cell: info => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{info.row.original.countPurchased}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{info.row.original.count}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      cell: info => (
        <button
          onClick={() => setEditingPass(info.row.original)}
          className="bg-yellow-600 text-white px-4 py-1.5 rounded-lg hover:bg-yellow-700 transition shadow-sm font-medium text-sm"
        >
          Edit
        </button>
      )
    }
  ];

  const table = useReactTable({
    data: passes,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-lg font-semibold text-yellow-600">Loading inventory details...</div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase">Pass Inventory</h2>
          <p className="text-gray-500 font-medium text-sm">Configure ticket types, pricing, and availability.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Search types..."
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-green-500 text-sm shadow-sm transition-all"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-black text-sm hover:bg-green-700 transition shadow-lg shadow-green-600/20 whitespace-nowrap"
          >
            + NEW PASS
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
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-green-50/10 transition-colors group">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="p-4 text-gray-700 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                    No matching passes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddPassModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchPasses();
          }}
        />
      )}

      {editingPass && (
        <EditPassModal
          pass={editingPass}
          onClose={() => setEditingPass(null)}
          onSuccess={() => {
            setEditingPass(null);
            fetchPasses();
          }}
        />
      )}
    </div>
  );
};

export default PassTypeAdmin;
