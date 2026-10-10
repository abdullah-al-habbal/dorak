# Architectural Standards & Best Practices

## State management

All contributions must follow these rules.

1. BLoCs accept events and emit states. A BLoC must not expose public
   imperative methods for UI actions.
2. Cubit methods return only `void` or `Future<void>` and communicate results
   through emitted state. They must not return view data.
3. BLoC, Cubit, state, and event files are pure logic. They must not import
   `package:flutter/material.dart` or `package:flutter/widgets.dart`, accept a
   `BuildContext`, or perform navigation, dialogs, or snackbars. Use
   `dart:ui show Locale` when a locale type is required.
4. State classes extend `Equatable` (or implement complete value equality).
   Collection values are frozen at the state boundary with
   `List.unmodifiable`, `Map.unmodifiable`, or `Set.unmodifiable`.
5. A state manager must not inject another state manager. Coordinate feature
   interactions in presentation listeners or through repository streams.
6. Feature state is route-scoped by default with a local `BlocProvider` and
   must be disposed when its route exits. Only documented application-wide
   state belongs in the root composition: authentication, session, and locale.
7. Builders render. Navigation, dialogs, snackbars, and other one-shot effects
   belong in `BlocListener` or the listener side of `BlocConsumer`.

## Review checklist

Every state-management change must demonstrate the appropriate state equality,
collection immutability, disposal scope, and regression tests. Run the
workspace verification gate before merge.

## Booking payment policy

MVP bookings use pay-at-salon only. Payment method is not mutable client state,
and the booking UI must not present online checkout controls. The backend owns
the persisted `pay_at_salon` / `unpaid_in_person` contract.
