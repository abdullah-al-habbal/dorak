import { TEST_SECRET } from "@tests/helpers/claim.helper";

process.env.DASHBOARD_SESSION_SECRET = TEST_SECRET;
process.env.BACKEND_API_URL = "http://backend.test";
