import { supabase } from '@/integrations/supabase/client';

const PAGE_SIZE = 1000;

/**
 * Fetch all rows from a Supabase query that may exceed the 1000-row default limit.
 * Accepts a query builder function and paginates automatically.
 */
export async function fetchAllRows<T = any>(
  buildQuery: () => ReturnType<ReturnType<typeof supabase.from>['select']>
): Promise<T[]> {
  const allRows: T[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await buildQuery().range(from, from + PAGE_SIZE - 1);
    if (error || !data) break;
    allRows.push(...(data as T[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return allRows;
}
