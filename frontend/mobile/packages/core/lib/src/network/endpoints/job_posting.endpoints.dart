class JobPostingEndpoints {
  JobPostingEndpoints._();
  static const jobs = '/jobs';
  static const applications = '/applications';
  static const branchJobPostings = '/branch/job-postings';
  static const branchFloorPlan = '/branch/floor-plan';
  static String job(String id) => '$jobs/$id';
  static String apply(String id) => '${job(id)}/apply';
  static String applicationStatus(String id) => '$applications/$id/status';
  static String branchJobPosting(String id) => '$branchJobPostings/$id';
  static String branchApplications(String id) =>
      '${branchJobPosting(id)}/applications';
}
