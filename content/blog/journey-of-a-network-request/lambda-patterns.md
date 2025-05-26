---
title: "DNS Resolution"
date: 2025-05-21
draft: true
tags: ["dns", "tcp", "http"]
---

# DNS Resolution

Exploring common patterns and best practices for building serverless applications with AWS Lambda.

## Common Lambda Patterns

### 1. API Gateway + Lambda
The most common pattern for building serverless APIs:
```
API Gateway → Lambda → Database/Service
```

### 2. Event-Driven Processing
Lambda functions triggered by AWS events:
- S3 object uploads
- DynamoDB stream changes  
- SQS messages
- CloudWatch events

### 3. Fan-Out Pattern
One event triggers multiple Lambda functions:
```
SNS Topic → Multiple Lambda Functions
```

### 4. Pipeline Pattern
Chain Lambda functions for data processing:
```
S3 Upload → Process → Transform → Store → Notify
```

## Best Practices

- **Keep functions small**: Single responsibility principle
- **Minimize cold starts**: Use provisioned concurrency for critical paths
- **Handle errors gracefully**: Implement retry logic and dead letter queues
- **Monitor everything**: Use CloudWatch and X-Ray for observability
- **Optimize memory**: More memory = faster execution (up to a point)

## Cost Optimization

- Right-size memory allocation
- Use reserved concurrency to limit costs
- Consider using ARM-based Graviton2 processors
- Implement efficient connection pooling

Lambda excels at event-driven architectures but requires careful design for optimal performance and cost. 