abstract final class AppRoutes {
  static const login = '/login';
  static const forgotPassword = '/forgot-password';
  static const operations = '/operations';
  static const newBarber = '/barbers/new';
  static const jobs = '/jobs';
  static const newJob = '/jobs/new';
  static const floorPlan = '/floor-plan';
  static const affiliations = '/affiliations';
  static const profile = '/profile';
  static const reviews = '/reviews';
  static const staff = '/staff';
  static const services = '/services';
  static const hours = '/hours';
  static const earnings = '/earnings';
  static const inbox = '/inbox';
  static const more = '/more';
  static const jobIdParameter = 'jobId';

  static String editJob(String id) => '$jobs/$id/edit';
  static String applicants(String id) => '$jobs/$id/applicants';
}
