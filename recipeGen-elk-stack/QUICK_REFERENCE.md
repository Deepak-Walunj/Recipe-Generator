# Quick Reference: ELK Data Streams Architecture

## 🎯 The Bottom Line

**Your Recipe Generator:**
```
MyLogs (Physical) → Backend  + DB logs 
         ↓
      Filebeat
         ↓
      Logstash
         ↓
  Elasticsearch (2 separate Data Streams created)
         ↓
      Kibana (1 Group showing all 3 Data Streams)
```

---

## 📦 Data Streams vs Groups

### **Data Stream = Physical Container** (In Elasticsearch)
```
logs-recipeGen.backend-dev       ← Data Stream 1
logs-recipeGen.database-dev      ← Data Stream 2
```

### **Group = Logical View** (In Kibana)
```
logs-recipeGen-*                 ← Shows all 3 data streams together
```

---

## 📝 For Your Recipe Generator

### **What Gets Created in Elasticsearch?**
```
3 Data Streams:
✅ logs-recipeGen-backend-dev       (10,000-100K logs/day)
✅ logs-recipeGen-database-dev      (100-10K logs/day)
```

### **What You See in Kibana?**
```
1 Recipe Generator Group:
✅ Discover: logs-recipeGen-* (shows all 2 together)
✅ Dashboards: By service (backend, DB)
✅ Alerts: All 2 data streams
```

---

## 🗂️ For Your 4 Projects

### **Storage in Elasticsearch (Physical)**
```
14 Total Data Streams:

Recipe Generator (3):
  logs-recipeGen-backend-dev
  logs-recipeGen-frontend-dev
  logs-recipeGen-database-dev

E-Commerce (4):
  logs-ecommerce-backend-prod
  logs-ecommerce-frontend-prod
  logs-ecommerce-database-prod
  logs-ecommerce-payment-prod

Social App (4):
  logs-socialapp-backend-prod
  logs-socialapp-frontend-prod
  logs-socialapp-database-prod
  logs-socialapp-cache-prod

CMS (3):
  logs-cms-backend-prod
  logs-cms-frontend-prod
  logs-cms-database-prod
```

### **Organization in Kibana (Logical)**
```
4 Groups / Index Patterns:

Group 1: logs-recipeGen-*     → Shows 3 data streams
Group 2: logs-ecommerce-*     → Shows 4 data streams
Group 3: logs-socialapp-*     → Shows 4 data streams
Group 4: logs-cms-*           → Shows 3 data streams
```

---

## 🔄 The Flow

```
Your App Code
    ↓
    └─→ Generates logs
         └─→ Saved to: /app/logs/app.log (filesystem)
             └─→ Picked up by: Filebeat (every 1 sec)
                 └─→ Sent to: Logstash:5044 (TCP pipeline)
                     └─→ Logstash routes based on:
                         - service: "recipeGen"
                         - component: "backend"
                         └─→ Creates/sends to:
                             Data Stream: logs-recipeGen.backend-dev
                                 ↓
                             Elasticsearch (stores it)
                                 ↓
                             Kibana (you see it & query it)
```

---

## 💾 Data Stream Field Structure

Every log entry in `logs-recipeGen-backend-dev` will have:

```json
{
  "times": "2024-03-01T10:30:45.123Z",
  "msg": "Request from user 123",
  "level": "30",
  
  // From your app
  "component": "backend",
  "service": "recipeGen",
  "environment": "dev",
  
  // From Filebeat
  "log": {
    "file": {
      "path": "/app-logs/app.log"
    }
  },
  
  // From Docker
  "docker": {
    "container": {
      "name": "backend",
      "id": "abc123..."
    }
  }
}
```

This structure allows filtering in Kibana:
```
Component: "backend" AND service: "recipeGen" AND level: "error"
```
---

## 🎯 Remember These 3 Things

### 1. **Data Streams are PHYSICAL**
- They exist in Elasticsearch
- Indexed and searchable
- Can be queried directly

### 2. **Groups are LOGICAL**
- They exist in Kibana
- Index patterns like `logs-recipeGen-*`
- Help you organize the UI

### 3. **For Your 4 Projects**
- 14 data streams total (physical storage)
- 4 groups in Kibana (logical organization)
- 1 Logstash pipeline (routes to correct data stream)
- 1 Filebeat (collects from all apps)

---

## ❓ FAQ Quick Answers

**Q: How many data streams should I have?**
A: One per service per environment. Recipe Gen = 2

**Q: What's a "group" in real terms?**
A: An index pattern in Kibana that finds multiple data streams

**Q: Can I search across all 4 projects at once?**
A: Yes! Use pattern `logs-*` to search all data streams

**Q: Where do I set retention (delete logs after X days)?**
A: Elasticsearch ILM Policy (Index Lifecycle Management)

**Q: Can I have different retention per project?**
A: Yes! Create separate ILM policies, apply to different data streams

**Q: How do I know if logs are flowing?**
A: Check: Data Stream → Documents count increasing → Kibana shows logs

**Q: What if logs aren't appearing in Kibana?**
A: Check: Filebeat → Logstash → Elasticsearch → Index Pattern
