# Practical Implementation Guide: Recipe Generator + 3 Other Projects

## 📋 Final Configuration Summary for Your Setup

### Architecture Overview
Backend / Frontend / MySQL
        ↓
      Filebeat
        ↓
     Logstash (Routing + Data Stream Metadata)
        ↓
  Elasticsearch (Data Streams + ILM)
        ↓
       Kibana (Dashboards)

### **Recipe Generator Project Breakdown**

```
PROJECT: recipeGen
├── Component 1: backend    → Node.js/Express API
└── Component 2: database   → MySQL

DATA STREAMS:
✅ logs-recipeGen-backend-dev
✅ logs-recipeGen-database-dev
```
(logs-<service>.<component>-<environment>)

---

## ⚙️ Step-by-Step Implementation

### **STEP 1: Update Your Backend Configuration**

**Suggested Enhancement:**
```env
# Logging
LOG_LEVEL=info
LOG_FORMAT=json
ENABLE_CONSOLE_LOGGING=true
ENABLE_FILE_LOGGING=true
LOG_FILE_PATH=./logs/app.log
```

### **STEP 2: Update Backend Logger Code**

Your backend should log like this (Node.js example):

```json
{
  "timestamp": "2024-03-01 10:30:45",
  "level": "info",
  "message": "User logged in",
  "name": "user-router"
}
```

### **STEP 3: Filebeat Configuration (Your filebeat.yml)**

Already updated - here's the final version with all 3 services:

```yaml
filebeat.config.inputs:
  enabled: false

filebeat.inputs:
  # Backend Application Logs
  - type: filestream
    id: recipeGen-backend
    enabled: true
    paths:
      - /app-logs/app.log
    fields:
      service: recipegen
      component: backend
      environment: dev
    fields_under_root: true
    parsers:
      - ndjson:
          overwrite_keys: true
          add_error_key: true
          expand_keys: true

  # MySQL Database Logs
  - type: filestream
    id: recipeGen-database
    enabled: true
    paths:
      - /var/log/mysql/*.log
    fields:
      service: recipegen
      component: database
      environment: dev
    fields_under_root: true

# Ship to Logstash (which routes based on project/service)
output.logstash:
  hosts: ["${LOGSTASH_HOST:logstash}:${LOGSTASH_PORT:5044}"]

# Add Docker metadata
processors:
  - add_docker_metadata:
      host: "unix:///var/run/docker.sock"
  - add_host_metadata:
  - add_fields:
      target: log
      fields:
        version: "1.0.0"

logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  keepfiles: 7
```
### Logstash Routing Logic

Logstash dynamically builds data stream metadata:

mutate {
  replace => { "[data_stream][type]" => "logs" }
  replace => { "[data_stream][dataset]" => "%{service}.%{component}" }
  replace => { "[data_stream][namespace]" => "%{environment}" }
}

Routing condition:

if [service] == "recipegen" {
  elasticsearch {
    data_stream => true
  }
}

### Elasticsearch Setup

Run in Kibana → Dev Tools.

1️⃣ Create ILM Policy
PUT _ilm/policy/recipegen-logs-lifecycle
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_primary_shard_size": "50gb",
            "max_age": "1d"
          }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": { "delete": {} }
      }
    }
  }
}

2️⃣ Create Index Template
{
  "index_patterns": ["logs-recipegen.*"],
  "data_stream": {},
  "priority": 200,
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "index.lifecycle.name": "recipegen-logs-lifecycle"
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "service": { "type": "keyword" },
        "component": { "type": "keyword" },
        "environment": { "type": "keyword" },
        "file": { "type": "keyword" },
        "level": { "type": "keyword" },
        "msg": { "type": "text" }
      }
    }
  }
}

3. Create role:

PUT _security/role/logstash_writer_role_recipeGen
	{   
      "cluster": ["monitor"],
  		"indices": [
    		{
      				"names": [
        				"logs-recipegen.*"
   				   ],
      		"privileges": [
        		"create",
        		"create_index",
            "create_doc",
            "read",
        		"write",
        		"index",
            "manage"
      		]
    		}
  		]
	}

4. Create user:

POST _security/user/logstash_writer_recipeGen
{
  "password": "recipeGenWriter",
  "roles": ["logstash_writer_role_recipeGen"],
  "full_name": "Logstash writer for recipeGen data streams"
}

### 📊 Kibana Setup

Create index pattern:

logs-recipegen.*
Time field: @timestamp

📈 Dashboards
Backend Dashboard

Filter:
service: "recipegen" AND component: "backend"

Shows:
Errors by level
Request rate
API performance
User actions
MySQL Dashboard

Filter:
service: "recipegen" AND component: "mysql"

Shows:
Slow queries
Query time distribution
Errors


### Notes for Multi-Project Scaling

Each project must:

Use its own writer role
Use its own index template
Use its own ILM policy

Follow naming convention strictly

