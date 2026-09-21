import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

type LocationState =
  | { status: 'loading' }
  | { status: 'granted'; coords: { latitude: number; longitude: number } }
  | { status: 'denied' };

// F3: foreground-only location, requested once per mount. Denied permission
// falls back to a time-of-day-only recommendation (see src/lib/mood.ts) —
// no background location, matching the PRD's low-privacy-risk design.
export function useLocation(): LocationState {
  const [state, setState] = useState<LocationState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        if (!cancelled) setState({ status: 'denied' });
        return;
      }
      const position = await Location.getCurrentPositionAsync();
      if (!cancelled) {
        setState({
          status: 'granted',
          coords: { latitude: position.coords.latitude, longitude: position.coords.longitude },
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
