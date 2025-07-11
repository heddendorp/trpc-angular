import { Component } from '@angular/core';
import {
  injectQuery,
  injectMutation,
} from '@tanstack/angular-query-experimental';
import { injectTRPC } from './trpc'; // Use the typed injection function

@Component({
  selector: 'app-user-list',
  template: `
    <div>
      <h2>User List</h2>

      @if (userQuery.isPending()) {
        <p>Loading users...</p>
      } @else if (userQuery.isError()) {
        <p>Error: {{ userQuery.error()?.message }}</p>
      } @else {
        <ul>
          @for (user of userQuery.data(); track user.id) {
            <li>{{ user.name }}</li>
          }
        </ul>
      }

      <h3>Add User</h3>
      <form (submit)="createUser()">
        <input
          type="text"
          [(ngModel)]="newUserName"
          placeholder="Enter user name"
          required
        />
        <button type="submit" [disabled]="createUserMutation.isPending()">
          @if (createUserMutation.isPending()) {
            Adding...
          } @else {
            Add User
          }
        </button>
      </form>

      @if (createUserMutation.isError()) {
        <p class="error">Error: {{ createUserMutation.error()?.message }}</p>
      }
    </div>
  `,
  styles: [
    `
      .error {
        color: red;
      }
      form {
        margin-top: 1rem;
      }
      input {
        margin-right: 0.5rem;
        padding: 0.5rem;
      }
      button {
        padding: 0.5rem 1rem;
      }
      button:disabled {
        opacity: 0.5;
      }
    `,
  ],
})
export class UserListComponent {
  // No need to specify router type - it's automatically inferred!
  private trpc = injectTRPC();

  newUserName = '';

  // Type-safe query with Angular signals
  userQuery = injectQuery(() => this.trpc.user.list.queryOptions());

  // Type-safe mutation with optimistic updates
  createUserMutation = injectMutation(() =>
    this.trpc.user.create.mutationOptions({
      onSuccess: () => {
        // Invalidate and refetch user list
        this.userQuery.refetch();
        // Clear form
        this.newUserName = '';
      },
    }),
  );

  createUser() {
    if (this.newUserName.trim()) {
      this.createUserMutation.mutate({
        name: this.newUserName.trim(),
      });
    }
  }
}
