import { useState, useEffect, useRef } from 'react';
import { Accelerometer, Gyroscope, Magnetometer } from 'expo-sensors';
import type { Subscription } from 'expo-sensors';

// ---------- Types ----------
export type SensorVec3 = { x: number; y: number; z: number };
export type SensorStatus = 'available' | 'unavailable' | 'loading';

type TriAxisReading = SensorVec3 & { timestamp: number };

// ---------- Accelerometer Hook ----------
export function useAccelerometer(intervalMs = 200) {
  const [data, setData] = useState<TriAxisReading | null>(null);
  const [status, setStatus] = useState<SensorStatus>('loading');
  const subRef = useRef<Subscription | null>(null);

  useEffect(() => {
    let mounted = true;

    Accelerometer.isAvailableAsync().then((avail) => {
      if (!mounted) return;
      if (!avail) { setStatus('unavailable'); return; }
      setStatus('available');
      Accelerometer.setUpdateInterval(intervalMs);
      subRef.current = Accelerometer.addListener((d) => {
        if (mounted) setData({ ...d, timestamp: Date.now() });
      });
    });

    return () => {
      mounted = false;
      subRef.current?.remove();
    };
  }, [intervalMs]);

  return { data, status };
}

// ---------- Gyroscope Hook ----------
export function useGyroscope(intervalMs = 200) {
  const [data, setData] = useState<TriAxisReading | null>(null);
  const [status, setStatus] = useState<SensorStatus>('loading');
  const subRef = useRef<Subscription | null>(null);

  useEffect(() => {
    let mounted = true;

    Gyroscope.isAvailableAsync().then((avail) => {
      if (!mounted) return;
      if (!avail) { setStatus('unavailable'); return; }
      setStatus('available');
      Gyroscope.setUpdateInterval(intervalMs);
      subRef.current = Gyroscope.addListener((d) => {
        if (mounted) setData({ ...d, timestamp: Date.now() });
      });
    });

    return () => {
      mounted = false;
      subRef.current?.remove();
    };
  }, [intervalMs]);

  return { data, status };
}

// ---------- Magnetometer Hook ----------
export function useMagnetometer(intervalMs = 200) {
  const [data, setData] = useState<TriAxisReading | null>(null);
  const [status, setStatus] = useState<SensorStatus>('loading');
  const subRef = useRef<Subscription | null>(null);

  useEffect(() => {
    let mounted = true;

    Magnetometer.isAvailableAsync().then((avail) => {
      if (!mounted) return;
      if (!avail) { setStatus('unavailable'); return; }
      setStatus('available');
      Magnetometer.setUpdateInterval(intervalMs);
      subRef.current = Magnetometer.addListener((d) => {
        if (mounted) setData({ ...d, timestamp: Date.now() });
      });
    });

    return () => {
      mounted = false;
      subRef.current?.remove();
    };
  }, [intervalMs]);

  // Hitung arah kompas (heading) dari magnetometer X dan Y
  const heading = data
    ? Math.round(((Math.atan2(data.y, data.x) * 180) / Math.PI + 360) % 360)
    : null;

  return { data, heading, status };
}
