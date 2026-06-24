import { Format, GenerationStatus, Platform, PrismaClient, ProbeStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface Snapshot {
  impressions: number;
  likes: number;
  comments: number;
  saves: number;
  qualitativeScore: number;
}

async function main() {
  await prisma.generation.create({ data: engineerSellerBatch001() });
}

function engineerSellerBatch001() {
  return {
    title: 'Engineer-Seller Batch 001',
    theme: 'Rough probes around engineers, AI commoditization, sales, and anti-grift positioning',
    fitnessFunction: 'default_v0',
    status: GenerationStatus.ACTIVE,
    probes: {
      create: [antiGriftProbe(), aiReplacementProbe(), distributionAllergyProbe()],
    },
  };
}

function antiGriftProbe() {
  return {
    title: 'Engineer-Seller: Anti-Grift',
    rawInput:
      "Most engineers don't need to become influencers. They need to learn enough sales to survive commoditization. Not guru sales. Not manipulation. Not fake authority. Just enough to explain a real problem, find people who have it, and get paid to solve it.",
    format: Format.SHORT_TEXT,
    status: ProbeStatus.DRAFT,
    tags: ['engineer-seller', 'ai-disruption', 'anti-grift', 'sales'],
    effortMinutes: 15,
    platformPosts: { create: [linkedInPost(antiGriftSnapshot())] },
  };
}

function aiReplacementProbe() {
  return {
    title: "AI Won't Replace Engineers",
    rawInput:
      "AI won't replace engineers. It will replace engineers who need perfect specs before they can create value. The next durable skill is not prompting. It is finding painful problems, shipping rough solutions, and learning from the market before your confidence catches up.",
    format: Format.SHORT_TEXT,
    status: ProbeStatus.DRAFT,
    tags: ['ai-disruption', 'market-learning', 'shipping', 'engineers'],
    effortMinutes: 15,
    platformPosts: { create: [linkedInPost(aiReplacementSnapshot())] },
  };
}

function distributionAllergyProbe() {
  return {
    title: 'Distribution Allergy',
    rawInput:
      "Most technical founders don't have a product problem. They have a distribution allergy. They keep improving the thing because improving the thing feels safer than asking strangers if they care.",
    format: Format.SHORT_TEXT,
    status: ProbeStatus.DRAFT,
    tags: ['technical-founders', 'distribution', 'sales-avoidance', 'positioning'],
    effortMinutes: 10,
    platformPosts: { create: [linkedInPost(distributionAllergySnapshot())] },
  };
}

function linkedInPost(snapshot: Snapshot) {
  return {
    platform: Platform.LINKEDIN,
    url: null,
    publishedAt: null,
    snapshots: { create: [snapshot] },
  };
}

function antiGriftSnapshot(): Snapshot {
  return {
    impressions: 1200,
    likes: 42,
    comments: 8,
    saves: 15,
    qualitativeScore: 6,
  };
}

function aiReplacementSnapshot(): Snapshot {
  return {
    impressions: 1800,
    likes: 61,
    comments: 12,
    saves: 22,
    qualitativeScore: 7,
  };
}

function distributionAllergySnapshot(): Snapshot {
  return {
    impressions: 900,
    likes: 78,
    comments: 19,
    saves: 41,
    qualitativeScore: 9,
  };
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
