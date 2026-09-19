# APISEC — Enterprise API Security & Attack Path Platform
> **Tagline:** Discover. Analyze. Correlate. Secure.  
> **Core Innovation:** Beyond Flat Vulnerability Scanners — Multi-Hop API Attack Path Discovery, Real-Time Evidence-Backed Validation & Multi-Scanner Mesh (Nmap + Nuclei + OWASP ZAP + Acunetix).

---

## 🚀 1-Click Quickstart

### Launch APISEC Cyber HUD & Backend
```bash
# Starts the unified FastAPI backend + Web Cyber HUD on port 8001
python3 /home/kali/opencode/apisec/run_demo.py
```
Open **[http://localhost:8001](http://localhost:8001)** in your browser.

---

### Run Real Live Executions via CLI
```bash
# Execute genuine real-time HTTP multi-hop exploit chain against live target microservices
python3 /home/kali/opencode/apisec/cli.py live

# Run real system Nmap port reconnaissance & shadow listener discovery
python3 /home/kali/opencode/apisec/cli.py nmap 127.0.0.1

# Display multi-hop correlated attack paths and choke-point fixes
python3 /home/kali/opencode/apisec/cli.py paths

# List all discovered vulnerabilities with CVSS and confidence scores
python3 /home/kali/opencode/apisec/cli.py findings

# Run live differential authorization validation for finding F-1021
python3 /home/kali/opencode/apisec/cli.py validate F-1021

# Execute the complete 7-stage discovery & attack path scan
python3 /home/kali/opencode/apisec/cli.py scan
```

---

## 🏛️ Real-Data Architecture & Multi-Scanner Mesh

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                      UNIFIED SCANNING & DISCOVERY MESH                      │
 ├───────────────────┬───────────────────┬───────────────────┬─────────────────┤
 │  1. NMAP (Infra)  │ 2. NUCLEI (Fast)  │ 3. OWASP ZAP      │ 4. ACUNETIX     │
 │  • Open API Ports │  • Fast CVE &     │  • Open-Source    │  • Enterprise   │
 │  • Shadow servers │    Misconfig      │    DAST / Spider  │    Threat DAST  │
 │    (8001, 8088)   │    YAML Templates │  • Passive fuzz   │  • Deep Crawl   │
 └─────────┬─────────┴─────────┬─────────┴─────────┬─────────┴────────┬────────┘
           │                   │                   │                  │
           └───────────────────┼───────────────────┼──────────────────┘
                               ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                      APISEC REAL DATA INGESTION ENGINE                      │
 │  • Real System Nmap Binary (/usr/bin/nmap) & Nuclei (/usr/bin/nuclei)       │
 │  • Live Async HTTP Client (httpx) with Dynamic Variable Forward-Piping      │
 │  • Real NetworkX Causal Graph (Shortest Path & Betweenness Centrality)      │
 │  • Real OpenAPI 3.0/3.1 JSON/YAML Parser & OASIS SARIF v2.1.0 Importer      │
 └─────────────────────────────────────┬───────────────────────────────────────┘
                                       ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                    CAUSAL GRAPH & ATTACK PATH SYNTHESIS                     │
 │  Live Proven Exploit Chain:                                                 │
 │  [Nmap: Port 8088] ──> [Nuclei: Debug Leak] ──> [ZAP: BOLA]                │
 │                    ──> [Acunetix: $85k Payout BFLA Takeover]                │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Real Execution Highlights

1. **Live HTTP Forward-Piping Engine:**
   * **Hop 1:** `GET /target/api/v1/system/debug` $\rightarrow$ Live extracts `target_victim_id: usr_alice_8821`.
   * **Hop 2:** `GET /target/api/v1/tenants/org_acme_a01/users/usr_alice_8821` $\rightarrow$ Live extracts victim balance and SSN without token ownership.
   * **Hop 3:** `PUT /target/api/v1/users/usr_bob_9942/profile` $\rightarrow$ Live mutates role to `merchant_admin`.
   * **Hop 4:** `POST /target/api/v1/admin/payouts/emergency` $\rightarrow$ Disburses $85,000 corporate funds!
2. **Real System Tool Integration:**
   * Uses real `/usr/bin/nmap` for port discovery.
   * Uses real `/usr/bin/nuclei` for rapid API misconfiguration templates.
3. **Graph Algorithms:**
   * Genuine `networkx.DiGraph` computation for all simple paths and betweenness centrality choke-point ranking.
