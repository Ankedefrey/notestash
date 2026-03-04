import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PdfViewerClient from '@/components/PdfViewerClient'

export default async function ViewPdfPage({ params }: { params: { pdfId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <PdfViewerClient pdfId={params.pdfId} userEmail={user.email!} />
}
