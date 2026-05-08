import React, { useState, useEffect } from 'react';
import { tableAPI } from '../services/api';

interface Table {
  _id: string;
  tableNumber: number;
  tableCode: string;
  capacity: number;
  isAvailable: boolean;
  qrCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

const AdminTableManagementPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTable, setNewTable] = useState({ tableNumber: '', capacity: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const data = await tableAPI.getAll();
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setError('Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tableAPI.create({
        tableNumber: parseInt(newTable.tableNumber),
        capacity: parseInt(newTable.capacity),
      });
      setShowCreateModal(false);
      setNewTable({ tableNumber: '', capacity: '' });
      fetchTables();
    } catch (error: any) {
      console.error('Error creating table:', error);
      setError(error.response?.data?.message || 'Failed to create table');
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await tableAPI.delete(id);
        fetchTables();
      } catch (error) {
        console.error('Error deleting table:', error);
        setError('Failed to delete table');
      }
    }
  };

  const handleToggleAvailability = async (table: Table) => {
    try {
      await tableAPI.update(table._id, { isAvailable: !table.isAvailable });
      fetchTables();
    } catch (error) {
      console.error('Error updating table:', error);
      setError('Failed to update table');
    }
  };

  const handleRegenerateAllQR = async () => {
    if (window.confirm('Regenerate QR codes for all tables?')) {
      try {
        setLoading(true);
        await tableAPI.regenerateAllQR();
        fetchTables();
      } catch (error) {
        console.error('Error regenerating QR codes:', error);
        setError('Failed to regenerate QR codes');
      } finally {
        setLoading(false);
      }
    }
  };

  const downloadQRCode = (table: Table) => {
    if (table.qrCode) {
      const link = document.createElement('a');
      link.href = table.qrCode;
      link.download = `${table.tableCode}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const printQRCode = (table: Table) => {
    if (table.qrCode) {
      const printWindow = window.open('', '', 'width=600,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Table ${table.tableNumber} QR Code</title>
              <style>
                body {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  margin: 0;
                  font-family: Arial, sans-serif;
                }
                h1 { margin-bottom: 20px; }
                img { max-width: 400px; }
                p { margin-top: 10px; font-size: 14px; color: #666; }
              </style>
            </head>
            <body>
              <h1>Table ${table.tableCode}</h1>
              <img src="${table.qrCode}" alt="QR Code" />
              <p>Number: ${table.tableNumber}</p>
              <p>Capacity: ${table.capacity} persons</p>
              <p>Scan to view menu and place order</p>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
              <p className="mt-2 text-gray-600">Manage restaurant tables and QR codes</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRegenerateAllQR}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                🔄 Regenerate All QR Codes
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                + Add New Table
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
            <button onClick={() => setError('')} className="float-right font-bold">×</button>
          </div>
        )}

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <div key={table._id} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Table {table.tableCode}</h3>
                    <p className="text-gray-500 text-sm mt-1">Number: {table.tableNumber}</p>
                    <p className="text-gray-600 mt-1">Capacity: {table.capacity} persons</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      table.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {table.isAvailable ? 'Available' : 'Occupied'}
                  </span>
                </div>

                {/* QR Code */}
                {table.qrCode && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 text-center">
                    <img
                      src={table.qrCode}
                      alt={`QR Code for Table ${table.tableCode}`}
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadQRCode(table)}
                      disabled={!table.qrCode}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      📥 Download QR
                    </button>
                    <button
                      onClick={() => printQRCode(table)}
                      disabled={!table.qrCode}
                      className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      🖨️ Print QR
                    </button>
                  </div>
                  <button
                    onClick={() => handleToggleAvailability(table)}
                    className={`w-full px-4 py-2 rounded-lg transition-colors ${
                      table.isAvailable
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {table.isAvailable ? 'Mark as Occupied' : 'Mark as Available'}
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table._id)}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    🗑️ Delete Table
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tables.length === 0 && (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No tables created yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Create Your First Table
            </button>
          </div>
        )}
      </div>

      {/* Create Table Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Create New Table</h2>
            <form onSubmit={handleCreateTable}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Table Number</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newTable.tableNumber}
                  onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 1"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Capacity (persons)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 4"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTable({ tableNumber: '', capacity: '' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTableManagementPage;
