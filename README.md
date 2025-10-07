10-Q Inference (Amplify + Cognito + API Gateway + Lambda)

Live app: https://main.d2pg9zfn1cap9l.amplifyapp.com

A Cognito-protected React app (Vite + Amplify UI) that sends questions about a company’s SEC filings (10-Q/10-K) to a secure API. The API is fronted by API Gateway → Edge Lambda (proxy/validator) → Core Lambda (SecEdgar + Bedrock). Only signed-in users can invoke the backend.

This repo contains the frontend only. The Lambdas/API are deployed in AWS and referenced via environment variables.

Features

Amplify Authenticator (Cognito User Pool)

Form built with Amplify UI: Partner, Year, Period, Question

Client-side guard for impossible periods (e.g., “2025 Annual” before year end)

Sends ID token in Authorization: Bearer <jwt> to a Cognito-protected API

Clean answer card + error states

Architecture
[ React (Amplify UI) ]
   │ (ID token)
   ▼
[ API Gateway HTTP API ]
   └─ Cognito User Pool Authorizer (JWT)
      │
      ▼
[ Edge Lambda (Python) ]
   - Validates payload
   - Reads JWT claims (sub/email)
   - Invokes Core Lambda (boto3)
      │
      ▼
[ Core Lambda ]
   - SecEdgar: fetch 10-Q/10-K text
   - Bedrock (Claude) for Q&A
   - Returns JSON
