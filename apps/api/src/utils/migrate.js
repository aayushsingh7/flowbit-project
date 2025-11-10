import { PrismaClient } from "@prisma/client";
import jsonData from "../../../../data/Analytics_Test_Data.json" with {type:"json"}; // <-- Make sure your JSON is in this file

const prisma = new PrismaClient();

const getVal = (field) => {
  const val = field?.value;
  return (val === "" || val === null || val === undefined) ? null : String(val);
};

const getFloat = (field) => {
  const val = field?.value;
  if (val === "" || val === null || val === undefined) return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};

const getInt = (field) => {
  const val = field?.value;
  if (val === "" || val === null || val === undefined) return null;
  const num = parseInt(val, 10);
  return isNaN(num) ? null : num;
};

const getDate = (field) => {
  if (field?.$date) {
    const date = new Date(field.$date);
    return isNaN(date.getTime()) ? null : date;
  }
  const val = field?.value;
  if (!val) return null; 
  const date = new Date(val);
  return isNaN(date.getTime()) ? null : date;
};

async function processDocument(doc) {
  const llm = doc.extractedData?.llmData;
  if (!llm) {
    console.error(`[SKIP] Document ${doc._id} has no llmData.`);
    return;
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
            const vData = llm.vendor?.value;
      const cData = llm.customer?.value;
      const pData = llm.payment?.value;
      const iData = llm.invoice?.value;
      const sData = llm.summary?.value;
      const lineItemsData = llm.lineItems?.value?.items.value || [];

      if (!vData || !cData || !pData || !iData || !sData) {
        throw new Error(`Doc ${doc._id}: Missing critical data block (vendor, customer, etc.)`);
      }

      const vendorName = getVal(vData.vendorName);
      const partyNumber = getVal(vData.vendorPartyNumber);
      
      if (!vendorName) throw new Error(`Doc ${doc._id}: Vendor name is missing.`);

      let vendor;
      
      if (partyNumber) {
        vendor = await tx.vendor.upsert({
          where: { partyNumber: partyNumber },
          update: {
            name: vendorName,
            address: getVal(vData.vendorAddress),
            taxId: getVal(vData.vendorTaxId),
          },
          create: {
            name: vendorName,
            partyNumber: partyNumber,
            address: getVal(vData.vendorAddress),
            taxId: getVal(vData.vendorTaxId),
          },
        });
      } else {
        vendor = await tx.vendor.findFirst({
          where: { name: vendorName },
        });

        if (!vendor) {
          vendor = await tx.vendor.create({
            data: {
              name: vendorName,
              partyNumber: null,
              address: getVal(vData.vendorAddress),
              taxId: getVal(vData.vendorTaxId),
            },
          });
        }
      }

      const customerName = getVal(cData.customerName);
      if (!customerName) throw new Error(`Doc ${doc._id}: Customer name is missing.`);

      let customer = await tx.customer.findFirst({
        where: { name: customerName, address: getVal(cData.customerAddress) },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: customerName,
            address: getVal(cData.customerAddress),
          },
        });
      }

      const categoryCodes = new Set(
        lineItemsData.map((item) => getVal(item.Sachkonto)).filter(Boolean)
      );
      const categoryMap = new Map();

      for (const code of categoryCodes) {
        const category = await tx.category.upsert({
          where: { code: code },
          update: {},
          create: {
            code: code,
            name: `Category ${code}`,
          },
        });
        categoryMap.set(code, category.id);
      }

      const paymentCreate = {
        dueDate:         getDate(pData.dueDate),
        paymentTerms:    getVal(pData.paymentTerms),
        bankAccount:     getVal(pData.bankAccountNumber),
        bic:             getVal(pData.BIC),
        accountName:     getVal(pData.accountName),
        netDays:         getInt(pData.netDays),
        discountPercent: getFloat(pData.discountPercentage),
        discountDays:    getInt(pData.discountDays),
        discountedTotal: getFloat(sData.invoiceTotal),
      };

      
      const lineItemsCreate = lineItemsData.map((item) => {
        const sachkonto = getVal(item.Sachkonto);
        return {
          srNo:         getInt(item.srNo),
          description:  getVal(item.description),
          quantity:     getFloat(item.quantity),
          unitPrice:    getFloat(item.unitPrice),
          totalPrice:   getFloat(item.totalPrice),
          sachkonto:    sachkonto,
          buschluessel: getVal(item.BUSchluessel),
          categoryId:   sachkonto ? categoryMap.get(sachkonto) : null,
        };
      });

      const total = getFloat(sData.invoiceTotal);
      const isCredit =
        (total !== null && total < 0) || doc.name.toLowerCase().includes("gutschrift");

      const newInvoice = await tx.invoice.create({
        data: {
          invoiceNumber: getVal(iData.invoiceId),
          invoiceDate:   getDate(iData.invoiceDate),
          invoiceTotal:  total,
          isCreditNote:  isCredit,
          
          vendor:   { connect: { id: vendor.id } },
          customer: { connect: { id: customer.id } },
          payment:   { create: paymentCreate },
          lineItems: { create: lineItemsCreate },
        },
      });

      const newDocument = await tx.document.create({
        data: {
          id:             doc._id,
          fileName:       doc.name,
          filePath:       doc.filePath,
          fileSizeBytes:  doc.fileSize?.$numberLong ? parseInt(doc.fileSize.$numberLong) : null,
          fileType:       doc.fileType,
          status:         doc.status,
          organizationId: doc.organizationId,
          departmentId:   doc.departmentId,
          metadata:       doc.metadata || undefined,
          extractedData:  doc.extractedData || undefined,
          validated:      doc.isValidatedByHuman || false,
          createdAt:      getDate(doc.createdAt) || new Date(),
          updatedAt:      getDate(doc.updatedAt) || new Date(),
          invoice: { connect: { id: newInvoice.id } },
        },
      });

      return { docId: newDocument.id, invId: newInvoice.id };
    });

    console.log(
      `✅ Successfully migrated document: ${doc.name} (InvID: ${result.invId})`
    );
  } catch (error) {
    console.error(
      `❌ FAILED to migrate document: ${doc.name} (ID: ${doc._id}). Error: ${error.message}`
    );
  }
}


async function migrateData() {
  console.log(`Starting migration for ${jsonData.length} documents...`);
  console.log("---");

  for (const doc of jsonData) {
    await processDocument(doc);
  }

  console.log("----------------------------------------");
  console.log("Migration complete. All documents processed.");
  console.log("----------------------------------------");
  console.log("=> Next step: Run 'node updateTotalSpends.js' to calculate vendor spends.");
}

migrateData()
  .catch((e) => {
    console.error("An unexpected error occurred during migration:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });