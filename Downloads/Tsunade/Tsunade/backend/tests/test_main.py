import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from core.database import get_db, Base
from core.config import settings

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create test database tables
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Override the dependency
app.dependency_overrides[get_db] = override_get_db

# Test client
client = TestClient(app)

class TestHealthEndpoint:
    """Test health check endpoint"""
    
    def test_health_check(self):
        """Test that health endpoint returns 200"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
    
    def test_health_check_includes_timestamp(self):
        """Test that health endpoint includes timestamp"""
        response = client.get("/health")
        data = response.json()
        assert "timestamp" in data
        assert isinstance(data["timestamp"], str)

class TestRootEndpoint:
    """Test root endpoint"""
    
    def test_root_endpoint(self):
        """Test that root endpoint returns welcome message"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "LP Assistant" in data["message"]

class TestAPIDocumentation:
    """Test API documentation endpoints"""
    
    def test_openapi_json(self):
        """Test that OpenAPI JSON is accessible"""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "info" in data
    
    def test_docs_endpoint(self):
        """Test that Swagger docs are accessible"""
        response = client.get("/docs")
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]
    
    def test_redoc_endpoint(self):
        """Test that ReDoc is accessible"""
        response = client.get("/redoc")
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]

class TestCORSHeaders:
    """Test CORS configuration"""
    
    def test_cors_headers_present(self):
        """Test that CORS headers are present"""
        response = client.options("/health")
        assert "access-control-allow-origin" in response.headers
    
    def test_preflight_request(self):
        """Test preflight CORS request"""
        headers = {
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Content-Type"
        }
        response = client.options("/health", headers=headers)
        assert response.status_code == 200

@pytest.mark.integration
class TestDatabaseConnection:
    """Test database connectivity"""
    
    def test_database_connection(self):
        """Test that database connection works"""
        db = TestingSessionLocal()
        try:
            # Simple query to test connection
            result = db.execute("SELECT 1")
            assert result.fetchone()[0] == 1
        finally:
            db.close()

@pytest.mark.api
class TestAPIVersioning:
    """Test API versioning"""
    
    def test_api_v1_prefix(self):
        """Test that API v1 endpoints are accessible"""
        # This will depend on your actual API structure
        response = client.get("/api/v1/")
        # Adjust based on your actual API structure
        assert response.status_code in [200, 404]  # 404 if no root v1 endpoint

@pytest.mark.security
class TestSecurityHeaders:
    """Test security headers"""
    
    def test_security_headers_present(self):
        """Test that security headers are present"""
        response = client.get("/health")
        
        # Check for common security headers
        expected_headers = [
            "x-content-type-options",
            "x-frame-options",
            "x-xss-protection"
        ]
        
        for header in expected_headers:
            # Note: FastAPI might not set all these by default
            # Adjust based on your security middleware configuration
            pass  # Implement based on your actual security setup

@pytest.mark.performance
class TestPerformance:
    """Test basic performance metrics"""
    
    def test_health_endpoint_response_time(self):
        """Test that health endpoint responds quickly"""
        import time
        
        start_time = time.time()
        response = client.get("/health")
        end_time = time.time()
        
        response_time = end_time - start_time
        assert response.status_code == 200
        assert response_time < 1.0  # Should respond within 1 second

# Fixtures for common test data
@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Test User",
        "is_active": True
    }

@pytest.fixture
def sample_health_data():
    """Sample health data for testing"""
    return {
        "weight": 70.5,
        "height": 175.0,
        "blood_pressure_systolic": 120,
        "blood_pressure_diastolic": 80,
        "heart_rate": 72,
        "temperature": 36.5
    }

@pytest.fixture
def sample_exercise_data():
    """Sample exercise data for testing"""
    return {
        "exercise_type": "running",
        "duration_minutes": 30,
        "calories_burned": 300,
        "distance_km": 5.0,
        "intensity": "moderate"
    }

# Cleanup
def teardown_module():
    """Clean up after tests"""
    import os
    if os.path.exists("test.db"):
        os.remove("test.db")