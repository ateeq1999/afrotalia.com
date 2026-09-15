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
  shippingAddress,
  wallet,
  walletTransaction,
} from "./schema/mnada";
import {
  category,
  deliveryMethod,
  orderItem,
  payment,
  paymentEvent,
  product,
} from "./schema/shop";
import { service } from "./schema/web";

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

interface SeedCategory {
  id: string;
  name: string;
  slug: string;
}

const CATEGORIES: SeedCategory[] = [
  { id: "seed-cat-electronics", name: "Electronics", slug: "electronics" },
  { id: "seed-cat-appliances", name: "Appliances", slug: "appliances" },
  { id: "seed-cat-furniture", name: "Furniture", slug: "furniture" },
  { id: "seed-cat-tools", name: "Tools & Equipment", slug: "tools-equipment" },
];

interface SeedProduct {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  condition: "NEW" | "USED" | "NOT_WORKING";
  isWorking: boolean;
  stock: number;
  price: number;
}

const PRODUCTS: SeedProduct[] = [
  {
    id: "seed-prod-macbook-air",
    categoryId: "seed-cat-electronics",
    name: 'MacBook Air 13" M2',
    slug: "macbook-air-13-m2",
    sku: "ELEC-MBA13-M2",
    description: "Sealed retail unit, 256GB, Midnight. Regional warranty included.",
    condition: "NEW",
    isWorking: true,
    stock: 6,
    price: 2_450_000,
  },
  {
    id: "seed-prod-iphone-13",
    categoryId: "seed-cat-electronics",
    name: "iPhone 13, 128GB",
    slug: "iphone-13-128gb",
    sku: "ELEC-IP13-128",
    description: "Used, battery health 89%. Minor scuff on the frame, screen flawless.",
    condition: "USED",
    isWorking: true,
    stock: 3,
    price: 780_000,
  },
  {
    id: "seed-prod-samsung-tv",
    categoryId: "seed-cat-electronics",
    name: 'Samsung 55" 4K TV',
    slug: "samsung-55-4k-tv",
    sku: "ELEC-SAM55-4K",
    description: "Display panel cracked, powers on. Sold for parts or repair.",
    condition: "NOT_WORKING",
    isWorking: false,
    stock: 2,
    price: 150_000,
  },
  {
    id: "seed-prod-office-chair",
    categoryId: "seed-cat-furniture",
    name: "Ergonomic office chair",
    slug: "ergonomic-office-chair",
    sku: "FURN-CHAIR-ERG",
    description: "Brand new, mesh back, adjustable lumbar support and armrests.",
    condition: "NEW",
    isWorking: true,
    stock: 12,
    price: 320_000,
  },
  {
    id: "seed-prod-dining-table",
    categoryId: "seed-cat-furniture",
    name: "Mahogany dining table, 6-seat",
    slug: "mahogany-dining-table-6-seat",
    sku: "FURN-TABLE-MAH6",
    description: "Solid mahogany, light surface wear consistent with age. Structurally sound.",
    condition: "USED",
    isWorking: true,
    stock: 2,
    price: 950_000,
  },
  {
    id: "seed-prod-fridge",
    categoryId: "seed-cat-appliances",
    name: "Double-door refrigerator, 400L",
    slug: "double-door-refrigerator-400l",
    sku: "APPL-FRIDGE-400",
    description: "Brand new, frost-free, energy rating A++.",
    condition: "NEW",
    isWorking: true,
    stock: 8,
    price: 1_100_000,
  },
  {
    id: "seed-prod-washer",
    categoryId: "seed-cat-appliances",
    name: "Front-load washing machine, 7kg",
    slug: "front-load-washing-machine-7kg",
    sku: "APPL-WASH-7KG",
    description: "Used, drum spins fine, door seal shows wear. Tested working.",
    condition: "USED",
    isWorking: true,
    stock: 4,
    price: 480_000,
  },
  {
    id: "seed-prod-microwave-broken",
    categoryId: "seed-cat-appliances",
    name: "Microwave oven, 25L",
    slug: "microwave-oven-25l",
    sku: "APPL-MICRO-25L",
    description: "Turntable motor faulty, heating element intact. Sold as-is.",
    condition: "NOT_WORKING",
    isWorking: false,
    stock: 5,
    price: 35_000,
  },
  {
    id: "seed-prod-drill",
    categoryId: "seed-cat-tools",
    name: "Cordless drill driver, 18V",
    slug: "cordless-drill-driver-18v",
    sku: "TOOL-DRILL-18V",
    description: "Brand new, two batteries, carry case included.",
    condition: "NEW",
    isWorking: true,
    stock: 15,
    price: 145_000,
  },
  {
    id: "seed-prod-generator",
    categoryId: "seed-cat-tools",
    name: "Petrol generator, 3.5kVA",
    slug: "petrol-generator-3-5kva",
    sku: "TOOL-GEN-35KVA",
    description: "Used, runs and holds voltage, minor rust on the frame.",
    condition: "USED",
    isWorking: true,
    stock: 3,
    price: 620_000,
  },
];

interface SeedDeliveryMethod {
  id: string;
  name: string;
  description: string;
  fee: number;
  etaLabel: string;
}

const DELIVERY_METHODS: SeedDeliveryMethod[] = [
  {
    id: "seed-delivery-standard",
    name: "Standard delivery",
    description: "Delivered to your door across mainland Tanzania.",
    fee: 8_000,
    etaLabel: "3-5 business days",
  },
  {
    id: "seed-delivery-express",
    name: "Express delivery",
    description: "Priority courier, Dar es Salaam metro area.",
    fee: 20_000,
    etaLabel: "1-2 business days",
  },
  {
    id: "seed-delivery-pickup",
    name: "Store pickup",
    description: "Collect from our Dar es Salaam warehouse.",
    fee: 0,
    etaLabel: "Ready same day",
  },
];

interface SeedService {
  id: string;
  name: string;
  slug: string;
  summary: string;
  sortOrder: number;
}

/**
 * The five service categories are given directly by the product spec, not
 * invented — safe to seed. Company facts (numbers, dates, names, client
 * outcomes) are deliberately NOT seeded anywhere: `cms_page` and `project`
 * stay empty so the corporate site renders its documented empty states.
 */
const SERVICES: SeedService[] = [
  {
    id: "seed-service-import",
    name: "Import",
    slug: "import",
    summary: "Sourcing and bringing goods into Tanzania from international markets, handled end to end.",
    sortOrder: 0,
  },
  {
    id: "seed-service-wholesale",
    name: "Wholesale",
    slug: "wholesale",
    summary: "Bulk supply for retailers and businesses, at volumes and terms built for resale.",
    sortOrder: 1,
  },
  {
    id: "seed-service-distribution",
    name: "Distribution",
    slug: "distribution",
    summary: "Moving stock reliably across Tanzania and into the wider East African market.",
    sortOrder: 2,
  },
  {
    id: "seed-service-retail",
    name: "Retail",
    slug: "retail",
    summary: "Direct-to-customer sales through Afrotalia Shop and Afrotalia Mnada.",
    sortOrder: 3,
  },
  {
    id: "seed-service-b2b",
    name: "B2B Services",
    slug: "b2b-services",
    summary: "Sourcing, logistics, and supply partnerships tailored to business buyers.",
    sortOrder: 4,
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

  console.log("Seeding Shop categories, products, and delivery methods...");
  await db.insert(category).values(CATEGORIES).onConflictDoNothing({ target: category.id });
  await db.insert(product).values(PRODUCTS).onConflictDoNothing({ target: product.id });
  await db.insert(deliveryMethod).values(DELIVERY_METHODS).onConflictDoNothing({ target: deliveryMethod.id });

  console.log("Seeding a shipping address and one completed Shop order...");
  await db
    .insert(shippingAddress)
    .values({
      id: "seed-address-bidder",
      userId: "seed-test-user",
      fullName: "Test Bidder",
      phone: "+255700000001",
      country: "Tanzania",
      region: "Dar es Salaam",
      city: "Dar es Salaam",
      district: "Kinondoni",
      street: "Ali Hassan Mwinyi Road",
      additional: "Apt 4B",
    })
    .onConflictDoNothing({ target: shippingAddress.id });

  const shopOrderTotal = PRODUCTS[0]!.price + DELIVERY_METHODS[0]!.fee;
  await db
    .insert(order)
    .values({
      id: "seed-order-macbook-air",
      userId: "seed-test-user",
      type: "SHOP_ORDER",
      status: "DELIVERED",
      totalAmount: shopOrderTotal,
    })
    .onConflictDoNothing({ target: order.id });
  await db
    .insert(orderItem)
    .values({
      id: "seed-order-item-macbook-air",
      orderId: "seed-order-macbook-air",
      productId: PRODUCTS[0]!.id,
      productName: PRODUCTS[0]!.name,
      unitPrice: PRODUCTS[0]!.price,
      quantity: 1,
    })
    .onConflictDoNothing({ target: orderItem.id });
  await db
    .insert(payment)
    .values({
      id: "seed-payment-macbook-air",
      orderId: "seed-order-macbook-air",
      method: "mpesa",
      externalRef: "seed-mock-ref",
      amount: shopOrderTotal,
      status: "SUCCEEDED",
    })
    .onConflictDoNothing({ target: payment.id });
  await db
    .insert(paymentEvent)
    .values([
      { id: "seed-payment-event-captured", paymentId: "seed-payment-macbook-air", kind: "CAPTURED", amount: shopOrderTotal },
      { id: "seed-payment-event-released", paymentId: "seed-payment-macbook-air", kind: "RELEASED", amount: shopOrderTotal },
    ])
    .onConflictDoNothing({ target: paymentEvent.id });

  console.log("Seeding Web services (cms_page and project stay empty on purpose)...");
  await db.insert(service).values(SERVICES).onConflictDoNothing({ target: service.id });

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
