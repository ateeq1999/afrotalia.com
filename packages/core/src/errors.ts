export type DomainErrorCode =
  | "AUCTION_NOT_LIVE"
  | "BID_TOO_LOW"
  | "INSUFFICIENT_FUNDS"
  | "ACCOUNT_NOT_ACTIVE"
  | "SELF_OUTBID";

const MESSAGES: Record<DomainErrorCode, string> = {
  AUCTION_NOT_LIVE: "This auction is not open for bidding.",
  BID_TOO_LOW: "Your bid must be at least the minimum next bid.",
  INSUFFICIENT_FUNDS: "Your wallet balance is not enough to cover this bid.",
  ACCOUNT_NOT_ACTIVE: "Your account must be active to bid.",
  SELF_OUTBID: "You already hold the leading bid on this lot.",
};

/** Typed, user-facing failure for a domain rule. Never a bug — expected control flow. */
export class DomainError extends Error {
  readonly code: DomainErrorCode;

  constructor(code: DomainErrorCode, message = MESSAGES[code]) {
    super(message);
    this.name = "DomainError";
    this.code = code;
  }
}
