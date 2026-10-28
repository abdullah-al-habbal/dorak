import { JobPostingsPage } from "@/components/people/job-postings-page";

export function createJobPostingsPage() {
  return function JobPostingsRoute() {
    return <JobPostingsPage />;
  };
}
