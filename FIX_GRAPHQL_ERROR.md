# Fix: GraphQL Validation Error - exportTatitraReport

## Problem
The backend Docker container shows this error:
```
GraphQL Error: [ValidationError: Cannot query field "exportTatitraReport" on type "Mutation". 
Did you mean "exportReport"?]
```

## Root Cause
The Docker container is running an old version of the backend code that doesn't include the new `exportTatitraReport` mutation. The code has been updated in the repository, but the container needs to be rebuilt or restarted to load the new schema.

## Solution

### Option 1: Rebuild the Backend Container (Recommended)
This ensures the latest code is loaded:

```bash
# Stop the containers
docker-compose down

# Rebuild the backend container
docker-compose build backend

# Start the containers
docker-compose up -d
```

### Option 2: Restart the Backend Container
If you're confident the code is already in the container but just needs a restart:

```bash
# Restart just the backend service
docker-compose restart backend

# Or restart all services
docker-compose restart
```

### Option 3: Force Rebuild Everything
If the above doesn't work, do a complete rebuild:

```bash
# Stop and remove everything
docker-compose down -v

# Rebuild all containers from scratch
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

## Verification

After restarting, check the backend logs to confirm the schema loaded successfully:

```bash
docker-compose logs backend | grep -A 5 "GraphQL schema loaded"
```

You should see:
```
✅ GraphQL schema loaded successfully.
```

Then test the mutation in GraphQL Playground at `http://localhost:4000/graphql`:

```graphql
mutation {
  exportTatitraReport(
    quarter: "EFATRA"
    year: 2024
  ) {
    success
    message
    url
    fileName
  }
}
```

## Why This Happens

Docker containers cache the application code when they're built. When you update the code in your repository:
1. The files on your local machine are updated ✅
2. The files in the running Docker container are NOT updated automatically ❌

You must rebuild or restart the container to pick up the changes.

## Prevention

For development, you can use volume mounting to auto-sync code changes:
```yaml
# In docker-compose.yml
services:
  backend:
    volumes:
      - ./backend/src:/app/src  # Mount source code
```

This way, changes to the code are reflected immediately in the container (though you may still need to restart Node.js to reload modules).
