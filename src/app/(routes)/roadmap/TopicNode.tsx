import { Handle, Position } from '@xyflow/react';
import { BookOpen, CheckCircle, ExternalLink, Star } from 'lucide-react';

export default function TopicNode({ data }: any) {
  const isCheckpoint = data.type === 'checkpoint';

  return (
    <div className={`relative px-5 py-5 bg-white border-2 rounded-xl min-w-[280px] max-w-[320px] shadow-md hover:shadow-lg transition-all duration-300
      ${isCheckpoint ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 hover:border-blue-300'}
    `}>
      {/* Star Badge for Checkpoints */}
      {isCheckpoint && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
          <Star className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
      )}
      
      {/* Target Handle (Top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 border-2 border-white bg-slate-400 hover:bg-blue-500 transition-colors"
      />

      {/* Header Section */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg shrink-0 mt-0.5 shadow-sm
          ${isCheckpoint ? 'bg-yellow-400 text-white' : 'bg-blue-500 text-white'}
        `}>
          {isCheckpoint ? (
            <Star className="w-5 h-5" strokeWidth={2} />
          ) : (
            <BookOpen className="w-5 h-5" strokeWidth={2} />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1.5 pr-2">
            {data.label}
          </h3>
          {data.description && (
            <p className="text-xs text-slate-600 leading-relaxed">
              {data.description}
            </p>
          )}
        </div>
      </div>

      {/* Resources Section */}
      {data.resources && data.resources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="relative mb-2">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 mb-2 block">
              Resources
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {data.resources.map((res: any, idx: number) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="group/link flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 transition-colors"
                title={res.title}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover/link:bg-blue-500 shrink-0" />
                <span className="truncate">{res.title}</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Source Handle (Bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 border-2 border-white bg-slate-400 hover:bg-blue-500 transition-colors"
      />
    </div>
  );
}