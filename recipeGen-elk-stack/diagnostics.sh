#!/bin/bash

echo "=== DOCKER SETUP DIAGNOSTICS ==="
echo ""

echo "1. Check if backend container is running:"
docker ps | grep backend

echo ""
echo "2. Check if logs are being generated in backend container:"
docker exec -it recipeGen-elk-stack-backend-1 ls -lah /app/logs/ 2>/dev/null || echo "FAILED: Backend container not found"

echo ""
echo "3. Check app.log size in backend container:"
docker exec -it recipeGen-elk-stack-backend-1 wc -l /app/logs/app.log 2>/dev/null || echo "FAILED: Cannot access app.log"

echo ""
echo "4. Read last few lines from app.log in backend container:"
docker exec -it recipeGen-elk-stack-backend-1 tail -20 /app/logs/app.log 2>/dev/null || echo "FAILED: Cannot read app.log"

echo ""
echo "5. Check if filebeat can access the volume:"
docker exec -it recipeGen-elk-stack-filebeat-1 ls -lah /app-logs/ 2>/dev/null || echo "FAILED: Filebeat container not found"

echo ""
echo "6. Check filebeat connection status:"
docker logs recipeGen-elk-stack-filebeat-1 2>&1 | grep -i "logstash\|elasticsearch" | tail -5

echo ""
echo "7. Check docker network:"
docker network ls | grep recipe-network
docker network inspect recipe-network 2>/dev/null | grep "Containers" -A 20

echo ""
echo "=== END DIAGNOSTICS ==="
