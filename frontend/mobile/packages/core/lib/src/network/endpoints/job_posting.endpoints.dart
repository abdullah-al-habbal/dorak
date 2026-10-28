class JobPostingEndpoints {
  JobPostingEndpoints._();
  static const jobs = '/jobs';
  static const applications = '/applications';
  static const branchJobPostings = '/branch/job-postings';
  static String job(String id) => '$jobs/$id';
  static String apply(String id) => '${job(id)}/apply';
  static String branchJobPosting(String id) => '$branchJobPostings/$id';
  static String branchApplications(String id) =>
      '${branchJobPosting(id)}/applications';
  static String branchApplicationStatus(String jobId, String applicationId) =>
      '${branchApplications(jobId)}/$applicationId/status';
}
