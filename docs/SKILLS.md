# Skills System

## Skill Contract

Each skill exports:

- `name`: stable id (`kb.search`, `leads.upsert`, ...)
- `description`
- `inputSchema` and `outputSchema` (zod)
- `permissionGate(context): boolean | Promise<boolean>`
- `execute(input, context)`

## Execution Context

- `tenantId` (required)
- `userId` (optional)
- `conversationId` (optional)
- Supabase client adapter
- permission flags

## Tool Calling Rules

- All tool inputs and outputs are schema-validated.
- Permission gate is evaluated before execution.
- Failures return structured error codes.
- Tool call logs are returned in orchestrator response.

## Initial Skills

- `kb.search(query)` returns passages and citation objects.
- `leads.upsert(leadPayload)` inserts/updates tenant lead.
- `conversations.appendMessage(payload)` appends tenant-scoped messages.

## Stubbed Future Skills

- `integrations.mls.searchListings`
- `integrations.crm.pushLead`
- `integrations.sms.send`
  All are contract-only placeholders in v1.

## Citation Format

```ts
{
  sourceId: string;
  title: string;
  url?: string;
  snippet: string;
}
```
