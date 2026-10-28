abstract final class AppRoutes {
  static const login = '/login';
  static const operations = '/operations';
  static const newBarber = '/barbers/new';
  static const jobs = '/jobs';
  static const newJob = '/jobs/new';
  static const floorPlan = '/floor-plan';
  static const affiliations = '/affiliations';
  static const profile = '/profile';
  static const reviews = '/reviews';
  static const jobIdParameter = 'jobId';

  static String editJob(String id) => '$jobs/$id/edit';
  static String applicants(String id) => '$jobs/$id/applicants';
}
