# @heddendorp/trpc-link-angular

## 0.0.5

### Patch Changes

- 81712be: Fix critical error handling issues in angularHttpLink to match tRPC standards

  This patch addresses several critical issues in error handling that prevented the Angular HTTP Link from working correctly with tRPC servers:

  ### 🐛 **Fixed Issues:**
  - **HTTP errors were being resolved instead of rejected** - HTTP error responses now properly resolve with server error payloads, allowing tRPC to handle them correctly
  - **Inconsistent abort signal handling** - Added proper `throwIfAborted()` polyfill with DOMException support following tRPC patterns
  - **Improper error structure creation** - HTTP errors now return actual server response bodies instead of manually created error structures
  - **Missing network error handling** - Network errors are now properly wrapped in TRPCClientError while preserving the original cause

  ### ✨ **Improvements:**
  - **Standard abort signal handling** - Added `AbortError` class and `throwIfAborted()` function matching official tRPC implementation
  - **Better meta information** - Response metadata now follows the same structure as tRPC's HTTP utils
  - **Improved error flow** - Network errors properly reject while HTTP error responses resolve with server payloads
  - **Enhanced request cancellation** - Proper cleanup and error handling for aborted requests

  ### 🧪 **Testing:**
  - Added comprehensive error handling test suite with 37 tests covering:
    - Standard tRPC server errors (400, 401, 404, 500, 408, etc.)
    - Network and transport layer errors
    - AbortSignal request cancellation
    - Response meta information preservation
    - Malformed response handling
    - Real-world error scenarios with exact tRPC server response simulation

  ### 🎯 **Compatibility:**

  The Angular HTTP Link now handles errors identically to the official tRPC HTTP links, ensuring consistent error handling across different transport layers. All errors are properly wrapped in `TRPCClientError` with preserved error data, HTTP metadata, and original causes.

  **Breaking Change:** None - this is a bug fix that improves compatibility with tRPC standards without changing the public API.

## 0.0.4

### Patch Changes

- caafc89: Fix compatibility with transformers

## 0.0.3

### Patch Changes

- 5184e97: Update publish directory config

## 0.0.2

### Patch Changes

- cf7c48d: First changeset
