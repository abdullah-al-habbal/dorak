/// Public legal pages served by the Dorak website. The slugs match the seeded
/// marketing pages (`privacy`, `terms`, `about`, `contact`, `delete-account`).
class LegalLinks {
  const LegalLinks._(this._origin);

  /// [apiBaseUrl] is the app's API base (for example `https://host/api`): the website
  /// lives on the same host, so its origin is the API origin.
  factory LegalLinks.fromApiBaseUrl(String apiBaseUrl) {
    final uri = Uri.parse(apiBaseUrl);
    return LegalLinks._(
      Uri(
        scheme: uri.scheme,
        host: uri.host,
        port: uri.hasPort ? uri.port : null,
      ),
    );
  }

  final Uri _origin;

  /// Only `ar` and `en` pages exist; anything else falls back to English.
  Uri privacy(String languageCode) => _page(languageCode, 'privacy');
  Uri terms(String languageCode) => _page(languageCode, 'terms');
  Uri about(String languageCode) => _page(languageCode, 'about');
  Uri contact(String languageCode) => _page(languageCode, 'contact');
  Uri deleteAccount(String languageCode) =>
      _page(languageCode, 'delete-account');

  /// The web owner registration; the business app links here (owner sign-up is web only).
  Uri get ownerRegistration => _origin.replace(path: '/register/business');

  Uri _page(String languageCode, String slug) =>
      _origin.replace(path: '/${languageCode == 'ar' ? 'ar' : 'en'}/$slug');
}
