from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class EmployeeInput(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    department: Optional[str] = None
    job_role: Optional[str] = None
    skills: Dict[str, int] = Field(default_factory=dict, description="Skill name to proficiency (1-5)")
    verified_skills: List[str] = Field(default_factory=list, description="Skills verified via GitHub/Assessments")
    experience_years: float = 0.0
    weekly_capacity_hours: float = 40.0
    allocated_hours: float = 0.0
    available_hours: float = 40.0
    workload_risk_score: float = Field(default=0.0, ge=0.0, le=100.0)
    current_assignments_count: int = 0
    on_leave: bool = False
    is_available: bool = True


class ProjectRoleSlot(BaseModel):
    role_id: str
    role_name: str
    mandatory_skills: Dict[str, int] = Field(default_factory=dict, description="Skill name to min proficiency (1-5)")
    preferred_skills: Dict[str, int] = Field(default_factory=dict, description="Skill name to desired proficiency (1-5)")
    min_experience_years: float = 0.0
    hours_per_week: float = 20.0


class OptimizationRequest(BaseModel):
    project_id: str
    project_title: str
    priority: str = "Medium"
    duration_weeks: int = 4
    role_slots: List[ProjectRoleSlot]
    employees: List[EmployeeInput]
    max_alternatives: int = 2
    workload_risk_threshold: float = 90.0
    allow_high_risk_exception: bool = False


class AssignedMember(BaseModel):
    employee_id: str
    employee_name: str
    role_id: str
    role_name: str
    assigned_hours: float
    skills_covered: Dict[str, int]
    verified_skills_used: List[str]
    individual_suitability_score: float  # 0 - 100
    utilization_before: float
    utilization_after: float
    workload_risk_before: float
    workload_risk_after: float
    experience_years: float
    decision_rationale: str


class InfeasibilityReason(BaseModel):
    role_id: str
    role_name: str
    constraint_type: str
    description: str
    suggested_action: str


class RejectedCandidate(BaseModel):
    employee_id: str
    employee_name: str
    role_name: str
    reason_code: str
    explanation: str
    suitability_score: float


class TeamSolution(BaseModel):
    team_label: str  # "Primary Team", "Backup Team A", "Backup Team B"
    team_type: str   # "primary", "backup_a", "backup_b"
    assigned_members: List[AssignedMember]
    total_score: float
    mandatory_skills_satisfied: bool
    preferred_skills_coverage: float  # Percentage 0-100
    missing_preferred_skills: List[str]
    solver_status: str  # "OPTIMAL", "FEASIBLE"
    objective_value: float
    explanation: str


class OptimizationResponse(BaseModel):
    success: bool
    project_id: str
    project_title: str
    solver_status: str
    solver_time_ms: float
    primary_team: Optional[TeamSolution] = None
    backup_teams: List[TeamSolution] = Field(default_factory=list)
    infeasibility_reasons: List[InfeasibilityReason] = Field(default_factory=list)
    rejected_candidates: List[RejectedCandidate] = Field(default_factory=list)
    human_explanation: str


class ValidationRequest(BaseModel):
    project_id: str
    role_slots: List[ProjectRoleSlot]
    proposed_assignments: Dict[str, str]  # role_id -> employee_id
    employees: List[EmployeeInput]
    workload_risk_threshold: float = 90.0


class ValidationResult(BaseModel):
    is_valid: bool
    violations: List[str]
    warnings: List[str]
    team_suitability_score: float
    assigned_members: List[AssignedMember]


class EmergencyRecoveryRequest(BaseModel):
    project_id: str
    project_title: str
    unavailable_employee_id: str
    role_slots: List[ProjectRoleSlot]
    current_team: Dict[str, str]  # role_id -> employee_id
    employees: List[EmployeeInput]
    workload_risk_threshold: float = 90.0


class EmergencyRecoveryResponse(BaseModel):
    success: bool
    recovered_team: Optional[TeamSolution] = None
    replaced_employee_id: str
    new_employee_id: Optional[str] = None
    affected_role_name: str
    preserved_members_count: int
    solver_status: str
    explanation: str
    infeasibility_reasons: List[InfeasibilityReason] = Field(default_factory=list)
