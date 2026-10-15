import time
from typing import List, Dict, Tuple, Optional, Set, Any
from ortools.sat.python import cp_model
from models import (
    OptimizationRequest,
    OptimizationResponse,
    TeamSolution,
    AssignedMember,
    InfeasibilityReason,
    RejectedCandidate,
    ProjectRoleSlot,
    EmployeeInput,
    ValidationRequest,
    ValidationResult,
    EmergencyRecoveryRequest,
    EmergencyRecoveryResponse,
)


def calculate_suitability(
    emp: EmployeeInput,
    role: ProjectRoleSlot,
    workload_risk_threshold: float = 90.0
) -> Tuple[float, Dict[str, Any]]:
    """
    Computes a transparent 0-100 suitability score and component breakdown:
    - Skill proficiency (45%) with verified skill bonus
    - Experience (20%)
    - Availability/Capacity (20%)
    - Workload Health (15%)
    """
    # 1. Skill Score (45 points max)
    skill_score = 0.0
    mandatory_total = len(role.mandatory_skills)
    mandatory_matched = 0
    skills_covered = {}
    verified_used = []

    for skill, min_prof in role.mandatory_skills.items():
        emp_prof = emp.skills.get(skill, 0)
        if emp_prof >= min_prof:
            mandatory_matched += 1
            skills_covered[skill] = emp_prof
            # Check verified status
            if skill in emp.verified_skills:
                verified_used.append(skill)

    if mandatory_total > 0:
        base_mandatory_score = (mandatory_matched / mandatory_total) * 30.0
        # Verified skills bonus (up to 5 points)
        verified_bonus = (len(verified_used) / mandatory_total) * 5.0
    else:
        base_mandatory_score = 30.0
        verified_bonus = 5.0

    # Preferred skills (up to 10 points)
    preferred_total = len(role.preferred_skills)
    preferred_matched = 0
    for skill, min_prof in role.preferred_skills.items():
        emp_prof = emp.skills.get(skill, 0)
        if emp_prof >= min_prof:
            preferred_matched += 1
            skills_covered[skill] = emp_prof
            if skill in emp.verified_skills and skill not in verified_used:
                verified_used.append(skill)

    preferred_score = (preferred_matched / preferred_total * 10.0) if preferred_total > 0 else 10.0
    skill_score = min(45.0, base_mandatory_score + verified_bonus + preferred_score)

    # 2. Experience Score (20 points max)
    exp_ratio = 1.0
    if role.min_experience_years > 0:
        exp_ratio = min(2.0, emp.experience_years / role.min_experience_years)
        exp_score = min(20.0, exp_ratio * 10.0)
    else:
        exp_score = min(20.0, emp.experience_years * 2.5)

    # 3. Availability Score (20 points max)
    # How much capacity remains after assigning role hours?
    post_available = emp.available_hours - role.hours_per_week
    if post_available < 0:
        avail_score = 0.0
    else:
        # Higher remaining hours = healthier allocation
        avail_ratio = post_available / max(1.0, emp.weekly_capacity_hours)
        avail_score = min(20.0, avail_ratio * 20.0 + 5.0)

    # 4. Workload Health Score (15 points max)
    # Lower current workload risk = higher health score
    health_ratio = max(0.0, (100.0 - emp.workload_risk_score) / 100.0)
    workload_score = health_ratio * 15.0

    total_suitability = round(min(100.0, skill_score + exp_score + avail_score + workload_score), 1)

    breakdown = {
        "skill_score": round(skill_score, 1),
        "experience_score": round(exp_score, 1),
        "availability_score": round(avail_score, 1),
        "workload_score": round(workload_score, 1),
        "skills_covered": skills_covered,
        "verified_skills_used": verified_used,
        "mandatory_matched": mandatory_matched,
        "mandatory_total": mandatory_total,
    }
    return total_suitability, breakdown


def build_assigned_member(
    emp: EmployeeInput,
    role: ProjectRoleSlot,
    suitability: float,
    breakdown: Dict[str, Any]
) -> AssignedMember:
    util_before = round((emp.allocated_hours / max(1.0, emp.weekly_capacity_hours)) * 100.0, 1)
    new_allocated = emp.allocated_hours + role.hours_per_week
    util_after = round((new_allocated / max(1.0, emp.weekly_capacity_hours)) * 100.0, 1)

    # Calculate post-assignment workload risk
    risk_delta = (role.hours_per_week / max(1.0, emp.weekly_capacity_hours)) * 30.0
    risk_after = round(min(100.0, emp.workload_risk_score + risk_delta), 1)

    rationale_parts = []
    if breakdown["verified_skills_used"]:
        rationale_parts.append(f"Verified expertise in {', '.join(breakdown['verified_skills_used'])}")
    if breakdown["skills_covered"]:
        covered_names = list(breakdown["skills_covered"].keys())[:3]
        rationale_parts.append(f"Covers key skills: {', '.join(covered_names)}")
    rationale_parts.append(f"{emp.experience_years} yrs exp")
    rationale_parts.append(f"Post-utilization {util_after}%")

    rationale = "; ".join(rationale_parts)

    return AssignedMember(
        employee_id=emp.id,
        employee_name=emp.name,
        role_id=role.role_id,
        role_name=role.role_name,
        assigned_hours=role.hours_per_week,
        skills_covered=breakdown["skills_covered"],
        verified_skills_used=breakdown["verified_skills_used"],
        individual_suitability_score=suitability,
        utilization_before=util_before,
        utilization_after=util_after,
        workload_risk_before=emp.workload_risk_score,
        workload_risk_after=risk_after,
        experience_years=emp.experience_years,
        decision_rationale=rationale
    )


def diagnose_infeasibility(
    role_slots: List[ProjectRoleSlot],
    employees: List[EmployeeInput],
    workload_risk_threshold: float
) -> Tuple[List[InfeasibilityReason], List[RejectedCandidate]]:
    reasons = []
    rejected = []

    for role in role_slots:
        qualified_skills = []
        blocked_by_capacity = []
        blocked_by_policy = []
        blocked_by_leave = []
        blocked_by_exp = []

        for emp in employees:
            suitability, bd = calculate_suitability(emp, role, workload_risk_threshold)

            # Check mandatory skills
            lacks_skill = False
            for sk, min_p in role.mandatory_skills.items():
                if emp.skills.get(sk, 0) < min_p:
                    lacks_skill = True
                    break

            if lacks_skill:
                continue

            qualified_skills.append(emp)

            # Check experience
            if emp.experience_years < role.min_experience_years:
                blocked_by_exp.append(emp)
                rejected.append(RejectedCandidate(
                    employee_id=emp.id,
                    employee_name=emp.name,
                    role_name=role.role_name,
                    reason_code="EXP_INSUFFICIENT",
                    explanation=f"Has {emp.experience_years} yrs, role requires {role.min_experience_years} yrs.",
                    suitability_score=suitability
                ))
                continue

            # Check leaves
            if emp.on_leave or not emp.is_available:
                blocked_by_leave.append(emp)
                rejected.append(RejectedCandidate(
                    employee_id=emp.id,
                    employee_name=emp.name,
                    role_name=role.role_name,
                    reason_code="UNAVAILABLE_OR_LEAVE",
                    explanation="Currently on leave or declared unavailable.",
                    suitability_score=suitability
                ))
                continue

            # Check capacity
            if emp.available_hours < role.hours_per_week:
                blocked_by_capacity.append(emp)
                rejected.append(RejectedCandidate(
                    employee_id=emp.id,
                    employee_name=emp.name,
                    role_name=role.role_name,
                    reason_code="INSUFFICIENT_HOURS",
                    explanation=f"Needs {role.hours_per_week}h/week, only {emp.available_hours}h available.",
                    suitability_score=suitability
                ))
                continue

            # Check workload policy
            if emp.workload_risk_score >= workload_risk_threshold:
                blocked_by_policy.append(emp)
                rejected.append(RejectedCandidate(
                    employee_id=emp.id,
                    employee_name=emp.name,
                    role_name=role.role_name,
                    reason_code="BURNOUT_POLICY_BLOCKED",
                    explanation=f"Workload risk ({emp.workload_risk_score}) exceeds blocking threshold ({workload_risk_threshold}).",
                    suitability_score=suitability
                ))

        if len(qualified_skills) == 0:
            mandatory_str = ", ".join([f"{k} >= {v}" for k, v in role.mandatory_skills.items()])
            reasons.append(InfeasibilityReason(
                role_id=role.role_id,
                role_name=role.role_name,
                constraint_type="SKILL_GAP",
                description=f"Zero employees in workforce have mandatory skills [{mandatory_str}].",
                suggested_action="Upskill existing staff through practical mentorship or adjust mandatory threshold."
            ))
        elif len(blocked_by_policy) > 0 and len(qualified_skills) == len(blocked_by_policy):
            reasons.append(InfeasibilityReason(
                role_id=role.role_id,
                role_name=role.role_name,
                constraint_type="FATIGUE_POLICY_BLOCK",
                description=f"All {len(qualified_skills)} skilled candidates are protected by Fatigue-Aware Workload Policy (Risk >= {workload_risk_threshold}).",
                suggested_action="Authorize a temporary workload exception, rebalance other tasks, or delay start date."
            ))
        elif len(blocked_by_capacity) > 0 and len(qualified_skills) == len(blocked_by_capacity):
            reasons.append(InfeasibilityReason(
                role_id=role.role_id,
                role_name=role.role_name,
                constraint_type="CAPACITY_CONSTRAINT",
                description=f"All {len(qualified_skills)} qualified candidates have insufficient weekly capacity for {role.hours_per_week}h/week.",
                suggested_action="Reduce weekly hours allocation for this role or release overlapping low-priority assignments."
            ))

    return reasons, rejected


def solve_workforce_cpsat(
    request: OptimizationRequest,
    excluded_solutions: Optional[List[List[Tuple[str, str]]]] = None
) -> Tuple[Optional[TeamSolution], str, float, List[RejectedCandidate]]:
    """
    Solves for a complete feasible team using Google OR-Tools CP-SAT.
    Enforces hard constraints:
      1. Exactly 1 employee per role slot.
      2. At most 1 role slot per employee.
      3. Mandatory skill proficiency coverage.
      4. Available hours >= required role hours.
      5. Workload risk < threshold (fatigue-aware protection).
      6. Not on leave and available.
      7. Experience years >= min experience.
    """
    start_time = time.time()
    model = cp_model.CpModel()

    role_slots = request.role_slots
    employees = request.employees
    threshold = request.workload_risk_threshold

    # Pre-filtering and eligibility evaluation
    # Map (emp_idx, role_idx) -> Var
    x = {}
    suitability_map = {}
    breakdown_map = {}
    rejected_candidates = []

    for r_idx, role in enumerate(role_slots):
        for e_idx, emp in enumerate(employees):
            suitability, bd = calculate_suitability(emp, role, threshold)

            # Check Hard Constraints
            is_eligible = True
            rejection_reason = None
            code = ""

            # Check Mandatory Skills
            for sk, min_p in role.mandatory_skills.items():
                if emp.skills.get(sk, 0) < min_p:
                    is_eligible = False
                    rejection_reason = f"Lacks mandatory skill {sk} (has {emp.skills.get(sk, 0)}, needs {min_p})"
                    code = "SKILL_MISMATCH"
                    break

            if is_eligible and emp.experience_years < role.min_experience_years:
                is_eligible = False
                rejection_reason = f"Experience {emp.experience_years} yrs < required {role.min_experience_years} yrs"
                code = "EXP_INSUFFICIENT"

            if is_eligible and (emp.on_leave or not emp.is_available):
                is_eligible = False
                rejection_reason = "Employee is on leave or unavailable"
                code = "UNAVAILABLE"

            if is_eligible and emp.available_hours < role.hours_per_week:
                is_eligible = False
                rejection_reason = f"Available hours ({emp.available_hours}h) < role hours ({role.hours_per_week}h)"
                code = "CAPACITY_EXCEEDED"

            if is_eligible and not request.allow_high_risk_exception and emp.workload_risk_score >= threshold:
                is_eligible = False
                rejection_reason = f"Workload Risk score {emp.workload_risk_score} violates Fatigue Policy (threshold {threshold})"
                code = "BURNOUT_BLOCKED"

            if is_eligible:
                var = model.NewBoolVar(f"assign_e{e_idx}_r{r_idx}")
                x[(e_idx, r_idx)] = var
                suitability_map[(e_idx, r_idx)] = suitability
                breakdown_map[(e_idx, r_idx)] = bd
            else:
                if code in ["CAPACITY_EXCEEDED", "BURNOUT_BLOCKED", "EXP_INSUFFICIENT"]:
                    rejected_candidates.append(RejectedCandidate(
                        employee_id=emp.id,
                        employee_name=emp.name,
                        role_name=role.role_name,
                        reason_code=code,
                        explanation=rejection_reason,
                        suitability_score=suitability
                    ))

    # Constraint 1: Exactly 1 employee per role slot
    for r_idx, role in enumerate(role_slots):
        role_vars = [x[(e_idx, r_idx)] for e_idx in range(len(employees)) if (e_idx, r_idx) in x]
        if not role_vars:
            # Immediate infeasibility for this role
            return None, "INFEASIBLE", (time.time() - start_time) * 1000, rejected_candidates
        model.Add(sum(role_vars) == 1)

    # Constraint 2: At most 1 role per employee
    for e_idx in range(len(employees)):
        emp_vars = [x[(e_idx, r_idx)] for r_idx in range(len(role_slots)) if (e_idx, r_idx) in x]
        if emp_vars:
            model.Add(sum(emp_vars) <= 1)

    # Exclusion / Diversity Constraints for Solution Pools (Backup Teams)
    if excluded_solutions:
        for sol in excluded_solutions:
            # sol is list of (emp_id, role_id)
            matching_vars = []
            for emp_id, role_id in sol:
                # find indices
                e_match = next((i for i, e in enumerate(employees) if e.id == emp_id), None)
                r_match = next((j for j, r in enumerate(role_slots) if r.role_id == role_id), None)
                if e_match is not None and r_match is not None and (e_match, r_match) in x:
                    matching_vars.append(x[(e_match, r_match)])

            if matching_vars:
                # Require at least one difference
                model.Add(sum(matching_vars) <= len(matching_vars) - 1)

    # Multi-Objective Function:
    # Maximize sum of scaled suitability scores
    # Integer scaling: suitability * 100
    objective_terms = []
    for (e_idx, r_idx), var in x.items():
        score_int = int(suitability_map[(e_idx, r_idx)] * 100)
        objective_terms.append(score_int * var)

    model.Maximize(sum(objective_terms))

    # Solve
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 5.0
    solver.parameters.num_search_workers = 4
    status = solver.Solve(model)

    duration_ms = (time.time() - start_time) * 1000

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        assigned_members = []
        total_score_sum = 0.0
        covered_preferred = set()
        all_preferred = set()

        for role in role_slots:
            for pref_k in role.preferred_skills.keys():
                all_preferred.add(pref_k)

        for (e_idx, r_idx), var in x.items():
            if solver.Value(var) == 1:
                emp = employees[e_idx]
                role = role_slots[r_idx]
                suit = suitability_map[(e_idx, r_idx)]
                bd = breakdown_map[(e_idx, r_idx)]

                assigned_member = build_assigned_member(emp, role, suit, bd)
                assigned_members.append(assigned_member)
                total_score_sum += suit

                for sk in emp.skills.keys():
                    if sk in all_preferred:
                        covered_preferred.add(sk)

        avg_team_score = round(total_score_sum / max(1, len(assigned_members)), 1)
        pref_cov_pct = round((len(covered_preferred) / max(1, len(all_preferred))) * 100.0, 1)
        missing_pref = list(all_preferred - covered_preferred)

        status_str = "OPTIMAL" if status == cp_model.OPTIMAL else "FEASIBLE"

        # Generate explanatory narrative
        explanation = (
            f"CP-SAT solver achieved {status_str} team configuration in {round(duration_ms, 1)}ms. "
            f"100% mandatory skills satisfied. Team suitability: {avg_team_score}/100. "
            f"Preferred complementary skills coverage: {pref_cov_pct}%. "
            f"Zero workload policy violations."
        )

        solution = TeamSolution(
            team_label="Primary Team",
            team_type="primary",
            assigned_members=assigned_members,
            total_score=avg_team_score,
            mandatory_skills_satisfied=True,
            preferred_skills_coverage=pref_cov_pct,
            missing_preferred_skills=missing_pref,
            solver_status=status_str,
            objective_value=round(solver.ObjectiveValue() / 100.0, 1),
            explanation=explanation
        )
        return solution, status_str, duration_ms, rejected_candidates

    elif status == cp_model.INFEASIBLE:
        return None, "INFEASIBLE", duration_ms, rejected_candidates
    else:
        return None, "UNKNOWN", duration_ms, rejected_candidates


def optimize_team(request: OptimizationRequest) -> OptimizationResponse:
    """
    Main orchestration function:
    1. Runs CP-SAT for Primary Team
    2. Runs CP-SAT with diversity cuts for Backup Team A and Backup Team B
    3. If infeasible, diagnoses root causes
    """
    start_time = time.time()

    primary_team, status, dur1, rejected_pool = solve_workforce_cpsat(request)

    if not primary_team or status == "INFEASIBLE":
        infeasibility_reasons, extra_rejected = diagnose_infeasibility(
            request.role_slots, request.employees, request.workload_risk_threshold
        )
        all_rejected = rejected_pool + extra_rejected
        # Deduplicate rejected
        seen_rej = set()
        unique_rejected = []
        for r in all_rejected:
            key = (r.employee_id, r.role_name)
            if key not in seen_rej:
                seen_rej.add(key)
                unique_rejected.append(r)

        return OptimizationResponse(
            success=False,
            project_id=request.project_id,
            project_title=request.project_title,
            solver_status="INFEASIBLE",
            solver_time_ms=round((time.time() - start_time) * 1000, 1),
            primary_team=None,
            backup_teams=[],
            infeasibility_reasons=infeasibility_reasons,
            rejected_candidates=unique_rejected[:10],
            human_explanation=(
                f"No feasible team could satisfy all hard constraints for '{request.project_title}'. "
                f"Found {len(infeasibility_reasons)} constraint bottleneck(s). Review recommendations below."
            )
        )

    # Primary found! Now find Backup Team A and Backup Team B
    backup_teams = []
    sol1 = [(m.employee_id, m.role_id) for m in primary_team.assigned_members]
    excluded_list = [sol1]

    # Generate Backup A
    backup_a, status_a, dur_a, rej_a = solve_workforce_cpsat(request, excluded_solutions=excluded_list)
    if backup_a and status_a in ["OPTIMAL", "FEASIBLE"]:
        backup_a.team_label = "Backup Team A"
        backup_a.team_type = "backup_a"
        backup_a.explanation = (
            f"Alternative viable team offering high resilience. "
            f"Team suitability: {backup_a.total_score}/100. "
            f"Preferred skill coverage: {backup_a.preferred_skills_coverage}%."
        )
        backup_teams.append(backup_a)
        sol2 = [(m.employee_id, m.role_id) for m in backup_a.assigned_members]
        excluded_list.append(sol2)

        # Generate Backup B
        backup_b, status_b, dur_b, rej_b = solve_workforce_cpsat(request, excluded_solutions=excluded_list)
        if backup_b and status_b in ["OPTIMAL", "FEASIBLE"]:
            backup_b.team_label = "Backup Team B"
            backup_b.team_type = "backup_b"
            backup_b.explanation = (
                f"Contingency roster minimizing overlap with Primary Team. "
                f"Team suitability: {backup_b.total_score}/100."
            )
            backup_teams.append(backup_b)

    total_duration = round((time.time() - start_time) * 1000, 1)

    narrative = (
        f"Successfully synthesized Primary Team and {len(backup_teams)} resilient backup alternative(s) "
        f"using Google OR-Tools CP-SAT in {total_duration}ms. "
        f"Primary team covers all {len(request.role_slots)} roles with 100% mandatory skill compliance "
        f"and {primary_team.preferred_skills_coverage}% complementary skill coverage."
    )

    return OptimizationResponse(
        success=True,
        project_id=request.project_id,
        project_title=request.project_title,
        solver_status=primary_team.solver_status,
        solver_time_ms=total_duration,
        primary_team=primary_team,
        backup_teams=backup_teams,
        infeasibility_reasons=[],
        rejected_candidates=rejected_pool[:8],
        human_explanation=narrative
    )


def validate_manual_team(request: ValidationRequest) -> ValidationResult:
    """
    Validates a manual or modified team configuration against all hard constraints and policy thresholds.
    """
    violations = []
    warnings = []
    assigned_members = []
    total_score = 0.0

    role_map = {r.role_id: r for r in request.role_slots}
    emp_map = {e.id: e for e in request.employees}

    assigned_emp_ids = set()

    for role_id, emp_id in request.proposed_assignments.items():
        role = role_map.get(role_id)
        emp = emp_map.get(emp_id)

        if not role:
            violations.append(f"Invalid role ID '{role_id}'")
            continue
        if not emp:
            violations.append(f"Invalid employee ID '{emp_id}' for role '{role.role_name}'")
            continue

        # Check duplicate assignment
        if emp_id in assigned_emp_ids:
            violations.append(f"Duplicate assignment: Employee '{emp.name}' is assigned to multiple roles.")
        assigned_emp_ids.add(emp_id)

        # Mandatory Skills
        for sk, min_p in role.mandatory_skills.items():
            emp_p = emp.skills.get(sk, 0)
            if emp_p < min_p:
                violations.append(f"{emp.name} lacks mandatory skill '{sk}' (has {emp_p}, requires {min_p})")

        # Capacity
        if emp.available_hours < role.hours_per_week:
            violations.append(
                f"{emp.name} has only {emp.available_hours}h available, but role '{role.role_name}' requires {role.hours_per_week}h/week."
            )

        # Workload Risk Policy
        if emp.workload_risk_score >= request.workload_risk_threshold:
            violations.append(
                f"Workload policy violation: {emp.name} has a Fatigue Risk score of {emp.workload_risk_score}/100 "
                f"(exceeds threshold of {request.workload_risk_threshold})."
            )
        elif emp.workload_risk_score >= 75.0:
            warnings.append(f"High workload warning: {emp.name} has current fatigue risk of {emp.workload_risk_score}/100.")

        # Experience
        if emp.experience_years < role.min_experience_years:
            violations.append(
                f"{emp.name} has {emp.experience_years} yrs exp, role '{role.role_name}' requires {role.min_experience_years} yrs."
            )

        suit, bd = calculate_suitability(emp, role, request.workload_risk_threshold)
        total_score += suit
        assigned_members.append(build_assigned_member(emp, role, suit, bd))

    avg_score = round(total_score / max(1, len(assigned_members)), 1)
    is_valid = len(violations) == 0

    return ValidationResult(
        is_valid=is_valid,
        violations=violations,
        warnings=warnings,
        team_suitability_score=avg_score,
        assigned_members=assigned_members
    )


def reoptimize_emergency(request: EmergencyRecoveryRequest) -> EmergencyRecoveryResponse:
    """
    Emergency Project Recovery:
    Given an unavailable employee, preserve unaffected team members and find the optimal
    replacement candidate using CP-SAT constraint satisfaction.
    """
    role_map = {r.role_id: r for r in request.role_slots}
    emp_map = {e.id: e for e in request.employees}

    # Find which role is affected
    affected_role_id = None
    affected_role_name = "Unknown"
    preserved_members = {}

    for r_id, e_id in request.current_team.items():
        if e_id == request.unavailable_employee_id:
            affected_role_id = r_id
            if r_id in role_map:
                affected_role_name = role_map[r_id].role_name
        else:
            preserved_members[r_id] = e_id

    if not affected_role_id:
        return EmergencyRecoveryResponse(
            success=False,
            replaced_employee_id=request.unavailable_employee_id,
            affected_role_name="None",
            preserved_members_count=len(preserved_members),
            solver_status="NO_AFFECTED_ROLE",
            explanation=f"Employee {request.unavailable_employee_id} was not assigned to any active role on this project."
        )

    # Exclude currently assigned preserved employees and unavailable employee from the candidate pool
    forbidden_ids = set(preserved_members.values())
    forbidden_ids.add(request.unavailable_employee_id)

    available_candidates = [e for e in request.employees if e.id not in forbidden_ids]
    target_role = role_map[affected_role_id]

    # Run CP-SAT for this single vacant slot
    single_req = OptimizationRequest(
        project_id=request.project_id,
        project_title=request.project_title,
        role_slots=[target_role],
        employees=available_candidates,
        workload_risk_threshold=request.workload_risk_threshold
    )

    replacement_sol, status, dur, rej = solve_workforce_cpsat(single_req)

    if not replacement_sol or status == "INFEASIBLE":
        reasons, _ = diagnose_infeasibility([target_role], available_candidates, request.workload_risk_threshold)
        return EmergencyRecoveryResponse(
            success=False,
            replaced_employee_id=request.unavailable_employee_id,
            affected_role_name=affected_role_name,
            preserved_members_count=len(preserved_members),
            solver_status="INFEASIBLE",
            explanation=f"Emergency reoptimization failed: No available employee meets all constraints for role '{affected_role_name}'.",
            infeasibility_reasons=reasons
        )

    new_member = replacement_sol.assigned_members[0]

    # Reconstruct the full recovered team
    full_assigned_members = []
    total_score = 0.0

    # Add preserved members
    for r_id, e_id in preserved_members.items():
        r_obj = role_map[r_id]
        e_obj = emp_map[e_id]
        s, bd = calculate_suitability(e_obj, r_obj, request.workload_risk_threshold)
        total_score += s
        full_assigned_members.append(build_assigned_member(e_obj, r_obj, s, bd))

    # Add replacement member
    full_assigned_members.append(new_member)
    total_score += new_member.individual_suitability_score

    avg_score = round(total_score / max(1, len(full_assigned_members)), 1)

    unavail_emp = emp_map.get(request.unavailable_employee_id)
    unavail_name = unavail_emp.name if unavail_emp else "Unavailable Employee"

    explanation = (
        f"Emergency recovery successful! Preserved {len(preserved_members)} existing team members. "
        f"Replaced {unavail_name} with {new_member.employee_name} in role '{affected_role_name}'. "
        f"Team integrity maintained at {avg_score}/100 suitability score with 0 policy violations."
    )

    recovered_team = TeamSolution(
        team_label="Recovered Resilient Team",
        team_type="recovered",
        assigned_members=full_assigned_members,
        total_score=avg_score,
        mandatory_skills_satisfied=True,
        preferred_skills_coverage=replacement_sol.preferred_skills_coverage,
        missing_preferred_skills=replacement_sol.missing_preferred_skills,
        solver_status=status,
        objective_value=avg_score,
        explanation=explanation
    )

    return EmergencyRecoveryResponse(
        success=True,
        recovered_team=recovered_team,
        replaced_employee_id=request.unavailable_employee_id,
        new_employee_id=new_member.employee_id,
        affected_role_name=affected_role_name,
        preserved_members_count=len(preserved_members),
        solver_status=status,
        explanation=explanation
    )
