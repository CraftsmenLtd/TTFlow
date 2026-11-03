import { cn } from '../../lib/cn';
import { initials } from '../../lib/initials';

// Initials are drawn locally. No third-party avatar service sees employee names (ISO A.5.34).
const fallbackTones = [
  'bg-brand text-on-brand',
  'bg-hover text-brand',
  'bg-info-tint text-ink',
  'bg-warning-tint text-ink',
  'bg-live-tint text-ink',
  'bg-success-tint text-ink',
];

const sizeClasses = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-16 text-xl' } as const;

function toneFor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return fallbackTones[hash % fallbackTones.length] ?? 'bg-brand text-on-brand';
}

interface AvatarProps {
  name: string;
  src?: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const base = cn(
    'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
    sizeClasses[size],
    className,
  );
  if (src) return <img src={src} alt={name} className={cn(base, 'object-cover')} />;
  return (
    <span role="img" aria-label={name} className={cn(base, toneFor(name))}>
      {initials(name)}
    </span>
  );
}
