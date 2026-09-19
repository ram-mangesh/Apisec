from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime

class ParameterModel(BaseModel):
    name: str
    location: Literal["path", "query", "header", "body"]
    param_type: str
    required: bool = True
    inferred_entity: Optional[str] = None
    description: Optional[str] = None

class EndpointModel(BaseModel):
    id: str
    method: Literal["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    path: str
    service: str
    auth: str
    tags: List[str] = []
    status: Literal["Active", "Deprecated", "Shadow", "Internal"] = "Active"
    risk_level: Literal["Critical", "High", "Medium", "Low", "Safe"] = "Medium"
    parameters: List[ParameterModel] = []
    request_example: Optional[str] = None
    response_example: Optional[str] = None
    last_seen: str = "2h ago"
    source: str = "OpenAPI 3.0"

class EvidenceModel(BaseModel):
    id: str
    finding_id: str
    title: str
    description: str
    baseline_request: str
    baseline_response: str
    probe_request: str
    probe_response: str
    diff_summary: str
    unauthorized_confirmed: bool = True
    extracted_variables: Dict[str, Any] = {}
    timestamp: str

class FindingModel(BaseModel):
    id: str
    title: str
    severity: Literal["Critical", "High", "Medium", "Low", "Info"]
    confidence: int = 94
    status: Literal["Open", "Validating", "Validated", "Remediated", "False Positive", "Closed"] = "Validated"
    type: str
    cwe: str
    cvss: float
    endpoint: str
    service: str
    discovered: str
    assignee: str = "Anshu Bind"
    description: str
    evidence_summary: List[str] = []
    impact: str
    remediation: str
    code_fix: Dict[str, str] = {}
    evidence_id: Optional[str] = None
    preconditions: Dict[str, Any] = {}
    postconditions: Dict[str, Any] = {}

class GraphNode(BaseModel):
    id: str
    label: str
    type: Literal["entry", "finding", "endpoint", "identity", "asset", "boundary"]
    color: str
    data: Dict[str, Any] = {}

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    animated: bool = False
    style: Optional[Dict[str, Any]] = None

class AttackStep(BaseModel):
    step_num: int
    name: str
    type: str
    endpoint: Optional[str] = None
    finding_id: Optional[str] = None
    description: str
    evidence_snippet: Optional[str] = None
    status: Literal["confirmed", "exploited", "blocked"] = "confirmed"

class AttackPathModel(BaseModel):
    id: str
    title: str
    subtitle: str
    risk_level: Literal["Critical", "High", "Medium", "Low"]
    compound_cvss: float
    steps_count: int
    entry_point: str
    impact: str
    target_asset: str
    identity: str
    confidence: int = 92
    steps: List[AttackStep]
    graph_nodes: List[GraphNode]
    graph_edges: List[GraphEdge]
    choke_point: str
    remediation_summary: str

class TestAccountModel(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str = "Active"
    token_preview: str

class ProjectModel(BaseModel):
    id: str
    name: str
    description: str
    project_type: str
    business_owner: str
    environment: str
    tags: List[str]
    in_scope: List[str]
    excluded_scope: List[str]
    test_accounts: List[TestAccountModel]
    api_count: int = 342
    findings_count: int = 28
    critical_count: int = 7
    attack_paths_count: int = 5
    validated_count: int = 21
    last_scan: str = "2h ago"

class ValidationRequest(BaseModel):
    finding_id: str
    validation_type: str = "Authorization Test"
    test_account_id: str = "user_a"
    expected_behaviour: str = "403 Forbidden"
    actual_behaviour: str = "200 OK + unauthorized customer data"

class CopilotMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: Optional[str] = None
    context_tags: List[str] = []
    metadata: Optional[Dict[str, Any]] = None

class CopilotQueryRequest(BaseModel):
    message: str
    project_id: str = "proj-acme-prod"
    context: Optional[Dict[str, Any]] = None
