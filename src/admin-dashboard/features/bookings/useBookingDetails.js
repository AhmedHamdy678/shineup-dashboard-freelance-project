import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBookingById } from '../../api/endpoints/bookings.api';

/**
 * Fetches a single booking's full detail payload.
 *
 * Strategy: the list endpoint (/admin/bookings) already returns complete
 * booking objects (including scheduledAt, pricing, etc.). The detail endpoint
 * (/admin/bookings/:id) may return a subset of those fields. To guarantee
 * no field is silently missing, we merge:
 *   finalData = { ...cachedListItem, ...detailResponse }
 * The detail response always wins when both sources have a field, but the
 * list-cache fills any gap the detail endpoint leaves.
 *
 * @param {string} bookingId
 */
export function useBookingDetails(bookingId) {
  const queryClient = useQueryClient();

  /** Walk all cached 'bookings' list queries and return the matching item. */
  function getListCacheItem() {
    const allListQueries = queryClient.getQueriesData({ queryKey: ['bookings'] });
    for (const [, data] of allListQueries) {
      const items = Array.isArray(data) ? data : data?.items;
      if (Array.isArray(items)) {
        const found = items.find((b) => b.id === bookingId);
        if (found) return found;
      }
    }
    return undefined;
  }

  return useQuery({
    queryKey: ['booking', bookingId],

    queryFn: async () => {
      // 1. Fetch the detail endpoint
      const detailData = await getBookingById(bookingId);

      // 2. Grab list-cache item (may already be in memory from BookingsPage)
      const cachedItem = getListCacheItem();

      // 3. Null-safe merge:
      //    - Start with cachedItem as the base (has scheduledAt, pricing, etc.)
      //    - Layer in detailData fields, BUT skip any key where the detail
      //      response returns null/undefined/'' while the cache has a real value.
      //    This prevents the detail endpoint from silently wiping valid dates.
      if (detailData && cachedItem) {
        const merged = { ...cachedItem };
        for (const [key, val] of Object.entries(detailData)) {
          if (val !== null && val !== undefined && val !== '') {
            merged[key] = val;
          } else if (cachedItem[key] == null || cachedItem[key] === '') {
            // Both empty/null — keep the one from detail (fresher)
            merged[key] = val;
          }
          // else: detail is empty but cache has a value → keep cache value
        }
        return merged;
      }
      return detailData ?? cachedItem ?? null;
    },

    // Show cached list data immediately while the detail request is in flight
    placeholderData: getListCacheItem,

    enabled: !!bookingId,
    staleTime: 1000 * 60 * 5,
  });
}
