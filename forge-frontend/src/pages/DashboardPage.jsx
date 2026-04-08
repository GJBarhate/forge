// src/pages/DashboardPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusCircle,
  Zap,
  FolderOpen,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { projectService } from "../services/projectService.js";
import { useAuthStore } from "../store/authStore.js";
import { useSocket } from "../hooks/useSocket.js";
import EmptyState from "../components/shared/EmptyState.jsx";
import ConfirmModal from "../components/shared/ConfirmModal.jsx";
import toast from "react-hot-toast";

function StatusBadge({ status }) {
  if (status === "COMPLETE")
    return (
      <span className="badge-teal text-[11px] gap-1">
        <CheckCircle size={10} />
        Complete
      </span>
    );
  if (status === "FAILED")
    return (
      <span className="badge-coral text-[11px] gap-1">
        <AlertCircle size={10} />
        Failed
      </span>
    );
  return (
    <span className="badge-amber text-[11px] gap-1">
      <Loader2 size={10} className="animate-spin" />
      Processing
    </span>
  );
}

function ProjectCard({ project, onDelete }) {
  const [projectProgress, setProjectProgress] = useState(0);
  const [projectStep, setProjectStep] = useState('Processing...');
  const { onJobProgress } = useSocket();

  // Listen for progress updates for this specific project
  useEffect(() => {
    if (project.status !== 'PROCESSING') return;

    const unsubscribe = onJobProgress(({ progress, step, projectId }) => {
      if (projectId === project.id) {
        setProjectProgress(progress);
        if (step) setProjectStep(step);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [project.id, project.status, onJobProgress]);

  const date = new Date(project.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Show progress bar for processing projects
  if (project.status === 'PROCESSING') {
    const barLength = 20;
    const filledLength = Math.round((projectProgress / 100) * barLength);
    const progressBar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

    return (
      <div className="card-hover group relative">
        <Link to={`/project/${project.id}`} className="block">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber/15 border border-amber/25 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Loader2 size={15} className="text-amber-light animate-spin" />
            </div>
            <StatusBadge status={project.status} />
          </div>
          <h3 className="font-display font-600 text-sm text-[#e8e8f0] mb-2 line-clamp-2 leading-snug">
            {project.name}
          </h3>
          
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-[#9999b8] font-mono">{projectProgress}%</span>
              <span className="text-[10px] text-[#5f5f80]">{projectStep}</span>
            </div>
            <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.07]">
              <div
                className="h-full bg-gradient-to-r from-amber to-yellow transition-all duration-300"
                style={{ width: `${projectProgress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#5f5f80] font-mono">
            <Clock size={10} />
            {date}
          </div>
        </Link>
      </div>
    );
  }

  // Original card for completed/failed projects
  return (
    <div className="card-hover group relative">
      <Link to={`/project/${project.id}`} className="block">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-xl bg-purple/15 border border-purple/25 flex items-center justify-center flex-shrink-0">
            <Zap size={15} className="text-purple-light" />
          </div>
          <StatusBadge status={project.status} />
        </div>
        <h3 className="font-display font-600 text-sm text-[#e8e8f0] mb-1 line-clamp-2 leading-snug">
          {project.name}
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] text-[#5f5f80] font-mono mt-3">
          <Clock size={10} />
          {date}
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          onDelete(project);
        }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#5f5f80] hover:text-coral hover:bg-coral/10 transition-all duration-150"
        title="Delete project"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { onJobComplete } = useSocket();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: projectService.getAll,
    retry: 3, // ✅ Retry up to 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // ✅ Exponential backoff
    staleTime: 30000, // ✅ Keep data fresh for 30s
    gcTime: 5 * 60 * 1000, // ✅ Keep cached data for 5 minutes
  });

  // Listen for job completions and refresh projects
  useEffect(() => {
    const unsubscribe = onJobComplete((data) => {
      console.log('[Dashboard] Job completed:', data);
      // Invalidate projects query to refresh immediately
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [onJobComplete, queryClient]);

  const projects = Array.isArray(data) ? data : [];  // ✅ projectService.getAll() returns array directly

  const deleteMutation = useMutation({
    mutationFn: (id) => projectService.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Could not delete project"),
  });

  const completed = Array.isArray(projects)
    ? projects.filter((p) => p?.status === "COMPLETE").length
    : 0;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="section-title mb-1">Dashboard</h1>
          <p className="text-sm text-[#9999b8]">
            Welcome back{user?.name ? `, ${user.name}` : ""}. You have{" "}
            {projects.length} project{projects.length !== 1 ? "s" : ""}.
          </p>
        </div>
        <Link to="/project/new" className="btn-primary gap-2">
          <PlusCircle size={15} />
          New project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total projects", value: projects.length, color: "purple" },
          { label: "Blueprints ready", value: completed, color: "teal" },
          {
            label: "In progress",
            value: projects.filter((p) => p.status === "PROCESSING").length,
            color: "amber",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-surface rounded-xl p-4 border border-white/[0.07]"
          >
            <p className="text-xs text-[#5f5f80] font-mono uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className={`font-display font-800 text-2xl text-${color}-light`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Projects grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#5f5f80]" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-coral" />
            <p className="text-sm text-coral font-medium mb-2">
              {error?.response?.status === 429 
                ? '⏳ Too many requests. Please wait a moment and try again.' 
                : 'Failed to load projects. Please refresh.'}
            </p>
            {error?.message && (
              <p className="text-xs text-[#5f5f80]">{error.message}</p>
            )}
          </div>
          <button
            onClick={() => refetch()}
            className="btn-secondary gap-2 text-xs"
          >
            <Loader2 size={13} />
            Retry
          </button>
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects yet"
          description="Create your first blueprint by combining voice, sketch, or text input."
          action={
            <Link to="/project/new" className="btn-primary gap-2">
              <PlusCircle size={15} /> Create first project
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete project?"
        message={`"${deleteTarget?.name}" will be soft-deleted. This can be recovered from the database if needed.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
