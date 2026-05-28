'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '../store/assessmentStore';
import { useToast } from '../Components/ui/Toast';
import { 
  Search, 
  MoreVertical, 
  Trash2, 
  Eye, 
  Plus,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { 
    assignments, 
    isLoading, 
    loadAssignments, 
    removeAssignment 
  } = useAssessmentStore();

  const { showToast, showConfirm } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm({
      title: 'Delete Assignment',
      message: 'Are you sure you want to delete this assignment? All data will be permanently removed. This cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        await removeAssignment(id);
        setActiveDropdownId(null);
        showToast('success', 'Assignment deleted successfully!');
      }
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Main Content Frame — tighter padding on mobile */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-4 max-w-7xl w-full mx-auto">
        {isLoading && assignments.length === 0 ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-orange-500 animate-spin mb-4" />
            <p className="text-slate-400 text-sm font-medium">Syncing assignments...</p>
          </div>

        ) : assignments.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-lg mx-auto px-4">
            <div className="w-48 h-48 sm:w-64 sm:h-64 relative mb-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-slate-100/50 rounded-full blur-2xl" />
              <svg className="w-36 h-36 sm:w-48 sm:h-48 relative z-10" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="50" y="30" width="100" height="130" rx="16" fill="white" stroke="#E2E8F0" strokeWidth="6" />
                <line x1="75" y1="65" x2="125" y2="65" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
                <line x1="75" y1="85" x2="125" y2="85" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
                <line x1="75" y1="105" x2="105" y2="105" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
                <circle cx="120" cy="120" r="30" fill="white" stroke="#94A3B8" strokeWidth="6" />
                <line x1="140" y1="140" x2="165" y2="165" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
                <circle cx="120" cy="120" r="14" fill="#EF4444" />
                <path d="M115 115L125 125M125 115L115 125" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">No assignments yet</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Create your first assignment to start collecting and grading student submissions.
            </p>

            <Link href="/create-assignment">
              <button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full py-3.5 px-8 font-semibold text-sm flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] cursor-pointer active:scale-[0.98]">
                <Plus className="w-5 h-5" />
                <span>Create Your First Assignment</span>
              </button>
            </Link>
          </div>

        ) : (
          /* Filled State — assignment grid */
          <div className="space-y-5 sm:space-y-6 animate-fade-in">

            {/* ── Header row ── */}
            <div className="flex items-start gap-3 pt-1">
              {/* Green live-status dot */}
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)] mt-1 shrink-0" />
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">Assignments</h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Manage and create assignments for your classes.</p>
              </div>
            </div>

            {/* ── Filter + Search row ── */}

            {/* MOBILE: inline side-by-side pills on gray bg */}
            <div className="flex items-center gap-2.5 sm:hidden">
              {/* Filter pill */}
              <button className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 cursor-pointer whitespace-nowrap shadow-sm active:scale-95 transition-all">
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 16 16" fill="none">
                  <path d="M2 3h12M4.5 8h7M7 13h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>Filter</span>
              </button>

              {/* Search Name pill */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 outline-none rounded-full pl-9 pr-4 py-2.5 text-xs font-medium text-slate-700 placeholder-slate-400 shadow-sm transition-all"
                  style={{ boxShadow: 'inset -3px 0 0 0 #8b5cf6' }}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = 'inset -3px 0 0 0 #7c3aed, 0 0 0 3px rgba(139,92,246,0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = 'inset -3px 0 0 0 #8b5cf6'; }}
                />
              </div>
            </div>

            {/* DESKTOP: white card with red-orange underline */}
            <div className="hidden sm:block bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5">
                <button className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer transition-colors group outline-none">
                  <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" viewBox="0 0 16 16" fill="none">
                    <path d="M2 3h12M4.5 8h7M7 13h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span>Filter By</span>
                </button>
                <div className="relative w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search Assignment"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white outline-none rounded-full pl-9 pr-4 py-2 text-xs font-medium text-slate-700 placeholder-slate-400 transition-all"
                    style={{ border: '1.5px solid #e2e8f0', boxShadow: 'inset -3px 0 0 0 #8b5cf6' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.boxShadow = 'inset -3px 0 0 0 #7c3aed, 0 0 0 3px rgba(139,92,246,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'inset -3px 0 0 0 #8b5cf6'; }}
                  />
                </div>
              </div>
              <div className="h-[2px] bg-gradient-to-r from-red-500 via-orange-400 to-transparent" />
            </div>


            {/* Grid — 1 col mobile, 2 col tablet, 3 col desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 relative">
              {filteredAssignments.map((assignment) => {
                const isDropdownOpen = activeDropdownId === assignment._id;

                return (
                  <div
                    key={assignment._id}
                    onClick={() => router.push(`/assessment/${assignment._id}`)}
                    className="bg-white border border-slate-100 hover:border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md/5 transition-all cursor-pointer relative group active:scale-[0.99]"
                  >
                    {/* ── MOBILE card layout ── */}
                    <div className="sm:hidden px-4 py-3.5">
                      <div className="flex items-center justify-between">
                        {/* Title */}
                        <h3 className="text-sm font-bold text-slate-800 line-clamp-1 flex-1 mr-2">
                          {assignment.title}
                        </h3>
                        {/* Kebab menu */}
                        <div className="relative shrink-0" ref={isDropdownOpen ? dropdownRef : null}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveDropdownId(isDropdownOpen ? null : assignment._id); }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {isDropdownOpen && (
                            <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-100 rounded-xl shadow-lg z-20 py-1.5 animate-fade-in">
                              <button onClick={() => router.push(`/assessment/${assignment._id}`)} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer">
                                <Eye className="w-4 h-4 text-slate-400" /><span>View Assignment</span>
                              </button>
                              <button onClick={(e) => handleDelete(assignment._id, e)} className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-xs font-semibold text-red-600 flex items-center gap-2 cursor-pointer border-t border-slate-50">
                                <Trash2 className="w-4 h-4 text-red-400" /><span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Dates row — matches screenshot exactly */}
                      <p className="text-xs text-slate-500 mt-1.5">
                        <span className="font-semibold">Assigned on</span>
                        <span className="text-slate-400"> : {formatDate(assignment.createdAt)}</span>
                        <span className="mx-3 text-slate-300">·</span>
                        <span className="font-semibold">Due</span>
                        <span className="text-slate-400"> : {formatDate(assignment.dueDate)}</span>
                      </p>
                    </div>

                    {/* ── DESKTOP card layout (sm+) ── */}
                    <div className="hidden sm:flex flex-col p-6 min-h-[170px]">
                      {/* Header: subject badge + status + dropdown */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <span className="bg-slate-50 border border-slate-100 text-slate-500 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase">
                          {assignment.subject}
                        </span>
                        <div className="flex items-center gap-2">
                          {assignment.status === 'PENDING' && <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" title="In Queue" />}
                          {assignment.status === 'GENERATING' && <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" title="Generating" />}
                          {assignment.status === 'FAILED' && <span className="w-2.5 h-2.5 rounded-full bg-red-500" title="Failed" />}
                          {assignment.status === 'COMPLETED' && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Completed" />}
                          <div className="relative" ref={isDropdownOpen ? dropdownRef : null}>
                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdownId(isDropdownOpen ? null : assignment._id); }} className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {isDropdownOpen && (
                              <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-100 rounded-xl shadow-lg z-20 py-1.5 animate-fade-in">
                                <button onClick={() => router.push(`/assessment/${assignment._id}`)} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer">
                                  <Eye className="w-4 h-4 text-slate-400" /><span>View Assignment</span>
                                </button>
                                <button onClick={(e) => handleDelete(assignment._id, e)} className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-xs font-semibold text-red-600 flex items-center gap-2 cursor-pointer border-t border-slate-50">
                                  <Trash2 className="w-4 h-4 text-red-400" /><span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-slate-800 line-clamp-1 mb-2 group-hover:text-orange-500 transition-colors">{assignment.title}</h3>
                      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-6">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>Assigned: {formatDate(assignment.createdAt)}</span>
                      </div>
                      <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-500 truncate mr-2">{assignment.className}</span>
                        <span className="font-bold text-slate-700 shrink-0"><span className="text-slate-400 font-medium">Due: </span>{formatDate(assignment.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop bottom create button */}
            <div className="hidden lg:flex justify-center pt-8">
              <Link href="/create-assignment">
                <button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full py-3.5 px-6 flex items-center gap-2 font-semibold text-sm shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
                  <Plus className="w-4 h-4" />
                  <span>Create Assignment</span>
                </button>
              </Link>
            </div>

            {/* Mobile FAB — red/coral + button matches screenshot */}
            <div
              className="lg:hidden fixed bottom-20 right-4 z-40 no-print"
              style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
            >
              <Link href="/create-assignment">
                <button className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer">
                  <Plus className="w-5 h-5 text-white" />
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
