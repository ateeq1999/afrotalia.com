import "varlock/auto-load";

import { hashPassword } from "better-auth/crypto";

import { createDb } from "./index";
import { account, user } from "./schema/auth";
import {
  auction,
  bid,
  mnadaProfile,
  mnadaSetting,
  order,
  wallet,
  walletTransaction,
} from "./schema/mnada";

const db = createDb({ DATABASE_URL: process.env.DATABASE_URL ?? "" });

const now = Date.now();
const minutes = (n: number) => n * 60 * 1000;

interface SeedAuction {
  id: string;
  lotNumber: number;
  title: string;
  description: string;
  condition: "NEW" | "USED" | "WORKING" | "NOT_WORKING";
  openingBid: number;
  minimumIncrement: number;
  reservePrice?: number;
  status: "SCHEDULED" | "LIVE" | "CLOSED";
  startsInMs: number;
  endsInMs: number;
}

const AUCTIONS: SeedAuction[] = [
  {
    id: "seed-rolex-submariner",
    lotNumber: 18,
    title: "Rolex Submariner",
    description: "Pre-owned luxury automatic, serviced 2025, box and papers.",
    condition: "WORKING",
    openingBid: 1_000_000,
    minimumIncrement: 50_000,
    reservePrice: 1_500_000,
    status: "LIVE",
    startsInMs: -minutes(60),
    endsInMs: minutes(90),
  },
  {
    id: "seed-canon-eos-r6",
    lotNumber: 42,
    title: "Canon EOS R6 body",
    description: "Shutter count 12k, two batteries, original strap.",
    condition: "WORKING",
    openingBid: 800_000,
    minimumIncrement: 50_000,
    status: "LIVE",
    startsInMs: -minutes(30),
    endsInMs: minutes(45),
  },
  {
    id: "seed-seiko-5-flash-lot",
    lotNumber: 9,
    title: "Seiko 5 — flash lot",
    description: "Two-minute flash close. Bid to see the win and payment flow.",
    condition: "WORKING",
    openingBid: 100_000,
    minimumIncrement: 10_000,
    status: "LIVE",
    startsInMs: -minutes(20),
    endsInMs: minutes(2),
  },
  {
    id: "seed-lamu-door-panel",
    lotNumber: 27,
    title: "Lamu carved door panel",
    description: "Nineteenth-century coastal woodwork, reclaimed and stabilised.",
    condition: "USED",
    openingBid: 3_000_000,
    minimumIncrement: 100_000,
    status: "SCHEDULED",
    startsInMs: minutes(60),
    endsInMs: minutes(180),
  },
  {
    id: "seed-yamaha-generator",
    lotNumber: 51,
    title: "Yamaha 5kVA generator",
    description: "Spares or repair — engine turns, alternator faulty.",
    condition: "NOT_WORKING",
    openingBid: 300_000,
    minimumIncrement: 20_000,
    status: "SCHEDULED",
    startsInMs: minutes(24 * 60),
    endsInMs: minutes(24 * 60 + 120),
  },
];

async function upsertUser(params: {
  id: string;
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
}) {
  await db
    .insert(user)
    .values({
      id: params.id,
      name: params.name,
      email: params.email,
      emailVerified: true,
      phoneNumber: params.phoneNumber,
      phoneNumberVerified: params.phoneNumberVerified ?? false,
    })
    .onConflictDoNothing({ target: user.id });

  const hashed = await hashPassword(params.password);
  await db
    .insert(account)
    .values({
      id: `${params.id}-credential`,
      accountId: params.id,
      providerId: "credential",
      userId: params.id,
      password: hashed,
    })
    .onConflictDoNothing({ target: account.id });
}

async function fundWallet(userId: string, walletId: string, balance: number) {
  await db.insert(wallet).values({ id: walletId, userId, balance }).onConflictDoNothing({ target: wallet.userId });
  if (balance > 0) {
    await db
      .insert(walletTransaction)
      .values({
        id: `${walletId}-deposit`,
        walletId,
        kind: "DEPOSIT",
        amount: balance,
        balanceAfter: balance,
        reference: "seed",
      })
      .onConflictDoNothing({ target: walletTransaction.id });
  }
}

async function seed() {
  console.log("Seeding Mnada settings...");
  await db
    .insert(mnadaSetting)
    .values([
      { key: "registrationFeeMinor", value: "50000" },
      { key: "paymentWindowHours", value: "24" },
    ])
    .onConflictDoNothing({ target: mnadaSetting.key });

  console.log("Seeding admin and test users...");
  await upsertUser({
    id: "seed-admin",
    name: "Afrotalia Admin",
    email: "admin@afrotalia.com",
    password: "AdminPass123!",
  });
  await upsertUser({
    id: "seed-test-user",
    name: "Test Bidder",
    email: "bidder@afrotalia.com",
    password: "BidderPass123!",
    phoneNumber: "+255700000001",
    phoneNumberVerified: true,
  });
  await upsertUser({
    id: "seed-pending-user",
    name: "Pending Bidder",
    email: "pending@afrotalia.com",
    password: "PendingPass123!",
    phoneNumber: "+255700000002",
    phoneNumberVerified: true,
  });
  await upsertUser({
    id: "seed-blocked-user",
    name: "Blocked Bidder",
    email: "blocked@afrotalia.com",
    password: "BlockedPass123!",
    phoneNumber: "+255700000003",
    phoneNumberVerified: true,
  });

  console.log("Setting Mnada profile status for each test user...");
  await db
    .insert(mnadaProfile)
    .values([
      { id: "seed-mnada-profile-bidder", userId: "seed-test-user", status: "ACTIVE" },
      { id: "seed-mnada-profile-pending", userId: "seed-pending-user", status: "PENDING_PAYMENT" },
      {
        id: "seed-mnada-profile-blocked",
        userId: "seed-blocked-user",
        status: "BLOCKED",
        nonPaymentViolations: 2,
      },
    ])
    .onConflictDoNothing({ target: mnadaProfile.userId });

  console.log("Funding wallets...");
  await fundWallet("seed-test-user", "seed-wallet-bidder", 10_000_000);
  await fundWallet("seed-pending-user", "seed-wallet-pending", 0);
  await fundWallet("seed-blocked-user", "seed-wallet-blocked", 0);

  console.log("Seeding auctions...");
  for (const a of AUCTIONS) {
    await db
      .insert(auction)
      .values({
        id: a.id,
        lotNumber: a.lotNumber,
        title: a.title,
        description: a.description,
        condition: a.condition,
        status: a.status,
        openingBid: a.openingBid,
        currentBid: 0,
        minimumIncrement: a.minimumIncrement,
        reservePrice: a.reservePrice,
        startsAt: new Date(now + a.startsInMs),
        endsAt: new Date(now + a.endsInMs),
      })
      .onConflictDoNothing({ target: auction.id });
  }

  console.log("Seeding one completed auction win (settled, delivered)...");
  const wonAuctionId = "seed-macbook-pro-14";
  const winAmount = 2_650_000;
  await db
    .insert(auction)
    .values({
      id: wonAuctionId,
      lotNumber: 63,
      title: 'MacBook Pro 14" M3',
      description: "Sealed retail unit, regional warranty included.",
      condition: "NEW",
      status: "SETTLED",
      openingBid: 2_500_000,
      currentBid: winAmount,
      minimumIncrement: 100_000,
      winnerId: "seed-test-user",
      startsAt: new Date(now - minutes(24 * 60)),
      endsAt: new Date(now - minutes(23 * 60)),
    })
    .onConflictDoNothing({ target: auction.id });
  await db
    .insert(bid)
    .values({
      id: "seed-winning-bid",
      auctionId: wonAuctionId,
      userId: "seed-test-user",
      amount: winAmount,
      createdAt: new Date(now - minutes(23 * 60 + 5)),
    })
    .onConflictDoNothing({ target: bid.id });
  await db
    .insert(order)
    .values({
      id: "seed-order-macbook",
      userId: "seed-test-user",
      type: "AUCTION_WIN",
      status: "DELIVERED",
      auctionId: wonAuctionId,
      totalAmount: winAmount,
      paymentDueAt: new Date(now - minutes(23 * 60)),
    })
    .onConflictDoNothing({ target: order.id });

  console.log("Seed complete.");
  console.log("  Admin:   admin@afrotalia.com / AdminPass123!");
  console.log("  Bidder:  bidder@afrotalia.com / BidderPass123! (ACTIVE, funded, one delivered win)");
  console.log("  Pending: pending@afrotalia.com / PendingPass123! (phone verified, needs to pay registration fee)");
  console.log("  Blocked: blocked@afrotalia.com / BlockedPass123! (2 non-payment violations)");
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$client.end();
  });
