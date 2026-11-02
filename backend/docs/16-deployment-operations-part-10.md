---
nodeid: backend.16-deployment-operations.part-10
parentnode: backend.16-deployment-operations
childnodes: []
codeanchors:
  - backend/modules/
---

Part 10 of 11 · [16 — Deployment Operations & Known Limitations](16-deployment-operations.md) · [Previous](16-deployment-operations-part-9.md) · [Next](16-deployment-operations-part-11.md)

## Compiled-view retention — investigated, no cleanup needed

**Conclusion: `shared/storage/framework/views` cannot grow indefinitely. No
pruning mechanism exists, and none should be added.**

An earlier draft of this document claimed the opposite — that `view:cache` only
writes, that each release adds its own set keyed by absolute source path, and
that stale files accumulate. That was wrong on every count. Corrected below with
the evidence.

### How Laravel actually manages compiled views

**Filenames are deterministic.** `Compiler::getCompiledPath()`:

```php
return $this->cachePath.'/'.hash('xxh128', 'v2'.Str::after($path, $this->basePath)).'.'.$this->compiledExtension;
```

`$basePath` comes from `ViewServiceProvider`:

```php
$app['config']->get('view.relative_hash', false) ? $app->basePath() : ''
```

`view.relative_hash` is unset in this project (verified at runtime: `NULL`), so
`basePath` is `''` and the hash covers the **absolute** source path. That would
matter if releases were served from their own directories — but the atomic swap
moves every release into the same fixed path, `public_html/dev`, so the absolute
paths are identical on every deploy and the hashes are stable.

**`view:cache` deletes before it writes.** `ViewCacheCommand::handle()` opens
with:

```php
$this->callSilent('view:clear');
```

and `ViewClearCommand` globs `config('view.compiled').'/*'` and deletes it all.
So the directory is wiped and rebuilt on every deploy.
