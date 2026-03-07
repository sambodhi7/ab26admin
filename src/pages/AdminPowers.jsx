import React, { useState } from 'react';
import api from '../api/api';

const AdminPowers = () => {
    const [userId, setUserId] = useState('');
    const [actualCuid, setActualCuid] = useState('');
    const [regId, setRegId] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // User Edit State
    const [userForm, setUserForm] = useState({
        name: '',
        collegeName: '',
        phoneNumber: ''
    });

    // Submission State
    const [submissionForm, setSubmissionForm] = useState({
        submissionString: '',
        isTeam: false
    });

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    // 1. Fetch User (Search by ABID/Serial)
    const handleFetchUser = async () => {
        if (!userId) return showMessage('error', 'Enter ABID first');
        setLoading(true);
        try {
            const input = userId.trim().toUpperCase();
            const numericPart = input.replace(/[^0-9]/g, '');
            const targetSerial = parseInt(numericPart, 10);

            if (isNaN(targetSerial)) {
                showMessage('error', 'Invalid ID format');
                setLoading(false);
                return;
            }

            const res = await api.get('/users');
            const foundUser = res.data.users.find(u => u.serialId === targetSerial);

            if (foundUser) {
                setActualCuid(foundUser.id);
                setUserForm({
                    name: foundUser.name || '',
                    collegeName: foundUser.collegeName || '',
                    phoneNumber: foundUser.phoneNumber || ''
                });
                showMessage('success', `Found: AB${String(foundUser.serialId).padStart(5, '0')}`);
            } else {
                showMessage('error', 'User not found in system');
            }
        } catch (err) {
            showMessage('error', 'Failed to reach database');
        } finally {
            setLoading(false);
        }
    };

    // 2. Update User
    const handleUpdateUser = async () => {
        if (!actualCuid) return showMessage('error', 'Fetch a user first');
        setLoading(true);
        try {
            await api.put(`/users/${actualCuid}`, userForm);
            showMessage('success', 'User modulated successfully');
        } catch (err) {
            showMessage('error', err.response?.data?.error || 'Modulation failed');
        } finally {
            setLoading(false);
        }
    };

    // 3. Delete User
    const handleDeleteUser = async () => {
        if (!actualCuid || !window.confirm("FATAL: Permanently purge this user? This cannot be undone.")) return;
        setLoading(true);
        try {
            await api.delete(`/users/${actualCuid}`);
            showMessage('success', 'User purged from existence');
            setUserId('');
            setActualCuid('');
            setUserForm({ name: '', collegeName: '', phoneNumber: '' });
        } catch (err) {
            showMessage('error', err.response?.data?.error || 'Purge aborted by system');
        } finally {
            setLoading(false);
        }
    };

    // 4. Delete Registration
    const handleDeleteRegistration = async () => {
        if (!regId || !window.confirm("Delete this registration record?")) return;
        setLoading(true);
        try {
            await api.delete(`/registrations/${regId}`);
            showMessage('success', 'Registration annihilated');
            setRegId('');
        } catch (err) {
            showMessage('error', err.response?.data?.error || 'Annihilation failed');
        } finally {
            setLoading(false);
        }
    };

    // 5. Update Submission
    const handleUpdateSubmission = async () => {
        if (!regId) return showMessage('error', 'Enter Registration ID');
        setLoading(true);
        try {
            const path = submissionForm.isTeam
                ? `/registration/${regId}/submit`
                : `/registration/indv/${regId}/submit`;

            // Note: The API usually expects /api prefix. Our axios instance handles /api base.
            // But if the instructions say /api/registration, we use /registration
            await api.put(path, { submissionString: submissionForm.submissionString });
            showMessage('success', 'Submission data overwritten');
        } catch (err) {
            showMessage('error', err.response?.data?.error || 'Override failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 p-4 md:p-12 font-sans selection:bg-blue-50">
            <div className="max-w-4xl mx-auto space-y-10">
                {/* Header */}
                <div className="space-y-1 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight text-gray-900">System Management</h1>
                    <p className="text-gray-400 text-xs uppercase tracking-[0.2em]">Administrative Data Override</p>
                </div>

                {/* Status Message */}
                {message.text && (
                    <div className={`p-4 rounded-xl border text-base transition-all text-center shadow-sm ${message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        : 'bg-rose-50 border-rose-100 text-rose-600'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* SECTION: USER MODULATION */}
                    <div className="bg-white border border-gray-100/80 p-8 rounded-2xl shadow-sm space-y-8">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Profile Modulation</h2>
                            <div className="h-px bg-gray-50 flex-1"></div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Target ABID</label>
                                <div className="flex gap-2">
                                    <input
                                        value={userId}
                                        onChange={e => setUserId(e.target.value)}
                                        placeholder="AB0000 or 123"
                                        className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-base outline-none focus:bg-white focus:border-blue-300 transition-all font-mono"
                                    />
                                    <button
                                        onClick={handleFetchUser}
                                        className="bg-gray-900 hover:bg-black text-white text-xs px-6 rounded-lg font-bold uppercase tracking-wider transition-all"
                                    >
                                        Load
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[11px] text-gray-400 uppercase font-bold px-1">Legal Name</label>
                                        <input
                                            value={userForm.name}
                                            placeholder="Full Name"
                                            onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-base outline-none focus:bg-white focus:border-blue-300 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] text-gray-400 uppercase font-bold px-1">Phone</label>
                                        <input
                                            value={userForm.phoneNumber}
                                            placeholder="Phone"
                                            onChange={e => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-base outline-none focus:bg-white focus:border-blue-300 transition-all font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] text-gray-400 uppercase font-bold px-1">Institute</label>
                                        <input
                                            value={userForm.collegeName}
                                            placeholder="Institute Name"
                                            onChange={e => setUserForm({ ...userForm, collegeName: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-base outline-none focus:bg-white focus:border-blue-300 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 pt-4 border-t border-gray-50">
                                <button
                                    onClick={handleUpdateUser}
                                    disabled={loading}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs py-4 rounded-lg uppercase tracking-widest transition-all shadow-md shadow-blue-100 disabled:opacity-50"
                                >
                                    Apply Modulation
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    disabled={loading}
                                    className="w-full text-gray-400 hover:text-rose-500 text-[11px] py-2 font-bold uppercase tracking-widest transition-all"
                                >
                                    Purge Data Record
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-8">
                        {/* REG DELETION */}
                        <div className="bg-white border border-gray-100/80 p-8 rounded-2xl shadow-sm space-y-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Event Registrations</h2>
                                <div className="h-px bg-gray-50 flex-1"></div>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={regId}
                                    onChange={e => setRegId(e.target.value)}
                                    placeholder="Reg ID..."
                                    className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-base outline-none focus:bg-white focus:border-rose-200 transition-all"
                                />
                                <button
                                    onClick={handleDeleteRegistration}
                                    disabled={loading}
                                    className="bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 font-bold text-xs px-8 rounded-lg uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        {/* SUBMISSION OVERRIDE */}
                        <div className="bg-white border border-gray-100/80 p-8 rounded-2xl shadow-sm space-y-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Submission Links</h2>
                                <div className="h-px bg-gray-50 flex-1"></div>
                            </div>

                            <div className="space-y-5">
                                <div className="flex gap-2">
                                    {['indv', 'team'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setSubmissionForm({ ...submissionForm, isTeam: type === 'team' })}
                                            className={`text-[11px] font-bold uppercase tracking-widest px-6 py-2 rounded-md border transition-all ${(type === 'team' ? submissionForm.isTeam : !submissionForm.isTeam)
                                                ? 'bg-blue-50 border-blue-100 text-blue-600'
                                                : 'text-gray-400 border-gray-50 hover:bg-gray-50'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    value={submissionForm.submissionString}
                                    onChange={e => setSubmissionForm({ ...submissionForm, submissionString: e.target.value })}
                                    rows={2}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-base outline-none focus:bg-white focus:border-blue-200 transition-all font-mono resize-none text-gray-600"
                                    placeholder="New Submission URL..."
                                />

                                <button
                                    onClick={handleUpdateSubmission}
                                    disabled={loading}
                                    className="w-full bg-gray-900 hover:bg-black text-white font-bold text-xs py-4 rounded-lg uppercase tracking-widest transition-all shadow-md shadow-gray-200 disabled:opacity-50"
                                >
                                    Overwrite Link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Notice */}
                <div className="pt-10 text-center">
                    <p className="text-[11px] text-gray-300 font-medium uppercase tracking-[0.4em]">
                        Internal Utility System
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminPowers;
