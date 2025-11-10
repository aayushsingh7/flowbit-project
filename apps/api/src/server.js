import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/user", async (req, res) => {
  try {
    const newUser = await prisma.user.create({
      data: { name: "trail-user", email: "trail-user@gmail.com" },
    });
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ success: false, message: "Oops! something went wrong" });
  }
});

app.get("/stats", async (req, res) => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    );
    endOfCurrentMonth.setHours(23, 59, 59, 999);

    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    endOfPrevMonth.setHours(23, 59, 59, 999);

    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalSpendCurrentMonthAgg,
      totalInvoicesCurrentMonthCount,
      documentUploadsCurrentMonthCount,
      avgInvoiceValueCurrentMonthAgg,
      totalSpendPrevMonthAgg,
      totalInvoicesPrevMonthCount,
      documentUploadsPrevMonthCount,
      avgInvoiceValuePrevMonthAgg,
      totalSpendYtdAgg,
    ] = await prisma.$transaction([
      prisma.invoice.aggregate({
        _sum: { invoiceTotal: true },
        where: {
          invoiceDate: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
          isCreditNote: false,
        },
      }),
      prisma.invoice.count({
        where: {
          invoiceDate: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
        },
      }),
      prisma.document.count({
        where: {
          createdAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
        },
      }),
      prisma.invoice.aggregate({
        _avg: { invoiceTotal: true },
        where: {
          invoiceDate: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
          isCreditNote: false,
        },
      }),

      prisma.invoice.aggregate({
        _sum: { invoiceTotal: true },
        where: {
          invoiceDate: { gte: startOfPrevMonth, lte: endOfPrevMonth },
          isCreditNote: false,
        },
      }),
      prisma.invoice.count({
        where: {
          invoiceDate: { gte: startOfPrevMonth, lte: endOfPrevMonth },
        },
      }),
      prisma.document.count({
        where: {
          createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth },
        },
      }),
      prisma.invoice.aggregate({
        _avg: { invoiceTotal: true },
        where: {
          invoiceDate: { gte: startOfPrevMonth, lte: endOfPrevMonth },
          isCreditNote: false,
        },
      }),

      prisma.invoice.aggregate({
        _sum: { invoiceTotal: true },
        where: {
          invoiceDate: { gte: startOfYear, lte: endOfCurrentMonth },
          isCreditNote: false,
        },
      }),
    ]);

    const response = {
      currentMonth: {
        totalSpend: totalSpendCurrentMonthAgg._sum.invoiceTotal || 0,
        totalInvoicesProcessed: totalInvoicesCurrentMonthCount || 0,
        documentUploads: documentUploadsCurrentMonthCount || 0,
        averageInvoiceValue:
          avgInvoiceValueCurrentMonthAgg._avg.invoiceTotal || 0,
        totalSpendYTD: totalSpendYtdAgg._sum.invoiceTotal || 0,
      },
      prevMonth: {
        totalSpend: totalSpendPrevMonthAgg._sum.invoiceTotal || 0,
        totalInvoicesProcessed: totalInvoicesPrevMonthCount || 0,
        documentUploads: documentUploadsPrevMonthCount || 0,
        averageInvoiceValue: avgInvoiceValuePrevMonthAgg._avg.invoiceTotal || 0,
      },
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ success: false, message: "Oops! something went wrong" });
  }
});

app.get("/vendors/top-by-invoice", async (req, res) => {
  try {
    const currentYear = 2025;
    const startDateOfYear = new Date(currentYear, 0, 1);
    const endDateOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);
    const vendorInvoiceCounts = await prisma.invoice.groupBy({
      by: ["vendorId"],
      _count: {
        id: true,
      },
      _sum: {
        invoiceTotal: true,
      },
      where: {
        vendorId: { not: null },
        invoiceDate: {
          gte: startDateOfYear,
          lte: endDateOfYear,
        },
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    const vendorIds = vendorInvoiceCounts.map((v) => v.vendorId);

    const vendors = await prisma.vendor.findMany({
      where: {
        id: { in: vendorIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const vendorMap = new Map(vendors.map((v) => [v.id, v.name]));
    const top10Vendors = vendorInvoiceCounts
      .filter((v) => v._sum.invoiceTotal > 0)
      .map((v) => ({
        vendorId: v.vendorId,
        name: vendorMap.get(v.vendorId) || "Unknown Vendor",
        invoiceCount: v._count.id || 0,
        totalSpend: v._sum.invoiceTotal || 0,
      }));

    res.json(top10Vendors);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ success: false, message: "Oops! something went wrong" });
  }
});

app.get("/invoice-trends", async (req, res) => {
  try {
    const trends = await prisma.$queryRaw`
     SELECT
        TO_CHAR("invoiceDate", 'YYYY-MM') AS month,
        COUNT(id)::int AS "invoiceCount",
        SUM("invoiceTotal") AS "totalSpend"
      FROM "invoices"
      WHERE "invoiceDate" IS NOT NULL AND EXTRACT(YEAR FROM "invoiceDate") = 2025
      GROUP BY month
      ORDER BY month ASC;
    `;

    const formattedTrends = trends.map((t) => ({
      ...t,
      totalSpend: t.totalSpend || 0,
    }));

    res.json(formattedTrends);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ success: false, message: "Oops! something went wrong" });
  }
});

app.get("/vendors/top10", async (req, res) => {
  try {
    const vendorSpend = await prisma.invoice.groupBy({
      by: ["vendorId"],
      _sum: {
        invoiceTotal: true,
      },
      where: {
        vendorId: { not: null },
        isCreditNote: false,
      },
      orderBy: {
        _sum: {
          invoiceTotal: "desc",
        },
      },
      take: 10,
    });

    const vendorIds = vendorSpend.map((v) => v.vendorId);

    const vendors = await prisma.vendor.findMany({
      where: {
        id: { in: vendorIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const vendorMap = new Map(vendors.map((v) => [v.id, v.name]));
    const top10Vendors = vendorSpend.map((v) => ({
      vendorId: v.vendorId,
      name: vendorMap.get(v.vendorId) || "Unknown Vendor",
      totalSpend: v._sum.invoiceTotal || 0,
    }));

    res.json(top10Vendors);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ success: false, message: "Oops! something went wrong" });
  }
});

app.get("/category-spend", async (req, res) => {
  try {
    const categorySpend = await prisma.lineItem.groupBy({
      by: ["categoryId"],
      _sum: {
        totalPrice: true,
      },
      where: {
        categoryId: { not: null },
      },
      orderBy: {
        _sum: {
          totalPrice: "desc",
        },
      },
    });

    const categoryIds = categorySpend.map((c) => c.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, code: true },
    });

    const categoryMap = new Map(
      categories.map((c) => [c.id, { name: c.name, code: c.code }])
    );

    const result = categorySpend.map((c) => ({
      categoryId: c.categoryId,
      name: categoryMap.get(c.categoryId)?.name || "Uncategorized",
      code: categoryMap.get(c.categoryId)?.code,
      totalSpend: c._sum.totalPrice || 0,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ success: false, message: "Oops! something went wrong" });
  }
});

app.get("/cash-outflow", async (req, res) => {
  try {
    const outflowData = await prisma.$queryRaw`
      SELECT
        "name",
        SUM("amt") AS "amt"
      FROM (
        SELECT
          CASE
            WHEN p."dueDate" BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN '0-7 days'
            WHEN p."dueDate" BETWEEN CURRENT_DATE + INTERVAL '8 days' AND CURRENT_DATE + INTERVAL '30 days' THEN '8-30 days'
            WHEN p."dueDate" BETWEEN CURRENT_DATE + INTERVAL '31 days' AND CURRENT_DATE + INTERVAL '60 days' THEN '31-60 days'
            WHEN p."dueDate" > CURRENT_DATE + INTERVAL '60 days' THEN '60+ days'
          END AS "name",
          i."invoiceTotal" AS "amt"
        FROM "payments" AS p
        JOIN "invoices" AS i ON p.id = i."paymentId"
        WHERE
          p."dueDate" >= CURRENT_DATE
      ) AS "subquery"
      WHERE "name" IS NOT NULL
      GROUP BY "name"
      ORDER BY
        CASE "name"
          WHEN '0-7 days' THEN 1
          WHEN '8-30 days' THEN 2
          WHEN '31-60 days' THEN 3
          WHEN '60+ days' THEN 4
        END ASC;
    `;

    const outflowMap = new Map([
      ["0-7 days", { name: "0-7 days", amt: 0 }],
      ["8-30 days", { name: "8-30 days", amt: 0 }],
      ["31-60 days", { name: "31-60 days", amt: 0 }],
      ["60+ days", { name: "60+ days", amt: 0 }],
    ]);

    outflowData.forEach((row) => {
      if (outflowMap.has(row.name)) {
        outflowMap.set(row.name, {
          name: row.name,
          amt: Number(row.amt) || 0,
        });
      }
    });

    const formattedOutflow = Array.from(outflowMap.values());

    res.json(formattedOutflow);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ success: false, message: "Oops! something went wrong" });
  }
});

app.get("/invoices", async (req, res) => {
  try {
    const {
      vendorId,
      customerId,
      startDate,
      endDate,
      invoiceNumber,
      page, 
      limit,
      sortType,
    } = req.query;

    const where = {
      isCreditNote: false,
    };
    if (vendorId) where.vendorId = String(vendorId);
    if (customerId) where.customerId = String(customerId);
    if (invoiceNumber) where.invoiceNumber = String(invoiceNumber);
    if (startDate || endDate) {
      where.invoiceDate = {};
      if (startDate) where.invoiceDate.gte = new Date(startDate);
      if (endDate) where.invoiceDate.lte = new Date(endDate);
    }


    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;

    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;
    let orderBy = {};

    switch (sortType) {
      case "min":
        orderBy = { invoiceTotal: "asc" };
        break;
      case "max":
        orderBy = { invoiceTotal: "desc" };
        break;
      default:
        orderBy = { invoiceDate: "desc" };
    }

    const [invoices, totalCount] = await prisma.$transaction([
      prisma.invoice.findMany({
        where,
        skip, 
        take, 
        orderBy: orderBy,
        include: {
          vendor: { select: { name: true } },
          customer: { select: { name: true } },
          payment: { select: { dueDate: true } },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    res.json({
      data: invoices,
      pagination: {
        total: totalCount,
        page: pageNum, 
        limit: limitNum, 
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ success: false, message: "Oops! something went wrong" });
  }
});

app.post("/chat-with-data", async (req, res) => {
  try {
    const { message } = req.body;
    const vannaRes = await fetch(`${process.env.VANNA_SERVICE_API}/chat_sse`, {
      method: "POST",
      body: JSON.stringify({
        conversation_id: "demo-conversation-id-4592342",
        message,
        metaData: {},
        request_id: "demo-requset-id-23239",
      }),
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ success: false, message: "Oops! something went wrong" });
  }
});

app.listen(PORT, (err) => {
  if (err) console.error("❌ Error while starting the server:", err);
  else console.log(`✅ Server started on port ${PORT}`);
});