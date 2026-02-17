import { cn } from '@/lib/className';

export function DashboardContainer({
  children,
  className,
  maxWidth = 'max-w-screen',
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}) {
  return (
    <div className={cn('min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8', className)}>
      <div className={cn(maxWidth, 'mx-auto')}>
        <div className="bg-white shadow rounded-lg p-6">{children}</div>
      </div>
    </div>
  );
}

export function DashboardHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start justify-between mb-8">{children}</div>;
}

export function DashboardTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="text-3xl font-bold text-gray-900">{children}</h1>;
}

export function DashboardContent({ children }: { children: React.ReactNode }) {
  return <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">{children}</div>;
}

export function DashboardContentSpacer() {
  return <div className="h-8"></div>;
}
