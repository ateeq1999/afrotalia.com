import "varlock/auto-load";

import { hashPassword } from "better-auth/crypto";

import { createDb } from "./index";
import { account, user } from "./schema/auth";
import { auction, mnadaProfile, wallet, walletTransaction } from "./schema/mnada";

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
  {
    id: "seed-macbook-pro-14",
    lotNumber: 63,
    title: 'MacBook Pro 14" M3',
    description: "Sealed retail unit, regional warranty included.",
    condition: "NEW",
    openingBid: 2_500_000,
    minimumIncrement: 100_000,
    status: "CLOSED",
    startsInMs: -minutes(24 * 60),
    endsInMs: -minutes(60),
  },
];

async function upsertUser(params: {
  id: string;
  name: string;
  email: string;
  password: string;
}) {
  await db
    .insert(user)
    .values({ id: params.id, name: params.name, email: params.email, emailVerified: true })
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

async function seed() {
  console.log("Seeding admin and test user...");
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
  });

  console.log("Activating Mnada profile and funding wallet for the test bidder...");
  await db
    .insert(mnadaProfile)
    .values({
      id: "seed-mnada-profile-bidder",
      userId: "seed-test-user",
      status: "ACTIVE",
      phone: "+255700000001",
    })
    .onConflictDoNothing({ target: mnadaProfile.userId });

  const startingBalance = 10_000_000;
  await db
    .insert(wallet)
    .values({ id: "seed-wallet-bidder", userId: "seed-test-user", balance: startingBalance })
    .onConflictDoNothing({ target: wallet.userId });
  await db
    .insert(walletTransaction)
    .values({
      id: "seed-wallet-txn-deposit",
      walletId: "seed-wallet-bidder",
      kind: "DEPOSIT",
      amount: startingBalance,
      balanceAfter: startingBalance,
      reference: "seed",
    })
    .onConflictDoNothing({ target: walletTransaction.id });

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
        startsAt: new Date(now + a.startsInMs),
        endsAt: new Date(now + a.endsInMs),
      })
      .onConflictDoNothing({ target: auction.id });
  }

  console.log("Seed complete.");
  console.log("  Admin:  admin@afrotalia.com / AdminPass123!");
  console.log("  Bidder: bidder@afrotalia.com / BidderPass123! (wallet funded, Mnada ACTIVE)");
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$client.end();
  });
