import axios from 'axios'

/**
 * Backend URL resolution:
 *   Local dev:    VITE_API_URL not set → Vite proxy → localhost:8000
 *   Codespaces:   set VITE_API_URL in .env.local
 *   Production:   VITE_API_URL=https://terra-vi-backend.fly.dev
 */
const BASE_URL = import.meta.env.VITE_API_URL || ''

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 90_000,
  withCredentials: false,
})

export async function diagnose(imageFile, crop, onProgress, opts = {}) {
  const form = new FormData()
  form.append('image', imageFile)
  form.append('crop', crop)
  if (opts.language) form.append('language', opts.language)
  if (opts.stateNg)  form.append('state_ng', opts.stateNg)

  const r = await client.post('/api/v1/diagnose', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    },
  })
  return r.data
}

export async function getHistory(limit = 30, offset = 0) {
  const r = await client.get('/api/v1/history', { params: { limit, offset } })
  return r.data
}

export async function getHealth() {
  const r = await client.get('/health', { timeout: 6000 })
  return r.data
}

export async function getAnalytics() {
  const r = await client.get('/api/v1/analytics', { timeout: 15000 })
  return r.data
}
