import app from "../app.js";
import prisma from "../lib/prisma.js";
import http from "http";

const PORT = 5099;
let server: http.Server;

async function request(method: string, path: string, body?: any, headers: Record<string, string> = {}) {
  return new Promise<{ status: number; body: any }>((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const req = http.request(
      `http://localhost:${PORT}${path}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
          ...headers,
        },
      },
      (res) => {
        let responseText = "";
        res.on("data", (chunk) => (responseText += chunk));
        res.on("end", () => {
          try {
            const parsed = responseText ? JSON.parse(responseText) : {};
            resolve({ status: res.statusCode || 500, body: parsed });
          } catch {
            resolve({ status: res.statusCode || 500, body: responseText });
          }
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runApiVerificationSuite() {
  console.log("\n==================================================");
  console.log("    AIRAVÉ REST API LAYER VERIFICATION SUITE      ");
  console.log("==================================================\n");

  server = app.listen(PORT);

  try {
    // 1. Health Check
    console.log("[Test 1/9] Testing Health Check Endpoint...");
    const healthRes = await request("GET", "/health");
    if (healthRes.status !== 200 || healthRes.body.status !== "OK") {
      throw new Error(`Health check failed: ${JSON.stringify(healthRes.body)}`);
    }
    console.log("  ✓ Health check passed (HTTP 200 OK).\n");

    // 2. Auth - Registration
    console.log("[Test 2/9] Testing User Registration (/api/v1/auth/register)...");
    const testEmail = `api_test_${Date.now()}@airave.com`;
    const regRes = await request("POST", "/api/v1/auth/register", {
      email: testEmail,
      password: "TestPassword123!",
      firstName: "Test",
      lastName: "User",
    });

    if (regRes.status !== 201 || !regRes.body.success || !regRes.body.data.token) {
      throw new Error(`User registration failed: ${JSON.stringify(regRes.body)}`);
    }
    const token = regRes.body.data.token;
    const userId = regRes.body.data.user.id;
    console.log(`  -> Registered User ID: ${userId}`);
    console.log("  ✓ User registration passed (HTTP 201 Created).\n");

    // 3. User Profile Retrieval
    console.log("[Test 3/9] Testing User Profile (/api/v1/users/me)...");
    const profileRes = await request("GET", "/api/v1/users/me", undefined, {
      Authorization: `Bearer ${token}`,
    });
    if (profileRes.status !== 200 || profileRes.body.data.email !== testEmail) {
      throw new Error(`Get profile failed: ${JSON.stringify(profileRes.body)}`);
    }
    console.log("  ✓ User profile retrieval passed.\n");

    // 4. Catalog Collections & Categories
    console.log("[Test 4/9] Testing Catalog Taxonomy (/api/v1/collections & /api/v1/categories)...");
    const collectionsRes = await request("GET", "/api/v1/collections");
    const categoriesRes = await request("GET", "/api/v1/categories");
    if (collectionsRes.status !== 200 || categoriesRes.status !== 200) {
      throw new Error(`Catalog taxonomy failed`);
    }
    console.log(`  -> Collections count: ${collectionsRes.body.data.length}, Categories count: ${categoriesRes.body.data.length}`);
    console.log("  ✓ Catalog taxonomy endpoints passed.\n");

    // 5. Products Search & Filtering
    console.log("[Test 5/9] Testing Product Listing & Filter (/api/v1/products)...");
    const productsRes = await request("GET", "/api/v1/products?page=1&limit=5&sortBy=createdAt");
    if (productsRes.status !== 200 || !productsRes.body.meta) {
      throw new Error(`Product listing failed: ${JSON.stringify(productsRes.body)}`);
    }
    console.log(`  -> Total products found: ${productsRes.body.meta.total}`);
    console.log("  ✓ Product search & pagination passed.\n");

    // 6. Cart Operations
    console.log("[Test 6/9] Testing Cart Operations (/api/v1/cart)...");
    const cartRes = await request("GET", "/api/v1/cart", undefined, {
      Authorization: `Bearer ${token}`,
    });
    if (cartRes.status !== 200 || !cartRes.body.data.id) {
      throw new Error(`Get cart failed: ${JSON.stringify(cartRes.body)}`);
    }
    console.log(`  -> Active Cart ID: ${cartRes.body.data.id}`);
    console.log("  ✓ Cart operations passed.\n");

    // 7. Zod Validation Error Response Envelope Guard
    console.log("[Test 7/9] Testing Zod Validation Error Guard...");
    const badReqRes = await request("POST", "/api/v1/auth/register", {
      email: "not-an-email",
      password: "123",
    });
    if (badReqRes.status !== 400 || badReqRes.body.success !== false || badReqRes.body.error.code !== "VALIDATION_ERROR") {
      throw new Error(`Zod error handler failed: ${JSON.stringify(badReqRes.body)}`);
    }
    console.log("  -> Received HTTP 400 VALIDATION_ERROR envelope correctly.");
    console.log("  ✓ Zod runtime error handler passed.\n");

    // 8. 404 Unmatched Route Handler
    console.log("[Test 8/9] Testing 404 Unmatched Route Handler...");
    const notFoundRes = await request("GET", "/api/v1/non-existent-route");
    if (notFoundRes.status !== 404 || notFoundRes.body.error.code !== "NOT_FOUND") {
      throw new Error(`404 handler failed: ${JSON.stringify(notFoundRes.body)}`);
    }
    console.log("  ✓ 404 Route Handler passed.\n");

    // 9. Cleanup Test User
    console.log("[Test 9/9] Cleaning up test records...");
    await prisma.user.delete({ where: { id: userId } });
    console.log("  ✓ Cleanup complete.\n");

    console.log("==================================================");
    console.log("   ALL REST API VERIFICATION TESTS PASSED (100%)  ");
    console.log("==================================================\n");
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runApiVerificationSuite().catch((err) => {
  console.error("API Verification Suite Failed:", err);
  if (server) server.close();
  prisma.$disconnect();
  process.exit(1);
});
