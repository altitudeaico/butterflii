import { supabase } from '../supabase'

export type ArtworkSubmission = {
  id: string
  title: string
  description: string
  proposed_price_pence: number
  status: 'pending' | 'approved' | 'changes_requested'
  review_note: string | null
  reviewed_at: string | null
  created_at: string
}

export type ArtworkDraft = Pick<ArtworkSubmission, 'title' | 'description' | 'proposed_price_pence'>

export async function listArtwork(): Promise<ArtworkSubmission[]> {
  const {data,error}=await supabase.schema('hq').from('artwork_submissions').select('*').order('created_at',{ascending:false})
  if(error) throw error
  return data as ArtworkSubmission[]
}
export async function submitArtwork(draft: ArtworkDraft): Promise<ArtworkSubmission> {
  const title=draft.title.trim()
  if(!title || title.length>200 || draft.description.length>4000 || !Number.isInteger(draft.proposed_price_pence) || draft.proposed_price_pence<=0 || draft.proposed_price_pence>2147483647) throw new Error('Enter valid artwork details.')
  const {data,error}=await supabase.schema('hq').from('artwork_submissions').insert({title,description:draft.description,proposed_price_pence:draft.proposed_price_pence}).select().single()
  if(error) throw error
  return data as ArtworkSubmission
}
export async function reviewArtwork(id:string,status:'approved'|'changes_requested',review_note:string): Promise<ArtworkSubmission> {
  const {data,error}=await supabase.schema('hq').rpc('review_artwork',{p_id:id,p_status:status,p_note:review_note})
  if(error) throw error
  if(!Array.isArray(data)||data.length!==1) throw new Error('Artwork has already been reviewed or is unavailable.')
  return data[0] as ArtworkSubmission
}

export async function resubmitArtwork(id:string,draft:ArtworkDraft): Promise<ArtworkSubmission> {
  const {data,error}=await supabase.schema('hq').rpc('resubmit_artwork',{p_id:id,p_title:draft.title.trim(),p_description:draft.description,p_price:draft.proposed_price_pence})
  if(error) throw error
  if(!Array.isArray(data)||data.length!==1) throw new Error('Artwork is no longer awaiting changes.')
  return data[0] as ArtworkSubmission
}
