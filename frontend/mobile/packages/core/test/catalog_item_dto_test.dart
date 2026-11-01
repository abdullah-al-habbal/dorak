import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

const _itemId = '0199d9a4-3c1e-7c2a-9f1b-6a2d4e8b1c3f';
const _categoryId = '0199d9a4-3b00-7d11-8a2b-1c3d5e7f9a0b';
const _tagId = '0199d9a4-3d5f-7e44-9c6d-2b4f6a8c0e1d';

// Mirrors GET /api/v1/service-catalog/items `data[]` after Task 14.
Map<String, dynamic> _catalogItemPayload() => {
  'id': _itemId,
  'category_id': _categoryId,
  'name': {'en': 'Classic Fade', 'ar': 'فيد كلاسيكي'},
  'description': {'en': 'Short sides', 'ar': 'جوانب قصيرة'},
  'slug': 'classic-fade',
  'sku': null,
  'price_range': {'min': 10, 'max': 25.5, 'currency': 'SAR'},
  'maintenance_level': 'low',
  'style_period': 'modern',
  'formality': null,
  'face_shapes': ['oval', 'square'],
  'hair_textures': null,
  'metadata': null,
  'category': {
    'id': _categoryId,
    'name': {'en': 'Hair'},
    'slug': 'hair',
  },
  'tags': [
    {
      'id': _tagId,
      'name': {'en': 'Classic'},
      'slug': 'classic',
      'group': null,
    },
  ],
  'is_active': true,
  'created_at': '2026-10-14T09:00:00+00:00',
  'updated_at': '2026-10-14T09:00:00+00:00',
};

void main() {
  group('CatalogItemDto UUID contract', () {
    test('parses the catalog API payload with a UUID id', () {
      final dto = CatalogItemDto.fromJson(_catalogItemPayload());

      expect(dto.id, _itemId);
      expect(dto.name['en'], 'Classic Fade');
      expect(dto.priceRange?.currency, 'SAR');
      expect(dto.faceShapes, [FaceShape.oval, FaceShape.square]);
      expect(dto.isActive, isTrue);
    });

    test('falls back safely for enum values this app does not know', () {
      final dto = CatalogItemDto.fromJson({
        ..._catalogItemPayload(),
        'face_shapes': ['oval', 'hexagon'],
        'style_period': 'futuristic',
        'media': [
          {'id': 'm1', 'type': 'hologram', 'path': 'a.png', 'sort_order': 0},
          {'id': 'm2', 'type': 'video', 'path': 'b.mp4', 'sort_order': 1},
        ],
      });

      expect(dto.faceShapes, [FaceShape.oval]);
      expect(dto.stylePeriod, isNull);
      expect(dto.media.first.type, CatalogMediaType.image);
      expect(dto.media.last.type, CatalogMediaType.video);
    });

    test('parses a catalog category universe and ignores unknown values', () {
      final base = {
        'id': 'c1',
        'name': {'en': 'Cuts'},
        'slug': 'cuts',
        'is_active': true,
      };
      expect(
        CatalogCategoryDto.fromJson({...base, 'universe': 'unisex'}).universe,
        VenueUniverse.unisex,
      );
      expect(
        CatalogCategoryDto.fromJson({...base, 'universe': 'kids'}).universe,
        isNull,
      );
    });

    test('rejects a legacy integer id instead of coercing it', () {
      expect(
        () => CatalogItemDto.fromJson({..._catalogItemPayload(), 'id': 42}),
        throwsA(isA<TypeError>()),
      );
    });
  });

  group('CatalogItemDto description robustness', () {
    test('treats an empty list description as an empty map', () {
      final dto = CatalogItemDto.fromJson({
        ..._catalogItemPayload(),
        'description': <dynamic>[],
      });

      expect(dto.description, isEmpty);
    });

    test('treats a null description as an empty map', () {
      final dto = CatalogItemDto.fromJson({
        ..._catalogItemPayload(),
        'description': null,
      });

      expect(dto.description, isEmpty);
    });

    test('keeps a normal translation map', () {
      final dto = CatalogItemDto.fromJson(_catalogItemPayload());

      expect(dto.description['en'], 'Short sides');
      expect(dto.description['ar'], 'جوانب قصيرة');
    });
  });

  group('ServiceHistoryDto catalog reference', () {
    test('parses UUID catalog item references', () {
      final dto = ServiceHistoryDto.fromJson({
        'id': '0199d9a4-4000-7000-8000-000000000001',
        'performed_at': '2026-10-14T09:00:00.000Z',
        'catalog_item_id': _itemId,
        'catalog_item': {
          'id': _itemId,
          'name': {'en': 'Classic Fade'},
        },
      });

      expect(dto.catalogItemId, _itemId);
      expect(dto.catalogItem?.id, _itemId);
    });
  });
}
