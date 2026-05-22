---
title: "Building BodaFare: A Quantile Regression Pricing Engine in Rust"
date: 2026-05-01T12:00:00+03:00
draft: false
tags: ["Rust", "Machine Learning", "System Architecture", "Mobility"]
---

A boda boda fare is not a single number. It is a negotiation range anchored by real-world costs. A 3 km ride in rural Kakamega costs KES 30–50, while the same distance in the Nairobi CBD never drops below KES 100. To solve this for the Vouch mobility platform, we built the BodaFare pricing engine.

## The Problem with Averages

Most pricing models use Ordinary Least Squares (OLS) to predict a single average price. However, boda boda fare distributions are right-skewed and bounded below by a hard break-even cost. To output an accurate range, we use linear quantile regression minimizing the pinball loss function:

$$L_\tau(y, \hat{y}) = \tau \cdot \max(y - \hat{y}, 0) + (1 - \tau) \cdot \max(\hat{y} - y, 0)$$

By updating this model via stochastic subgradient descent on every completed ride, we guarantee convergence to the true conditional quantile. Over-prediction at $\tau = 0.10$ is penalized 9 times more than under-prediction, which forces the model to find the market floor.

## Pure Rust Architecture

We built the engine entirely in Rust. The core system is a single shared state wrapped in an `Arc<RwLock<EngineState>>`. For storage, we strictly isolate responsibilities across our database stack:

* **PostgreSQL (PostGIS):** This acts as the source of truth, storing full ride records and handling spatial queries for zone tier polygons.
* **ScyllaDB:** This handles high-throughput time-series writes. It maintains the Welford online accumulators for rolling statistics without the row-lock contention of PostgreSQL.
* **Redis:** This serves as the hot model state cache. It caches `FareRange` views based on a request fingerprint for sub-millisecond reads.

## Honest Metrics Over Haversine

Instead of relying on straight-line Haversine distance, which is dishonest in dense urban areas, the model extracts actual road distance and route tortuosity from map polylines.

Tortuosity is the road distance divided by the straight-line distance. A direct suburban route has a tortuosity around 1.1, while a CBD route with forced one-ways can reach 2.0. When a route floods and riders take winding shortcuts, the tortuosity spikes. The model recognizes this elevated route-stress signal and naturally pushes the predicted quantiles upward, without needing a hardcoded weather API flag.

## The Mathematical Cost Floor

Beneath the quantile regression lies a non-negotiable hard floor. This is calculated using pure arithmetic. We take the actual route distance, multiply it by the standard fuel consumption of a motorcycle (3.5 litres per 100 km), and peg it to the current EPRA fuel price in Nairobi. We then add the rider's daily fixed obligations and the specific goodwill stage fees for the origin zone.

## System Output and Feedback Loops

The system ultimately outputs a `FareRange` JSON containing everything from the absolute market floor ($q_{10}$) to the surge ceiling ($q_{90}$). Passengers see the fair market median ($q_{50}$) alongside the normal negotiation band. Riders are given full visibility into the surge ceiling and their mathematical break-even floor.

If a requested fare dips below the calculated floor, the system explicitly warns the rider that they are losing money. Furthermore, every generated estimate is stored in PostgreSQL. When the ride completes, the actual negotiated fare feeds back into the engine. If the actual fare exceeds $q_{90}$, it acts as a real data point that pushes all quantiles upward for that specific zone-pair and hour.