"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { X, AlertCircle, CheckCircle2, Loader2, Calendar, MessageSquare, GraduationCap, MapPin, BarChart } from "lucide-react";
import { submitProfessorRequest } from "../lib/api";
import { getToken } from "../lib/auth";

export default function RequestProfessorModal({ isOpen, onClose }) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      campus: "RR"
    }
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      const token = getToken();
      await submitProfessorRequest(data, token);
      setSuccess(true);
      setTimeout(() => {
        reset();
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Report Missing Professor
            </h2>
            <p className="text-slate-400 text-xs mt-1">Help us update the PESU directory!</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Overlay */}
        {success && (
          <div className="absolute inset-0 z-20 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
            <p className="text-slate-400">Your report has been submitted for verification. We'll update the database soon.</p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Campus Selection */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              Campus *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['RR', 'EC'].map((c) => (
                <label key={c} className={`
                  relative flex items-center justify-center p-3 rounded-xl border transition-all cursor-pointer
                  ${watch('campus') === c 
                    ? 'border-sky-500/50 bg-sky-500/5 text-sky-400' 
                    : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'}
                `}>
                  <input {...register("campus", { required: true })} type="radio" value={c} className="sr-only" />
                  <span className="text-sm font-semibold">{c === 'RR' ? 'Ring Road (RR)' : 'Electronic City (EC)'}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Name & Dept */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1.5">
                <GraduationCap className="w-3 h-3" />
                Full Name *
              </label>
              <input 
                {...register("name", { required: "Name is required" })}
                placeholder="e.g. Dr. John Doe"
                className={`w-full bg-white/5 border ${errors.name ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1.5">
                <BarChart className="w-3 h-3" />
                Department *
              </label>
              <input 
                {...register("department", { required: "Department is required" })}
                placeholder="e.g. CSE, ECE"
                className={`w-full bg-white/5 border ${errors.department ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all`}
              />
            </div>
          </div>

          {/* Courses */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" />
              Subjects Handled *
            </label>
            <input 
              {...register("courses", { required: "Min 1 course is required" })}
              placeholder="e.g. OS, DBMS, AI"
              className={`w-full bg-white/5 border ${errors.courses ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all`}
            />
          </div>

          {/* Optional Fields Display */}
          <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3" />
                  Additional Comments
                </label>
                <textarea 
                  {...register("additionalComments")}
                  placeholder="Anything else to help us identify them?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all resize-none h-20"
                />
              </div>
          </div>

          {/* Action Button */}
          <button 
            type="submit"
            disabled={submitting}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-sky-900/40 flex items-center justify-center gap-2 mt-4"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Submit Report'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-950/50 border-t border-white/5 text-center">
           <p className="text-[9px] text-slate-600 italic">
             RateMyProf PES Edition uses student reports to keep our data fresh. 
             All submissions are reviewed before appearing in the directory.
           </p>
        </div>
      </div>
    </div>
  );
}
