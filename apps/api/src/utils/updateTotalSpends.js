import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function calculateVendorTotals() {
  console.log("Starting to calculate vendor total spends...");

  const vendors = await prisma.vendor.findMany({
    select: { id: true, name: true },
  });

  if (vendors.length === 0) {
    console.log("No vendors found to update.");
    return;
  }

  console.log(`Found ${vendors.length} vendors. Processing...`);

  const updatePromises = [];

  for (const vendor of vendors) {
    const spendAgg = await prisma.invoice.aggregate({
      _sum: {
        invoiceTotal: true,
      },
      where: {
        vendorId: vendor.id,
        isCreditNote: false, 
      },
    });

    const totalSpend = spendAgg._sum.invoiceTotal || 0; 
    updatePromises.push(
      prisma.vendor.update({
        where: { id: vendor.id },
        data: { totalSpend: totalSpend },
      })
    );

    console.log(
      `  -> Vendor: ${vendor.name}, Calculated Spend: ${totalSpend}`
    );
  }

  console.log("\nApplying all updates to the database...");
  await prisma.$transaction(updatePromises);

  console.log("✅ All vendor totalSpend fields have been updated!");
}

calculateVendorTotals()
  .catch((e) => {
    console.error("An error occurred while updating totals:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });