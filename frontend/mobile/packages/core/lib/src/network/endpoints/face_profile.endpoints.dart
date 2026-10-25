class FaceProfileEndpoints {
  FaceProfileEndpoints._();

  static const String upload = '/client/face-profile';
  static const String list = '/client/face-profile';
  static String profile(String id) => '/client/face-profile/$id';
  static const String recommendations = '/client/face-profile/recommendations';
  static String delete(String id) => '/client/face-profile/$id';
  static String setPrimary(String id) => '/client/face-profile/$id/primary';
}
