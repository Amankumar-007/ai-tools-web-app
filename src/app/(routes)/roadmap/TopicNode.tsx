import { Handle, Position } from '@xyflow/react';
import { BookOpen, Check, Flag, Sparkles } from 'lucide-react';

export default function TopicNode({ data, selected }: any) {
  const isCheckpoint = data.type === 'checkpoint';
  const horizontal = data.direction === 'LR';
  const level = typeof data.level === 'string' ? data.level : 'Step';

  return (
    <div className={`w-[292px] rounded-2xl border bg-white p-4 text-left shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900 ${selected ? 'border-blue-500 ring-4 ring-blue-500/10 dark:border-blue-400' : 'border-slate-200 dark:border-slate-700'}`}>
      <Handle type="target" position={horizontal ? Position.Left : Position.Top} className="!h-2.5 !w-2.5 !border-2 !border-white !bg-blue-500" />
      <div className="flex items-start gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isCheckpoint ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300'}`}>
          {isCheckpoint ? <Flag size={18} /> : <BookOpen size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{level} · {isCheckpoint ? 'Milestone' : `Step ${data.stepNumber}`}</span>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-900 dark:text-white">{data.label}</h3>
        </div>
      </div>
      {data.description && <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{data.description}</p>}
      <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
        {data.skills?.length > 0 && <span className="flex items-center gap-1"><Sparkles size={12} /> {data.skills.length} skills</span>}
        {data.projects?.length > 0 && <span className="flex items-center gap-1"><Check size={12} /> {data.projects.length} projects</span>}
        <span className="ml-auto font-medium text-blue-600 dark:text-blue-400">View step →</span>
      </div>
      <Handle type="source" position={horizontal ? Position.Right : Position.Bottom} className="!h-2.5 !w-2.5 !border-2 !border-white !bg-blue-500" />
    </div>
  );
}
