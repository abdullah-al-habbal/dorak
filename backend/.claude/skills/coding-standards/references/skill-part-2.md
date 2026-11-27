---
codeanchors:
  - backend/modules/
---

Part 2 of 2 · [Coding standards](../SKILL.md) · [Previous](../SKILL.md)

## Naming

- No `Controller` suffix — use invokable action classes: `ListAllBookingsAction`.
- Actions in `Http/Actions/`, handlers in `Handlers/`, resolvers in `Eloquent/Resolvers/`.
- Command/Query objects in `CQRS/Command/` and `CQRS/Query/`.
- PascalCase for class names and module names.
- snake_case for table columns and config keys.

### Mandatory class-name suffixes

Every class **must** carry a suffix matching its layer/role. No bare names like `User` or `Booking`.

| Layer / Role            | Suffix           | Example                                    |
|-------------------------|------------------|--------------------------------------------|
| Eloquent Model          | `Model`          | `ClientModel`, `BookingModel`                |
| Enum                    | `Enum`           | `ErrorCodeEnum`, `SuccessCodeEnum`         |
| Invocable Action        | `Action`         | `ListAllBookingsAction`, `CreateBookingAction` |
| Business Handler        | `Handler`        | `ListAllBookingsHandler`, `CreateBookingHandler` |
| Data Resolver           | `Resolver`       | `ListAllBookingsEloquentResolver`          |
| CQRS Command payload    | `Command`        | `CreateBookingCommand`                     |
| CQRS Query payload      | `Query`          | `FindAvailableChairsQuery`                 |
| Form Request            | `Request`        | `CreateBookingRequest`                     |
| API Resource / Presenter| `Presenter`      | `BookingPresenter`                         |
| Middleware              | `Middleware`     | `AssignRequestUuidMiddleware`              |
| Event                   | `Event`          | `BookingCreatedEvent`                      |
| Listener                | `Listener`       | `SendBookingConfirmationListener`          |
| Service (infrastructure)| `Service`        | `LoggerService`, `TranslatorHandlerService` |
| Service Provider        | `ServiceProvider`| `ApplicationServiceProvider`               |
| Trait                   | `Trait`          | `ApiResponseTrait`                         |
| Seeder                  | `Seeder`         | `ClientSeeder`                               |
| Factory                 | `Factory`        | `ClientFactory`                              |
| Console Command         | `Command`        | `SyncBookingsCommand`                      |
| Exception               | `Exception`      | `ChairAlreadyBookedException`              |
| Job                     | `Job`            | `SendReminderJob`                          |
| Notification            | `Notification`   | `BookingConfirmationNotification`          |
| Value Object            | `ValueObject`    | `ApiResponseBodyValueObject`               |

## Autoloading

PSR-4: `Modules\` → `modules/`, `Database\Seeders\` → `database/seeders/`, `Tests\` → `tests/`.
