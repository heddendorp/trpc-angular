import { inject, Injectable } from '@angular/core';
import { createTRPCClient } from '@trpc/client';
import { angularHttpLink } from '../public-api';
import { HttpClient } from '@angular/common/http';
import { AppRouter } from './example-server';


@Injectable({
  providedIn: 'root'
})
export class Trpc {
  private trpcClient = createTRPCClient<AppRouter>({
    links: [angularHttpLink({
      url: 'http://localhost:3000/trpc',
      httpClient: inject(HttpClient),
    })]
  })

  public get client() {
    return this.trpcClient;
  }
}
