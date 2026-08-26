import { useEffect, useReducer } from 'react'

interface State<T> {
  data: T | null
  loading: boolean
  error: string | null
}

type Action<T> =
  | { type: 'start' }
  | { type: 'success'; data: T }
  | { type: 'error'; message: string }

function reducer<T>(_state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case 'start':
      return { data: null, loading: true, error: null }
    case 'success':
      return { data: action.data, loading: false, error: null }
    case 'error':
      return { data: null, loading: false, error: action.message }
  }
}

export function useAsyncData<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
): State<T> {
  const [state, dispatch] = useReducer(reducer<T>, undefined, (): State<T> => ({
    data: null,
    loading: true,
    error: null,
  }))

  useEffect(() => {
    const controller = new AbortController()

    dispatch({ type: 'start' })

    fetcher(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) dispatch({ type: 'success', data })
      })
      .catch((err) => {
        if (!controller.signal.aborted && err?.name !== 'AbortError') {
          dispatch({
            type: 'error',
            message: err instanceof Error ? err.message : 'An error occurred.',
          })
        }
      })

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
