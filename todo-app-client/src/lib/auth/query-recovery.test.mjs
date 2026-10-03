import test from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { recoverAccountQueries } from './query-recovery.ts';

test('failed authentication resumes a canceled detail request on a retained screen', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let requests = 0;
  const observer = new QueryObserver(client, {
    queryKey: ['list', 'list-id'],
    queryFn: ({ signal }) => {
      requests++;
      if (requests > 1) return Promise.resolve({ name: 'Recovered list' });
      return new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('canceled')), {once:true});
      });
    },
  });
  const unsubscribe = observer.subscribe(() => {});
  try {
    assert.equal(requests, 1);
    await client.cancelQueries();
    assert.equal(observer.getCurrentResult().fetchStatus, 'idle');
    await recoverAccountQueries(client);
    assert.equal(requests, 2);
    assert.equal(observer.getCurrentResult().status, 'success');
    assert.deepEqual(observer.getCurrentResult().data, {name:'Recovered list'});
  } finally {
    unsubscribe();
    client.clear();
  }
});
