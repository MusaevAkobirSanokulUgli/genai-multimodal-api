import {
  MessageSquare,
  Eye,
  Image,
  Mic,
  GitBranch,
  Shield,
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare className="w-6 h-6 text-white" />,
  Eye: <Eye className="w-6 h-6 text-white" />,
  Image: <Image className="w-6 h-6 text-white" />,
  Mic: <Mic className="w-6 h-6 text-white" />,
  GitBranch: <GitBranch className="w-6 h-6 text-white" />,
  Shield: <Shield className="w-6 h-6 text-white" />,
};

interface Feature {
  label: string;
}

interface ModalityCardProps {
  iconName: string;
  title: string;
  subtitle: string;
  description: string;
  features: Feature[];
  gradient: string;
  endpoint: string;
  badge?: string;
}

export default function ModalityCard({
  iconName,
  title,
  subtitle,
  description,
  features,
  gradient,
  endpoint,
  badge,
}: ModalityCardProps) {
  return (
    <div className="group relative rounded-2xl p-6 border border-white/5 bg-[#0f172a]/60 backdrop-blur-sm hover:border-white/10 transition-all duration-500 hover:-translate-y-1">
      {badge && (
        <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/60">
          {badge}
        </span>
      )}

      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg`}
      >
        {ICON_MAP[iconName]}
      </div>

      {/* Title */}
      <div className="mb-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          {subtitle}
        </span>
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed mb-5">{description}</p>

      {/* Features */}
      <ul className="space-y-2 mb-5">
        {features.map((f) => (
          <li key={f.label} className="flex items-center gap-2 text-sm text-slate-300">
            <div
              className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradient} flex-shrink-0`}
            />
            {f.label}
          </li>
        ))}
      </ul>

      {/* Endpoint */}
      <div className="mt-auto pt-4 border-t border-white/5">
        <code className="text-xs font-mono text-slate-500">{endpoint}</code>
      </div>
    </div>
  );
}
