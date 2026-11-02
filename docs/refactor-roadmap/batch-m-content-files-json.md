# Batch M: Content, files and JSON settings

Status: Done. Schema edited in place in the create-migrations; every consumer changed in the same commit.

| Table | Old | New | Wire key |
| --- | --- | --- | --- |
| `reviews` | `comment` | `body` | `body` (request and resource) |
| `testimonials` | `quote` | `body` | `body` (marketing page API) |
| `sections` | `content` | `body` | `body` (marketing page API) |
| `brands` | `logo` | `logo_url` | `logo_url` |
| `clients` | `avatar` | `avatar_path` | profile resource now emits `avatar_url` (upload field stays `avatar`) |
| `service_catalog_media` | `path`, `alt` | `image_path`, `alt_text` | same |
| `barber_portfolio_photos` | `path` | `image_path` | `image_path` (upload response) |
| `client_service_history_media` | `photo_path`, `photo_url` | `image_path` (`photo_url` column dropped) | `photo_url` is still computed in the resource |
| `payment_gateways` | `config` | `gateway_settings` | `gateway_settings`, `gateway_setting_keys` |
| `chairs` | `ui_metadata` | `layout_settings` | `layout_settings` |
| `service_catalog_items` | `metadata` | `styling_details` | `styling_details` |
| `client_service_histories` | `metadata` | `service_details` | `service_details` |
| `social_accounts` | `metadata` | `provider_profile` | n/a |
| `entity_embeddings`, `client_preference_vectors` | `metadata` | `embedding_metadata` | n/a |
| `client_interaction_logs` | `context` | `interaction_context` | n/a |
| `recommendation_edges` | `context` | `edge_context` | n/a |
| `client_saved_filters` | `filter_config` | `filter_criteria` | `filter_criteria` |
| `bookings` | `at_home_location` | `home_address` | `home_address` |
| `notification_deliveries` | `error` | `error_message` | n/a |
| `platform_settings` | `key`, `value` | `setting_key`, `value_integer` | admin settings list emits `setting_key`, `value_integer` |

## Decisions
- `client_preference_vectors.metadata` becomes `embedding_metadata`, same as `entity_embeddings`.
- `photo_url` on history media was never fillable or written; it is dropped and the URL stays computed from `image_path`.

## Deliberately not changed
- Class names (`FilterConfigurationValueObject`, `AtHomeLocationDto`, `ServiceCatalogItemMetadataCast`).
- Avatar upload multipart field `avatar`, and Socialite's own `avatar` property.
- Component props named `content` in the Website blade components.
- `agent_conversations.content` (vendor AI table), cache `key`/`value`, Pennant `features.value`.
