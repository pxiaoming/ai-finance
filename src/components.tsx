import type { ReactNode } from "react";

export function SidebarSection({
  title,
  children,
  compact = false,
}: {
  title: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={`sidebar-group${compact ? " compact" : ""}`}>
      <p className="group-title">{title}</p>
      {children}
    </section>
  );
}

export function Message({
  role,
  avatar,
  label,
  title,
  children,
  actions,
}: {
  role: "assistant" | "user";
  avatar: string;
  label?: string;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <article className={`message ${role}`}>
      <div className="message-avatar">{avatar}</div>
      <div className="message-card">
        {label ? <p className="message-role">{label}</p> : null}
        {title ? <h3>{title}</h3> : null}
        {children}
        {actions ? <div className="message-actions">{actions}</div> : null}
      </div>
    </article>
  );
}

export function ArtifactPanel({
  eyebrow,
  title,
  children,
  className = "",
  aside,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
  aside?: ReactNode;
}) {
  return (
    <section className={`artifact-panel ${className}`.trim()}>
      <div className="panel-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Composer({
  value,
  actionLabel,
  disabled = false,
  onAction,
}: {
  value: string;
  actionLabel: string;
  disabled?: boolean;
  onAction?: () => void;
}) {
  return (
    <div className="composer">
      <div className="composer-bar">
        <span className="composer-icon">+</span>
        <input type="text" value={value} aria-label="输入任务" readOnly />
        <button className="primary-button" disabled={disabled} onClick={onAction}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
