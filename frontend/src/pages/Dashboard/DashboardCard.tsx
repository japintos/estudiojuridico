interface DashboardCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  colorClass: string
}

export default function DashboardCard({ title, value, icon, colorClass }: DashboardCardProps) {
  return (
    <div className="card">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString('es-AR') : value || '0'}
          </p>
        </div>
      </div>
    </div>
  )
}

