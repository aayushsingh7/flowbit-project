from vanna import Agent
from vanna.core.registry import ToolRegistry
from vanna.core.user import UserResolver, User, RequestContext
from vanna.tools import RunSqlTool, VisualizeDataTool
from vanna.tools.agent_memory import SaveQuestionToolArgsTool, SearchSavedCorrectToolUsesTool, SaveTextMemoryTool
from vanna.servers.fastapi import VannaFastAPIServer
from vanna.integrations.google import GeminiLlmService
from vanna.integrations.postgres import PostgresRunner
from vanna.integrations.local.agent_memory import DemoAgentMemory
from dotenv import load_dotenv
load_dotenv()
import os
DATABASE_URL = os.getenv("DATABASE_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# TRAINING DATA (NOT TRAINED FOR NOW)
db_schema_ddl = """
CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "Vendor" (
    "id" VARCHAR(255) PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "partyNumber" VARCHAR(64) UNIQUE,
    "address" TEXT,
    "taxId" VARCHAR(64),
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL,
    "totalSpend" DECIMAL(30, 2)
);

CREATE TABLE "Customer" (
    "id" VARCHAR(255) PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL
);

CREATE TABLE "Payment" (
    "id" VARCHAR(255) PRIMARY KEY,
    "dueDate" TIMESTAMP,
    "paymentTerms" TEXT,
    "bankAccount" TEXT,
    "bic" TEXT,
    "accountName" TEXT,
    "netDays" INT DEFAULT 0,
    "discountPercent" DECIMAL(5, 2),
    "discountDays" INT,
    "discountedTotal" DECIMAL(30, 2),
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL
);

CREATE TABLE "Invoice" (
    "id" VARCHAR(255) PRIMARY KEY,
    "invoiceNumber" TEXT,
    "invoiceDate" TIMESTAMP,
    "invoiceTotal" DECIMAL(30, 2),
    "isCreditNote" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL,
    "paymentId" VARCHAR(255) UNIQUE,
    "vendorId" VARCHAR(255),
    "customerId" VARCHAR(255),
    FOREIGN KEY ("paymentId") REFERENCES "Payment"("id"),
    FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL,
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
);

CREATE TABLE "Category" (
    "id" VARCHAR(255) PRIMARY KEY,
    "code" VARCHAR(255) UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL
);

CREATE TABLE "Document" (
    "id" VARCHAR(255) PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSizeBytes" INT,
    "fileType" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL,
    "organizationId" TEXT,
    "departmentId" TEXT,
    "metadata" JSONB,
    "extractedData" JSONB,
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "invoiceId" VARCHAR(255) UNIQUE,
    FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id")
);

CREATE TABLE "LineItem" (
    "id" VARCHAR(255) PRIMARY KEY,
    "invoiceId" VARCHAR(255) NOT NULL,
    "srNo" INT,
    "description" TEXT,
    "quantity" DECIMAL(20, 4),
    "unitPrice" DECIMAL(30, 2),
    "totalPrice" DECIMAL(30, 2),
    "sachkonto" TEXT,
    "buschluessel" TEXT,
    "categoryId" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL,
    FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE,
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL
);
"""

llm = GeminiLlmService(
    model="gemini-2.5-flash",
    api_key=GEMINI_API_KEY
)


db_tool = RunSqlTool(
    sql_runner=PostgresRunner(
        connection_string=DATABASE_URL
    )
)

agent_memory = DemoAgentMemory(max_items=1000)

class SimpleUserResolver(UserResolver):
    async def resolve_user(self, request_context: RequestContext) -> User:
        user_email = request_context.get_cookie('vanna_email') or 'guest@example.com'
        group = 'admin' if user_email == 'admin@example.com' else 'user'
        return User(id=user_email, email=user_email, group_memberships=[group])

user_resolver = SimpleUserResolver()

tools = ToolRegistry()
tools.register_local_tool(db_tool, access_groups=['admin', 'user'])
tools.register_local_tool(SaveQuestionToolArgsTool(), access_groups=['admin'])
tools.register_local_tool(SearchSavedCorrectToolUsesTool(), access_groups=['admin', 'user'])
tools.register_local_tool(SaveTextMemoryTool(), access_groups=['admin', 'user'])
tools.register_local_tool(VisualizeDataTool(), access_groups=['admin', 'user'])

agent = Agent(
    llm_service=llm,
    tool_registry=tools,
    user_resolver=user_resolver,
    agent_memory=agent_memory,
)

server = VannaFastAPIServer(agent)
server.run()  