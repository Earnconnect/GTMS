import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // System wallet user
  const systemUser = await prisma.user.upsert({
    where: { email: "system@gtms.internal" },
    update: {},
    create: {
      email: "system@gtms.internal",
      name: "GTMS System",
      role: "ADMIN",
      status: "ACTIVE",
      passwordHash: await bcrypt.hash("system-no-login", 12),
      kycStatus: "APPROVED",
      wallet: { create: { balanceCents: 0 } },
    },
  });
  console.log("✓ System user");

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@gtms.network" },
    update: {},
    create: {
      email: "admin@gtms.network",
      name: "Platform Admin",
      role: "ADMIN",
      status: "ACTIVE",
      passwordHash: await bcrypt.hash("Admin@123456", 12),
      kycStatus: "APPROVED",
      wallet: { create: { balanceCents: 0 } },
    },
  });
  console.log("✓ Admin user (email: admin@gtms.network, password: Admin@123456)");

  // Demo business user (pre-funded $500)
  const business = await prisma.user.upsert({
    where: { email: "demo@business.com" },
    update: {},
    create: {
      email: "demo@business.com",
      name: "Demo Business",
      role: "BUSINESS",
      status: "ACTIVE",
      passwordHash: await bcrypt.hash("Business@123456", 12),
      kycStatus: "APPROVED",
      wallet: { create: { balanceCents: 50000 } }, // $500
    },
  });
  console.log("✓ Demo business user (email: demo@business.com, password: Business@123456)");

  // Demo worker (KYC approved, Professional membership, pre-seeded scores)
  const worker = await prisma.user.upsert({
    where: { email: "demo@worker.com" },
    update: {},
    create: {
      email: "demo@worker.com",
      name: "Demo Worker",
      role: "WORKER",
      status: "ACTIVE",
      passwordHash: await bcrypt.hash("Worker@123456", 12),
      kycStatus: "APPROVED",
      careerLevel: "DIGITAL_ASSOCIATE",
      accuracyScore: 75.0,
      speedScore: 60.0,
      consistencyScore: 65.0,
      trustScore: 70.0,
      referralCode: "DEMO2024",
      wallet: { create: { balanceCents: 2500 } }, // $25
    },
  });
  console.log("✓ Demo worker (email: demo@worker.com, password: Worker@123456)");

  // Professional membership for demo worker
  await prisma.membership.upsert({
    where: { userId: worker.id },
    update: {},
    create: {
      userId: worker.id,
      tier: "PROFESSIONAL",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("✓ Professional membership for demo worker");

  // KYC submission for demo worker (already approved)
  await prisma.kycSubmission.upsert({
    where: { id: "seed-kyc-worker" },
    update: {},
    create: {
      id: "seed-kyc-worker",
      userId: worker.id,
      docType: "NATIONAL_ID",
      docNumber: "DEMO-12345",
      docFrontUrl: "https://placehold.co/600x400?text=ID+Front",
      status: "APPROVED",
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });
  console.log("✓ KYC for demo worker");

  // Certification catalog
  const certs = await Promise.all([
    prisma.certification.upsert({
      where: { slug: "PRODUCT_REVIEW" },
      update: {},
      create: {
        slug: "PRODUCT_REVIEW",
        title: "Product Review Specialist",
        description: "Certifies ability to accurately review and categorize product listings",
        requiredAccuracyScore: 70,
        passingScore: 70,
        validityDays: 365,
        examQuestions: [
          { id: 1, question: "What is the primary purpose of product categorization?", options: ["Increase price", "Improve discoverability", "Reduce inventory", "None"], answer: "Improve discoverability" },
          { id: 2, question: "Which attribute is most important when reviewing a product?", options: ["Color", "Accuracy of description", "Brand name", "Package size"], answer: "Accuracy of description" },
          { id: 3, question: "How should you handle ambiguous product information?", options: ["Guess", "Flag for review", "Skip it", "Use default"], answer: "Flag for review" },
        ],
      },
    }),
    prisma.certification.upsert({
      where: { slug: "COMMERCE_OPS" },
      update: {},
      create: {
        slug: "COMMERCE_OPS",
        title: "Commerce Operations Specialist",
        description: "Certifies ability to process and verify order operations",
        requiredAccuracyScore: 75,
        passingScore: 75,
        validityDays: 365,
        examQuestions: [
          { id: 1, question: "What does order fulfillment mean?", options: ["Creating orders", "Processing payments", "Picking and shipping orders", "Marketing"], answer: "Picking and shipping orders" },
          { id: 2, question: "What should you do when an order address is incomplete?", options: ["Skip it", "Flag for verification", "Use last known address", "Cancel"], answer: "Flag for verification" },
          { id: 3, question: "Which document confirms an order has shipped?", options: ["Invoice", "Tracking number", "Receipt", "Return label"], answer: "Tracking number" },
        ],
      },
    }),
    prisma.certification.upsert({
      where: { slug: "VERIFICATION" },
      update: {},
      create: {
        slug: "VERIFICATION",
        title: "Data Verification Expert",
        description: "Certifies accuracy in cross-referencing and verifying data points",
        requiredAccuracyScore: 80,
        passingScore: 80,
        validityDays: 365,
        examQuestions: [
          { id: 1, question: "What is data verification?", options: ["Creating data", "Confirming data accuracy", "Deleting records", "Formatting data"], answer: "Confirming data accuracy" },
          { id: 2, question: "How do you verify a transaction amount?", options: ["Estimate it", "Cross-reference with source documents", "Round up", "Accept as-is"], answer: "Cross-reference with source documents" },
          { id: 3, question: "What is the most important quality in verification work?", options: ["Speed", "Accuracy", "Creativity", "Volume"], answer: "Accuracy" },
        ],
      },
    }),
    prisma.certification.upsert({
      where: { slug: "AI_EVALUATION" },
      update: {},
      create: {
        slug: "AI_EVALUATION",
        title: "AI Data Evaluation Specialist",
        description: "Certifies ability to evaluate and label AI training data",
        requiredAccuracyScore: 80,
        passingScore: 80,
        validityDays: 365,
        examQuestions: [
          { id: 1, question: "What is AI data labeling?", options: ["Writing code", "Annotating data for machine learning", "Testing software", "Building models"], answer: "Annotating data for machine learning" },
          { id: 2, question: "What makes a good AI training sample?", options: ["Large size", "Accurate labels and diversity", "Speed of collection", "Low cost"], answer: "Accurate labels and diversity" },
          { id: 3, question: "How should conflicting labels be resolved?", options: ["Pick randomly", "Use consensus or escalate", "Always pick the first", "Ignore"], answer: "Use consensus or escalate" },
        ],
      },
    }),
  ]);
  console.log("✓ 4 certification catalog rows");

  // Award 2 certs to demo worker (PRODUCT_REVIEW, VERIFICATION)
  const [certPR, certV] = certs;
  await prisma.workerCertification.createMany({
    data: [
      {
        workerId: worker.id,
        certificationId: certPR.id,
        status: "PASSED",
        score: 90,
        earnedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        workerId: worker.id,
        certificationId: certV.id,
        status: "PASSED",
        score: 85,
        earnedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    ],
    skipDuplicates: true,
  });
  console.log("✓ 2 certifications for demo worker");

  // 16 real-world tasks (4 per category)
  const taskTemplates = [
    // ── PRODUCT_INTELLIGENCE ─────────────────────────────────────────────────
    {
      category: "PRODUCT_INTELLIGENCE" as const,
      title: "Verify Amazon Product Listing Accuracy",
      description: "Review Amazon product listings and verify that titles, descriptions, specifications, and images match the actual product. Flag discrepancies and misleading claims.",
      instructions: "You will be given an Amazon product URL and a reference product sheet. 1) Check if the product title matches the actual item. 2) Verify all listed specifications (weight, dimensions, materials). 3) Confirm images show the correct product. 4) Rate the listing accuracy on a scale of 1-5. 5) Flag any misleading claims.",
      rewardPerUnitCents: 125,
      totalUnits: 500,
      maxPerWorker: 10,
      qaEnabled: false,
      requiredMembershipTier: "BASIC" as const,
      requiredCareerLevel: "DIGITAL_ASSOCIATE" as const,
      minAccuracyScore: 0,
      fieldSchema: [
        { name: "result", label: "Listing Verdict", type: "select", required: true, options: ["APPROVE", "REJECT", "FLAG"] },
        { name: "accuracyRating", label: "Accuracy Rating (1-5)", type: "number", required: true, min: 1, max: 5 },
        { name: "notes", label: "Findings/Notes", type: "textarea", required: true },
      ],
    },
    {
      category: "PRODUCT_INTELLIGENCE" as const,
      title: "E-commerce Review Authenticity Check",
      description: "Analyze customer reviews to identify fake, incentivized, or bot-generated reviews. Help maintain review integrity on marketplace platforms.",
      instructions: "Review the provided customer review. Check for: 1) Generic or templated language. 2) Reviewer history patterns. 3) Unusually positive tone without specifics. 4) Grammar/language inconsistencies. 5) Mark as AUTHENTIC, SUSPICIOUS, or FAKE with reasoning.",
      rewardPerUnitCents: 95,
      totalUnits: 1000,
      maxPerWorker: 10,
      qaEnabled: false,
      requiredMembershipTier: "BASIC" as const,
      requiredCareerLevel: "DIGITAL_ASSOCIATE" as const,
      minAccuracyScore: 0,
      fieldSchema: [
        { name: "classification", label: "Review Classification", type: "select", required: true, options: ["AUTHENTIC", "SUSPICIOUS", "FAKE"] },
        { name: "confidence", label: "Confidence Level", type: "select", required: true, options: ["LOW", "MEDIUM", "HIGH"] },
        { name: "notes", label: "Reasoning", type: "textarea", required: true },
      ],
    },
    {
      category: "PRODUCT_INTELLIGENCE" as const,
      title: "Product Price Monitoring & Competitor Analysis",
      description: "Track product prices across multiple platforms and report pricing anomalies, price gouging, and competitive pricing gaps.",
      instructions: "Given a product name and SKU: 1) Search for the product on 3 major platforms. 2) Record current prices and seller names. 3) Note any significant price variations (>20%). 4) Check for counterfeit listings. 5) Submit structured price data.",
      rewardPerUnitCents: 150,
      totalUnits: 300,
      maxPerWorker: 10,
      qaEnabled: true,
      requiredMembershipTier: "PROFESSIONAL" as const,
      requiredCareerLevel: "CERTIFIED_REVIEWER" as const,
      minAccuracyScore: 70,
      fieldSchema: [
        { name: "result", label: "Overall Finding", type: "select", required: true, options: ["APPROVE", "REJECT", "FLAG"] },
        { name: "priceVariation", label: "Largest Price Variation (%)", type: "number", required: true, min: 0 },
        { name: "notes", label: "Findings/Notes", type: "textarea", required: true },
      ],
    },
    {
      category: "PRODUCT_INTELLIGENCE" as const,
      title: "Brand Safety Compliance Check",
      description: "Review product listings and promotional content for brand guideline compliance, trademark violations, and unauthorized use of brand assets.",
      instructions: "Review the submitted product image and description. Verify: 1) Logo usage follows brand guidelines. 2) No unauthorized use of trademarked terms. 3) Color scheme matches brand standards. 4) Product claims are factual. 5) Rate compliance: COMPLIANT / MINOR_ISSUES / MAJOR_VIOLATION.",
      rewardPerUnitCents: 200,
      totalUnits: 200,
      maxPerWorker: 5,
      qaEnabled: true,
      requiredMembershipTier: "PROFESSIONAL" as const,
      requiredCareerLevel: "CERTIFIED_REVIEWER" as const,
      minAccuracyScore: 70,
      fieldSchema: [
        { name: "classification", label: "Compliance Status", type: "select", required: true, options: ["COMPLIANT", "MINOR_ISSUES", "MAJOR_VIOLATION"] },
        { name: "confidence", label: "Confidence Level", type: "select", required: true, options: ["LOW", "MEDIUM", "HIGH"] },
        { name: "notes", label: "Reasoning", type: "textarea", required: true },
      ],
    },

    // ── ORDER_OPERATIONS ─────────────────────────────────────────────────────
    {
      category: "ORDER_OPERATIONS" as const,
      title: "Shipping Address Validation",
      description: "Validate customer shipping addresses for accuracy and deliverability before order fulfillment to reduce failed deliveries.",
      instructions: "You will receive a shipping address. Verify: 1) Street address format is valid. 2) City/State/ZIP combination exists. 3) Address is a real deliverable location (not a PO Box when prohibited). 4) Check for common typos. 5) Mark as VALID, NEEDS_CORRECTION, or INVALID with specific issues noted.",
      rewardPerUnitCents: 75,
      totalUnits: 2000,
      maxPerWorker: 10,
      qaEnabled: false,
      requiredMembershipTier: "BASIC" as const,
      requiredCareerLevel: "DIGITAL_ASSOCIATE" as const,
      minAccuracyScore: 0,
      fieldSchema: [
        { name: "result", label: "Address Status", type: "select", required: true, options: ["APPROVE", "REJECT", "FLAG"] },
        { name: "verified", label: "Address Deliverable?", type: "select", required: true, options: ["CORRECT", "HAS_ERRORS"] },
        { name: "corrections", label: "List any corrections needed", type: "textarea", required: false },
      ],
    },
    {
      category: "ORDER_OPERATIONS" as const,
      title: "Order Data Entry Verification",
      description: "Verify manual order entries against source documents (receipts, invoices) to catch data entry errors before processing.",
      instructions: "Compare the order data entered in our system against the provided source document: 1) Product SKU matches. 2) Quantity is correct. 3) Price matches the invoice. 4) Customer info matches. 5) Mark fields as CORRECT or flag specific discrepancies.",
      rewardPerUnitCents: 85,
      totalUnits: 1500,
      maxPerWorker: 10,
      qaEnabled: false,
      requiredMembershipTier: "BASIC" as const,
      requiredCareerLevel: "DIGITAL_ASSOCIATE" as const,
      minAccuracyScore: 0,
      fieldSchema: [
        { name: "verified", label: "Data Entry Status", type: "select", required: true, options: ["CORRECT", "HAS_ERRORS"] },
        { name: "corrections", label: "List any corrections needed", type: "textarea", required: true },
        { name: "result", label: "Final Disposition", type: "select", required: true, options: ["APPROVE", "REJECT", "FLAG"] },
      ],
    },
    {
      category: "ORDER_OPERATIONS" as const,
      title: "Returns & Refund Fraud Detection",
      description: "Review return requests and identify potentially fraudulent returns, wardrobing, or policy abuse patterns.",
      instructions: "Analyze the return request data: 1) Check customer return history (provided). 2) Verify the stated reason matches the product category. 3) Look for patterns indicating policy abuse. 4) Check if reported defect is plausible. 5) Recommend: APPROVE, FLAG_FOR_REVIEW, or DENY with reasoning.",
      rewardPerUnitCents: 175,
      totalUnits: 400,
      maxPerWorker: 10,
      qaEnabled: true,
      requiredMembershipTier: "PROFESSIONAL" as const,
      requiredCareerLevel: "CERTIFIED_REVIEWER" as const,
      minAccuracyScore: 70,
      fieldSchema: [
        { name: "result", label: "Return Decision", type: "select", required: true, options: ["APPROVE", "REJECT", "FLAG"] },
        { name: "confidence", label: "Confidence Level", type: "select", required: true, options: ["LOW", "MEDIUM", "HIGH"] },
        { name: "notes", label: "Findings/Notes", type: "textarea", required: true },
      ],
    },
    {
      category: "ORDER_OPERATIONS" as const,
      title: "Inventory Discrepancy Investigation",
      description: "Investigate stock count discrepancies between physical inventory counts and system records to identify causes (shrinkage, error, theft).",
      instructions: "Review the provided inventory data: 1) Compare physical count to system count. 2) Calculate discrepancy percentage. 3) Review recent transaction history for the SKU. 4) Identify most likely cause category. 5) Complete the discrepancy report form with findings.",
      rewardPerUnitCents: 225,
      totalUnits: 150,
      maxPerWorker: 5,
      qaEnabled: true,
      requiredMembershipTier: "PROFESSIONAL" as const,
      requiredCareerLevel: "CERTIFIED_REVIEWER" as const,
      minAccuracyScore: 70,
      fieldSchema: [
        { name: "result", label: "Investigation Result", type: "select", required: true, options: ["APPROVE", "REJECT", "FLAG"] },
        { name: "discrepancyPct", label: "Discrepancy Percentage (%)", type: "number", required: true, min: 0 },
        { name: "notes", label: "Findings/Notes", type: "textarea", required: true },
      ],
    },

    // ── TRANSACTION_VERIFICATION ─────────────────────────────────────────────
    {
      category: "TRANSACTION_VERIFICATION" as const,
      title: "Credit Card Transaction Fraud Screening",
      description: "Screen flagged credit card transactions for fraud indicators using provided behavioral data and transaction patterns.",
      instructions: "Review the transaction details: 1) Check if location matches customer's usual pattern. 2) Verify amount is within normal range for this customer. 3) Check if merchant category is unusual. 4) Review device/IP information. 5) Classify: LEGITIMATE, SUSPICIOUS, or FRAUD with confidence score.",
      rewardPerUnitCents: 145,
      totalUnits: 800,
      maxPerWorker: 10,
      qaEnabled: true,
      requiredMembershipTier: "PROFESSIONAL" as const,
      requiredCareerLevel: "CERTIFIED_REVIEWER" as const,
      minAccuracyScore: 70,
      fieldSchema: [
        { name: "classification", label: "Transaction Classification", type: "select", required: true, options: ["LEGITIMATE", "SUSPICIOUS", "FRAUD"] },
        { name: "confidence", label: "Confidence Level", type: "select", required: true, options: ["LOW", "MEDIUM", "HIGH"] },
        { name: "notes", label: "Reasoning", type: "textarea", required: true },
      ],
    },
    {
      category: "TRANSACTION_VERIFICATION" as const,
      title: "Bank Statement Categorization",
      description: "Categorize bank transactions for business expense reporting and bookkeeping. Accurate categorization helps with tax preparation and financial analysis.",
      instructions: "For each transaction provided: 1) Identify the merchant/payee. 2) Assign the correct expense category (Travel, Office Supplies, Software, Marketing, etc.). 3) Note if it appears personal vs business. 4) Flag unusual amounts. 5) Complete the categorization form.",
      rewardPerUnitCents: 65,
      totalUnits: 3000,
      maxPerWorker: 10,
      qaEnabled: false,
      requiredMembershipTier: "BASIC" as const,
      requiredCareerLevel: "DIGITAL_ASSOCIATE" as const,
      minAccuracyScore: 0,
      fieldSchema: [
        { name: "classification", label: "Expense Category", type: "select", required: true, options: ["Travel", "Office Supplies", "Software", "Marketing", "Meals", "Utilities", "Professional Services", "Other"] },
        { name: "verified", label: "Business vs Personal", type: "select", required: true, options: ["CORRECT", "HAS_ERRORS"] },
        { name: "notes", label: "Reasoning", type: "textarea", required: false },
      ],
    },
    {
      category: "TRANSACTION_VERIFICATION" as const,
      title: "Invoice Verification & Approval Routing",
      description: "Verify vendor invoices against purchase orders and route for appropriate approval based on amount and department.",
      instructions: "Review the invoice against the purchase order: 1) Verify vendor name and details match. 2) Confirm line items and quantities match PO. 3) Verify pricing matches agreed rates. 4) Check for duplicate invoice numbers. 5) Route to correct approver level based on amount threshold.",
      rewardPerUnitCents: 190,
      totalUnits: 350,
      maxPerWorker: 10,
      qaEnabled: true,
      requiredMembershipTier: "PROFESSIONAL" as const,
      requiredCareerLevel: "CERTIFIED_REVIEWER" as const,
      minAccuracyScore: 70,
      fieldSchema: [
        { name: "verified", label: "Invoice Match Status", type: "select", required: true, options: ["CORRECT", "HAS_ERRORS"] },
        { name: "result", label: "Routing Decision", type: "select", required: true, options: ["APPROVE", "REJECT", "FLAG"] },
        { name: "corrections", label: "List any corrections needed", type: "textarea", required: true },
      ],
    },
    {
      category: "TRANSACTION_VERIFICATION" as const,
      title: "Cryptocurrency Transaction Compliance Check",
      description: "Review cryptocurrency transactions for AML (Anti-Money Laundering) compliance indicators and suspicious activity patterns.",
      instructions: "Analyze the provided crypto transaction data: 1) Check wallet age and transaction history summary. 2) Identify if transaction involves known high-risk addresses. 3) Review transaction amount patterns. 4) Check for structuring (multiple small transactions). 5) Complete SAR (Suspicious Activity Report) screening form.",
      rewardPerUnitCents: 350,
      totalUnits: 100,
      maxPerWorker: 5,
      qaEnabled: true,
      requiredMembershipTier: "EXECUTIVE" as const,
      requiredCareerLevel: "SENIOR_VERIFIER" as const,
      minAccuracyScore: 80,
      requiredCertifications: ["VERIFICATION"],
      fieldSchema: [
        { name: "result", label: "Compliance Decision", type: "select", required: true, options: ["APPROVE", "REJECT", "FLAG"] },
        { name: "confidence", label: "Confidence Level", type: "select", required: true, options: ["LOW", "MEDIUM", "HIGH"] },
        { name: "notes", label: "Findings/Notes", type: "textarea", required: true },
      ],
    },

    // ── AI_DATA_INTELLIGENCE ─────────────────────────────────────────────────
    {
      category: "AI_DATA_INTELLIGENCE" as const,
      title: "Image Caption & Alt-Text Generation",
      description: "Write accurate, descriptive captions and alt-text for product and content images to improve accessibility and SEO.",
      instructions: "For each provided image: 1) Write a concise, accurate description of what is shown. 2) Create SEO-friendly alt text (under 125 characters). 3) Note the primary subject, context, and any text visible in the image. 4) Ensure descriptions are accessible for screen readers. 5) Avoid subjective language.",
      rewardPerUnitCents: 55,
      totalUnits: 5000,
      maxPerWorker: 10,
      qaEnabled: false,
      requiredMembershipTier: "BASIC" as const,
      requiredCareerLevel: "DIGITAL_ASSOCIATE" as const,
      minAccuracyScore: 0,
      fieldSchema: [
        { name: "altText", label: "SEO Alt Text (max 125 chars)", type: "text", required: true },
        { name: "caption", label: "Full Image Caption", type: "textarea", required: true },
        { name: "result", label: "Image Quality", type: "select", required: true, options: ["APPROVE", "REJECT", "FLAG"] },
      ],
    },
    {
      category: "AI_DATA_INTELLIGENCE" as const,
      title: "Customer Feedback Sentiment & Intent Classification",
      description: "Classify customer feedback messages by sentiment, intent, and urgency to help route support tickets and improve service quality.",
      instructions: "Analyze the customer message: 1) Classify sentiment: POSITIVE / NEUTRAL / NEGATIVE. 2) Identify intent: COMPLAINT / QUESTION / COMPLIMENT / REFUND_REQUEST / ESCALATION. 3) Rate urgency: LOW / MEDIUM / HIGH / CRITICAL. 4) Extract the core issue in one sentence. 5) Suggest department routing.",
      rewardPerUnitCents: 90,
      totalUnits: 2500,
      maxPerWorker: 10,
      qaEnabled: false,
      requiredMembershipTier: "BASIC" as const,
      requiredCareerLevel: "DIGITAL_ASSOCIATE" as const,
      minAccuracyScore: 0,
      fieldSchema: [
        { name: "classification", label: "Intent Classification", type: "select", required: true, options: ["COMPLAINT", "QUESTION", "COMPLIMENT", "REFUND_REQUEST", "ESCALATION"] },
        { name: "confidence", label: "Urgency Level", type: "select", required: true, options: ["LOW", "MEDIUM", "HIGH"] },
        { name: "notes", label: "Reasoning", type: "textarea", required: true },
      ],
    },
    {
      category: "AI_DATA_INTELLIGENCE" as const,
      title: "AI Training Data Quality Review",
      description: "Review AI/ML training datasets for quality issues, biases, errors, and labeling inconsistencies that could affect model performance.",
      instructions: "Review the provided data sample: 1) Verify labels are accurate and consistent. 2) Check for edge cases or ambiguous examples. 3) Identify potential bias in the data. 4) Flag mislabeled examples with corrections. 5) Rate overall batch quality: EXCELLENT / GOOD / NEEDS_REVIEW / REJECT.",
      rewardPerUnitCents: 160,
      totalUnits: 600,
      maxPerWorker: 10,
      qaEnabled: true,
      requiredMembershipTier: "PROFESSIONAL" as const,
      requiredCareerLevel: "CERTIFIED_REVIEWER" as const,
      minAccuracyScore: 70,
      requiredCertifications: ["AI_EVALUATION"],
      fieldSchema: [
        { name: "classification", label: "Batch Quality Rating", type: "select", required: true, options: ["EXCELLENT", "GOOD", "NEEDS_REVIEW", "REJECT"] },
        { name: "confidence", label: "Confidence Level", type: "select", required: true, options: ["LOW", "MEDIUM", "HIGH"] },
        { name: "notes", label: "Reasoning", type: "textarea", required: true },
      ],
    },
    {
      category: "AI_DATA_INTELLIGENCE" as const,
      title: "Product Description SEO Enhancement",
      description: "Improve existing product descriptions for search engine optimization while maintaining accuracy and readability.",
      instructions: "Given the product info and current description: 1) Identify missing high-value keywords. 2) Rewrite the description with natural keyword integration. 3) Ensure all product features are mentioned. 4) Keep tone consistent with brand voice provided. 5) Length should be 150-300 words. Submit the enhanced description.",
      rewardPerUnitCents: 130,
      totalUnits: 800,
      maxPerWorker: 10,
      qaEnabled: true,
      requiredMembershipTier: "PROFESSIONAL" as const,
      requiredCareerLevel: "CERTIFIED_REVIEWER" as const,
      minAccuracyScore: 70,
      fieldSchema: [
        { name: "result", label: "Enhancement Result", type: "select", required: true, options: ["APPROVE", "REJECT", "FLAG"] },
        { name: "enhancedDescription", label: "Enhanced Description (150-300 words)", type: "textarea", required: true },
        { name: "notes", label: "Keywords Added / Changes Made", type: "textarea", required: true },
      ],
    },
  ];

  for (const template of taskTemplates) {
    const task = await prisma.task.create({
      data: {
        requesterId: business.id,
        title: template.title,
        description: template.description,
        instructions: template.instructions,
        category: template.category,
        fieldSchema: template.fieldSchema as never,
        rewardPerUnitCents: template.rewardPerUnitCents,
        totalUnits: template.totalUnits,
        maxPerWorker: template.maxPerWorker,
        reviewWindowH: 48,
        reservationTtlM: 30,
        status: "ACTIVE",
        qaEnabled: template.qaEnabled,
        requiredMembershipTier: template.requiredMembershipTier,
        requiredCareerLevel: template.requiredCareerLevel,
        minAccuracyScore: template.minAccuracyScore,
        requiredCertifications: (template as { requiredCertifications?: string[] }).requiredCertifications ?? [],
      },
    });

    await prisma.assignment.createMany({
      data: Array.from({ length: template.totalUnits }, (_, i) => ({
        taskId: task.id,
        unitIndex: i,
        status: "AVAILABLE" as const,
      })),
    });
  }
  console.log("✓ 16 real-world tasks (4 per category)");

  console.log("\nSeed complete!");
  console.log("\nLogin credentials:");
  console.log("  Admin:    admin@gtms.network / Admin@123456");
  console.log("  Business: demo@business.com / Business@123456");
  console.log("  Worker:   demo@worker.com / Worker@123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
