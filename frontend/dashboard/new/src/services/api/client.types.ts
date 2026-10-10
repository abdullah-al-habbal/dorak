export interface ApiRequestOptions extends RequestInit {
  auth?: "public" | "session";
}
