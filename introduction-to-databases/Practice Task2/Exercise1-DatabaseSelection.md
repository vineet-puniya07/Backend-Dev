# Exercise 1: Database Selection (SQL vs NoSQL)

## 1) Online banking system — **SQL (Relational)**
- Needs **strong consistency** for balances/transactions.
- Requires **ACID transactions**, constraints, and clear audit trails.
- Typical model is highly structured (accounts, ledgers, transfers).

## 2) Social media platform — **NoSQL (Document / Wide-column) + sometimes SQL for parts**
- High write/read throughput, flexible evolving schema (posts, reactions, feeds).
- Denormalization is common for fast timelines.
- Relationships exist, but many queries are “read optimized” and vary by feature.

## 3) Real-time chat application — **NoSQL (Document / Key-value) + optional SQL for billing/admin**
- Messages are append-heavy; needs high availability and low latency.
- Schema evolves (attachments, reactions, read receipts).
- Partitioning by conversation/user is natural.

## 4) Hospital patient records — **SQL (Relational)** (often with controlled NoSQL for unstructured notes)
- Requires **data integrity**, constraints, auditing, and consistent updates.
- Highly sensitive domain: correctness and compliance dominate.
- Some unstructured data (notes/scans) may live outside relational tables, but the core record system is usually relational.

## 5) IoT sensor data collection — **NoSQL (Time-series / Document / Wide-column)**
- Very high ingest rates and large volumes.
- Time-based queries and retention policies are common.
- Natural fit for time-series patterns and horizontal scaling.
