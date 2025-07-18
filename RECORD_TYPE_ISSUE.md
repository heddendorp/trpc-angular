# Record Type Inference Issue Fix

## Problem Description

There is a TypeScript inference issue in the integration between tRPC and TanStack Angular Query experimental where `Record<string, any>` types are incorrectly inferred as function types (specifically `() => never`) in the complex type chain.

## Root Cause

The issue occurs in the following type transformation chain:

1. tRPC procedure returns `Record<string, any> | undefined`
2. `inferTransformedProcedureOutput` processes the type
3. `FixRecordInference` attempts to fix the type
4. TanStack Angular Query's `MapToSignals` converts types to signals
5. Somewhere in this chain, the Record type is incorrectly inferred as `() => never`

## Symptoms

When accessing properties on Record types in query results, TypeScript shows errors like:
- `Property 'test' does not exist on type '() => never'`
- `Element implicitly has an 'any' type because expression of type '"test"' can't be used to index type '() => never'`

## Solution

### Current Fix

The `FixRecordInference` type has been enhanced to handle more cases of incorrect function type inference:

```typescript
export type FixRecordInference<T> = 
  // If T is a function type but we expect it to be a Record, fix it
  T extends (...args: any[]) => any
    ? T extends (...args: any[]) => Record<string, any>
      ? T // Keep legitimate function types that return Records
      : Record<string, any> // Convert incorrect function types to Record
    : T extends Record<string, any>
      ? { [K in keyof T]: T[K] } & { [key: string]: any }
      : T;
```

### Workaround for Users

If you encounter this issue in your code, you can use a type assertion as a workaround:

```typescript
const userData = this.userDataQuery.data();
if (userData) {
  // Type assertion workaround
  const data = userData as Record<string, any>;
  console.log('User test:', data['test']);
  console.log('User dynamic prop:', data['dynamicProp']);
}
```

## Investigation Notes

- The issue appears to be related to version compatibility between tRPC server types and TanStack Angular Query experimental
- The `FixRecordInference` type is applied correctly, but the type inference issue occurs at a different level
- The runtime behavior is correct; only the TypeScript type inference is affected
- Multiple attempts to fix the issue at the `FixRecordInference` level have not resolved the core problem

## Next Steps

This issue may require:
1. Investigation into TanStack Angular Query experimental package for type inference issues
2. Version compatibility testing between tRPC and TanStack Angular Query
3. Potential upstream bug report to the TanStack Angular Query experimental project

## Testing

The fix is tested in `projects/tanstack-angular-query/src/tests/record-return.spec.ts` with both the enhanced `FixRecordInference` type and the type assertion workaround.