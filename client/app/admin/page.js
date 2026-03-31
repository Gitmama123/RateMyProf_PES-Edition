"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  fetchRequests, 
  updateRequestStatus 
} from "../../lib/api";
import { getToken, getUser } from "../../lib/auth";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  MapPin, 
  BookOpen, 
  ChevronLeft,
  LogOut,
  Edit3,
  Search,
  Filter,
  Check,
  X
} from "lucide-react";
import { useForm } from "react-hook-form";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    const token = getToken();

    if (!user || user.role !== "admin") {
      router.push("/login");
      return;
    }

    setCurrentUser(user);
    loadRequests(token);
  }, []);

  const loadRequests = async (token) => {
    setLoading(true);
    try {
      const data = await fetchRequests(token);
      setRequests(data);
    } catch (err) {
      setError(err.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, updateData = null) => {
    try {
      const token = getToken();
      await updateRequestStatus(id, status, updateData, token);
      setEditingRequest(null);
      loadRequests(token);
    } catch (err) {
      alert(err.message || "Action failed.");
    }
  };

  const pendingRequests = requests.filter(r => r.status === "Pending");
  const processedRequests = requests.filter(r => r.status !== "Pending");

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">{currentUser.username}</p>
              <p className="text-[10px] text-sky-500 uppercase tracking-widest font-black">Administrator</p>
            </div>
            <button 
              onClick={() => { localStorage.removeItem('token'); router.push('/login'); }}
              className="p-2.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all border border-white/5"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <header className="mb-10">
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            Admin Dashboard
            <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
              v1.2
            </span>
          </h1>
          <p className="text-slate-400">Review and moderate professor requests from the community.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Pending Requests Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-bold text-white tracking-tight">Pending Approval</h2>
                <div className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded text-xs font-bold font-mono">
                  {pendingRequests.length}
                </div>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">All caught up! No pending requests.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {pendingRequests.map(req => (
                    <RequestRow 
                      key={req._id} 
                      request={req} 
                      onApprove={(r) => setEditingRequest(r)}
                      onReject={(id) => handleStatusUpdate(id, "Rejected")}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* History Section */}
            {processedRequests.length > 0 && (
              <section>
                 <div className="flex items-center gap-3 mb-6 opacity-50">
                  <CheckCircle className="w-5 h-5 text-slate-400" />
                  <h2 className="text-xl font-bold text-white tracking-tight">History</h2>
                </div>
                <div className="grid grid-cols-1 gap-3 opacity-60">
                   {processedRequests.slice(0, 5).map(req => (
                    <div key={req._id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                             {req.status === 'Approved' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{req.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{req.department} • {req.campus}</p>
                          </div>
                       </div>
                       <div className="text-[10px] text-slate-600 font-mono">
                          {new Date(req.createdAt).toLocaleDateString()}
                       </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Edit & Approve Modal */}
      {editingRequest && (
        <EditApproveModal 
          request={editingRequest}
          onClose={() => setEditingRequest(null)}
          onConfirm={(id, updateData) => handleStatusUpdate(id, "Approved", updateData)}
        />
      )}
    </div>
  );
}

function RequestRow({ request, onApprove, onReject }) {
  return (
    <div className="relative bg-slate-900/50 border border-white/5 rounded-3xl p-5 sm:p-6 transition-all hover:bg-slate-900">
      <div className="flex flex-col md:flex-row gap-6 justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-sky-400 font-black shrink-0">
              {request.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">{request.name}</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{request.department}</span>
                <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{request.campus} Campus</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-0 sm:ml-16">
            <div className="flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest">Courses</p>
                <p className="text-xs text-slate-300 font-medium">{request.courses}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest">Submitted By</p>
                <p className="text-xs text-slate-300 font-medium">{request.submittedBy || 'Anonymous Student'}</p>
              </div>
            </div>
          </div>

          {request.additionalComments && (
            <div className="ml-0 sm:ml-16 p-3 bg-white/5 rounded-xl border border-white/5">
               <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-1">Additional Info</p>
               <p className="text-xs text-slate-400 italic">"{request.additionalComments}"</p>
            </div>
          )}
        </div>

        <div className="flex flex-row md:flex-col gap-2 shrink-0 justify-end md:justify-start">
          <button 
            onClick={() => onApprove(request)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-sky-900/20"
          >
            <Edit3 className="w-4 h-4" />
            Edit & Approve
          </button>
          <button 
            onClick={() => { if(confirm('Reject this request?')) onReject(request._id); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 font-bold rounded-2xl transition-all border border-white/5"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

function EditApproveModal({ request, onClose, onConfirm }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: request.name,
      department: request.department,
      campus: request.campus,
      courses: request.courses
    }
  });

  const onSubmit = (data) => {
    onConfirm(request._id, data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 border-b border-white/5">
           <h3 className="text-xl font-bold text-white flex items-center gap-2">
             <Edit3 className="w-5 h-5 text-sky-400" />
             Review & Approve
           </h3>
           <p className="text-slate-400 text-xs mt-1">Make any necessary corrections before adding to directory.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Professor Name</label>
            <input 
              {...register("name", { required: true })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-sky-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Department</label>
              <input 
                {...register("department", { required: true })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-sky-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Campus</label>
              <select 
                {...register("campus", { required: true })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-sky-500 outline-none appearance-none"
              >
                <option value="RR">RR</option>
                <option value="EC">EC</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Subjects (Comma separated)</label>
            <textarea 
              {...register("courses", { required: true })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-sky-500 outline-none h-20 resize-none"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white/5 text-slate-400 font-bold rounded-2xl border border-white/5"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-sky-600 text-white font-bold rounded-2xl shadow-lg shadow-sky-900/20 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Finalize & Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
