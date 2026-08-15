import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { products } from '@/lib/products'
import { AdminCalculator } from '@/components/admin-calculator'

export const metadata = {
  title: 'Cost Calculator | Go RoBo Admin',
  description: 'Internal admin tool to build a cart and calculate base cost totals.',
}

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/admin/sign-in')

  return <AdminCalculator userName={session.user.name} products={products} />
}
