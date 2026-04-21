import {
  MessageSquare,
  Eye,
  ImageIcon,
  Mic,
  GitBranch,
  Shield,
  ChevronRight,
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare style={{ width: 22, height: 22 }} />,
  Eye: <Eye style={{ width: 22, height: 22 }} />,
  Image: <ImageIcon style={{ width: 22, height: 22 }} />,
  Mic: <Mic style={{ width: 22, height: 22 }} />,
  GitBranch: <GitBranch style={{ width: 22, height: 22 }} />,
  Shield: <Shield style={{ width: 22, height: 22 }} />,
};

// Each modality gets its own warm-palette accent
const ACCENT_MAP: Record<string, { icon: string; glow: string; dot: string; border: string; pill: string }> = {
  MessageSquare: {
    icon: "linear-gradient(135deg, #F59E0B 0%, #FB923C 100%)",
    glow: "rgba(245,158,11,0.2)",
    dot: "#F59E0B",
    border: "rgba(245,158,11,0.18)",
    pill: "rgba(245,158,11,0.08)",
  },
  Eye: {
    icon: "linear-gradient(135deg, #FB923C 0%, #FBBF24 100%)",
    glow: "rgba(251,146,60,0.2)",
    dot: "#FB923C",
    border: "rgba(251,146,60,0.18)",
    pill: "rgba(251,146,60,0.08)",
  },
  Image: {
    icon: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
    glow: "rgba(251,191,36,0.2)",
    dot: "#FBBF24",
    border: "rgba(251,191,36,0.18)",
    pill: "rgba(251,191,36,0.08)",
  },
  Mic: {
    icon: "linear-gradient(135deg, #F97316 0%, #F59E0B 100%)",
    glow: "rgba(249,115,22,0.2)",
    dot: "#F97316",
    border: "rgba(249,115,22,0.18)",
    pill: "rgba(249,115,22,0.08)",
  },
  GitBranch: {
    icon: "linear-gradient(135deg, #FB923C 0%, #F59E0B 100%)",
    glow: "rgba(251,146,60,0.2)",
    dot: "#FB923C",
    border: "rgba(251,146,60,0.18)",
    pill: "rgba(251,146,60,0.08)",
  },
  Shield: {
    icon: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
    glow: "rgba(245,158,11,0.2)",
    dot: "#FBBF24",
    border: "rgba(245,158,11,0.18)",
    pill: "rgba(245,158,11,0.08)",
  },
};

const DEFAULT_ACCENT = ACCENT_MAP.MessageSquare;

interface Feature { label: string; }

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
  endpoint,
  badge,
}: ModalityCardProps) {
  const accent = ACCENT_MAP[iconName] ?? DEFAULT_ACCENT;

  return (
    <div
      className="group relative rounded-2xl p-6 transition-all duration-300 cursor-default overflow-hidden modality-card"
      style={{
        backgroundColor: "rgba(28,25,23,0.7)",
        border: `1px solid rgba(245,158,11,0.1)`,
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Soft background glow */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: accent.icon,
          opacity: 0.04,
          filter: "blur(40px)",
        }}
      />

      {badge && (
        <span
          className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{
            backgroundColor: accent.pill,
            color: accent.dot,
            border: `1px solid ${accent.border}`,
          }}
        >
          {badge}
        </span>
      )}

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
        style={{
          background: accent.icon,
          boxShadow: `0 8px 24px ${accent.glow}`,
          color: "#0C0A09",
        }}
      >
        {ICON_MAP[iconName]}
      </div>

      {/* Labels */}
      <div className="mb-1">
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: accent.dot }}
        >
          {subtitle}
        </span>
      </div>
      <h3 className="text-lg font-bold mb-3" style={{ color: "#F5F5F4" }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed mb-5" style={{ color: "#78716C" }}>
        {description}
      </p>

      {/* Features */}
      <ul className="space-y-2 mb-5">
        {features.map((f) => (
          <li key={f.label} className="flex items-start gap-2.5 text-sm" style={{ color: "#A8A29E" }}>
            <ChevronRight
              className="flex-shrink-0 mt-0.5"
              style={{ width: 14, height: 14, color: accent.dot }}
            />
            {f.label}
          </li>
        ))}
      </ul>

      {/* Endpoint */}
      <div
        className="pt-4 mt-auto"
        style={{ borderTop: "1px solid rgba(245,158,11,0.08)" }}
      >
        <code className="text-[11px] font-mono" style={{ color: "#57534E" }}>
          {endpoint}
        </code>
      </div>
    </div>
  );
}
