import { initTRPC } from '@trpc/server';

// Test different context type scenarios
const t1 = initTRPC.context<{ user?: Record<string, any> }>().create();
const t2 = initTRPC.context<{ user?: { [key: string]: any } }>().create();
const t3 = initTRPC.context<{ user?: any }>().create();
const t4 = initTRPC.context<{ user?: object }>().create();

const router1 = t1.router({
  userContext: t1.procedure.query(({ ctx }) => {
    return ctx.user;
  }),
});

const router2 = t2.router({
  userContext: t2.procedure.query(({ ctx }) => {
    return ctx.user;
  }),
});

const router3 = t3.router({
  userContext: t3.procedure.query(({ ctx }) => {
    return ctx.user;
  }),
});

const router4 = t4.router({
  userContext: t4.procedure.query(({ ctx }) => {
    return ctx.user;
  }),
});

type Router1Type = typeof router1;
type Router2Type = typeof router2;
type Router3Type = typeof router3;
type Router4Type = typeof router4;

export { Router1Type, Router2Type, Router3Type, Router4Type };