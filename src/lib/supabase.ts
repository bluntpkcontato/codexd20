/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase URL ou Anon Key ausentes. Usando fallback Mock/LocalStorage.");
}

// Helper to get local user
const getLocalUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('codex_mock_user');
  return user ? JSON.parse(user) : null;
};

// Fallback Mock Client para funcionar sem Supabase configurado
const mockSupabase = {
  auth: {
    getUser: async () => ({ data: { user: getLocalUser() }, error: null }),
    getSession: async () => ({ data: { session: getLocalUser() ? { user: getLocalUser() } : null }, error: null }),
    signInWithPassword: async ({ email }: { email: string }) => {
      const user = { id: 'mock-id-123', email, user_metadata: { username: email.split('@')[0] } };
      localStorage.setItem('codex_mock_user', JSON.stringify(user));
      return { data: { user }, error: null };
    },
    signUp: async ({ email }: { email: string }) => {
      const user = { id: 'mock-id-123', email, user_metadata: { username: email.split('@')[0] } };
      localStorage.setItem('codex_mock_user', JSON.stringify(user));
      return { data: { user }, error: null };
    },
    signOut: async () => {
      localStorage.removeItem('codex_mock_user');
      return { error: null };
    },
    onAuthStateChange: (cb: any) => {
      const u = getLocalUser();
      cb(u ? "SIGNED_IN" : "SIGNED_OUT", u ? { user: u } : null);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  from: (table: string) => {
    return {
      select: () => {
        const qb: any = {
          _single: false,
          eq: (col: string, val: any) => qb,
          in: (col: string, val: any) => qb,
          order: (col: string, options?: any) => qb,
          limit: (val: number) => qb,
          range: (from: number, to: number) => qb,
          single: () => { qb._single = true; return qb; },
          then: (resolve: any) => {
            if (typeof window !== 'undefined') {
              const data = JSON.parse(localStorage.getItem(`codex_mock_${table}`) || '[]');
              resolve({ data: qb._single ? data[0] : data, error: null });
            } else {
              resolve({ data: qb._single ? null : [], error: null });
            }
          }
        };
        return qb;
      },
      insert: (rows: any[]) => ({
        select: () => ({ single: () => ({
          then: (cb: any) => {
            if (typeof window === 'undefined') return cb({ data: null, error: null });
            const list = JSON.parse(localStorage.getItem(`codex_mock_${table}`) || '[]');
            const newItem = { id: `local-${Math.random()}`, ...rows[0] };
            localStorage.setItem(`codex_mock_${table}`, JSON.stringify([...list, newItem]));
            cb({ data: newItem, error: null });
          }
        })}),
        then: (cb: any) => {
          if (typeof window === 'undefined') return cb({ data: [], error: null });
          const list = JSON.parse(localStorage.getItem(`codex_mock_${table}`) || '[]');
          const newItems = rows.map(r => ({ id: `local-${Math.random()}`, ...r }));
          localStorage.setItem(`codex_mock_${table}`, JSON.stringify([...list, ...newItems]));
          cb({ data: newItems, error: null });
        }
      }),
      update: (data: any) => ({
        eq: (col: string, val: any) => ({
          then: (cb: any) => {
            if (typeof window === 'undefined') return cb({ data: [], error: null });
            let list = JSON.parse(localStorage.getItem(`codex_mock_${table}`) || '[]');
            list = list.map((item: any) => item[col] === val ? { ...item, ...data } : item);
            localStorage.setItem(`codex_mock_${table}`, JSON.stringify(list));
            cb({ data: list.filter((i: any) => i[col] === val), error: null });
          }
        })
      }),
      delete: () => ({
        eq: (col: string, val: any) => ({
          then: (cb: any) => {
            if (typeof window === 'undefined') return cb({ error: null });
            const list = JSON.parse(localStorage.getItem(`codex_mock_${table}`) || '[]');
            localStorage.setItem(`codex_mock_${table}`, JSON.stringify(list.filter((i: any) => i[col] !== val)));
            cb({ error: null });
          }
        })
      }),
      upsert: (data: any) => ({
        then: (cb: any) => {
           // Simulação simples de upsert salvando global
           if (typeof window !== 'undefined') localStorage.setItem(`codex_mock_${table}`, JSON.stringify([data]));
           cb({ data, error: null });
        }
      })
    };
  },
  channel: () => ({
    on: () => ({ subscribe: () => {} }),
    send: async () => {},
    unsubscribe: async () => {}
  }),
  removeChannel: async () => {},
  storage: {
    from: () => ({
      upload: async () => ({ error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: `https://via.placeholder.com/500?text=Mock+Image` } })
    })
  }
};

// Em desenvolvimento local, usar mock para evitar problemas de auth
const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const supabase = (supabaseUrl && supabaseAnonKey && !isLocalDev)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockSupabase as any;
