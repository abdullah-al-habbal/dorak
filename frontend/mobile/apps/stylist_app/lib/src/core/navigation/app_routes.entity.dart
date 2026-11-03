abstract final class AppRoutes {
  static const login = '/login';
  static const signUp = '/signup';
  static const home = '/home';
  static const schedule = '/home/schedule';
  static const portfolio = '/home/portfolio';
  static const profile = '/home/profile';
  static const affiliations = '/home/affiliations';
  static const jobs = '/home/jobs';
  static const reviews = '/home/reviews';
  static const applications = '/home/jobs/applications';
  static const jobIdParameter = 'jobId';
  static const clientIdParameter = 'clientId';

  static String job(String id) => '$jobs/$id';

  static String clientHistory(String clientId) =>
      '$home/clients/$clientId/history';
}
