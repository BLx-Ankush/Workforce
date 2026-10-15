# Workforce Intelligence AI — Technical Architecture & Optimization Specification

## 1. Mathematical Formulation (Google OR-Tools CP-SAT)

The team matching engine operates as a multi-objective constraint satisfaction optimization problem formulated with Google OR-Tools CP-SAT.

### Decision Variables
$$x_{i, r} \in \{0, 1\}$$
Binary variable equal to $1$ if employee $i \in E$ is assigned to project role slot $r \in R$; otherwise $0$.

### Hard Constraints (Strict Feasibility Guarantees)

1. **Role Slot Assignment**:
   Every role slot in the project must be filled by exactly one qualified candidate:
   $$\sum_{i \in E} x_{i, r} = 1 \quad \forall r \in R$$

2. **No Conflicting Duplicate Assignments**:
   An employee can fill at most one role slot per project:
   $$\sum_{r \in R} x_{i, r} \le 1 \quad \forall i \in E$$

3. **Mandatory Skill Proficiency**:
   For any mandatory skill $s$ required for role $r$ with threshold $P_{req}(s, r)$:
   $$x_{i, r} = 0 \quad \text{if } \text{Proficiency}(i, s) < P_{req}(s, r)$$

4. **Weekly Capacity Bounds**:
   For candidate $i$ and role $r$, required hours cannot exceed available capacity:
   $$x_{i, r} = 0 \quad \text{if } \text{HoursPerWeek}(r) > \text{AvailableHours}(i)$$

5. **Fatigue-Aware Safety Policy (Burnout Blocking)**:
   If an employee's workload risk index exceeds the configured safety threshold (default $90/100$) or projected utilization exceeds $105\%$:
   $$x_{i, r} = 0 \quad \text{if } \text{WorkloadRiskScore}(i) \ge 90$$

6. **Availability & Leave Status**:
   $$x_{i, r} = 0 \quad \text{if } i.\text{onLeave} = \text{true}$$

7. **Experience Requirements**:
   $$x_{i, r} = 0 \quad \text{if } \text{ExperienceYears}(i) < \text{MinExperienceYears}(r)$$

---

## 2. Multi-Objective Function

The solver maximizes an integer-scaled suitability and complementary skill score:
$$\text{Maximize} \sum_{i \in E} \sum_{r \in R} C_{i, r} \cdot x_{i, r}$$

Where $C_{i, r}$ combines:
- **Skill Proficiency (45%)**: Base mandatory score + verified credential bonus (+15% multiplier for GitHub-verified skills) + preferred skill match.
- **Relevant Experience (20%)**: Normalized experience ratio.
- **Available Capacity Margin (20%)**: Higher uncommitted bandwidth after assignment yields healthier allocations.
- **Workload Balance (15%)**: Penalizes employees nearing high-stress utilization.

---

## 3. Solution Pool Generation (Primary Team & Backup Alternatives)

To provide resilient staffing contingency:
1. **Primary Team ($S_1$)**: Optimal feasible solution.
2. **Backup Team A ($S_2$)**: Add exclusion/diversity cut requiring at least 1 different member:
   $$\sum_{(i, r) \in S_1} x_{i, r} \le |S_1| - 1$$
   Solve again with CP-SAT.
3. **Backup Team B ($S_3$)**: Add exclusion cuts for both $S_1$ and $S_2$:
   $$\sum_{(i, r) \in S_2} x_{i, r} \le |S_2| - 1$$
   Solve again with CP-SAT.

---

## 4. Emergency Project Recovery

When an employee $i^*$ becomes unavailable on active project $P$:
1. Freeze all unaffected assigned team members $E_{\text{preserved}} = E_{\text{assigned}} \setminus \{i^*\}$.
2. Exclude $i^*$ and all $E_{\text{preserved}}$ from the available candidate pool.
3. Run CP-SAT specifically for the vacant slot(s) ensuring 100% constraint satisfaction.
4. Return updated roster with preserved members and optimal replacement.
5. Require manager one-click approval before authoritative database commit.
