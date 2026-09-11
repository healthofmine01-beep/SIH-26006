"""
Decision support and optimization Pydantic request models.
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class FreightAnalysisInputModel(BaseModel):
    cargoType: str
    cargoQuantity: float
    origin: str
    destinationPort: str
    requiredDate: Optional[str] = None
    contractPreference: Optional[str] = "Spot"
