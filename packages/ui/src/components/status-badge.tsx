import { cva, type VariantProps } from 'class-variance-authority';

const statusVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      color: {
        gray: 'bg-gray-100 text-gray-700',
        blue: 'bg-blue-100 text-blue-700',
        green: 'bg-green-100 text-green-700',
        purple: 'bg-purple-100 text-purple-700',
        teal: 'bg-teal-100 text-teal-700',
        red: 'bg-red-100 text-red-700',
      },
    },
    defaultVariants: { color: 'gray' },
  }
);

type ColorVariant = 'gray' | 'blue' | 'green' | 'purple' | 'teal' | 'red';

const statusColorMap: Record<string, ColorVariant> = {
  DRAFT: 'gray',
  OPEN: 'gray',
  ACTIVE: 'blue',
  READY: 'blue',
  PUBLISHED: 'green',
  REVIEWED: 'purple',
  MUTATED: 'teal',
  DONE: 'teal',
  RETIRED: 'red',
  SKIPPED: 'red',
};

export interface StatusBadgeProps extends VariantProps<typeof statusVariants> {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = statusColorMap[status] ?? 'gray';
  return <span className={statusVariants({ color })}>{status}</span>;
}
