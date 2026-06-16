import { useState, useCallback } from 'react';
import { lookupPinCode } from '../lib/utils';

interface PinLookupState {
  loading: boolean;
  city: string;
  state: string;
  error: string | null;
}

export function usePinLookup() {
  const [state, setState] = useState<PinLookupState>({
    loading: false,
    city: '',
    state: '',
    error: null,
  });

  const lookup = useCallback(async (pin: string) => {
    if (pin.length !== 6) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    const result = await lookupPinCode(pin);
    if (result) {
      setState({ loading: false, city: result.city, state: result.state, error: null });
    } else {
      setState({ loading: false, city: '', state: '', error: 'PIN code not found' });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, city: '', state: '', error: null });
  }, []);

  return { ...state, lookup, reset };
}
