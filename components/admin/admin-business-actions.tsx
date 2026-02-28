'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, CheckCircle, XCircle, Crown, Star } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Props {
  businessId: string
  isActive: boolean
  isVerified: boolean
  isFeatured: boolean
  currentPlan: string
}

export function AdminBusinessActions({ businessId, isActive, isVerified, isFeatured, currentPlan }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const update = async (data: any) => {
    const res = await fetch(`/api/admin/businesses/${businessId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast({ title: 'Güncellendi' })
      router.refresh()
    } else {
      toast({ title: 'Hata', variant: 'destructive' })
    }
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded hover:bg-gray-100 text-gray-400"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-20 py-1">
            <button
              onClick={() => update({ isActive: !isActive })}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left"
            >
              {isActive
                ? <><XCircle className="w-4 h-4 text-red-400" /> Askıya Al</>
                : <><CheckCircle className="w-4 h-4 text-green-500" /> Aktifleştir</>
              }
            </button>
            <button
              onClick={() => update({ isVerified: !isVerified })}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left"
            >
              <CheckCircle className="w-4 h-4 text-teal-500" />
              {isVerified ? 'Doğrulamayı Kaldır' : 'Doğrula'}
            </button>
            <button
              onClick={() => update({ isFeatured: !isFeatured })}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left"
            >
              <Star className="w-4 h-4 text-amber-500" />
              {isFeatured ? 'Öne Çıkarmayı Kaldır' : 'Öne Çıkar'}
            </button>
            <hr className="my-1 border-gray-100" />
            <div className="px-3 py-1 text-xs text-gray-400 font-medium">Plan Değiştir</div>
            {['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'].map((plan) => (
              <button
                key={plan}
                onClick={() => update({ plan })}
                className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left ${
                  currentPlan === plan ? 'text-orange-600 font-medium' : ''
                }`}
              >
                {plan}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
