export interface SessionTokens {
  claim: string;
  accessToken: string;
  refreshToken: string;
  claimMaxAge: number;
  refreshMaxAge: number;
}
