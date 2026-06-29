# Deployment

This project has three deployable apps:

- `backend`: Express API
- `dashboard`: authenticated trading dashboard
- `frontend`: public landing site

## Backend

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Environment variables:

```env
NODE_ENV=production
PORT=3002
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=https://your-dashboard-domain.com,https://your-frontend-domain.com
```

## Dashboard

Build command:

```bash
npm install && npm run build
```

Publish directory:

```text
build
```

Environment variables:

```env
REACT_APP_API_URL=https://your-backend-domain.com
```

## Frontend

Build command:

```bash
npm install && npm run build
```

Publish directory:

```text
build
```

Environment variables:

```env
REACT_APP_DASHBOARD_URL=https://your-dashboard-domain.com
```

## Verification

Run these before deploying:

```bash
cd backend && npm test -- --watchAll=false
cd ../dashboard && npm run build
cd ../frontend && npm run build
```
