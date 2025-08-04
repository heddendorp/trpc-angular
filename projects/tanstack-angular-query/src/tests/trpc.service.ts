import { Injectable } from '@angular/core';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { AppRouter } from './example-server';

@Injectable({
  providedIn: 'root',
})
export class TrpcService {
  client = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost:3000/trpc',
      }),
    ],
  });
}
