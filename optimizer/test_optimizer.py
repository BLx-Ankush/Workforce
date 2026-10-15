import unittest
from models import OptimizationRequest, ProjectRoleSlot, EmployeeInput, EmergencyRecoveryRequest
from solver import optimize_team, reoptimize_emergency, validate_manual_team


class TestWorkforceOptimizer(unittest.TestCase):

    def setUp(self):
        # Sample workforce
        self.employees = [
            # Rahul: AWS + Data Analytics, healthy workload
            EmployeeInput(
                id="emp-1",
                name="Rahul Sharma",
                skills={"AWS": 4, "Data Analytics": 4, "Python": 2},
                verified_skills=["AWS"],
                experience_years=5.0,
                weekly_capacity_hours=40.0,
                allocated_hours=10.0,
                available_hours=30.0,
                workload_risk_score=25.0
            ),
            # Priya: Python + Data Analytics, healthy workload
            EmployeeInput(
                id="emp-2",
                name="Priya Patel",
                skills={"Python": 5, "Data Analytics": 4, "SQL": 4},
                verified_skills=["Python", "SQL"],
                experience_years=4.5,
                weekly_capacity_hours=40.0,
                allocated_hours=15.0,
                available_hours=25.0,
                workload_risk_score=35.0
            ),
            # Arjun: Python + AWS, BUT OVERLOADED (Risk = 92 / 100) -> should be blocked!
            EmployeeInput(
                id="emp-3",
                name="Arjun Verma",
                skills={"Python": 5, "AWS": 5},
                verified_skills=["Python", "AWS"],
                experience_years=7.0,
                weekly_capacity_hours=40.0,
                allocated_hours=38.0,
                available_hours=2.0,
                workload_risk_score=92.0
            ),
            # Neha: Python + Cloud, healthy workload (Alternative to Arjun!)
            EmployeeInput(
                id="emp-4",
                name="Neha Gupta",
                skills={"Python": 4, "AWS": 3, "Cloud Computing": 4},
                verified_skills=["Cloud Computing"],
                experience_years=3.5,
                weekly_capacity_hours=40.0,
                allocated_hours=10.0,
                available_hours=30.0,
                workload_risk_score=28.0
            ),
            # Vikram: Junior Python Developer (Backup)
            EmployeeInput(
                id="emp-5",
                name="Vikram Singh",
                skills={"Python": 4, "Data Analytics": 3, "AWS": 3},
                verified_skills=["Python"],
                experience_years=3.0,
                weekly_capacity_hours=40.0,
                allocated_hours=5.0,
                available_hours=35.0,
                workload_risk_score=15.0
            )
        ]

    def test_scenario_a_complementary_team_formation(self):
        """
        AMC Hack Attack Scenario A:
        Project requires Cloud/AWS Lead (AWS >= 4) + Data/Python Specialist (Python >= 4).
        System must match suitable employees, evaluate availability, and recommend the best team.
        """
        req = OptimizationRequest(
            project_id="proj-101",
            project_title="Cloud Analytics Platform",
            role_slots=[
                ProjectRoleSlot(
                    role_id="role-cloud",
                    role_name="Cloud Solutions Architect",
                    mandatory_skills={"AWS": 4},
                    preferred_skills={"Data Analytics": 3},
                    min_experience_years=3.0,
                    hours_per_week=15.0
                ),
                ProjectRoleSlot(
                    role_id="role-data",
                    role_name="Lead Data Engineer",
                    mandatory_skills={"Python": 4},
                    preferred_skills={"Data Analytics": 4},
                    min_experience_years=3.0,
                    hours_per_week=15.0
                )
            ],
            employees=self.employees,
            workload_risk_threshold=90.0
        )

        res = optimize_team(req)
        self.assertTrue(res.success)
        self.assertIsNotNone(res.primary_team)
        self.assertEqual(len(res.primary_team.assigned_members), 2)

        assigned_ids = [m.employee_id for m in res.primary_team.assigned_members]
        # Rahul has AWS >= 4, Priya has Python >= 4.
        self.assertIn("emp-1", assigned_ids)
        self.assertIn("emp-2", assigned_ids)

        # Overloaded Arjun (emp-3) must NOT be assigned due to fatigue policy
        self.assertNotIn("emp-3", assigned_ids)

        # Check that backup team is generated
        self.assertGreaterEqual(len(res.backup_teams), 1)

    def test_scenario_b_fatigue_aware_blocking(self):
        """
        AMC Hack Attack Scenario B:
        Arjun (emp-3) has 5/5 Python and 5/5 AWS, but workload risk is 92%.
        If a role requires Python >= 4 and AWS >= 4, the solver must NOT assign Arjun.
        """
        req = OptimizationRequest(
            project_id="proj-102",
            project_title="High Risk Test",
            role_slots=[
                ProjectRoleSlot(
                    role_id="role-dev",
                    role_name="Cloud Engineer",
                    mandatory_skills={"Python": 4, "AWS": 3},
                    min_experience_years=3.0,
                    hours_per_week=10.0
                )
            ],
            employees=self.employees,
            workload_risk_threshold=90.0
        )

        res = optimize_team(req)
        self.assertTrue(res.success)
        assigned = res.primary_team.assigned_members[0]
        # Must pick Neha or Vikram, NEVER Arjun!
        self.assertNotEqual(assigned.employee_id, "emp-3")
        # Check that Arjun appears in rejected candidates
        rejected_ids = [r.employee_id for r in res.rejected_candidates]
        self.assertIn("emp-3", rejected_ids)

    def test_emergency_recovery_flow(self):
        """
        Emergency Project Recovery:
        If Priya (emp-2) becomes unavailable, the system recovers by finding an alternative
        while preserving Rahul (emp-1).
        """
        roles = [
            ProjectRoleSlot(
                role_id="role-cloud",
                role_name="Cloud Architect",
                mandatory_skills={"AWS": 4},
                hours_per_week=15.0
            ),
            ProjectRoleSlot(
                role_id="role-data",
                role_name="Lead Data Engineer",
                mandatory_skills={"Python": 4},
                hours_per_week=15.0
            )
        ]
        current_team = {"role-cloud": "emp-1", "role-data": "emp-2"}

        rec_req = EmergencyRecoveryRequest(
            project_id="proj-101",
            project_title="Cloud Analytics",
            unavailable_employee_id="emp-2",
            role_slots=roles,
            current_team=current_team,
            employees=self.employees
        )

        recovery = reoptimize_emergency(rec_req)
        self.assertTrue(recovery.success)
        self.assertEqual(recovery.preserved_members_count, 1)
        self.assertIsNotNone(recovery.new_employee_id)
        # Should pick Neha or Vikram to replace Priya
        self.assertIn(recovery.new_employee_id, ["emp-4", "emp-5"])


if __name__ == "__main__":
    unittest.main()
