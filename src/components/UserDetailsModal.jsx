import React from 'react';

/**
 * UserDetailsModal - High Visibility Minimalist
 * Uses deeper functional colors (level 100/200 tints) for better contrast.
 */
const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;

    const SectionHeader = ({ title, colorClass }) => (
        <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${colorClass}`}>
            <span className={`w-1 h-4 rounded-full ${colorClass.replace('text', 'bg')}`}></span>
            {title}
        </h3>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-[4px] p-4" onClick={onClose}>
            <div
                className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header Section */}
                <div className="p-8 border-b border-slate-100 flex items-start justify-between bg-slate-50/30">
                    <div>
                        <h2 className="text-2xl font-medium text-slate-950 tracking-tight leading-none">
                            {user.name}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-blue-700 font-semibold">{user.email}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-sm text-slate-600 font-mono font-bold">
                                AB{String(user.serialId || '').padStart(5, '0')}
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className='text-sm text-slate-600 font-mono font-bold'>{user.collegeName || 'External Participant'}</span>
                            <span className="text-slate-300">|</span>
                            <span className='text-sm text-slate-600 font-mono font-bold'>{user.phoneNumber || 'Contact Unavailable'}</span>
                        </div>

                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-900 transition-colors bg-slate-100"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content Section */}
                <div className="p-5 overflow-y-auto space-y-6 bg-white">

                    {/* SECTION: PASSES (EMERALD) */}
                    <div>
                        <SectionHeader title="Financial Status: Passes" colorClass="text-emerald-700" />
                        {user.purchasedPasses?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {user.purchasedPasses.map(p => (
                                    <div key={p.id} className="p-5 rounded-xl border-2 border-emerald-100 bg-emerald-100/30 flex flex-col justify-between min-h-[90px] shadow-sm">
                                        <div className="text-sm font-bold text-emerald-900 leading-tight">{p.passType.name}</div>
                                        <div className="flex justify-between items-end mt-3 pt-3 border-t border-emerald-100/50">
                                            <span className="text-sm font-black text-emerald-700">₹{p.passType.price}</span>
                                            <span className="text-[9px] text-emerald-600/70 font-mono font-bold">#{p.transaction?.razorpay_payment_id?.slice(-8) || 'OFFLINE'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 text-center font-medium">
                                No active passes found.
                            </div>
                        )}
                    </div>

                    {/* SECTION: ACCOMMODATION (BLUE) */}
                    <div>
                        <SectionHeader title="Logistics: Stay & Housing" colorClass="text-blue-700" />
                        {user.accomodationBookings?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {user.accomodationBookings.map(acc => (
                                    <div key={acc.id} className="p-5 rounded-xl border-2 border-blue-100 bg-blue-100/30 flex justify-between items-center shadow-sm">
                                        <div>
                                            <div className="text-sm font-bold text-blue-950">{acc.accommodationType.name}</div>
                                            <div className="text-xs text-blue-700 font-bold mt-1">Ref: {acc.id}</div>
                                        </div>
                                        <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md border border-blue-700">
                                            {acc.days || acc.quantity || 1} Nights
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 text-center font-medium">
                                No accommodation bookings record.
                            </div>
                        )}
                    </div>

                    {/* SECTION: EVENT REGISTRATIONS (PURPLE) */}
                    <div>
                        <SectionHeader title="Event Participation" colorClass="text-purple-700" />
                        {user.registrations?.length > 0 ? (
                            <div className="space-y-3">
                                {user.registrations.map(reg => (
                                    <div key={reg.id} className="p-5 rounded-xl border border-slate-200 bg-white flex items-center justify-between group hover:border-purple-300 hover:shadow-md transition-all">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors uppercase tracking-tight">{reg.event.name}</span>
                                            <span className="text-[10px] text-slate-500 font-bold mt-0.5">{reg.event.isTeamEvent ? 'Team-based Challenge' : 'Individual Participation'}</span>
                                        </div>
                                        {reg.team ? (
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                                                        {reg.team.name}
                                                    </span>
                                                    {reg.team.leaderId === user.id ? (
                                                        <span className="text-[8px] font-black text-white bg-indigo-600 px-1.5 py-0.5 rounded mt-1 uppercase tracking-widest">Captain</span>
                                                    ) : (
                                                        <span className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest">Member</span>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Solo Entry</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 text-center font-medium">
                                No active registrations.
                            </div>
                        )}
                    </div>

                    {/* SECTION: TEAMS & ROUNDS (INDIGO/AMBER) */}
                    {(user.teamsLeading?.length > 0 || user.teamsMember?.length > 0 || user.round2Selected?.length > 0) && (
                        <div>
                            <SectionHeader title="Meta Data & Progress" colorClass="text-indigo-700" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {user.teamsLeading?.map(t => (
                                    <div key={t.id} className="p-5 rounded-xl border-2 border-indigo-100 bg-indigo-100/30 flex justify-between items-center relative overflow-hidden shadow-sm">
                                        <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-600 text-white text-[8px] font-black rounded-bl-xl uppercase tracking-widest">Lead</div>
                                        <div>
                                            <div className="text-sm font-bold text-indigo-950">{t.name}</div>
                                            <div className="text-[10px] text-indigo-600 font-mono font-bold mt-1.5">CODE: {t.teamcode}</div>
                                        </div>
                                    </div>
                                ))}
                                {user.teamsMember?.map(tm => (
                                    <div key={tm.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center relative overflow-hidden shadow-sm">
                                        <div className="absolute top-0 right-0 px-3 py-1 bg-slate-400 text-white text-[8px] font-black rounded-bl-xl uppercase tracking-widest font-mono">MBR</div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{tm.team.name}</div>
                                            <div className="text-[10px] text-slate-500 font-mono font-bold mt-1.5">CODE: {tm.team.teamcode}</div>
                                        </div>
                                    </div>
                                ))}
                                {user.round2Selected?.map(r2 => (
                                    <div key={r2.id} className="p-5 rounded-xl border-2 border-amber-200 bg-amber-100/40 flex items-center gap-4 shadow-sm">
                                        <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center text-xl shadow-inner border border-amber-500">⭐</div>
                                        <div>
                                            <div className="text-[9px] text-amber-700 font-black uppercase tracking-widest">Advanced to Round 2</div>
                                            <div className="text-sm font-bold text-amber-950 mt-0.5">{r2.event.name}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>


            </div>
        </div>
    );
};

export default UserDetailsModal;
