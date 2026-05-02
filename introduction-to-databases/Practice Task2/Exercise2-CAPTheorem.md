# Exercise 2: CAP Theorem Analysis

In a **distributed** system, network partitions (P) can happen, so designs typically *assume P* and then prioritize between **C** (Consistency) and **A** (Availability).

## 1) Stock trading platform — **CP (Consistency + Partition tolerance)**
- Correctness is critical: you must avoid inconsistent order books/executions.
- During partitions, it may reject/queue operations (reduced availability) to keep consistent state.

## 2) Content delivery network (CDN) — **AP (Availability + Partition tolerance)**
- Serving content is the priority; stale cache is usually acceptable temporarily.
- During partitions, it continues serving from edge caches.

## 3) Airline booking system — **CP (Consistency + Partition tolerance)**
- Must avoid double-booking seats.
- During partition or uncertainty, it may block/limit booking (sacrificing availability) until consistency is ensured.

## 4) Video streaming service — **AP (Availability + Partition tolerance)**
- Playback should continue even if some metadata is slightly stale.
- Prioritizes availability; can degrade quality or use fallback paths.
