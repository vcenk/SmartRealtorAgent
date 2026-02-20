'use client';

import { useState, useEffect } from 'react';

type TenantInfo = {
  tenantId: string;
  userId: string | null;
  email: string | null;
};

const FALLBACK: TenantInfo = {
  tenantId: '11111111-1111-1111-1111-111111111111',
  userId: null,
  email: null,
};

export function useTenant(): TenantInfo & { loading: boolean } {
  const [info, setInfo] = useState<TenantInfo>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d: TenantInfo) => setInfo(d))
      .catch(() => {/* stay on fallback */})
      .finally(() => setLoading(false));
  }, []);

  return { ...info, loading };
}
