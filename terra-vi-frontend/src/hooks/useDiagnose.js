import { useState, useCallback } from 'react'
import { diagnose } from '../services/api'

export const STATES = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  LOW_CONFIDENCE: 'low_confidence',
  ERROR: 'error',
}

export function useDiagnose() {
  const [state, setState] = useState(STATES.IDLE)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [uploadPct, setUploadPct] = useState(0)

  const submit = useCallback(async (file, crop) => {
    setState(STATES.UPLOADING)
    setResult(null)
    setError(null)
    setUploadPct(0)

    try {
      const data = await diagnose(file, crop, (pct) => {
        setUploadPct(pct)
        if (pct === 100) setState(STATES.PROCESSING)
      })

      setResult(data)

      if (data.status === 'diagnosed') {
        setState(STATES.SUCCESS)
      } else if (data.status === 'low_confidence') {
        setState(STATES.LOW_CONFIDENCE)
      } else if (data.status === 'cassava_coming_soon') {
        // Route cassava to ERROR state — ResultPanel handles the friendly card
        setState(STATES.ERROR)
        setError(data.error_message || 'Cassava diagnosis is coming soon.')
      } else {
        setState(STATES.ERROR)
        setError(data.error_message || 'An unexpected error occurred.')
      }
    } catch (err) {
      setState(STATES.ERROR)
      const detail = err.response?.data?.detail
      const msg = err.message || ''
      // Surface HF cold-start errors clearly
      if (msg.includes('timeout') || msg.includes('504')) {
        setError(
          'The HuggingFace model is taking too long to respond. ' +
          'The model may be loading (cold start). Please wait 30 seconds and try again.'
        )
      } else {
        setError(detail || msg || 'Could not reach the server.')
      }
    }
  }, [])

  const reset = useCallback(() => {
    setState(STATES.IDLE)
    setResult(null)
    setError(null)
    setUploadPct(0)
  }, [])

  return { state, result, error, uploadPct, submit, reset }
}
