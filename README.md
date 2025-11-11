# Flowbit Project - Monorepo Setup Guide

A comprehensive guide to set up and run the **Flowbit Project**. This monorepo includes frontend, backend, and a Python-based service with PostgreSQL integration.

### [QUICK VIDEO DEMO](https://youtu.be/rZgeYt4bgcE)
### Hostings
  - Frontend: []()
  - Backend: [https://api-flowbit-project.vercel.app/](https://api-flowbit-project.vercel.app/)
  - Vanna Service: [https://vanna-chat.onrender.com/](https://vanna-chat.onrender.com/)

---

# Table of Contents



- [Flowbit Project - Monorepo Setup Guide](#flowbit-project---monorepo-setup-guide)
    - [QUICK VIDEO DEMO](#quick-video-demo)
    - [Hostings](#hostings)
- [Table of Contents](#table-of-contents)
- [1. Project Requirements](#1-project-requirements)
- [2. Repository Structure](#2-repository-structure)
- [3. Installation](#3-installation)
- [4. Project Setup](#4-project-setup)
    - [4.1. Frontend Setup (apps/web)](#41-frontend-setup-appsweb)
    - [4.2. Backend Setup (apps/api)](#42-backend-setup-appsapi)
    - [4.3. Vanna Service Setup (services/vanna)](#43-vanna-service-setup-servicesvanna)
- [5. Database Setup (with migration)](#5-database-setup-with-migration)
- [6. API Routes and Example Responses](#6-api-routes-and-example-responses)
    - [6.1. GET /v1/stats](#61-get-v1stats)
    - [6.2. GET /v1/invoice-trends](#62-get-v1invoice-trends)
    - [6.3. GET /v1/vendors/top10](#63-get-v1vendorstop10)
    - [6.4. GET /v1/category-spend](#64-get-v1category-spend)
    - [6.5. GET /v1/cash-outflow](#65-get-v1cash-outflow)
    - [6.6. GET /v1/invoices](#66-get-v1invoices)
    - [6.7. POST /v1/chat-with-data](#67-post-v1chat-with-data)
- [7. ER Diagram](#7-er-diagram)

---

# 1. Project Requirements

Before starting, ensure you have the following installed:

* **Node.js** (v18+ recommended)
* **npm** (v9+ recommended)
* **Python 3.10+**
* **pip**
* **PostgreSQL** (v14+)
* Optional: **Virtualenv** for Python environment isolation

---

# 2. Repository Structure

After cloning the repo, the folder structure is as follows:

```text
flowbit-project/
├── apps/
│   ├── web        # Frontend (Next.js)
│   └── api        # Backend (Node.js + Express)
├── services/
│   └── vanna      # Python service with PostgreSQL
└── data/
    └── Analytics_Test_Data.json  # Sample data
```

---

# 3. Installation

Clone the repository:

```sh
git clone https://github.com/aayushsingh7/flowbit-project.git
cd flowbit-project
npm install
```

---

# 4. Project Setup

### 4.1. Frontend Setup (apps/web)

1. Create environment variables `.env.local` inside `/apps/web`:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/v1"
NEXT_PUBLIC_VANNA_API_URL="http://localhost:5001"
```

2. Start the development server:

* From root directory (`flowbit-project`):

```sh
npm run dev:web
```

* From inside `apps/web`:

```sh
npm run dev
```

---

### 4.2. Backend Setup (apps/api)

1. Create environment variables `.env` inside `/apps/api`:

```env
DATABASE_URL="postgresql://[username]:[password]@localhost:5432/demoDB"
PORT=4000
VANNA_SERVICE_API="http://localhost:5001"
```

2. Start the development server:

* From root directory:

```sh
npm run dev:api
```

* From inside `apps/api`:

```sh
npm run dev
```

---

### 4.3. Vanna Service Setup (services/vanna)

1. Navigate to the service folder:

```sh
cd services/vanna
```

2. Set up Python virtual environment:

```sh
python -m venv venv
```

3. Activate the virtual environment:

* On macOS/Linux:

```sh
source venv/bin/activate
```

* On Windows:

```sh
venv\Scripts\activate
```

4. Install required packages:

```sh
pip install -r requirements.txt
```

5. Create environment variables `.env` inside `/services/vanna`:

```env
GEMINI_API_KEY="YOUR_GEMINI_KEY"
FLASK_ENV=development
DATABASE_URL="postgresql://[user]:[password]@localhost:5432/demoDB"
PORT=5001
```

6. Start the Vanna development server:

```sh
python server.py
```

---

# 5. Database Setup (with migration)

1. Navigate to backend folder:

```sh
cd apps/api
```

> **Note:** Make sure your PostgreSQL database is running and accessible.

2. Migrate sample JSON data into PostgreSQL:

```sh
node src/utils/migrate.js
```

3. Update total spends after migration:

```sh
node src/utils/updateTotalSpends.js
```

Your PostgreSQL database is now ready with sample data for testing the Flowbit Project.

---

# 6. API Routes and Example Responses

### 6.1. GET /v1/stats

Returns dashboard overview metrics for quick comparison.

**Response:**

```json
{
  "currentMonth": {
    "totalSpend": 0,
    "totalInvoicesProcessed": 2,
    "documentUploads": 11,
    "averageInvoiceValue": 0,
    "totalSpendYTD": "5680"
  },
  "prevMonth": {
    "totalSpend": 0,
    "totalInvoicesProcessed": 0,
    "documentUploads": 37,
    "averageInvoiceValue": 0
  }
}
```

### 6.2. GET /v1/invoice-trends

Returns invoice count and total spend for the current year (all 12 months).

**Response:**

```json
[
 {
    "month": "2025-01",
    "invoiceCount": 0,
    "totalSpend": "0"
  },
  {
    "month": "2025-02",
    "invoiceCount": 0,
    "totalSpend": "0"
  },
  // [2025-03 - 2025-07]
  {
    "month": "2025-08",
    "invoiceCount": 2,
    "totalSpend": "5680"
  },
  {
    "month": "2025-11",
    "invoiceCount": 2,
    "totalSpend": "-717.58"
  }
  // [2025-12]
]
```

### 6.3. GET /v1/vendors/top10

Returns top 10 vendors based on total spending.

**Response:**

```json
[
  {
    "vendorId": "ecbce347-0c74-45a2-bd73-ce82e7037105",
    "name": "CPB SOFTWARE (GERMANY) GMBH",
    "totalSpend": "14101.44"
  },
  {
    "vendorId": "ed1e24cd-4440-49b8-8437-9a870c411823",
    "name": "EasyFirma GmbH & Co KG",
    "totalSpend": "5680"
  },
  {
    "vendorId": "420ed6f5-2abb-4d89-8d7a-ef4752308f7a",
    "name": "ABC Seller",
    "totalSpend": "4645"
  }
]
```

### 6.4. GET /v1/category-spend

Returns spending by category.

> Note: Since no `category` field existed in the dataset, the `Sachkonto` field was used.

**Response:**

```json
[
  {
    "categoryId": "3ce9d794-b69f-4e3e-ae8f-ebdee83b4fe3",
    "name": "Category 4400",
    "code": "4400",
    "totalSpend": "7087.15"
  },
  {
    "categoryId": "4c2f1de1-1fdc-4d96-8d62-f3e279197356",
    "name": "Category 4910",
    "code": "4910",
    "totalSpend": "2294.9"
  },
  {
    "categoryId": "5892512f-8a88-4f6f-902b-b61417f0d28f",
    "name": "Category 4425",
    "code": "4425",
    "totalSpend": "1720"
  }
]
```

### 6.5. GET /v1/cash-outflow

Returns projected cash outflow grouped by date ranges.

**Response:**

```json
[
  {
    "name": "0-7 days",
    "amt": 0
  },
  {
    "name": "8-30 days",
    "amt": 0
  },
  {
    "name": "31-60 days",
    "amt": 0
  },
  {
    "name": "60+ days",
    "amt": 0
  }
]
```

### 6.6. GET /v1/invoices

Returns filtered invoices based on query parameters.

**Available Query Params:**

```
?vendorId=[VENDOR_ID]
?customerId=[CUSTOMER_ID]
?startDate=[START_DATE]
?endDate=[END_DATE]
?invoiceNumber=[INVOICE_NUMBER]
?page=[PAGE_NO]
?sortType=[SORT_TYPE] // 'date' | 'min' | 'max'
```

**Response:**

```json
{
  "data": [
    {
      "id": "6e775ede-debd-401f-a390-e2317443e5b3",
      "invoiceNumber": "123100401",
      "invoiceDate": "2024-03-01T00:00:00.000Z",
      "invoiceTotal": "381.12",
      "isCreditNote": false,
      "createdAt": "2025-11-10T12:09:56.157Z",
      "updatedAt": "2025-11-10T12:09:56.157Z",
      "paymentId": "49264ed3-d4f2-4e39-ac58-1b9a202389c5",
      "vendorId": "ecbce347-0c74-45a2-bd73-ce82e7037105",
      "customerId": "0b3b90df-cb33-43fc-b993-2fa318ab90b0",
      "vendor": { "name": "CPB SOFTWARE (GERMANY) GMBH" },
      "customer": { "name": "Musterkunde AG
Mr. John Doe" },
      "payment": { "dueDate": null }
    }
  ],
  "pagination": {
    "total": 46,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### 6.7. POST /v1/chat-with-data

Allows natural-language queries mapped to PostgreSQL via LLM.

**Response:**

```json
{}
```
# 7. ER Diagram
![](https://res.cloudinary.com/dvk80x6fi/image/upload/v1762837672/ERD_acglfe.png)