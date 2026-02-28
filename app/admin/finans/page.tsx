export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import { TrendingUp, Building2, CreditCard, BarChart3 } from 'lucide-react'

export default async function AdminFinansPage() {
  const [
    totalBusinesses,
    planBreakdown,
    recentAppointments,
    monthlyStats,
  ] = await Promise.all([
    db.business.count({ where: { isActive: true } }),
    db.business.groupBy({
      by: ['plan'],
      _count: true,
      where: { isActive: true },
    }),
    db.appointment.count({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: new Date(new Date().setDate(1)) },
      },
    }),
    db.appointment.groupBy({
      by: ['status'],
      _count: true,
    }),
  ])

  const planPrices: Record<string, number> = {
    FREE: 0,
    BASIC: 299,
    PREMIUM: 599,
    ENTERPRISE: 999,
  }

  const planLabels: Record<string, string> = {
    FREE: 'Ücretsiz',
    BASIC: 'Basic',
    PREMIUM: 'Premium',
    ENTERPRISE: 'Kurumsal',
  }

  const planColors: Record<string, string> = {
    FREE: 'bg-gray-100 text-gray-600',
    BASIC: 'bg-blue-100 text-blue-700',
    PREMIUM: 'bg-amber-100 text-amber-700',
    ENTERPRISE: 'bg-purple-100 text-purple-700',
  }

  const mrr = planBreakdown.reduce((sum, p) => {
    return sum + (planPrices[p.plan] || 0) * p._count
  }, 0)

  const totalAppointments = monthlyStats.reduce((s, m) => s + m._count, 0)
  const completedAppointments = monthlyStats.find(m => m.status === 'COMPLETED')?._count || 0

  const cards = [
    {
      label: 'Tahmini Aylık Gelir (MRR)',
      value: formatPrice(mrr),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      note: 'Aktif aboneliklerden',
    },
    {
      label: 'Aktif İşletme',
      value: totalBusinesses.toString(),
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      note: 'Toplam aktif',
    },
    {
      label: 'Bu Ay Randevu',
      value: recentAppointments.toString(),
      icon: CreditCard,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      note: 'Tamamlanan',
    },
    {
      label: 'Tüm Randevular',
      value: totalAppointments.toString(),
      icon: BarChart3,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      note: `${completedAppointments} tamamlandı`,
    },
  ]

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Finansal Özet</h1>

      {/* Özet Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-sm text-gray-600 mt-0.5">{card.label}</div>
            <div className="text-xs text-gray-400 mt-1">{card.note}</div>
          </div>
        ))}
      </div>

      {/* Plan Dağılımı */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-orange-500" />
          Plan Dağılımı
        </h2>
        <div className="space-y-3">
          {planBreakdown
            .sort((a, b) => (planPrices[b.plan] || 0) - (planPrices[a.plan] || 0))
            .map((p) => {
              const pct = totalBusinesses > 0 ? Math.round((p._count / totalBusinesses) * 100) : 0
              return (
                <div key={p.plan} className="flex items-center gap-4">
                  <div className="w-28">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planColors[p.plan] || 'bg-gray-100 text-gray-500'}`}>
                      {planLabels[p.plan] || p.plan}
                    </span>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-orange-400 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-700 w-20 text-right">
                    {p._count} işletme
                  </div>
                  <div className="text-sm font-medium text-gray-900 w-24 text-right">
                    {formatPrice(planPrices[p.plan] * p._count)}/ay
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Randevu Durumları */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Randevu İstatistikleri</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {monthlyStats.map((stat) => {
            const statusLabels: Record<string, string> = {
              PENDING: 'Bekliyor',
              CONFIRMED: 'Onaylı',
              COMPLETED: 'Tamamlandı',
              CANCELLED: 'İptal',
              NO_SHOW: 'Gelmedi',
            }
            const statusColors: Record<string, string> = {
              PENDING: 'text-amber-600 bg-amber-50',
              CONFIRMED: 'text-blue-600 bg-blue-50',
              COMPLETED: 'text-green-600 bg-green-50',
              CANCELLED: 'text-red-600 bg-red-50',
              NO_SHOW: 'text-gray-600 bg-gray-50',
            }
            return (
              <div key={stat.status} className={`rounded-xl p-4 text-center ${statusColors[stat.status] || 'bg-gray-50'}`}>
                <div className="text-2xl font-bold">{stat._count}</div>
                <div className="text-xs mt-1 opacity-80">{statusLabels[stat.status] || stat.status}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
