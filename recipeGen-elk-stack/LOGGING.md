📄 LOGGING_FORMAT.txt – Recipe Generator Logging Standard
Recipe Generator Logging Format

All backend logs must be structured JSON.

Backend Logging Format

Example:

{
  "level": 30,
  "time": "2026-03-01T10:20:34.127Z",
  "name": "user-service",
  "msg": "Created user profile with user_id=1",
}

MySQL slow log example:

# Time: 2026-03-01T10:33:41.712770Z
# Query_time: 30.698499
SELECT BENCHMARK(50000000, MD5('test'));

Filebeat ships raw lines.

Future improvement:
Use Filebeat MySQL module for structured parsing.

Filebeat Inputs

Backend:
/app-logs/*.log

MySQL:
/var/log/mysql/*.log

Fields added by Filebeat:

service: recipegen
component: backend | mysql
environment: dev

Data Stream Mapping

Final Data Stream:
logs-recipegen.backend-dev
logs-recipegen.mysql-dev

Constructed using:
data_stream.type      = logs
data_stream.dataset   = service.component
data_stream.namespace = environment

🔒 Security Model

logstash_system → monitoring only
logstash_writer_recipeGen → write to recipegen data streams only

elastic → admin only

📌 Versioning Policy

If logging format changes:
Increment version
Update index template if required
Document change in README