# Events API Spec

Base URL: `/api/events`

Auth model:
- `x-user-id`: optional caller identifier. Defaults to `demo-user` when omitted.
- `x-user-role`: optional role. Use `admin` to override owner checks.
- `GET` endpoints are open.
- `PUT` and `DELETE` are allowed only for the event owner or an admin.

Error response format:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed.",
  "details": [
    {
      "path": "endAt",
      "message": "endAt must be later than startAt.",
      "code": "custom"
    }
  ]
}
```

## Event shape

```json
{
  "id": "evt_demo_001",
  "title": "Sprint planning",
  "description": "Scope the next iteration and assign owners.",
  "startAt": "2026-03-23T01:00:00.000Z",
  "endAt": "2026-03-23T02:00:00.000Z",
  "calendarId": "team",
  "tagIds": ["planning"],
  "status": "confirmed",
  "createdAt": "2026-03-21T00:00:00.000Z",
  "updatedAt": "2026-03-21T00:00:00.000Z",
  "createdBy": "demo-user",
  "updatedBy": "demo-user"
}
```

## `GET /api/events`

Query parameters:
- `calendarId`: optional exact match
- `tagId`: optional tag filter
- `q`: optional title/description substring search
- `startsFrom`: optional ISO datetime, includes overlapping events
- `endsUntil`: optional ISO datetime, includes overlapping events
- `limit`: optional, default `50`, max `100`
- `offset`: optional, default `0`

Example:

```bash
curl "http://localhost:3000/api/events?calendarId=team&limit=10"
```

Response:

```json
{
  "data": {
    "items": [
      {
        "id": "evt_demo_001",
        "title": "Sprint planning",
        "description": "Scope the next iteration and assign owners.",
        "startAt": "2026-03-23T01:00:00.000Z",
        "endAt": "2026-03-23T02:00:00.000Z",
        "calendarId": "team",
        "tagIds": ["planning"],
        "status": "confirmed",
        "createdAt": "2026-03-21T00:00:00.000Z",
        "updatedAt": "2026-03-21T00:00:00.000Z",
        "createdBy": "demo-user",
        "updatedBy": "demo-user"
      }
    ],
    "total": 2,
    "limit": 10,
    "offset": 0
  }
}
```

## `POST /api/events`

Request body:

```json
{
  "title": "Backend sync",
  "description": "Finalize CRUD contract.",
  "startAt": "2026-03-25T01:00:00.000Z",
  "endAt": "2026-03-25T02:00:00.000Z",
  "calendarId": "team",
  "tagIds": ["backend", "review"],
  "status": "confirmed"
}
```

Example:

```bash
curl -X POST "http://localhost:3000/api/events" \
  -H "Content-Type: application/json" \
  -H "x-user-id: demo-user" \
  -d "{\"title\":\"Backend sync\",\"description\":\"Finalize CRUD contract.\",\"startAt\":\"2026-03-25T01:00:00.000Z\",\"endAt\":\"2026-03-25T02:00:00.000Z\",\"calendarId\":\"team\",\"tagIds\":[\"backend\",\"review\"],\"status\":\"confirmed\"}"
```

Response:

```json
{
  "data": {
    "id": "2f3ab5b0-0b8b-4bc8-bfd2-2b2398ba50ce",
    "title": "Backend sync",
    "description": "Finalize CRUD contract.",
    "startAt": "2026-03-25T01:00:00.000Z",
    "endAt": "2026-03-25T02:00:00.000Z",
    "calendarId": "team",
    "tagIds": ["backend", "review"],
    "status": "confirmed",
    "createdAt": "2026-03-21T10:00:00.000Z",
    "updatedAt": "2026-03-21T10:00:00.000Z",
    "createdBy": "demo-user",
    "updatedBy": "demo-user"
  }
}
```

## `GET /api/events/{eventId}`

Example:

```bash
curl "http://localhost:3000/api/events/evt_demo_001"
```

Response:

```json
{
  "data": {
    "id": "evt_demo_001",
    "title": "Sprint planning",
    "description": "Scope the next iteration and assign owners.",
    "startAt": "2026-03-23T01:00:00.000Z",
    "endAt": "2026-03-23T02:00:00.000Z",
    "calendarId": "team",
    "tagIds": ["planning"],
    "status": "confirmed",
    "createdAt": "2026-03-21T00:00:00.000Z",
    "updatedAt": "2026-03-21T00:00:00.000Z",
    "createdBy": "demo-user",
    "updatedBy": "demo-user"
  }
}
```

## `PUT /api/events/{eventId}`

Full replacement body is required.

Example:

```bash
curl -X PUT "http://localhost:3000/api/events/evt_demo_001" \
  -H "Content-Type: application/json" \
  -H "x-user-id: demo-user" \
  -d "{\"title\":\"Sprint planning updated\",\"description\":\"Scope, risks, and owners.\",\"startAt\":\"2026-03-23T01:30:00.000Z\",\"endAt\":\"2026-03-23T02:30:00.000Z\",\"calendarId\":\"team\",\"tagIds\":[\"planning\",\"backend\"],\"status\":\"confirmed\"}"
```

Response:

```json
{
  "data": {
    "id": "evt_demo_001",
    "title": "Sprint planning updated",
    "description": "Scope, risks, and owners.",
    "startAt": "2026-03-23T01:30:00.000Z",
    "endAt": "2026-03-23T02:30:00.000Z",
    "calendarId": "team",
    "tagIds": ["planning", "backend"],
    "status": "confirmed",
    "createdAt": "2026-03-21T00:00:00.000Z",
    "updatedAt": "2026-03-21T10:05:00.000Z",
    "createdBy": "demo-user",
    "updatedBy": "demo-user"
  }
}
```

## `DELETE /api/events/{eventId}`

Example:

```bash
curl -X DELETE "http://localhost:3000/api/events/evt_demo_001" \
  -H "x-user-id: demo-user"
```

Response:

```json
{
  "data": {
    "id": "evt_demo_001",
    "deleted": true
  }
}
```

## Typical failures

### `404 NOT_FOUND`

```json
{
  "code": "NOT_FOUND",
  "message": "Event not found."
}
```

### `403 FORBIDDEN`

```json
{
  "code": "FORBIDDEN",
  "message": "Only the event owner or an admin can modify this event."
}
```
