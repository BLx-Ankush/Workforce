from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import time
from models import (
    OptimizationRequest,
    OptimizationResponse,
    ValidationRequest,
    ValidationResult,
    EmergencyRecoveryRequest,
    EmergencyRecoveryResponse,
)
from solver import optimize_team, validate_manual_team, reoptimize_emergency

app = FastAPI(
    title="Workforce Intelligence AI — CP-SAT Optimization Microservice",
    version="1.0.0",
    description="Multi-objective, constraint-based team optimizer powered by Google OR-Tools CP-SAT"
)

# Enable CORS for frontend and Node backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "workforce-cpsat-optimizer",
        "engine": "Google OR-Tools CP-SAT v9.15+",
        "timestamp": time.time()
    }


@app.post("/optimize", response_model=OptimizationResponse)
def optimize_project_team(request: OptimizationRequest):
    try:
        response = optimize_team(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Solver execution error: {str(e)}")


@app.post("/validate-team", response_model=ValidationResult)
def validate_team_configuration(request: ValidationRequest):
    try:
        return validate_manual_team(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")


@app.post("/reoptimize-emergency", response_model=EmergencyRecoveryResponse)
def emergency_recovery(request: EmergencyRecoveryRequest):
    try:
        return reoptimize_emergency(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Emergency reoptimization error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
