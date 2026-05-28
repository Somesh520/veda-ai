import React from 'react';
import CreateAssignmentForm from '../../Components/forms/CreateAssignmentForm';

export default function CreateAssignmentPage() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Header — hidden on mobile (topbar handles the title) */}
      <header className="hidden lg:block p-8 max-w-4xl w-full mx-auto pb-0 no-print select-none">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Create Assignment</h2>
        <p className="text-xs text-slate-400 mt-1 font-semibold">Set up a new assignment for your students</p>
      </header>

      {/* Form wrapper — tighter padding on mobile */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <CreateAssignmentForm />
      </div>
    </div>
  );
}
