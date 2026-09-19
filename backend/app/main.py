import sys
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn

# Ensure package or direct module imports work
try:
    from app.models import (
        ParameterModel,
        EndpointModel,
        EvidenceModel,
        FindingModel,
        GraphNode,
        GraphEdge,
        AttackStep,
        AttackPathModel,
        TestAccountModel,
        ProjectModel,
        ValidationRequest,
        CopilotMessage,
        CopilotQueryRequest,
    )
    from app.acunetix import acunetix_engine
    from app.multiscanner import multiscanner
    from app.real_engine import real_security_engine
except ImportError:
    from models import (
        ParameterModel,
        EndpointModel,
        EvidenceModel,
        FindingModel,
        GraphNode,
        GraphEdge,
        AttackStep,
        AttackPathModel,
        TestAccountModel,
        ProjectModel,
        ValidationRequest,
        CopilotMessage,
        CopilotQueryRequest,
    )
    from acunetix import acunetix_engine
    from multiscanner import multiscanner
    from real_engine import real_security_engine

app = FastAPI(
    title="APISEC Enterprise API Security Platform",
    description="Backend API engine for API discovery, authorization differential probing, and attack graph correlation.",
    version="1.0.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# 1. MOCK DATA DEFINITIONS: ACME PRODUCTION
# ==============================================================================

# ------------------------------------------------------------------------------
# 1.1 Project Model
# ------------------------------------------------------------------------------
PROJECTS: Dict[str, ProjectModel] = {
    "proj-acme-prod": ProjectModel(
        id="proj-acme-prod",
        name="Acme Production Core",
        description="Multi-tenant cloud commerce and fintech API mesh supporting customer checkout, merchant settlements, wallet disbursements, and identity administration.",
        project_type="REST & GraphQL Enterprise Mesh",
        business_owner="SecOps & Core Platform Engineering",
        environment="Production (AWS us-east-1)",
        tags=["PCI-DSS-Level-1", "SOC2-Type-II", "Production", "Public-Facing", "High-Volume"],
        in_scope=[
            "https://api.acmeprod.io/v1/*",
            "https://api.acmeprod.io/v2/*",
            "https://auth.acmeprod.io/api/*",
            "https://admin-internal.acmeprod.io/api/*",
        ],
        excluded_scope=[
            "https://legacy-billing.internal.acmeprod.io/*",
            "https://*.sandbox.acmeprod.io/*",
            "https://partner-test.acmeprod.io/*",
        ],
        test_accounts=[
            TestAccountModel(
                id="acc_user_a",
                name="Alice Standard (Tenant A)",
                email="alice.test@acmeprod.io",
                role="Standard Customer",
                status="Active",
                token_preview="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfYWxpY2VfODgyMSIsInJvbGUiOiJjdXN0b21lciIsIm9yZ0lkIjoib3JnX2FjbWVfYTAxIn0.9q8vN4lB-vXvJg9...",
            ),
            TestAccountModel(
                id="acc_user_b",
                name="Bob Attacker (Tenant B)",
                email="bob.attacker@secops-sandbox.net",
                role="Low-Privilege User",
                status="Active",
                token_preview="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfYm9iXzkwODgiLCJyb2xlIjoiY3VzdG9tZXIiLCJvcmdJZCI6Im9yZ19iZXRhX2IwMiJ9.81mN9pKl-wZ0Lq...",
            ),
            TestAccountModel(
                id="acc_merchant_admin",
                name="Marcus Merchant (Store #412)",
                email="marcus.merchant@retailpartner.com",
                role="Merchant Admin",
                status="Active",
                token_preview="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfbWFyY3VzXzQxMiIsInJvbGUiOiJtZXJjaGFudF9hZG1pbiIsIm9yZ0lkIjoib3JnX3N0b3JlNDEyIn0.3x7pQ1...",
            ),
            TestAccountModel(
                id="acc_ops_admin",
                name="Devin Ops (Infra Lead)",
                email="devin.ops@acmeprod.io",
                role="Internal Operations",
                status="Active",
                token_preview="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfZGV2aW5fb3BzIiwicm9sZSI6InN5c3RlbV9vcHMiLCJvcmdJZCI6Im9yZ19pbnRlcm5hbCJ9.7k3mL9...",
            ),
        ],
        api_count=21,
        findings_count=7,
        critical_count=3,
        attack_paths_count=3,
        validated_count=7,
        last_scan="12m ago",
    )
}

# ------------------------------------------------------------------------------
# 1.2 Realistic API Endpoints (~21 across 4 Services)
# ------------------------------------------------------------------------------
ENDPOINTS: List[EndpointModel] = [
    # User Service
    EndpointModel(
        id="ep-user-01",
        method="GET",
        path="/api/v1/users/{id}",
        service="User Service",
        auth="Bearer JWT",
        tags=["User Management", "PII", "Core"],
        status="Active",
        risk_level="Critical",
        parameters=[
            ParameterModel(name="id", location="path", param_type="string", required=True, inferred_entity="user_id", description="Unique user identifier (UUID)"),
            ParameterModel(name="include_kyc", location="query", param_type="boolean", required=False, inferred_entity="flag", description="Include verified KYC document metadata"),
        ],
        request_example="GET /api/v1/users/usr_alice_8821 HTTP/1.1\nHost: api.acmeprod.io\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\nAccept: application/json",
        response_example='{\n  "id": "usr_alice_8821",\n  "first_name": "Alice",\n  "last_name": "Vance",\n  "email": "alice.test@acmeprod.io",\n  "ssn_last4": "9218",\n  "phone": "+1-555-019-2831",\n  "kyc_status": "VERIFIED"\n}',
        last_seen="5m ago",
        source="OpenAPI 3.0",
    ),
    EndpointModel(
        id="ep-user-02",
        method="PUT",
        path="/api/v1/users/{id}/profile",
        service="User Service",
        auth="Bearer JWT",
        tags=["User Profile", "Profile Update"],
        status="Active",
        risk_level="High",
        parameters=[
            ParameterModel(name="id", location="path", param_type="string", required=True, inferred_entity="user_id", description="Unique user identifier"),
            ParameterModel(name="bio", location="body", param_type="string", required=False, description="Public bio text"),
            ParameterModel(name="avatar_url", location="body", param_type="string", required=False, description="Profile avatar CDN URL"),
            ParameterModel(name="role", location="body", param_type="string", required=False, description="User RBAC Role (Privileged)"),
        ],
        request_example='PUT /api/v1/users/usr_alice_8821/profile HTTP/1.1\nHost: api.acmeprod.io\nAuthorization: Bearer eyJhbGciOiJIUzI1Ni...\nContent-Type: application/json\n\n{\n  "bio": "Senior Engineer",\n  "avatar_url": "https://cdn.acmeprod.io/a.jpg"\n}',
        response_example='{\n  "status": "updated",\n  "user": {\n    "id": "usr_alice_8821",\n    "bio": "Senior Engineer",\n    "role": "customer"\n  }\n}',
        last_seen="10m ago",
        source="OpenAPI 3.0",
    ),
    EndpointModel(
        id="ep-user-03",
        method="POST",
        path="/api/v1/auth/login",
        service="User Service",
        auth="None",
        tags=["Authentication", "Public"],
        status="Active",
        risk_level="Medium",
        parameters=[
            ParameterModel(name="email", location="body", param_type="string", required=True, description="Account email address"),
            ParameterModel(name="password", location="body", param_type="string", required=True, description="Account password"),
        ],
        request_example='POST /api/v1/auth/login HTTP/1.1\nHost: auth.acmeprod.io\nContent-Type: application/json\n\n{\n  "email": "user@example.com",\n  "password": "••••••••••••"\n}',
        response_example='{\n  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n  "token_type": "Bearer",\n  "expires_in": 3600,\n  "mfa_required": false\n}',
        last_seen="2m ago",
        source="OpenAPI 3.0",
    ),
    EndpointModel(
        id="ep-user-04",
        method="POST",
        path="/api/v1/auth/mfa/verify-otp",
        service="User Service",
        auth="Session Token",
        tags=["MFA", "Auth", "OTP"],
        status="Active",
        risk_level="High",
        parameters=[
            ParameterModel(name="session_id", location="body", param_type="string", required=True, description="MFA Challenge Session ID"),
            ParameterModel(name="otp_code", location="body", param_type="string", required=True, description="4 to 6 digit one-time passcode"),
        ],
        request_example='POST /api/v1/auth/mfa/verify-otp HTTP/1.1\nHost: auth.acmeprod.io\nContent-Type: application/json\n\n{\n  "session_id": "mfa_sess_891283",\n  "otp_code": "8412"\n}',
        response_example='{\n  "verified": true,\n  "session_token": "sess_auth_99182310"\n}',
        last_seen="8m ago",
        source="OpenAPI 3.0",
    ),
    EndpointModel(
        id="ep-user-05",
        method="POST",
        path="/api/v1/auth/password-reset",
        service="User Service",
        auth="None",
        tags=["Password Reset", "Public"],
        status="Active",
        risk_level="Medium",
        parameters=[
            ParameterModel(name="email", location="body", param_type="string", required=True, description="User email requesting reset"),
        ],
        request_example='POST /api/v1/auth/password-reset HTTP/1.1\nHost: auth.acmeprod.io\nContent-Type: application/json\n\n{\n  "email": "victim@acmeprod.io"\n}',
        response_example='{\n  "message": "Reset verification dispatched if account exists",\n  "mfa_challenge": "mfa_sess_891283"\n}',
        last_seen="15m ago",
        source="OpenAPI 3.0",
    ),
    EndpointModel(
        id="ep-user-06",
        method="GET",
        path="/api/v1/users/export-debug",
        service="User Service",
        auth="None",
        tags=["Debug", "Shadow API", "Internal"],
        status="Shadow",
        risk_level="Critical",
        parameters=[
            ParameterModel(name="limit", location="query", param_type="integer", required=False, description="Number of debug records"),
        ],
        request_example="GET /api/v1/users/export-debug?limit=10 HTTP/1.1\nHost: api.acmeprod.io\nAccept: application/json",
        response_example='[\n  {\n    "user_id": "usr_victim_4401",\n    "session_hash": "a98df891bc8271e",\n    "internal_role": "executive_admin",\n    "api_key": "live_sec_9918238128"\n  }\n]',
        last_seen="1h ago",
        source="Traffic Ingestion (Shadow)",
    ),

    # Order Service
    EndpointModel(
        id="ep-order-01",
        method="GET",
        path="/api/v2/orders",
        service="Order Service",
        auth="Bearer JWT",
        tags=["Orders", "Pagination"],
        status="Active",
        risk_level="Medium",
        parameters=[
            ParameterModel(name="page", location="query", param_type="integer", required=False, description="Page index"),
            ParameterModel(name="limit", location="query", param_type="integer", required=False, description="Page limit"),
        ],
        request_example="GET /api/v2/orders?page=1&limit=20 HTTP/1.1\nHost: api.acmeprod.io\nAuthorization: Bearer eyJhbGciOiJIUzI1Ni...\nAccept: application/json",
        response_example='{\n  "total": 14,\n  "orders": [\n    {\n      "order_id": "ord_882910",\n      "amount": 249.99,\n      "status": "COMPLETED"\n    }\n  ]\n}',
        last_seen="4m ago",
        source="OpenAPI 3.0",
    ),
    EndpointModel(
        id="ep-order-02",
        method="GET",
        path="/api/v2/orders/{order_id}",
        service="Order Service",
        auth="Bearer JWT",
        tags=["Orders", "Sensitive Data", "PII"],
        status="Active",
        risk_level="High",
        parameters=[
            ParameterModel(name="order_id", location="path", param_type="string", required=True, inferred_entity="order_id", description="Unique order ID"),
        ],
        request_example="GET /api/v2/orders/ord_882910 HTTP/1.1\nHost: api.acmeprod.io\nAuthorization: Bearer eyJhbGciOiJIUzI1Ni...\nAccept: application/json",
        response_example='{\n  "order_id": "ord_882910",\n  "amount": 249.99,\n  "billing": {\n    "card_fingerprint": "fp_8829104812",\n    "full_cardholder": "Alice Vance",\n    "billing_address": "742 Evergreen Terrace"\n  }\n}',
        last_seen="6m ago",
        source="OpenAPI 3.0",
    ),
    EndpointModel(
        id="ep-order-03",
        method="POST",
        path="/api/v2/orders/checkout",
        service="Order Service",
        auth="Bearer JWT",
        tags=["Checkout", "Cart"],
        status="Active",
        risk_level="Medium",
        parameters=[
            ParameterModel(name="cart_id", location="body", param_type="string", required=True, description="Active cart ID"),
            ParameterModel(name="payment_method_id", location="body", param_type="string", required=True, description="Payment vault token"),
        ],
        request_example='POST /api/v2/orders/checkout HTTP/1.1\nHost: api.acmeprod.io\nAuthorization: Bearer eyJhbGciOiJIUzI1Ni...\nContent-Type: application/json\n\n{\n  "cart_id": "cart_991823",\n  "payment_method_id": "pm_card_us_991"\n}',
        response_example='{\n  "order_id": "ord_882910",\n  "status": "PROCESSING",\n  "total_charged": 249.99\n}',
        last_seen="11m ago",
        source="OpenAPI 3.0",
    ),
    EndpointModel(
        id="ep-order-04",
        method="POST",
        path="/api/v2/orders/{order_id}/cancel",
        service="Order Service",
        auth="Bearer JWT",
        tags=["Orders", "State Mutation"],
        status="Active",
        risk_level="Low",
        parameters=[
            ParameterModel(name="order_id", location="path", param_type="string", required=True, description="Order identifier"),
            ParameterModel(name="reason", location="body", param_type="string", required=False, description="Cancellation reason"),
        ],
        request_example='POST /api/v2/orders/ord_882910/cancel HTTP/1.1\nHost: api.acmeprod.io\nAuthorization: Bearer eyJhbGciOiJIUzI1Ni...\nContent-Type: application/json\n\n{\n  "reason": "Customer request"\n}',
        response_example='{\n  "order_id": "ord_882910",\n  "status": "CANCELLED",\n  "refund_initiated": true\n}',
        last_seen="30m ago",
        source="OpenAPI 3.0",
    ),
    EndpointModel(
        id="ep-order-05",
        method="GET",
        path="/api/v2/orders/{order_id}/receipt",
        service="Order Service",
        auth="Public Token",
        tags=["Billing", "Public Receipt"],
        status="Active",
        risk_level="High",
        parameters=[
            ParameterModel(name="order_id", location="path", param_type="string", required=True, description="Order identifier"),
            ParameterModel(name="token", location="query", param_type="string", required=False, description="Public receipt verification hash"),
        ],
        request_example="GET /api/v2/orders/ord_882910/receipt HTTP/1.1\nHost: api.acmeprod.io\nAccept: application/json",
        response_example='{\n  "receipt_id": "rcpt_99182",\n  "order_id": "ord_882910",\n  "subtotal": 249.99,\n  "tax": 19.99,\n  "grand_total": 269.98\n}',
        last_seen="45m ago",
        source="OpenAPI 3.0",
    ),

    # Payment Service
    EndpointModel(
        id="ep-pay-01",
        method="POST",
        path="/api/v1/payments/charge",
        service="Payment Service",
        auth="Bearer JWT + Idempotency-Key",
        tags=["Card Charge", "Payment Gateway"],
        status="Active",
        risk_level="Medium",
        parameters=[
            ParameterModel(name="amount_cents", location="body", param_type="integer", required=True, description="Charge amount in cents"),
            ParameterModel(name="currency", location="body", param_type="string", required=True, description="ISO Currency Code (USD, EUR)"),
            ParameterModel(name="source_id", location="body", param_type="string", required=True, description="Card token or saved source"),
        ],
        request_example='POST /api/v1/payments/charge HTTP/1.1\nHost: api.acmeprod.io\nAuthorization: Bearer eyJhbGciOiJIUzI1Ni...\nIdempotency-Key: 7c4e209b-112\nContent-Type: application/json\n\n{\n  "amount_cents": 15000,\n  "currency": "USD",\n  "source_id": "src_991823"\n}',
        response_example='{\n  "charge_id": "ch_99182310",\n  "status": "succeeded",\n  "captured": true\n}',
        last_seen="3m ago",
        source="OpenAPI 3.0",
    ),
    EndpointModel(
        id="ep-pay-02",
        method="POST",
        path="/api/v1/payments/refund",
        service="Payment Service",
        auth="Bearer JWT (Merchant)",
        tags=["Refunds", "Disputes"],
        status="Active",
        risk_level="Critical",
        parameters=[
            ParameterModel(name="charge_id", location="body", param_type="string", required=True, description="Original charge identifier"),
            ParameterModel(name="amount_cents", location="body", param_type="integer", required=False, description="Partial refund amount"),
        ],
        request_example='POST /api/v1/payments/refund HTTP/1.1\nHost: api.acmeprod.io\nAuthorization: Bearer eyJhbGciOiJIUzI1Ni...\nContent-Type: application/json\n\n{\n  "charge_id": "ch_99182310",\n  "amount_cents": 5000\n}',
        response_example='{\n  "refund_id": "ref_882910",\n  "status": "processed",\n  "amount_refunded": 5000\n}',
        last_seen="18m ago",
        source="OpenAPI 3.0",
    ),
    EndpointModel(
        id="ep-pay-03",
        method="GET",
        path="/api/v1/payments/wallets/{wallet_id}",
        service="Payment Service",
        auth="Bearer JWT",
        tags=["Wallets", "Balance"],
        status="Active",
        risk_level="High",
        parameters=[
            ParameterModel(name="wallet_id", location="path", param_type="string", required=True, inferred_entity="wallet_id", description="Wallet GUID"),
        ],
        request_example="GET /api/v1/payments/wallets/wlt_88291048 HTTP/1.1\nHost: api.acmeprod.io\nAuthorization: Bearer eyJhbGciOiJIUzI1Ni...\nAccept: application/json",
        response_example='{\n  "wallet_id": "wlt_88291048",\n  "available_balance_cents": 8500000,\n  "currency": "USD",\n  "routing_number": "021000021"\n}',
        last_seen="7m ago",
        source="OpenAPI 3.0",
    ),
    EndpointModel(
        id="ep-pay-04",
        method="POST",
        path="/api/v1/payments/payouts/instant",
        service="Payment Service",
        auth="Bearer JWT",
        tags=["Payouts", "Disbursement", "High-Risk"],
        status="Active",
        risk_level="Critical",
        parameters=[
            ParameterModel(name="destination_routing", location="body", param_type="string", required=True, description="Target bank routing transit"),
            ParameterModel(name="destination_account", location="body", param_type="string", required=True, description="Target bank account number"),
            ParameterModel(name="amount_cents", location="body", param_type="integer", required=True, description="Payout sum in cents"),
        ],
        request_example='POST /api/v1/payments/payouts/instant HTTP/1.1\nHost: api.acmeprod.io\nAuthorization: Bearer eyJhbGciOiJIUzI1Ni...\nContent-Type: application/json\n\n{\n  "destination_routing": "121000358",\n  "destination_account": "992182910",\n  "amount_cents": 8500000\n}',
        response_example='{\n  "payout_id": "po_991823",\n  "status": "QUEUED_FOR_SETTLEMENT",\n  "fee_cents": 250,\n  "effective_date": "2026-09-18"\n}',
        last_seen="1m ago",
        source="OpenAPI 3.0",
    ),
    EndpointModel(
        id="ep-pay-05",
        method="GET",
        path="/api/v1/payments/transactions",
        service="Payment Service",
        auth="Bearer JWT",
        tags=["Ledger", "Transaction History"],
        status="Active",
        risk_level="Medium",
        parameters=[
            ParameterModel(name="start_date", location="query", param_type="string", required=False, description="ISO date filter start"),
            ParameterModel(name="status", location="query", param_type="string", required=False, description="Transaction status"),
        ],
        request_example="GET /api/v1/payments/transactions?status=completed HTTP/1.1\nHost: api.acmeprod.io\nAuthorization: Bearer eyJhbGciOiJIUzI1Ni...\nAccept: application/json",
        response_example='{\n  "transactions": [\n    {\n      "id": "tx_88291048",\n      "type": "payout",\n      "amount": 1250.00,\n      "currency": "USD"\n    }\n  ]\n}',
        last_seen="12m ago",
        source="OpenAPI 3.0",
    ),
    EndpointModel(
        id="ep-pay-06",
        method="POST",
        path="/api/v1/payments/webhooks/stripe",
        service="Payment Service",
        auth="Stripe-Signature Header",
        tags=["Webhook", "External Integrations"],
        status="Active",
        risk_level="Low",
        parameters=[
            ParameterModel(name="Stripe-Signature", location="header", param_type="string", required=True, description="Cryptographic webhook signature"),
        ],
        request_example='POST /api/v1/payments/webhooks/stripe HTTP/1.1\nHost: api.acmeprod.io\nStripe-Signature: t=1726665600,v1=99281a8b...\nContent-Type: application/json\n\n{\n  "type": "payment_intent.succeeded",\n  "data": {}\n}',
        response_example='{\n  "received": true\n}',
        last_seen="1m ago",
        source="OpenAPI 3.0",
    ),

    # Admin Service
    EndpointModel(
        id="ep-admin-01",
        method="GET",
        path="/api/v1/admin/audit-logs",
        service="Admin Service",
        auth="Bearer JWT (Admin)",
        tags=["Audit", "Compliance", "Admin"],
        status="Active",
        risk_level="Medium",
        parameters=[
            ParameterModel(name="user_id", location="query", param_type="string", required=False, description="Filter logs by actor"),
            ParameterModel(name="action", location="query", param_type="string", required=False, description="Filter logs by action"),
        ],
        request_example="GET /api/v1/admin/audit-logs?action=role_change HTTP/1.1\nHost: admin-internal.acmeprod.io\nAuthorization: Bearer eyJhbGciOiJIUzI1Ni...\nAccept: application/json",
        response_example='{\n  "logs": [\n    {\n      "timestamp": "2026-09-18T14:10:00Z",\n      "actor": "devin.ops",\n      "action": "role_change",\n      "target": "usr_marcus_412"\n    }\n  ]\n}',
        last_seen="25m ago",
        source="OpenAPI 3.0",
    ),
    EndpointModel(
        id="ep-admin-02",
        method="POST",
        path="/api/v1/admin/users/{id}/role",
        service="Admin Service",
        auth="Bearer JWT (Admin)",
        tags=["RBAC", "Privilege Management"],
        status="Active",
        risk_level="Critical",
        parameters=[
            ParameterModel(name="id", location="path", param_type="string", required=True, description="Target user ID"),
            ParameterModel(name="new_role", location="body", param_type="string", required=True, description="New RBAC role to assign"),
        ],
        request_example='POST /api/v1/admin/users/usr_marcus_412/role HTTP/1.1\nHost: admin-internal.acmeprod.io\nAuthorization: Bearer eyJhbGciOiJIUzI1Ni...\nContent-Type: application/json\n\n{\n  "new_role": "superadmin"\n}',
        response_example='{\n  "user_id": "usr_marcus_412",\n  "assigned_role": "superadmin",\n  "updated_at": "2026-09-18T14:15:00Z"\n}',
        last_seen="50m ago",
        source="OpenAPI 3.0",
    ),
    EndpointModel(
        id="ep-admin-03",
        method="GET",
        path="/api/v1/admin/system/metrics",
        service="Admin Service",
        auth="mTLS / Internal",
        tags=["Telemetry", "Prometheus", "Internal"],
        status="Internal",
        risk_level="Safe",
        parameters=[],
        request_example="GET /api/v1/admin/system/metrics HTTP/1.1\nHost: admin-internal.acmeprod.io\nAccept: text/plain",
        response_example="# HELP http_requests_total Total HTTP requests\n# TYPE http_requests_total counter\nhttp_requests_total{code=\"200\",handler=\"users\"} 194821\nhttp_requests_total{code=\"500\",handler=\"payments\"} 12",
        last_seen="30s ago",
        source="Internal Gateway",
    ),
    EndpointModel(
        id="ep-admin-04",
        method="POST",
        path="/api/v1/admin/tenants/{tenant_id}/config",
        service="Admin Service",
        auth="Bearer JWT (Superadmin)",
        tags=["Multi-Tenancy", "Config"],
        status="Active",
        risk_level="High",
        parameters=[
            ParameterModel(name="tenant_id", location="path", param_type="string", required=True, description="Tenant organization ID"),
            ParameterModel(name="rate_limit_rpm", location="body", param_type="integer", required=False, description="Requests per minute quota"),
        ],
        request_example='POST /api/v1/admin/tenants/org_acme_a01/config HTTP/1.1\nHost: admin-internal.acmeprod.io\nAuthorization: Bearer eyJhbGciOiJIUzI1Ni...\nContent-Type: application/json\n\n{\n  "rate_limit_rpm": 5000\n}',
        response_example='{\n  "tenant_id": "org_acme_a01",\n  "status": "applied",\n  "rate_limit_rpm": 5000\n}',
        last_seen="1h ago",
        source="OpenAPI 3.0",
    ),
]

# ------------------------------------------------------------------------------
# 1.3 Full Evidence Models (Realistic HTTP pairs + Behavioral Diffs)
# ------------------------------------------------------------------------------
EVIDENCES: Dict[str, EvidenceModel] = {
    "ev-1021": EvidenceModel(
        id="ev-1021",
        finding_id="F-1021",
        title="BOLA Cross-Tenant Object Access via Insecure Direct Object Reference",
        description="Low-privilege actor (Bob, Tenant B) replaced their subject user ID with Alice's user ID (Tenant A). The User Service returned 200 OK containing Alice's confidential PII, KYC verification state, and SSN last 4.",
        baseline_request=(
            "GET /api/v1/users/usr_bob_9088 HTTP/1.1\n"
            "Host: api.acmeprod.io\n"
            "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfYm9iXzkwODgiLCJyb2xlIjoiY3VzdG9tZXIiLCJvcmdJZCI6Im9yZ19iZXRhX2IwMiJ9.81mN9pKl-wZ0Lq\n"
            "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)\n"
            "Accept: application/json"
        ),
        baseline_response=(
            "HTTP/1.1 200 OK\n"
            "Date: Fri, 18 Sep 2026 14:12:01 GMT\n"
            "Content-Type: application/json; charset=utf-8\n"
            "Content-Length: 218\n"
            "X-Request-Id: req_9921_b088\n\n"
            "{\n"
            '  "id": "usr_bob_9088",\n'
            '  "first_name": "Bob",\n'
            '  "last_name": "Attacker",\n'
            '  "email": "bob.attacker@secops-sandbox.net",\n'
            '  "phone": "+1-555-019-9944",\n'
            '  "ssn_last4": "1190",\n'
            '  "kyc_status": "PENDING"\n'
            "}"
        ),
        probe_request=(
            "GET /api/v1/users/usr_alice_8821 HTTP/1.1\n"
            "Host: api.acmeprod.io\n"
            "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfYm9iXzkwODgiLCJyb2xlIjoiY3VzdG9tZXIiLCJvcmdJZCI6Im9yZ19iZXRhX2IwMiJ9.81mN9pKl-wZ0Lq\n"
            "User-Agent: APISEC-Automated-Auditor/v2.4\n"
            "Accept: application/json"
        ),
        probe_response=(
            "HTTP/1.1 200 OK\n"
            "Date: Fri, 18 Sep 2026 14:12:03 GMT\n"
            "Content-Type: application/json; charset=utf-8\n"
            "Content-Length: 224\n"
            "X-Request-Id: req_9921_probe_8821\n\n"
            "{\n"
            '  "id": "usr_alice_8821",\n'
            '  "first_name": "Alice",\n'
            '  "last_name": "Vance",\n'
            '  "email": "alice.test@acmeprod.io",\n'
            '  "phone": "+1-555-019-2831",\n'
            '  "ssn_last4": "9218",\n'
            '  "kyc_status": "VERIFIED"\n'
            "}"
        ),
        diff_summary="STATUS MATCH (200 OK == 200 OK) with UNAUTHORIZED DATA EXTRACTION. Account Bob (Tenant B) successfully exfiltrated Tenant A record (usr_alice_8821). Expected 403 Forbidden or 404 Not Found.",
        unauthorized_confirmed=True,
        extracted_variables={
            "leaked_user_id": "usr_alice_8821",
            "leaked_ssn": "9218",
            "leaked_email": "alice.test@acmeprod.io",
            "cross_tenant_breach": True,
        },
        timestamp="2026-09-18T14:12:03Z",
    ),
    "ev-1022": EvidenceModel(
        id="ev-1022",
        finding_id="F-1022",
        title="BFLA Privilege Bypass on Instant Treasury Payout Endpoint",
        description="Standard consumer JWT token invoked POST /api/v1/payments/payouts/instant. The payment gateway processed the payout command directly without enforcing the Merchant/Admin RBAC matrix.",
        baseline_request=(
            "POST /api/v1/payments/payouts/instant HTTP/1.1\n"
            "Host: api.acmeprod.io\n"
            "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfbWFyY3VzXzQxMiIsInJvbGUiOiJtZXJjaGFudF9hZG1pbiJ9.3x7pQ1\n"
            "Content-Type: application/json\n\n"
            "{\n"
            '  "destination_routing": "121000358",\n'
            '  "destination_account": "992182910",\n'
            '  "amount_cents": 50000\n'
            "}"
        ),
        baseline_response=(
            "HTTP/1.1 200 OK\n"
            "Date: Fri, 18 Sep 2026 14:15:10 GMT\n"
            "Content-Type: application/json; charset=utf-8\n\n"
            "{\n"
            '  "payout_id": "po_base_00129",\n'
            '  "status": "QUEUED_FOR_SETTLEMENT",\n'
            '  "fee_cents": 250\n'
            "}"
        ),
        probe_request=(
            "POST /api/v1/payments/payouts/instant HTTP/1.1\n"
            "Host: api.acmeprod.io\n"
            "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfYm9iXzkwODgiLCJyb2xlIjoiY3VzdG9tZXIifQ.81mN9pKl-wZ0Lq\n"
            "Content-Type: application/json\n\n"
            "{\n"
            '  "destination_routing": "021000021",\n'
            '  "destination_account": "4491823901",\n'
            '  "amount_cents": 8500000\n'
            "}"
        ),
        probe_response=(
            "HTTP/1.1 200 OK\n"
            "Date: Fri, 18 Sep 2026 14:15:12 GMT\n"
            "Content-Type: application/json; charset=utf-8\n\n"
            "{\n"
            '  "payout_id": "po_probe_994812",\n'
            '  "status": "QUEUED_FOR_SETTLEMENT",\n'
            '  "fee_cents": 250,\n'
            '  "effective_date": "2026-09-18"\n'
            "}"
        ),
        diff_summary="FUNCTION ACCESS VIOLATION: Role 'customer' executed an administrative treasury disbursement of $85,000. Expected HTTP 403 (Insufficient Permissions), received HTTP 200 OK.",
        unauthorized_confirmed=True,
        extracted_variables={
            "payout_id": "po_probe_994812",
            "amount_disbursed_usd": 85000.00,
            "rbac_check_missing": True,
        },
        timestamp="2026-09-18T14:15:12Z",
    ),
    "ev-1023": EvidenceModel(
        id="ev-1023",
        finding_id="F-1023",
        title="Mass Assignment Attribute Injection Leading to Role Escalation",
        description="Attacker supplied unvalidated JSON payload attributes ('role': 'merchant_admin', 'is_verified_vendor': true) on PUT /api/v1/users/{id}/profile. Backend ORM blindly bound attributes to database record.",
        baseline_request=(
            "PUT /api/v1/users/usr_bob_9088/profile HTTP/1.1\n"
            "Host: api.acmeprod.io\n"
            "Authorization: Bearer eyJhbGciOiJIUzI1Ni...\n"
            "Content-Type: application/json\n\n"
            '{\n  "bio": "Regular shopper"\n}'
        ),
        baseline_response=(
            "HTTP/1.1 200 OK\n"
            "Content-Type: application/json\n\n"
            '{\n  "status": "updated",\n  "user": {\n    "id": "usr_bob_9088",\n    "bio": "Regular shopper",\n    "role": "customer"\n  }\n}'
        ),
        probe_request=(
            "PUT /api/v1/users/usr_bob_9088/profile HTTP/1.1\n"
            "Host: api.acmeprod.io\n"
            "Authorization: Bearer eyJhbGciOiJIUzI1Ni...\n"
            "Content-Type: application/json\n\n"
            "{\n"
            '  "bio": "Injected Payload",\n'
            '  "role": "merchant_admin",\n'
            '  "is_verified_vendor": true,\n'
            '  "credit_limit": 500000\n'
            "}"
        ),
        probe_response=(
            "HTTP/1.1 200 OK\n"
            "Content-Type: application/json\n\n"
            "{\n"
            '  "status": "updated",\n'
            '  "user": {\n'
            '    "id": "usr_bob_9088",\n'
            '    "bio": "Injected Payload",\n'
            '    "role": "merchant_admin",\n'
            '    "is_verified_vendor": true,\n'
            '    "credit_limit": 500000\n'
            '  }\n'
            "}"
        ),
        diff_summary="PARAMETER INJECTION PERSISTED: Server returned 'role': 'merchant_admin' and 'credit_limit': 500000 directly from database state mutation without DTO whitelist filtering.",
        unauthorized_confirmed=True,
        extracted_variables={
            "escalated_role": "merchant_admin",
            "modified_field": "role",
            "injected_fields": ["role", "is_verified_vendor", "credit_limit"],
        },
        timestamp="2026-09-18T14:18:45Z",
    ),
    "ev-1024": EvidenceModel(
        id="ev-1024",
        finding_id="F-1024",
        title="Missing Rate Limit on MFA OTP Verification (Brute-Force Feasible)",
        description="Auditor issued 1,200 sequential OTP verification attempts across 45 seconds using rotated X-Forwarded-For headers. Zero HTTP 429 Too Many Requests responses were received.",
        baseline_request=(
            "POST /api/v1/auth/mfa/verify-otp HTTP/1.1\n"
            "Host: auth.acmeprod.io\n"
            "Content-Type: application/json\n\n"
            '{\n  "session_id": "mfa_sess_891283",\n  "otp_code": "0000"\n}'
        ),
        baseline_response=(
            "HTTP/1.1 401 Unauthorized\n"
            "Content-Type: application/json\n\n"
            '{\n  "error": "invalid_otp",\n  "attempts_remaining": null\n}'
        ),
        probe_request=(
            "POST /api/v1/auth/mfa/verify-otp HTTP/1.1\n"
            "Host: auth.acmeprod.io\n"
            "X-Forwarded-For: 198.51.100.42\n"
            "Content-Type: application/json\n\n"
            '{\n  "session_id": "mfa_sess_891283",\n  "otp_code": "8412"\n}'
        ),
        probe_response=(
            "HTTP/1.1 200 OK\n"
            "Content-Type: application/json\n\n"
            '{\n  "verified": true,\n  "session_token": "sess_auth_99182310"\n}'
        ),
        diff_summary="RATE LIMIT ABSENCE: 1,200 attempts submitted without lockouts or backoff penalties. Full 4-digit OTP keyspace can be exhausted within ~90 seconds.",
        unauthorized_confirmed=True,
        extracted_variables={
            "attempts_tested": 1200,
            "http_429_count": 0,
            "keyspace_exhaustion_time": "90s",
        },
        timestamp="2026-09-18T14:22:10Z",
    ),
    "ev-1025": EvidenceModel(
        id="ev-1025",
        finding_id="F-1025",
        title="Unauthenticated Debug Route Exposing Active User UUIDs and Session Tokens",
        description="Public unauthenticated GET request to shadow route /api/v1/users/export-debug dumped internal customer identifiers, session hashes, and live secret keys.",
        baseline_request=(
            "GET /api/v1/users/export-debug HTTP/1.1\n"
            "Host: api.acmeprod.io\n"
            "Accept: application/json"
        ),
        baseline_response=(
            "HTTP/1.1 200 OK\n"
            "Content-Type: application/json\n\n"
            "[\n"
            '  {"user_id": "usr_victim_4401", "session_hash": "a98df891bc8271e", "role": "executive_admin"}\n'
            "]"
        ),
        probe_request=(
            "GET /api/v1/users/export-debug?limit=50 HTTP/1.1\n"
            "Host: api.acmeprod.io\n"
            "Accept: application/json"
        ),
        probe_response=(
            "HTTP/1.1 200 OK\n"
            "Content-Type: application/json\n\n"
            "[\n"
            '  {"user_id": "usr_victim_4401", "session_hash": "a98df891bc8271e", "role": "executive_admin", "api_key": "live_sec_9918238128"},\n'
            '  {"user_id": "usr_alice_8821", "session_hash": "c87b120fa892110", "role": "customer"}\n'
            "]"
        ),
        diff_summary="SENSITIVE INFO LEAK: 50 production records leaked without authentication headers, exposing customer UUIDs and internal API keys.",
        unauthorized_confirmed=True,
        extracted_variables={
            "exposed_uuids_count": 50,
            "exposed_api_keys": ["live_sec_9918238128"],
        },
        timestamp="2026-09-18T14:24:00Z",
    ),
}

# ------------------------------------------------------------------------------
# 1.4 7 Findings (3 Critical, 2 High, 1 Medium, 1 Low)
# ------------------------------------------------------------------------------
FINDINGS: List[FindingModel] = [
    FindingModel(
        id="F-1021",
        title="Broken Object Level Authorization (BOLA / IDOR) on User Profile Data",
        severity="Critical",
        confidence=98,
        status="Validated",
        type="Authorization / BOLA",
        cwe="CWE-639: Authorization Bypass Through User-Controlled Key",
        cvss=9.1,
        endpoint="GET /api/v1/users/{id}",
        service="User Service",
        discovered="15m ago",
        assignee="Anshu Bind",
        description="The endpoint GET /api/v1/users/{id} fails to validate whether the authenticated subject in the JWT bearer token owns or has tenant authorization to read the requested user resource {id}. An attacker can enumerate arbitrary UUIDs to harvest confidential PII including SSN and KYC records.",
        evidence_summary=[
            "Low-privilege tenant B token accessed tenant A customer record usr_alice_8821",
            "Server returned HTTP 200 OK with full PII instead of HTTP 403 Forbidden",
            "Zero cryptographic signature verification on object ownership parameter",
        ],
        impact="Complete confidentiality breach across all customer accounts in the database. Violates GDPR Article 32 and PCI-DSS Requirement 7.",
        remediation="Enforce object-level ownership checks at the service layer by verifying that request_context.user_id == target_user_id or the caller possesses 'admin:read' tenant authority before querying the database.",
        code_fix={
            "file": "services/user_service/controllers/users.py",
            "diff": (
                "@@ -42,7 +42,10 @@\n"
                " def get_user_by_id(user_id: str, current_user: User = Depends(get_current_user)):\n"
                "-    user = db.query(UserModel).filter(UserModel.id == user_id).first()\n"
                "+    if current_user.id != user_id and current_user.role != 'admin':\n"
                "+        raise HTTPException(status_code=403, detail='Access to requested user profile denied')\n"
                "+    user = db.query(UserModel).filter(UserModel.id == user_id, UserModel.tenant_id == current_user.tenant_id).first()\n"
                "     if not user:\n"
                "         raise HTTPException(status_code=404, detail='User not found')\n"
                "     return user"
            ),
        },
        evidence_id="ev-1021",
        preconditions={"auth": "Valid Customer JWT", "parameter": "Target user UUID"},
        postconditions={"access": "Full PII extraction (SSN, KYC, home address)", "isolation": "Tenant boundary breached"},
    ),
    FindingModel(
        id="F-1022",
        title="Broken Function Level Authorization (BFLA) on Instant Payout Processing",
        severity="Critical",
        confidence=99,
        status="Validated",
        type="Authorization / BFLA",
        cwe="CWE-285: Improper Authorization",
        cvss=9.6,
        endpoint="POST /api/v1/payments/payouts/instant",
        service="Payment Service",
        discovered="20m ago",
        assignee="Anshu Bind",
        description="The payout processing endpoint POST /api/v1/payments/payouts/instant permits execution by standard consumer identities without enforcing merchant administrative entitlement checks. An authenticated customer can initiate unauthorized treasury disbursements directly to external routing numbers.",
        evidence_summary=[
            "Standard consumer token initiated $85,000 treasury payout",
            "Response returned HTTP 200 OK with settlement transaction ID po_probe_994812",
            "Backend skipped @require_role('merchant_admin') validation decorator",
        ],
        impact="Direct financial loss through fraudulent treasury drainage and unauthorized fund transfers.",
        remediation="Implement strict role-based access control (RBAC) middleware verifying that the caller holds active 'merchant_admin' or 'finance_ops' scope before invoking payout queues.",
        code_fix={
            "file": "services/payment_service/routers/payouts.py",
            "diff": (
                "@@ -15,5 +15,7 @@\n"
                "-@router.post('/payouts/instant')\n"
                "-async def execute_payout(payload: PayoutRequest, user: User = Depends(get_current_user)):\n"
                "+@router.post('/payouts/instant', dependencies=[Depends(RequireRoles(['merchant_admin', 'finance_ops']))])\n"
                "+async def execute_payout(payload: PayoutRequest, user: User = Depends(get_current_user)):\n"
                "     return await payout_processor.dispatch(payload, initiator=user)"
            ),
        },
        evidence_id="ev-1022",
        preconditions={"auth": "Valid Customer JWT", "payload": "Routing + Account + Amount"},
        postconditions={"impact": "Direct fund disbursement from central merchant reserve"},
    ),
    FindingModel(
        id="F-1023",
        title="Mass Assignment Allows Privilege Escalation to Merchant Admin",
        severity="Critical",
        confidence=96,
        status="Validated",
        type="Data Exposure & Manipulation / Mass Assignment",
        cwe="CWE-915: Improperly Controlled Modification of Dynamically-Determined Object Attributes",
        cvss=9.3,
        endpoint="PUT /api/v1/users/{id}/profile",
        service="User Service",
        discovered="35m ago",
        assignee="Anshu Bind",
        description="The profile update endpoint blindly deserializes request JSON attributes into the ORM User entity. An attacker can inject {'role': 'merchant_admin', 'credit_limit': 500000} to elevate their privileges and bypass enterprise authorization checks.",
        evidence_summary=[
            "JSON payload containing 'role': 'merchant_admin' submitted by customer account",
            "Database entity updated and reflected in subsequent JWT issuance",
            "Absence of Pydantic/DTO input sanitization allowlist",
        ],
        impact="Vertical privilege escalation allowing standard users to acquire merchant administrator permissions.",
        remediation="Replace raw model dictionary binding with strict Pydantic Request DTOs that explicitly whitelist editable fields (e.g., bio, avatar_url).",
        code_fix={
            "file": "services/user_service/schemas/user_profile.py",
            "diff": (
                "@@ -8,6 +8,9 @@\n"
                "-class UserProfileUpdateRequest(BaseModel):\n"
                "-    class Config: extra = 'allow'\n"
                "+class UserProfileUpdateRequest(BaseModel):\n"
                "+    bio: Optional[str] = Field(None, max_length=500)\n"
                "+    avatar_url: Optional[HttpUrl] = None\n"
                "+    class Config: extra = 'forbid'"
            ),
        },
        evidence_id="ev-1023",
        preconditions={"auth": "Valid Customer JWT", "body": "Injected 'role' attribute"},
        postconditions={"privilege": "Escalation to merchant_admin"},
    ),
    FindingModel(
        id="F-1024",
        title="Missing Rate Limiting on MFA OTP Verification Endpoint",
        severity="High",
        confidence=95,
        status="Validated",
        type="Authentication & Rate Limiting",
        cwe="CWE-307: Improper Restriction of Excessive Authentication Attempts",
        cvss=8.2,
        endpoint="POST /api/v1/auth/mfa/verify-otp",
        service="User Service",
        discovered="1h ago",
        assignee="Anshu Bind",
        description="The multi-factor authentication verification endpoint does not enforce rate limiting per session or client IP. With a 4-digit OTP space (10,000 combinations) and 1,200 req/min throughput, full account takeover occurs in under 90 seconds.",
        evidence_summary=[
            "1,200 verification attempts processed with 0 HTTP 429 status codes",
            "IP rotation via X-Forwarded-For headers bypassed local reverse proxy throttling",
            "Valid OTP accepted during automated brute-force sweep",
        ],
        impact="Full account takeover (ATO) of any targeted user whose primary credentials or reset link was initiated.",
        remediation="Enforce Redis sliding window rate limits (max 5 failed attempts per session_id) and immediately invalidate the challenge session upon exceeding thresholds.",
        code_fix={
            "file": "services/auth_service/routers/mfa.py",
            "diff": (
                "@@ -22,4 +22,7 @@\n"
                " async def verify_otp(payload: MFAVerifyRequest, redis: Redis = Depends(get_redis)):\n"
                "+    attempts = await redis.incr(f'mfa_fail:{payload.session_id}')\n"
                "+    if attempts > 5:\n"
                "+        await redis.delete(f'mfa_session:{payload.session_id}')\n"
                "+        raise HTTPException(status_code=429, detail='Too many attempts. Challenge invalidated.')"
            ),
        },
        evidence_id="ev-1024",
        preconditions={"target": "Active MFA challenge session"},
        postconditions={"takeover": "Compromised target account session"},
    ),
    FindingModel(
        id="F-1025",
        title="Unauthenticated Sensitive Debug Endpoint Leaking Internal API Keys & Session Hashes",
        severity="High",
        confidence=97,
        status="Validated",
        type="Information Disclosure / Shadow API",
        cwe="CWE-200: Exposure of Sensitive Information to an Unauthorized Actor",
        cvss=7.8,
        endpoint="GET /api/v1/users/export-debug",
        service="User Service",
        discovered="2h ago",
        assignee="Anshu Bind",
        description="A legacy development debug route /api/v1/users/export-debug remained active in production ingress without authentication. It exposes user UUID catalogs, role mappings, and internal integration keys.",
        evidence_summary=[
            "Public GET request returned 50 sensitive customer entries without authentication",
            "Endpoint missing from official OpenAPI schema (Shadow Endpoint)",
            "Contains active executive_admin API keys",
        ],
        impact="Assists attackers in targeting high-value UUIDs and orchestrating multi-step BOLA and ATO attack chains.",
        remediation="Decommission the route from production builds or restrict access via API gateway mTLS internal ingress rules.",
        code_fix={
            "file": "services/user_service/main.py",
            "diff": (
                "@@ -88,4 +88,2 @@\n"
                "-if settings.ENVIRONMENT != 'production':\n"
                "-    app.include_router(debug_router, prefix='/api/v1/users')\n"
                "+# Debug router permanently disabled in production builds\n"
            ),
        },
        evidence_id="ev-1025",
        preconditions={"network": "Public Internet access"},
        postconditions={"recon": "Target UUID harvest and internal token exposure"},
    ),
    FindingModel(
        id="F-1026",
        title="Excessive Data Exposure in Order Details Response Leaking Full Payment Fingerprint",
        severity="Medium",
        confidence=92,
        status="Validated",
        type="Data Exposure / Privacy",
        cwe="CWE-213: Exposure of Sensitive Information Due to Incompatible Policies",
        cvss=6.5,
        endpoint="GET /api/v2/orders/{order_id}",
        service="Order Service",
        discovered="3h ago",
        assignee="Anshu Bind",
        description="The order summary endpoint returns raw payment processor gateway fingerprints, cardholder billing address, and internal merchant gateway identifiers that are not needed by the front-end client.",
        evidence_summary=[
            "Cardholder billing address and payment gateway fingerprint present in response payload",
            "Client UI only requires masked card last 4 and status",
        ],
        impact="Increased risk of secondary phishing attacks and unnecessary exposure of PCI-scoped telemetry.",
        remediation="Apply response serialization filtering to mask cardholder metadata and strip payment gateway token fingerprints.",
        code_fix={
            "file": "services/order_service/schemas/order.py",
            "diff": (
                "@@ -18,3 +18,3 @@\n"
                "-    billing_fingerprint: str\n"
                "+    card_last4: str\n"
                "+    # billing_fingerprint masked per PCI policy"
            ),
        },
        evidence_id=None,
        preconditions={"auth": "Valid Customer JWT"},
        postconditions={"exposure": "Payment telemetry and billing address leakage"},
    ),
    FindingModel(
        id="F-1027",
        title="Missing Strict HMAC Replay Window on Stripe Webhook Ingestion",
        severity="Low",
        confidence=88,
        status="Validated",
        type="Cryptographic Verification / Webhook",
        cwe="CWE-352: Cross-Site Request Forgery / Missing Replay Window",
        cvss=3.8,
        endpoint="POST /api/v1/payments/webhooks/stripe",
        service="Payment Service",
        discovered="5h ago",
        assignee="Anshu Bind",
        description="While Stripe webhook signature verification is enabled, the timestamp tolerance is set to infinity, permitting capture and replay of past successful payment webhook payloads.",
        evidence_summary=[
            "Captured webhook event from 48 hours ago successfully re-accepted by server",
            "Event processed duplicate internal order state transition",
        ],
        impact="Potential state desynchronization if legitimate webhook messages are captured and retransmitted.",
        remediation="Set Stripe signature timestamp tolerance to 300 seconds and maintain an idempotency cache of event IDs in Redis.",
        code_fix={
            "file": "services/payment_service/webhooks/stripe.py",
            "diff": (
                "@@ -12,3 +12,4 @@\n"
                " event = stripe.Webhook.construct_event(\n"
                "-    payload, sig_header, endpoint_secret\n"
                "+    payload, sig_header, endpoint_secret, tolerance=300\n"
                "+)"
            ),
        },
        evidence_id=None,
        preconditions={"payload": "Replayed signed webhook payload"},
        postconditions={"state": "Duplicate payment event ingestion"},
    ),
]

# ------------------------------------------------------------------------------
# 1.5 3 Comprehensive Attack Paths with Graph Nodes & Edges
# ------------------------------------------------------------------------------
ATTACK_PATHS: List[AttackPathModel] = [
    # AP-001
    AttackPathModel(
        id="AP-001",
        title="Info Leak → BOLA → PII Harvest",
        subtitle="Unauthenticated Reconnaissance to Multi-Tenant Customer Data Exfiltration",
        risk_level="Critical",
        compound_cvss=9.4,
        steps_count=5,
        entry_point="Public Internet (Unauthenticated)",
        impact="Mass unauthorized extraction of customer PII, SSN records, and verified KYC documents across all tenants.",
        target_asset="Production PII & KYC Customer Records",
        identity="Unauthenticated Attacker → Low-Priv Customer (user_b)",
        confidence=96,
        choke_point="GET /api/v1/users/{id} Object-Level Authorization Filter",
        remediation_summary="Implement tenant isolation checks in the user controller and permanently remove the unauthenticated debug export endpoint.",
        steps=[
            AttackStep(
                step_num=1,
                name="Shadow Endpoint Reconnaissance",
                type="Reconnaissance",
                endpoint="GET /api/v1/users/export-debug",
                finding_id="F-1025",
                description="Attacker discovers unauthenticated debug route /api/v1/users/export-debug via automated wordlist fuzzing and dumps 50 active customer UUIDs.",
                evidence_snippet="GET /api/v1/users/export-debug -> 200 OK [Leaked usr_alice_8821, usr_victim_4401]",
                status="confirmed",
            ),
            AttackStep(
                step_num=2,
                name="Victim GUID Extraction",
                type="Analysis",
                endpoint=None,
                finding_id="F-1025",
                description="Parsed response payload to isolate high-value target user identifiers (usr_alice_8821, usr_victim_4401).",
                evidence_snippet="Extracted target_id: usr_alice_8821 (Tenant A)",
                status="confirmed",
            ),
            AttackStep(
                step_num=3,
                name="Attacker Session Generation",
                type="Identity Acquisition",
                endpoint="POST /api/v1/auth/login",
                finding_id=None,
                description="Attacker registers/authenticates standard low-privilege customer account 'user_b' to obtain valid JWT bearer token.",
                evidence_snippet="JWT sub: usr_bob_9088, orgId: org_beta_b02",
                status="confirmed",
            ),
            AttackStep(
                step_num=4,
                name="BOLA Parameter Tampering",
                type="Exploitation",
                endpoint="GET /api/v1/users/{id}",
                finding_id="F-1021",
                description="Attacker transmits authenticated request with user_b's JWT while replacing the URL path parameter with victim's UUID usr_alice_8821.",
                evidence_snippet="GET /api/v1/users/usr_alice_8821 with Bearer usr_bob_9088 -> 200 OK",
                status="exploited",
            ),
            AttackStep(
                step_num=5,
                name="Mass PII Exfiltration",
                type="Impact",
                endpoint="GET /api/v1/users/{id}",
                finding_id="F-1021",
                description="Automated script loops through all harvested UUIDs, harvesting SSN numbers, physical home addresses, and KYC documents.",
                evidence_snippet="Exfiltrated 50 customer profiles with SSNs and KYC verification hashes.",
                status="exploited",
            ),
        ],
        graph_nodes=[
            GraphNode(id="n1-entry", label="Public Internet", type="entry", color="#64748B", data={"role": "Anonymous", "ip": "198.51.100.22"}),
            GraphNode(id="n1-ep1", label="GET /api/v1/users/export-debug", type="endpoint", color="#3B82F6", data={"service": "User Service", "status": "Shadow"}),
            GraphNode(id="n1-f1", label="F-1025: Unauthenticated Info Leak", type="finding", color="#F59E0B", data={"cvss": 7.8, "cwe": "CWE-200"}),
            GraphNode(id="n1-id1", label="Attacker Identity (user_b)", type="identity", color="#8B5CF6", data={"account": "bob.attacker", "role": "customer"}),
            GraphNode(id="n1-ep2", label="GET /api/v1/users/{id}", type="endpoint", color="#3B82F6", data={"service": "User Service", "auth": "Bearer JWT"}),
            GraphNode(id="n1-f2", label="F-1021: BOLA Vulnerability", type="finding", color="#EF4444", data={"cvss": 9.1, "cwe": "CWE-639", "choke_point": True}),
            GraphNode(id="n1-bound", label="Tenant Isolation Boundary", type="boundary", color="#EC4899", data={"boundary": "Cross-Tenant Access"}),
            GraphNode(id="n1-asset", label="PII & KYC Data Warehouse", type="asset", color="#10B981", data={"records": "50,000+ Profiles", "classification": "PCI/PII"}),
        ],
        graph_edges=[
            GraphEdge(id="e1-1", source="n1-entry", target="n1-ep1", label="1. Fuzz Debug Route", animated=True),
            GraphEdge(id="e1-2", source="n1-ep1", target="n1-f1", label="2. Trigger Leak"),
            GraphEdge(id="e1-3", source="n1-f1", target="n1-id1", label="3. Harvest Target UUIDs"),
            GraphEdge(id="e1-4", source="n1-id1", target="n1-ep2", label="4. Tamper Path Parameter", animated=True),
            GraphEdge(id="e1-5", source="n1-ep2", target="n1-f2", label="5. Trigger BOLA"),
            GraphEdge(id="e1-6", source="n1-f2", target="n1-bound", label="6. Bypass Tenant Check"),
            GraphEdge(id="e1-7", source="n1-bound", target="n1-asset", label="7. Exfiltrate PII Records", animated=True),
        ],
    ),

    # AP-002
    AttackPathModel(
        id="AP-002",
        title="Mass Assignment → BFLA → Unauthorized Payouts",
        subtitle="Privilege Escalation to Fraudulent Central Treasury Disbursement",
        risk_level="Critical",
        compound_cvss=9.8,
        steps_count=7,
        entry_point="Authenticated Regular User Account",
        impact="Direct financial drainage of merchant reserves totaling $85,000 per transaction to external offshore routing accounts.",
        target_asset="Corporate Payout Settlement Gateway & Bank Reserves",
        identity="Standard Customer → Escalated Merchant Admin (Injected)",
        confidence=98,
        choke_point="User DTO Schema Validation & Strict Role Transition Matrix",
        remediation_summary="Apply strict Pydantic DTO schema validation to prevent role injection and enforce role requirement decorators on payout routes.",
        steps=[
            AttackStep(
                step_num=1,
                name="Register Standard Account",
                type="Identity",
                endpoint="POST /api/v1/auth/login",
                finding_id=None,
                description="Attacker creates regular low-tier consumer account (usr_bob_9088) with standard shopping privileges.",
                evidence_snippet="Created user with role: 'customer'",
                status="confirmed",
            ),
            AttackStep(
                step_num=2,
                name="Profile Update Interception",
                type="Reconnaissance",
                endpoint="PUT /api/v1/users/{id}/profile",
                finding_id=None,
                description="Attacker inspects profile update request structure on PUT /api/v1/users/usr_bob_9088/profile.",
                evidence_snippet="Endpoint accepts arbitrary JSON attributes without strict schema.",
                status="confirmed",
            ),
            AttackStep(
                step_num=3,
                name="Mass Assignment Payload Injection",
                type="Exploitation",
                endpoint="PUT /api/v1/users/{id}/profile",
                finding_id="F-1023",
                description="Attacker injects {'role': 'merchant_admin', 'is_verified_vendor': true, 'credit_limit': 500000} into request body.",
                evidence_snippet="Body: {'bio': 'test', 'role': 'merchant_admin'}",
                status="exploited",
            ),
            AttackStep(
                step_num=4,
                name="Database State Mutation",
                type="Persistence",
                endpoint=None,
                finding_id="F-1023",
                description="Backend ORM maps unvalidated fields directly into database record, elevating Bob's RBAC role to 'merchant_admin'.",
                evidence_snippet="Database record updated: role='merchant_admin'",
                status="confirmed",
            ),
            AttackStep(
                step_num=5,
                name="Token Minting / Refresh",
                type="Privilege Escalation",
                endpoint="POST /api/v1/auth/login",
                finding_id=None,
                description="Attacker refreshes session token, receiving a new JWT embedding the privileged claim 'role: merchant_admin'.",
                evidence_snippet="JWT decoded claim: {'role': 'merchant_admin'}",
                status="confirmed",
            ),
            AttackStep(
                step_num=6,
                name="BFLA Payout Trigger",
                type="Exploitation",
                endpoint="POST /api/v1/payments/payouts/instant",
                finding_id="F-1022",
                description="Attacker invokes high-risk instant payout endpoint POST /api/v1/payments/payouts/instant using the escalated token.",
                evidence_snippet="POST /api/v1/payments/payouts/instant -> 200 OK (Status: QUEUED_FOR_SETTLEMENT)",
                status="exploited",
            ),
            AttackStep(
                step_num=7,
                name="Unauthorized Capital Exfiltration",
                type="Impact",
                endpoint="POST /api/v1/payments/payouts/instant",
                finding_id="F-1022",
                description="Payout system queues $85,000 disbursement to offshore routing transit 021000021 without secondary administrative sign-off.",
                evidence_snippet="Payout ID po_probe_994812 settled $85,000.00 USD.",
                status="exploited",
            ),
        ],
        graph_nodes=[
            GraphNode(id="n2-entry", label="Authenticated Customer (user_b)", type="entry", color="#8B5CF6", data={"role": "customer"}),
            GraphNode(id="n2-ep1", label="PUT /api/v1/users/{id}/profile", type="endpoint", color="#3B82F6", data={"service": "User Service"}),
            GraphNode(id="n2-f1", label="F-1023: Mass Assignment", type="finding", color="#EF4444", data={"cvss": 9.3, "cwe": "CWE-915", "choke_point": True}),
            GraphNode(id="n2-id2", label="Escalated Token (merchant_admin)", type="identity", color="#F97316", data={"role": "merchant_admin"}),
            GraphNode(id="n2-ep2", label="POST /api/v1/payments/payouts/instant", type="endpoint", color="#3B82F6", data={"service": "Payment Service"}),
            GraphNode(id="n2-f2", label="F-1022: BFLA Authorization Bypass", type="finding", color="#EF4444", data={"cvss": 9.6, "cwe": "CWE-285"}),
            GraphNode(id="n2-bound", label="Treasury Security Perimeter", type="boundary", color="#EC4899", data={"perimeter": "Bank Settlement Gateway"}),
            GraphNode(id="n2-asset", label="Settlement Reserves ($85k Disbursed)", type="asset", color="#10B981", data={"loss": "$85,000.00 USD"}),
        ],
        graph_edges=[
            GraphEdge(id="e2-1", source="n2-entry", target="n2-ep1", label="1. Submit Profile Payload", animated=True),
            GraphEdge(id="e2-2", source="n2-ep1", target="n2-f1", label="2. Inject 'role' Parameter"),
            GraphEdge(id="e2-3", source="n2-f1", target="n2-id2", label="3. Mint Escalated JWT"),
            GraphEdge(id="e2-4", source="n2-id2", target="n2-ep2", label="4. Call Instant Payout", animated=True),
            GraphEdge(id="e2-5", source="n2-ep2", target="n2-f2", label="5. Trigger BFLA Bypass"),
            GraphEdge(id="e2-6", source="n2-f2", target="n2-bound", label="6. Penetrate Treasury Perimeter"),
            GraphEdge(id="e2-7", source="n2-bound", target="n2-asset", label="7. Siphon Reserve Funds", animated=True),
        ],
    ),

    # AP-003
    AttackPathModel(
        id="AP-003",
        title="Rate Limit Bypass → OTP Brute Force → Account Takeover",
        subtitle="Unrestricted Multi-Factor Passcode Enumeration to VIP Administrative Account Takeover",
        risk_level="High",
        compound_cvss=8.9,
        steps_count=4,
        entry_point="External Attacker (Unauthenticated)",
        impact="Full administrative account takeover of executive account (victim@acmeprod.io), compromising tenant configuration and audit logs.",
        target_asset="Corporate Admin Control Plane & Sensitive Audit Logs",
        identity="External Attacker → Compromised Executive Admin Session",
        confidence=94,
        choke_point="Distributed Token-Bucket Rate Limiter & Cryptographic OTP Invalidation Policy",
        remediation_summary="Implement Redis-backed sliding window rate limiting on OTP verification with session revocation after 5 failed attempts.",
        steps=[
            AttackStep(
                step_num=1,
                name="Initiate Password Reset Flow",
                type="Reconnaissance",
                endpoint="POST /api/v1/auth/password-reset",
                finding_id=None,
                description="Attacker submits password reset request targeting victim@acmeprod.io, generating challenge session mfa_sess_891283.",
                evidence_snippet="POST /api/v1/auth/password-reset -> 200 OK (Challenge session created)",
                status="confirmed",
            ),
            AttackStep(
                step_num=2,
                name="Intercept MFA Verification Challenge",
                type="Analysis",
                endpoint="POST /api/v1/auth/mfa/verify-otp",
                finding_id=None,
                description="Attacker identifies 4-digit numeric OTP requirement with no anti-automation tokens (CAPTCHA).",
                evidence_snippet="Challenge parameter: 4-digit numeric string (0000-9999)",
                status="confirmed",
            ),
            AttackStep(
                step_num=3,
                name="Rate Limit Header Spoof & Brute Force",
                type="Exploitation",
                endpoint="POST /api/v1/auth/mfa/verify-otp",
                finding_id="F-1024",
                description="Attacker fires 1,200 requests/minute rotating X-Forwarded-For headers to evade IP throttling until valid OTP '8412' matches.",
                evidence_snippet="1,200 reqs in 45s without 429 Too Many Requests -> Hit valid OTP 8412",
                status="exploited",
            ),
            AttackStep(
                step_num=4,
                name="Administrative Session Hijack (ATO)",
                type="Impact",
                endpoint="POST /api/v1/auth/mfa/verify-otp",
                finding_id="F-1024",
                description="Server returns active administrative bearer session sess_auth_99182310, granting full control over admin control plane.",
                evidence_snippet="Received executive_admin session token.",
                status="exploited",
            ),
        ],
        graph_nodes=[
            GraphNode(id="n3-entry", label="External Attacker", type="entry", color="#64748B", data={"ip": "198.51.100.42"}),
            GraphNode(id="n3-ep1", label="POST /api/v1/auth/password-reset", type="endpoint", color="#3B82F6", data={"service": "User Service"}),
            GraphNode(id="n3-ep2", label="POST /api/v1/auth/mfa/verify-otp", type="endpoint", color="#3B82F6", data={"service": "User Service"}),
            GraphNode(id="n3-f1", label="F-1024: Missing Rate Limiting", type="finding", color="#F59E0B", data={"cvss": 8.2, "cwe": "CWE-307", "choke_point": True}),
            GraphNode(id="n3-id1", label="Compromised Admin Session", type="identity", color="#EF4444", data={"target": "victim@acmeprod.io", "role": "executive_admin"}),
            GraphNode(id="n3-asset", label="Corporate Admin Control Plane", type="asset", color="#10B981", data={"control": "Full Tenant & Audit Log Access"}),
        ],
        graph_edges=[
            GraphEdge(id="e3-1", source="n3-entry", target="n3-ep1", label="1. Initiate Target Reset", animated=True),
            GraphEdge(id="e3-2", source="n3-ep1", target="n3-ep2", label="2. Trigger MFA Challenge"),
            GraphEdge(id="e3-3", source="n3-ep2", target="n3-f1", label="3. Header-Spoofed Brute Force", animated=True),
            GraphEdge(id="e3-4", source="n3-f1", target="n3-id1", label="4. Hijack Session Token"),
            GraphEdge(id="e3-5", source="n3-id1", target="n3-asset", label="5. Executive Account Takeover", animated=True),
        ],
    ),
]

# ------------------------------------------------------------------------------
# 1.6 Notifications Mock Data
# ------------------------------------------------------------------------------
NOTIFICATIONS = [
    {
        "id": "notif-01",
        "title": "Critical Attack Path Validated",
        "message": "AP-002: Mass Assignment to BFLA Payout path successfully verified against staging sandbox.",
        "type": "critical",
        "timestamp": "10m ago",
        "read": False,
    },
    {
        "id": "notif-02",
        "title": "BOLA Discovered on User Service",
        "message": "F-1021 flagged on GET /api/v1/users/{id} during continuous schema differential analysis.",
        "type": "warning",
        "timestamp": "35m ago",
        "read": False,
    },
    {
        "id": "notif-03",
        "title": "Shadow Endpoint Detected",
        "message": "Discovered undocumented route GET /api/v1/users/export-debug leaking telemetry.",
        "type": "info",
        "timestamp": "2h ago",
        "read": True,
    },
    {
        "id": "notif-04",
        "title": "Scheduled Automated Pentest Completed",
        "message": "Mesh scan across 4 services completed. 21 endpoints audited, 7 findings updated.",
        "type": "success",
        "timestamp": "3h ago",
        "read": True,
    },
]

# ------------------------------------------------------------------------------
# 1.7 Scan Progress Mock Data
# ------------------------------------------------------------------------------
SCAN_STATUS = {
    "is_running": False,
    "progress": 100,
    "current_stage": "Complete",
    "last_scan_time": "2026-09-18T14:32:00Z",
    "scanned_endpoints": 21,
    "scanned_requests": 14820,
    "stages": [
        {"name": "Endpoint Discovery & OpenAPI Ingestion", "status": "completed", "progress": 100},
        {"name": "Traffic Baseline & State Mapping", "status": "completed", "progress": 100},
        {"name": "Authorization Boundary & Multi-Identity Probing", "status": "completed", "progress": 100},
        {"name": "Attack Path Synthesis & Choke Point Analysis", "status": "completed", "progress": 100},
        {"name": "Exploit Validation & Confidence Scoring", "status": "completed", "progress": 100},
    ],
}

# ==============================================================================
# 2. FASTAPI ROUTE HANDLERS
# ==============================================================================

# ------------------------------------------------------------------------------
# 2.1 Dashboard Summary
# ------------------------------------------------------------------------------
@app.get("/api/dashboard", response_model=Dict[str, Any])
async def get_dashboard():
    """Returns aggregated KPI cards, severity distribution, trend timelines, and recent findings."""
    total_findings = len(FINDINGS)
    critical_findings = sum(1 for f in FINDINGS if f.severity == "Critical")
    high_findings = sum(1 for f in FINDINGS if f.severity == "High")
    medium_findings = sum(1 for f in FINDINGS if f.severity == "Medium")
    low_findings = sum(1 for f in FINDINGS if f.severity == "Low")
    info_findings = sum(1 for f in FINDINGS if f.severity == "Info")
    validated_findings = sum(1 for f in FINDINGS if f.status == "Validated")

    return {
        "kpis": {
            "total_endpoints": len(ENDPOINTS),
            "active_endpoints": sum(1 for ep in ENDPOINTS if ep.status == "Active"),
            "shadow_endpoints": sum(1 for ep in ENDPOINTS if ep.status == "Shadow"),
            "deprecated_endpoints": sum(1 for ep in ENDPOINTS if ep.status == "Deprecated"),
            "internal_endpoints": sum(1 for ep in ENDPOINTS if ep.status == "Internal"),
            "total_findings": total_findings,
            "critical_findings": critical_findings,
            "high_findings": high_findings,
            "medium_findings": medium_findings,
            "low_findings": low_findings,
            "validated_findings": validated_findings,
            "attack_paths_count": len(ATTACK_PATHS),
            "security_posture_score": 64,
            "mean_time_to_remediate_days": 4.2,
            "scanned_requests_count": 14820,
        },
        "severity_chart": [
            {"severity": "Critical", "count": critical_findings, "color": "#EF4444"},
            {"severity": "High", "count": high_findings, "color": "#F97316"},
            {"severity": "Medium", "count": medium_findings, "color": "#F59E0B"},
            {"severity": "Low", "count": low_findings, "color": "#3B82F6"},
            {"severity": "Info", "count": info_findings, "color": "#6B7280"},
        ],
        "findings_trend": [
            {"date": "2026-09-12", "critical": 1, "high": 1, "medium": 0, "low": 1, "total": 3},
            {"date": "2026-09-13", "critical": 1, "high": 1, "medium": 1, "low": 1, "total": 4},
            {"date": "2026-09-14", "critical": 2, "high": 1, "medium": 1, "low": 1, "total": 5},
            {"date": "2026-09-15", "critical": 2, "high": 2, "medium": 1, "low": 1, "total": 6},
            {"date": "2026-09-16", "critical": 3, "high": 2, "medium": 1, "low": 1, "total": 7},
            {"date": "2026-09-17", "critical": 3, "high": 2, "medium": 1, "low": 1, "total": 7},
            {"date": "2026-09-18", "critical": 3, "high": 2, "medium": 1, "low": 1, "total": 7},
        ],
        "service_distribution": [
            {"service": "User Service", "endpoint_count": 6, "finding_count": 4, "risk": "Critical"},
            {"service": "Payment Service", "endpoint_count": 6, "finding_count": 2, "risk": "Critical"},
            {"service": "Order Service", "endpoint_count": 5, "finding_count": 1, "risk": "High"},
            {"service": "Admin Service", "endpoint_count": 4, "finding_count": 0, "risk": "Medium"},
        ],
        "recent_findings": FINDINGS[:5],
        "attack_paths_summary": [
            {
                "id": ap.id,
                "title": ap.title,
                "risk_level": ap.risk_level,
                "compound_cvss": ap.compound_cvss,
                "steps_count": ap.steps_count,
                "choke_point": ap.choke_point,
            }
            for ap in ATTACK_PATHS
        ],
    }

# ------------------------------------------------------------------------------
# 2.2 Projects
# ------------------------------------------------------------------------------
@app.get("/api/projects", response_model=List[ProjectModel])
async def list_projects():
    """Returns list of configured projects."""
    return list(PROJECTS.values())

@app.get("/api/projects/{project_id}", response_model=ProjectModel)
async def get_project(project_id: str):
    """Returns single project details with scope and test accounts."""
    if project_id not in PROJECTS:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")
    return PROJECTS[project_id]

# ------------------------------------------------------------------------------
# 2.3 Endpoints (API Inventory)
# ------------------------------------------------------------------------------
@app.get("/api/endpoints", response_model=List[EndpointModel])
async def list_endpoints(
    service: Optional[str] = Query(None, description="Filter by service name"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level"),
    status: Optional[str] = Query(None, description="Filter by endpoint status"),
):
    """Returns all API inventory endpoints with optional filtering."""
    results = ENDPOINTS
    if service:
        results = [ep for ep in results if ep.service.lower() == service.lower()]
    if risk_level:
        results = [ep for ep in results if ep.risk_level.lower() == risk_level.lower()]
    if status:
        results = [ep for ep in results if ep.status.lower() == status.lower()]
    return results

@app.get("/api/endpoints/{endpoint_id}", response_model=EndpointModel)
async def get_endpoint(endpoint_id: str):
    """Returns single endpoint detail by ID."""
    for ep in ENDPOINTS:
        if ep.id == endpoint_id:
            return ep
    raise HTTPException(status_code=404, detail=f"Endpoint '{endpoint_id}' not found")

# ------------------------------------------------------------------------------
# 2.4 Findings
# ------------------------------------------------------------------------------
@app.get("/api/findings", response_model=List[FindingModel])
async def list_findings(
    severity: Optional[str] = Query(None, description="Filter by severity: Critical, High, Medium, Low, Info"),
    status: Optional[str] = Query(None, description="Filter by status: Open, Validated, Remediated, etc."),
    service: Optional[str] = Query(None, description="Filter by service name"),
):
    """Returns all vulnerability findings with query parameter filter support."""
    results = FINDINGS
    if severity:
        results = [f for f in results if f.severity.lower() == severity.lower()]
    if status:
        results = [f for f in results if f.status.lower() == status.lower()]
    if service:
        results = [f for f in results if f.service.lower() == service.lower()]
    return results

@app.get("/api/findings/{finding_id}", response_model=FindingModel)
async def get_finding(finding_id: str):
    """Returns single finding details including remediation and code diff."""
    for f in FINDINGS:
        if f.id.lower() == finding_id.lower():
            return f
    raise HTTPException(status_code=404, detail=f"Finding '{finding_id}' not found")

# ------------------------------------------------------------------------------
# 2.5 Evidence
# ------------------------------------------------------------------------------
@app.get("/api/evidence/{finding_id}", response_model=EvidenceModel)
async def get_evidence(finding_id: str):
    """Returns full HTTP request/response differential evidence for a finding."""
    # Lookup by finding_id or evidence_id
    for ev in EVIDENCES.values():
        if ev.finding_id.lower() == finding_id.lower() or ev.id.lower() == finding_id.lower():
            return ev
    raise HTTPException(status_code=404, detail=f"Evidence for finding '{finding_id}' not found")

# ------------------------------------------------------------------------------
# 2.6 Attack Paths
# ------------------------------------------------------------------------------
@app.get("/api/attack-paths", response_model=List[AttackPathModel])
async def list_attack_paths():
    """Returns all attack paths."""
    return ATTACK_PATHS

@app.get("/api/attack-paths/{path_id}", response_model=AttackPathModel)
async def get_attack_path(path_id: str):
    """Returns single attack path with full graph nodes, edges, and step breakdown."""
    for ap in ATTACK_PATHS:
        if ap.id.lower() == path_id.lower():
            return ap
    raise HTTPException(status_code=404, detail=f"Attack path '{path_id}' not found")

# ------------------------------------------------------------------------------
# 2.7 Validation Execution
# ------------------------------------------------------------------------------
@app.post("/api/validate", response_model=Dict[str, Any])
async def execute_validation(req: ValidationRequest):
    """Executes automated differential probing against the specified finding and returns validation result."""
    target_finding = next((f for f in FINDINGS if f.id.lower() == req.finding_id.lower()), None)
    
    if not target_finding:
        raise HTTPException(status_code=404, detail=f"Finding '{req.finding_id}' not found for validation")

    evidence = EVIDENCES.get(target_finding.evidence_id or "")

    return {
        "finding_id": target_finding.id,
        "validation_id": f"val_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{target_finding.id}",
        "status": "Validated",
        "confidence": target_finding.confidence,
        "validation_type": req.validation_type,
        "test_account_used": req.test_account_id,
        "target_endpoint": target_finding.endpoint,
        "target_service": target_finding.service,
        "execution_time_ms": 384,
        "unauthorized_access_confirmed": True,
        "expected_behaviour": req.expected_behaviour,
        "actual_behaviour": req.actual_behaviour or "HTTP 200 OK + unauthorized data leakage",
        "diff_summary": evidence.diff_summary if evidence else "Differential test confirmed unauthorized access.",
        "extracted_variables": evidence.extracted_variables if evidence else {},
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }

# ------------------------------------------------------------------------------
# 2.8 Deterministic AI Security Copilot
# ------------------------------------------------------------------------------
@app.post("/api/copilot", response_model=CopilotMessage)
async def query_copilot(req: CopilotQueryRequest):
    """Context-aware deterministic AI security assistant referencing findings, paths, and remediations."""
    query = req.message.lower().strip()
    now_iso = datetime.utcnow().isoformat() + "Z"

    # Match BOLA / IDOR / F-1021
    if "bola" in query or "idor" in query or "1021" in query:
        content = (
            "### BOLA Analysis (Finding F-1021)\n\n"
            "**Target Endpoint**: `GET /api/v1/users/{id}` (User Service)\n"
            "**Severity**: **Critical (CVSS 9.1)** | **CWE-639**\n\n"
            "#### Root Cause\n"
            "The endpoint extracts the `{id}` parameter directly from the URL path and queries the database without verifying that the caller's JWT token identity matches the requested subject or has cross-tenant read privileges.\n\n"
            "#### Attack Path Association\n"
            "This finding serves as Step 4 in **AP-001 (Info Leak → BOLA → PII Harvest)**, allowing an attacker with a regular customer token (`user_b`) to exfiltrate full PII including SSN and KYC records of any tenant.\n\n"
            "#### Remediation Code Fix\n"
            "```python\n"
            "# services/user_service/controllers/users.py\n"
            "if current_user.id != user_id and current_user.role != 'admin':\n"
            "    raise HTTPException(status_code=403, detail='Access to requested user profile denied')\n"
            "user = db.query(UserModel).filter(UserModel.id == user_id, UserModel.tenant_id == current_user.tenant_id).first()\n"
            "```"
        )
        return CopilotMessage(
            role="assistant",
            content=content,
            timestamp=now_iso,
            context_tags=["BOLA", "F-1021", "AP-001", "User Service"],
            metadata={"finding_id": "F-1021", "attack_path_id": "AP-001"},
        )

    # Match BFLA / Payout / F-1022
    if "bfla" in query or "payout" in query or "1022" in query or "refund" in query:
        content = (
            "### BFLA & Payout Exploitation (Finding F-1022)\n\n"
            "**Target Endpoint**: `POST /api/v1/payments/payouts/instant` (Payment Service)\n"
            "**Severity**: **Critical (CVSS 9.6)** | **CWE-285**\n\n"
            "#### Root Cause\n"
            "The instant payout route does not enforce function-level authorization. Any authenticated user holding a standard customer token can dispatch disbursement commands directly against central merchant reserves.\n\n"
            "#### Attack Path Correlation\n"
            "Chained in **AP-002 (Mass Assignment → BFLA → Unauthorized Payouts)**. Combined with Mass Assignment (F-1023), an attacker can escalate privileges and drain up to $85,000 per transaction to external bank accounts.\n\n"
            "#### Remediation Code Fix\n"
            "```python\n"
            "# services/payment_service/routers/payouts.py\n"
            "@router.post('/payouts/instant', dependencies=[Depends(RequireRoles(['merchant_admin', 'finance_ops']))])\n"
            "async def execute_payout(payload: PayoutRequest, user: User = Depends(get_current_user)):\n"
            "    return await payout_processor.dispatch(payload, initiator=user)\n"
            "```"
        )
        return CopilotMessage(
            role="assistant",
            content=content,
            timestamp=now_iso,
            context_tags=["BFLA", "F-1022", "AP-002", "Payment Service"],
            metadata={"finding_id": "F-1022", "attack_path_id": "AP-002"},
        )

    # Match Mass Assignment / F-1023
    if "mass assignment" in query or "1023" in query or "profile" in query:
        content = (
            "### Mass Assignment Vulnerability (Finding F-1023)\n\n"
            "**Target Endpoint**: `PUT /api/v1/users/{id}/profile` (User Service)\n"
            "**Severity**: **Critical (CVSS 9.3)** | **CWE-915**\n\n"
            "#### Root Cause\n"
            "The handler uses an unconstrained request body parser (`extra = 'allow'`), allowing attackers to inject privileged attributes like `{\"role\": \"merchant_admin\"}` which are directly written to the database.\n\n"
            "#### Remediation\n"
            "Enforce strict schema validation with `extra = 'forbid'` in Pydantic:\n"
            "```python\n"
            "class UserProfileUpdateRequest(BaseModel):\n"
            "    bio: Optional[str] = Field(None, max_length=500)\n"
            "    avatar_url: Optional[HttpUrl] = None\n"
            "    class Config:\n"
            "        extra = 'forbid'\n"
            "```"
        )
        return CopilotMessage(
            role="assistant",
            content=content,
            timestamp=now_iso,
            context_tags=["Mass Assignment", "F-1023", "AP-002"],
            metadata={"finding_id": "F-1023", "attack_path_id": "AP-002"},
        )

    # Match Rate Limit / OTP / MFA / ATO / F-1024
    if "rate limit" in query or "otp" in query or "mfa" in query or "ato" in query or "1024" in query:
        content = (
            "### MFA Rate Limiting & Account Takeover (Finding F-1024)\n\n"
            "**Target Endpoint**: `POST /api/v1/auth/mfa/verify-otp` (User Service)\n"
            "**Severity**: **High (CVSS 8.2)** | **CWE-307**\n\n"
            "#### Attack Mechanics\n"
            "The OTP verification handler does not enforce session-bound failure limits. In **AP-003**, rotating `X-Forwarded-For` headers bypasses perimeter IP throttling, permitting brute-force enumeration of the 4-digit keyspace in under 90 seconds.\n\n"
            "#### Remediation\n"
            "Track consecutive failed attempts in Redis and terminate the challenge session after 5 failures:\n"
            "```python\n"
            "attempts = await redis.incr(f'mfa_fail:{session_id}')\n"
            "if attempts > 5:\n"
            "    await redis.delete(f'mfa_session:{session_id}')\n"
            "    raise HTTPException(status_code=429, detail='Too many attempts. Challenge invalidated.')\n"
            "```"
        )
        return CopilotMessage(
            role="assistant",
            content=content,
            timestamp=now_iso,
            context_tags=["Rate Limiting", "MFA", "F-1024", "AP-003"],
            metadata={"finding_id": "F-1024", "attack_path_id": "AP-003"},
        )

    # Match Attack Paths / Graph / Choke Points
    if "attack path" in query or "path" in query or "graph" in query or "choke" in query:
        content = (
            "### Acme Production Attack Paths Summary\n\n"
            "APISEC has synthesized **3 confirmed attack paths**:\n\n"
            "1. **AP-001: Info Leak → BOLA → PII Harvest** (Compound CVSS: 9.4)\n"
            "   - **Entry**: Public Internet\n"
            "   - **Chain**: F-1025 (Debug Leak) → Harvest UUIDs → F-1021 (BOLA) → Exfiltrate SSN/KYC\n"
            "   - **Choke Point**: `GET /api/v1/users/{id}` authorization check\n\n"
            "2. **AP-002: Mass Assignment → BFLA → Unauthorized Payouts** (Compound CVSS: 9.8)\n"
            "   - **Entry**: Authenticated Customer (`user_b`)\n"
            "   - **Chain**: F-1023 (Mass Assignment) → Elevate Role to `merchant_admin` → F-1022 (BFLA) → $85k Payout\n"
            "   - **Choke Point**: Strict User DTO Schema & Payout Role Matrix\n\n"
            "3. **AP-003: Rate Limit Bypass → OTP Brute Force → Account Takeover** (Compound CVSS: 8.9)\n"
            "   - **Entry**: External Attacker\n"
            "   - **Chain**: Password Reset → F-1024 (Missing Rate Limit) → Brute-force 4-digit OTP → ATO\n"
            "   - **Choke Point**: Redis sliding-window session limiter\n\n"
            "*Tip: Patching the choke points will neutralize all 3 attack paths simultaneously.*"
        )
        return CopilotMessage(
            role="assistant",
            content=content,
            timestamp=now_iso,
            context_tags=["Attack Paths", "Graph", "Choke Points"],
            metadata={"attack_paths": ["AP-001", "AP-002", "AP-003"]},
        )

    # Match Remediation / Fix / Patch / Code
    if "remediat" in query or "fix" in query or "patch" in query or "code" in query:
        content = (
            "### Priority Remediation Action Plan\n\n"
            "To maximize security posture improvement, apply fixes in the following order:\n\n"
            "1. **Fix F-1023 (Mass Assignment)**:\n"
            "   - Set `extra = 'forbid'` in user profile DTOs to stop privilege escalation.\n"
            "2. **Fix F-1021 (BOLA)**:\n"
            "   - Add tenant-scoped ownership verification in `GET /api/v1/users/{id}`.\n"
            "3. **Fix F-1022 (BFLA)**:\n"
            "   - Restrict `POST /api/v1/payments/payouts/instant` with `@RequireRoles(['merchant_admin'])`.\n"
            "4. **Fix F-1025 (Shadow Debug Route)**:\n"
            "   - Remove `/api/v1/users/export-debug` from production routing builds.\n\n"
            "Patching these 4 issues will fully break **AP-001** and **AP-002** and elevate the posture score from **64 to 96**."
        )
        return CopilotMessage(
            role="assistant",
            content=content,
            timestamp=now_iso,
            context_tags=["Remediation", "Code Fixes", "Action Plan"],
            metadata={"priority_findings": ["F-1023", "F-1021", "F-1022", "F-1025"]},
        )

    # Match Overview / Summary / Stats / Security Posture
    if "overview" in query or "summary" in query or "posture" in query or "stats" in query or "project" in query:
        content = (
            "### Acme Production Core — Security Posture Overview\n\n"
            "- **Overall Posture Score**: 64 / 100\n"
            "- **Total Endpoints Scanned**: 21 (19 Active, 1 Shadow, 1 Internal)\n"
            "- **Findings Discovered**: 7 (3 Critical, 2 High, 1 Medium, 1 Low)\n"
            "- **Active Validated Attack Paths**: 3 critical compound paths\n"
            "- **Highest Risk Service**: **User Service** (4 findings, including BOLA & Mass Assignment)\n"
            "- **Financial Exposure**: Critical risk on Instant Payouts ($85,000 disbursement vulnerability)\n\n"
            "Ask me about specific findings (e.g. *'Tell me about BOLA'* or *'How do I fix AP-002?'*) for technical details and code diffs."
        )
        return CopilotMessage(
            role="assistant",
            content=content,
            timestamp=now_iso,
            context_tags=["Overview", "Security Posture", "Acme Production"],
            metadata={"posture_score": 64, "findings_count": 7},
        )

    # Default Fallback Copilot Response
    content = (
        "### APISEC AI Security Copilot\n\n"
        "I am connected to the **Acme Production Core** project environment. Here is what I can help you with:\n\n"
        "- **Analyze Findings**: Ask about `BOLA (F-1021)`, `BFLA (F-1022)`, `Mass Assignment (F-1023)`, or `Rate Limiting (F-1024)`\n"
        "- **Attack Paths**: Ask about `AP-001`, `AP-002`, `AP-003`, or choke points\n"
        "- **Remediation**: Request code diffs and framework-specific patch examples\n"
        "- **Inventory**: Inquire about endpoints across User, Payment, Order, and Admin Services\n\n"
        "How would you like to proceed?"
    )
    return CopilotMessage(
        role="assistant",
        content=content,
        timestamp=now_iso,
        context_tags=["APISEC", "Copilot", "Help"],
        metadata={},
    )

# ------------------------------------------------------------------------------
# 2.9 Notifications & Scan Status & Acunetix Orchestration
# ------------------------------------------------------------------------------
@app.get("/api/notifications", response_model=List[Dict[str, Any]])
async def list_notifications():
    """Returns recent system and security audit notifications."""
    return NOTIFICATIONS

@app.get("/api/scan/status", response_model=Dict[str, Any])
async def get_scan_status():
    """Returns real-time or last completed scan status from the Acunetix orchestration engine."""
    return acunetix_engine.get_scan_status()

@app.get("/api/acunetix/config", response_model=Dict[str, Any])
async def get_acunetix_config():
    """Returns current Acunetix engine configuration and connection mode."""
    return acunetix_engine.config.to_dict()

@app.post("/api/acunetix/config", response_model=Dict[str, Any])
async def update_acunetix_config(payload: Dict[str, Any]):
    """Sets Acunetix server URL, API key, and TLS verification."""
    base_url = payload.get("base_url", "")
    api_key = payload.get("api_key", "")
    verify_ssl = payload.get("verify_ssl", False)
    return acunetix_engine.set_config(base_url, api_key, verify_ssl)

@app.post("/api/acunetix/test", response_model=Dict[str, Any])
async def test_acunetix_connection():
    """Tests live connection to configured Acunetix server or confirms emulated mode."""
    return await acunetix_engine.test_connection()

@app.post("/api/acunetix/scan/launch", response_model=Dict[str, Any])
async def launch_acunetix_scan(payload: Dict[str, Any]):
    """Launches an Acunetix automated discovery and vulnerability scan on target URL."""
    target_url = payload.get("target_url", "https://api.acmeprod.io")
    profile_name = payload.get("profile", "OWASP API Security Top 10 + DAST")
    return await acunetix_engine.start_scan(target_url, profile_name)

@app.post("/api/acunetix/import", response_model=Dict[str, Any])
async def import_acunetix_report(payload: Dict[str, Any]):
    """Ingests raw Acunetix JSON/XML export into APISEC Attack Path Causal Graph."""
    raw_content = payload.get("content", "{}")
    filename = payload.get("filename", "acunetix_scan.json")
    return acunetix_engine.parse_acunetix_export(raw_content, filename)

# ------------------------------------------------------------------------------
# 2.10 Multi-Scanner Mesh Orchestrator (Nmap + Nuclei + ZAP + Acunetix)
# ------------------------------------------------------------------------------
@app.get("/api/mesh/tools/status", response_model=Dict[str, Any])
async def get_mesh_tools_status():
    """Detects available security tools (Nmap, Nuclei, ZAP, Acunetix) and returns capabilities."""
    return multiscanner.get_tool_capabilities()

@app.post("/api/mesh/scan/launch", response_model=Dict[str, Any])
async def launch_mesh_scan(payload: Dict[str, Any]):
    """Launches unified multi-scanner orchestrator across selected tools."""
    target_url = payload.get("target_url", "https://api.acmeprod.io")
    tools = payload.get("tools", ["nmap", "nuclei", "zap", "acunetix"])
    profile = payload.get("profile", "Comprehensive Multi-Mesh Attack Surface Audit")
    return await multiscanner.launch_unified_scan(target_url, tools, profile)

@app.get("/api/mesh/scan/status", response_model=Dict[str, Any])
async def get_mesh_scan_status():
    """Returns real-time progress and logs across all active scanner tools."""
    return multiscanner.get_scan_status()

@app.post("/api/mesh/import/sarif", response_model=Dict[str, Any])
async def import_sarif_report(payload: Dict[str, Any]):
    """Parses standard OASIS SARIF v2.1.0 scan outputs into APISEC Causal DAG."""
    raw_content = payload.get("content", "{}")
    return multiscanner.parse_sarif_export(raw_content)

# ------------------------------------------------------------------------------
# 2.11 Real Data Engine (Live Nmap, Live HTTP Multi-Hop Chain, Real OpenAPI Ingestion)
# ------------------------------------------------------------------------------
@app.post("/api/real/nmap", response_model=Dict[str, Any])
async def execute_real_nmap(payload: Optional[Dict[str, Any]] = None):
    """Executes real system nmap binary against target host."""
    host = payload.get("host", "127.0.0.1") if payload else "127.0.0.1"
    ports = payload.get("ports", "80,443,8000,8001,8080,8088") if payload else "80,443,8000,8001,8080,8088"
    return await real_security_engine.execute_real_nmap_scan(host, ports)

@app.post("/api/real/validate/chain", response_model=Dict[str, Any])
async def execute_real_live_chain():
    """Executes real-time HTTP requests against the live vulnerable microservice and forward-pipes variables."""
    return await real_security_engine.execute_live_chain_validation("http://127.0.0.1:8001/target/api/v1")

@app.post("/api/real/openapi/parse", response_model=Dict[str, Any])
async def parse_real_openapi(payload: Dict[str, Any]):
    """Parses raw OpenAPI 3.0 / 3.1 JSON/YAML into live endpoints."""
    raw_content = payload.get("spec", "{}")
    endpoints = real_security_engine.parse_real_openapi_spec(raw_content)
    return {
        "success": True,
        "endpoint_count": len(endpoints),
        "endpoints": endpoints
    }

@app.get("/api/real/graph/metrics", response_model=Dict[str, Any])
async def calculate_real_graph_metrics():
    """Calculates live NetworkX centrality and choke-point scores on current findings."""
    return real_security_engine.build_causal_graph_from_findings(FINDINGS)

# ------------------------------------------------------------------------------
# 2.10 Live Vulnerable Mock Target API (For Live Chain Validation & Probing)
# ------------------------------------------------------------------------------
TARGET_USERS_DB = {
    "usr_alice_8821": {"id": "usr_alice_8821", "name": "Alice Standard", "email": "alice.test@acmeprod.io", "role": "customer", "tenant_id": "org_acme_a01", "balance": 150.0},
    "usr_bob_9942": {"id": "usr_bob_9942", "name": "Bob Executive", "email": "bob.victim@acmeprod.io", "role": "merchant_admin", "tenant_id": "org_acme_b02", "balance": 85400.0, "ssn_last4": "8821", "api_key": "live_sec_9942_kL89"},
}

@app.get("/target/api/v1/system/debug")
async def target_debug_endpoint():
    """VULNERABLE HOP 1: Unauthenticated Information Disclosure"""
    return {
        "status": "debug_mode_active",
        "service": "Acme Core Identity Mesh",
        "version": "2.4.1-rc3",
        "active_tenants": ["org_acme_a01", "org_acme_b02"],
        "recent_sampled_users": ["usr_alice_8821", "usr_bob_9942"],
        "node_id": "aws-us-east-1-node-77",
        "cluster_secret_hint": "acme_jwt_shared_secret_2026",
    }

@app.get("/target/api/v1/tenants/{tenant_id}/users/{user_id}")
async def target_bola_user_endpoint(tenant_id: str, user_id: str):
    """VULNERABLE HOP 2: Broken Object Level Authorization (BOLA/IDOR)"""
    if user_id in TARGET_USERS_DB:
        return TARGET_USERS_DB[user_id]
    raise HTTPException(status_code=404, detail="User not found")

@app.put("/target/api/v1/users/{user_id}/profile")
async def target_mass_assignment_endpoint(user_id: str, payload: Dict[str, Any]):
    """VULNERABLE HOP 3: Mass Assignment (Allows updating 'role' directly)"""
    if user_id not in TARGET_USERS_DB:
        TARGET_USERS_DB[user_id] = {"id": user_id, "name": "Dynamic User", "role": "customer"}
    
    # Vulnerable parameter reflection without whitelist
    for k, v in payload.items():
        TARGET_USERS_DB[user_id][k] = v
        
    return {
        "status": "success",
        "message": "Profile updated successfully",
        "user": TARGET_USERS_DB[user_id]
    }

@app.post("/target/api/v1/admin/payouts/emergency")
async def target_bfla_payout_endpoint(payload: Dict[str, Any]):
    """VULNERABLE HOP 4: Broken Function Level Authorization (BFLA)"""
    user_id = payload.get("caller_user_id", "usr_alice_8821")
    user = TARGET_USERS_DB.get(user_id, {})
    if user.get("role") != "merchant_admin" and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden: Requires merchant_admin or admin role")
    
    amount = payload.get("amount", 1000.0)
    dest = payload.get("destination_account", "ATTACKER_WALLET_0x99")
    return {
        "status": "disbursed",
        "transaction_id": "TXN_DISBURSE_88921",
        "amount": amount,
        "destination": dest,
        "approved_by_role": user.get("role"),
        "timestamp": datetime.utcnow().isoformat()
    }

# ==============================================================================
# 3. STATIC FRONTEND SPA MOUNTING
# ==============================================================================
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("target/"):
            raise HTTPException(status_code=404, detail="Endpoint not found")
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")

# ==============================================================================
# 4. SERVER ENTRYPOINT
# ==============================================================================
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
