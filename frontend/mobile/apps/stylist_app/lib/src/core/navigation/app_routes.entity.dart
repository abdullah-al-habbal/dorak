abstract final class AppRoutes {
  static const login = '/login';
  static const signUp = '/signup';
  static const forgotPassword = '/forgot-password';
  static const home = '/home';
  static const schedule = '/home/schedule';
  static const portfolio = '/home/portfolio';
  static const profile = '/home/profile';
  static const affiliations = '/home/affiliations';
  static const jobs = '/home/jobs';
  static const reviews = '/home/reviews';
  static const services = '/home/services';
  static const newService = '/home/services/new';
  static const history = '/history';
  static const earnings = '/earnings';
  static const inbox = '/inbox';
  static const more = '/more';
  static const serviceIdParameter = 'serviceId';
  static const applications = '/home/jobs/applications';
  static const jobIdParameter = 'jobId';
  static const clientIdParameter = 'clientId';

  static String job(String id) => '$jobs/$id';

  static String editService(String id) => '$services/$id/edit';

  static String clientHistory(String clientId) =>
      '$home/clients/$clientId/history';
}
