---
codeanchors:
  - backend/modules/
---

Part 5 of 6 · [Worked Refactors From This Codebase](dorak-refactors.md) · [Previous](dorak-refactors-part-4.md) · [Next](dorak-refactors-part-6.md)

## 4. Repeated query in one execution → relationship + load once

`modules/ClientRecommendation/Console/Commands/RecomputeClientVectorsCommand.php:212` and `:236`

```php
// Before — the identical query runs twice per client, in two private methods
$favorites = ClientFavoriteModel::where('client_id', $client->id)->get();
```

`ClientModel` declares `bans()`, `socialAccounts()`, and `bookings()` but **no** `favorites()`
relation. Declare it, then load once:

```php
// ClientModel
public function favorites(): HasMany
{
    return $this->hasMany(ClientFavoriteModel::class, 'client_id');
}
```

```php
// Command — load once, pass the collection to both steps
$client->loadMissing('favorites');

$signals = $this->gatherSignals($client);   // uses $client->favorites
$this->rebuildEdges($client);               // uses $client->favorites
```

The same command already does the right thing for bookings —
`$client->bookings()->with('barber', 'services.catalogItem')->get()` — which is the pattern to
copy.

If the command iterates all clients, it should stream rather than `get()` them:

```php
ClientModel::query()->lazyById()->each(fn (ClientModel $client) => $this->recompute($client));
```

---
