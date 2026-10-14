class FaceProfileEndpoints {
  FaceProfileEndpoints._();

  static const String upload = '/client/face-profile';
  static String profile(String id) => '/client/face-profile/$id';
  static const String recommendations = '/client/face-profile/recommendations';
}
