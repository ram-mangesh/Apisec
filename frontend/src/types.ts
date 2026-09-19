export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
export type FindingStatus = 'Open' | 'Validating' | 'Validated' | 'Remediated' | 'False Positive' | 'Closed';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Safe';

export interface Parameter {
  name: string;
  location: 'path' | 'query' | 'header' | 'body';
  param_type: string;
  required: boolean;
  inferred_entity?: string;
  description?: string;
}

export interface ApiEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  service: string;
  auth: string;
  tags: string[];
  status: 'Active' | 'Deprecated' | 'Shadow' | 'Internal';
  risk_level: RiskLevel;
  parameters: Parameter[];
  request_example?: string;
  response_example?: string;
  last_seen: string;
  source: string;
}

export interface Evidence {
  id: string;
  finding_id: string;
  title: string;
  description: string;
  baseline_request: string;
  baseline_response: string;
  probe_request: string;
  probe_response: string;
  diff_summary: string;
  unauthorized_confirmed: boolean;
  extracted_variables: Record<string, any>;
  timestamp: string;
}

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  confidence: number;
  status: FindingStatus;
  type: string;
  cwe: string;
  cvss: number;
  endpoint: string;
  service: string;
  discovered: string;
  assignee: string;
  description: string;
  evidence_summary: string[];
  impact: string;
  remediation: string;
  code_fix?: Record<string, string>;
  evidence_id?: string;
  preconditions?: Record<string, any>;
  postconditions?: Record<string, any>;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'entry' | 'finding' | 'endpoint' | 'identity' | 'asset' | 'boundary';
  color: string;
  data: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  style?: Record<string, any>;
}

export interface AttackStep {
  step_num: number;
  name: string;
  type: string;
  endpoint?: string;
  finding_id?: string;
  description: string;
  evidence_snippet?: string;
  status: 'confirmed' | 'exploited' | 'blocked';
}

export interface AttackPath {
  id: string;
  title: string;
  subtitle: string;
  risk_level: 'Critical' | 'High' | 'Medium' | 'Low';
  compound_cvss: number;
  steps_count: number;
  entry_point: string;
  impact: string;
  target_asset: string;
  identity: string;
  confidence: number;
  steps: AttackStep[];
  graph_nodes: GraphNode[];
  graph_edges: GraphEdge[];
  choke_point: string;
  remediation_summary: string;
}

export interface TestAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  token_preview: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  project_type: string;
  business_owner: string;
  environment: string;
  tags: string[];
  in_scope: string[];
  excluded_scope: string[];
  test_accounts: TestAccount[];
  api_count: number;
  findings_count: number;
  critical_count: number;
  attack_paths_count: number;
  validated_count: number;
  last_scan: string;
}

export interface DashboardStats {
  total_apis: number;
  total_findings: number;
  critical_findings: number;
  attack_paths: number;
  validated_findings: number;
  trends: {
    apis_change: string;
    findings_change: string;
    critical_percent: string;
    paths_change: string;
    validated_percent: string;
  };
  severity_distribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  findings_trend: {
    dates: string[];
    critical: number[];
    high: number[];
    medium: number[];
    low: number[];
  };
}

export interface NotificationItem {
  id: string;
  type: 'critical' | 'path' | 'scan' | 'report';
  title: string;
  description: string;
  time: string;
  read: boolean;
  link_screen?: string;
  link_id?: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context_tags?: string[];
}
