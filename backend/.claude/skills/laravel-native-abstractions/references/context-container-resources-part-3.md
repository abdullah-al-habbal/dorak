---
codeanchors:
  - backend/modules/
---

Part 3 of 4 · [Context, Container, Storage, API Resources](context-container-resources.md) · [Previous](context-container-resources-part-2.md) · [Next](context-container-resources-part-4.md)

## Storage and uploads

Use the filesystem abstraction, never native file functions, for application-managed files.

```php
$path = Storage::disk('s3')->putFile("bookings/{$booking->getKey()}", $request->file('invoice'));

$path = Storage::disk('s3')->putFileAs("clients/{$client->getKey()}", $file, 'avatar.jpg');

// From the uploaded file itself
$path = $request->file('invoice')->store("bookings/{$booking->getKey()}", 's3');
```

Avoid:

```php
move_uploaded_file($tmp, storage_path('app/...'));
file_put_contents($path, $contents);
unlink($path);
```

- `putFile()` streams — it does not read the whole upload into memory.
- `exists()` / `missing()`, `delete()`, `copy()`, `move()`, `size()`, `mimeType()`,
  `lastModified()`, `readStream()` / `writeStream()` for large files.
- `temporaryUrl($path, now()->addMinutes(5))` for time-limited access on drivers that support
  it (S3 does; the local driver needs `Storage::buildTemporaryUrlsUsing()`). Never expose a
  permanent public URL for a file that requires authorization.
- Disk names and credentials belong in `modules/Core/Config/filesystems.php` reading `env()`
  with no default. Do not scatter bucket names or paths through Handlers.
- `Storage::fake('s3')` in tests, with `assertExists()` / `assertMissing()`.
- Image manipulation goes through `intervention/image` (already installed), not shell calls.

---
