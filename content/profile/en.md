## Skills

AI & LLM Engineering

Transformer Architecture
Quantization (FP8 · INT4 · W/A/KV)
vLLM · TensorRT-LLM
Post-Training (SFT · DPO · GRPO)
Interpretability (SAE · SVD)

Programming Languages

Go (Gin)
Python (FastAPI · Asyncio)
Rust

Cloud & Infrastructure

AWS
Kubernetes (EKS)
Helm
Terraform

Data & Messaging

Apache Kafka
PostgreSQL
Redis

DevOps & Observability

GitHub Actions
GitLab CI
OpenTelemetry
Prometheus
Grafana
Loki
Tempo

Web & API

Vue.js (Nuxt 4)
Tailwind CSS 4
RESTful API

## Experience

### v4.0.0 Japanese Language Study Tokyo School of the Japanese Language (Naganuma School) 2026.04 – PRESENT ACTIVE

Study

- Full-time Japanese language study in Tokyo.

### v3.0.0 Senior Cloud Engineer TrendMicro 趨勢科技 2022.07 – 2026.04

Orchestration

### Companion-Orchestrator Agent Center

- Designed and shipped an agent-orchestration platform on Google ADK with clear app architecture and module boundaries.

- Implemented Agent-to-Agent (A2A) communication to coordinate remote agents.

- Built an LLM agent with tool use, state tracking, retries, and error handling.

- Delivered a web Playground for scenario testing and prompt/tool debugging; frontend developed independently with AI-assisted workflows.

- Created a CopilotKit adapter and composed multi-step LangGraph flows.

- Enabled dynamic agent loading via database-backed configs for zero-downtime rollout.

- Authored ADK ↔ AGUI Middleware (Python 3.13+) providing SSE streaming and Human-in-the-Loop workflows; integrated with the orchestrator.

- Achieved an end-to-end pipeline A2A → ADK → LangGraph → CopilotKit adopted cross-org with other teams.

→ [ADK-AGUI Middleware (GitHub)](https://github.com/trendmicro/adk-agui-middleware)

Platform

### Platform Development & API Management

- Built a plugin-based API platform that lets teams ship integrations without core changes; provided lifecycle hooks, auth, and rate limiting.

- Developed a Collector Manager for configurable log routing with backpressure and retry controls.

- Created a Mini-Companion system with GitHub-based sync for declarative workflows.

- Implemented a Companion Proxy enforcing PII redaction and policy-based request filtering.

Infrastructure

### Cloud Infrastructure Optimization

- Re-architected EKS node groups: moved monitoring to ARM nodes for cost savings and introduced dedicated CPU-/memory-optimized pools.

- Resolved Kubernetes compatibility defects in Stream Lake environments.

- Authored modular Helm charts to standardize deployments across services.

- Fixed CNI IP exhaustion and routing issues to stabilize multi-tenant clusters.

AI & Security

### AI Integration & Data Security

- Built an AWS Comprehend PII pipeline that reduced costs by ~99% while preserving detection quality.

- Created an AI Proxy Adapter with Amazon Bedrock integration and policy enforcement.

- Developed a Kafka → Neptune pipeline for MITRE-aligned knowledge graphs.

- Implemented fine-grained AI access controls with auditability and tenant isolation.

Leadership

### Technical Leadership

- Produced executive-level AI demos for the CEO's NVIDIA presentation.

- Led internal workshops on AI tooling and best practices.

- Recognized as Employee of the Quarter.

- Drove cross-functional enablement through reusable platform components.

### v2.0.0 Back-End Engineer KKStream 2021.06 – 2022.07

DevOps

### DevOps & Infrastructure

- Optimized GitLab CI/CD pipelines, reducing deployment time by 40%.

- Deployed Kubernetes clusters using Helm.

- Implemented Terraform for infrastructure as code.

- Managed Kubernetes clusters using Kops.

Architecture

### System Architecture & Development

- Designed Kafka-based consumer service architecture.

- Created Docker Compose development environment.

- Integrated multiple backend services and databases.

- Built low-latency streaming server using Golang.

Research

### Research & Implementation

- Evaluated WebRTC Mesh and SFU technologies.

- Integrated Pydantic for robust data validation.

- Refactored monolithic projects for better maintenance.

- Implemented CI/CD pipeline testing integration.

### v1.0.0 Back-End Engineer (Intern) 天堂遊戲有限公司 2019.01 – 2019.07

API

### API Development & Optimization

- Optimized RESTful APIs using Golang PProf.

- Reduced API response times by 30%.

- Refactored codebases for improved modularity.

Research

### Research & Evaluation

- Implemented Apache Spark for data processing.

- Demonstrated GraphQL API capabilities.

- Evaluated emerging technologies for adoption.

## Education

Tokyo School of the Japanese Language (Naganuma School)

2026.04 – Present · Japanese language study in Tokyo

National Taipei University of Technology 台北科技大學

2016 – 2020 · Electronic Engineering

## Technical Depth

### LLM Architecture

Core

- Transformer architecture

- Decoder-only language models

Attention

- MHA · GQA · MQA

- latent-attention variants

Position Representation

- RoPE · NoPE

- hybrid positional designs

Feed-forward

- SwiGLU · GEGLU

Normalization

- RMSNorm

Residual Design

- standard residual paths

- experimental attention-residual variants

Tokenizer

- SentencePiece · Unigram

### Training & Post-training

Pre-training

- token / data pipeline

- optimization

- learning-rate scheduling

- checkpointing

- validation loss / perplexity

- throughput monitoring

Post-training · implemented

- SFT · DPO · GRPO

Studied / compared

- PPO · TRPO · DAPO

### Inference & Quantization

Precision

- FP16 · BF16 · FP8 · INT8 · INT4

Quantization Concepts

- W / A / KV precision

- PTQ · E4M3

- W8A16KV8-style configurations

Runtime / Serving

- vLLM · TensorRT-LLM · Ollama

Performance

- KV cache

- batching

- context length

- VRAM estimation

- throughput / tokens per second

Exploring

- MXFP8 · NVFP4

### Model Interpretability

CURRENT STUDY

- Sparse Autoencoders (SAE)

- SVD

- activation analysis

- activation patching

- circuit-level interpretation concepts

### Agentic AI

PRODUCTION

- Google ADK

- Agent-to-Agent (A2A)

- LangGraph · CopilotKit

- AG-UI integration

- tool execution

- state management

- Human-in-the-Loop

- streaming (SSE)

- retries & error handling

- dynamic agent configuration

### Backend & Distributed Systems

Languages

- Go · Python · Rust

Backend

- REST · FastAPI · Gin · Asyncio

Distributed Systems

- Kafka · Redis · PostgreSQL

- event-driven systems

- asynchronous processing

Design

- modular architecture

- plugin architecture

- microservices

- low-latency systems

### Cloud & Platform

Infrastructure

- AWS · Kubernetes / EKS

- Terraform · Helm

CI/CD

- GitHub Actions · GitLab CI

Observability

- OpenTelemetry · Prometheus · Grafana · Loki · Tempo

Production Experience

- EKS node-group architecture

- ARM migration

- CPU / memory optimized pools

- CNI troubleshooting

- multi-tenant cluster stability

- reusable Helm modules

### Security

- PII protection & redaction

- policy enforcement

- tenant isolation

- access control

- auditability

- security architecture

## Beyond Engineering

Japanese

Currently studying Japanese in Tokyo at Tokyo School of the Japanese Language (Naganuma School).

Piano

Learning piano as a long-term hobby, with current emphasis on sight-reading, harmony and fluent score reading.

Scuba Diving

Interested in distinctive dive sites around Japan, especially wrecks, large marine life and location-specific underwater environments.

## Open-Source Projects

### [dgxtop](https://github.com/DennySORA/dgxtop)

High-performance interactive system monitor for NVIDIA DGX systems — GPU, CPU, memory, disk and network in a beautiful TUI.

Rust ★ 69 github.com/DennySORA/dgxtop

### [DLsite-Classification-Manager](https://github.com/DennySORA/DLsite-Classification-Manager)

High-performance async DLsite work classification and management tool with a modern web interface, automatic metadata crawling and intelligent search.

Python ★ 36 github.com/DennySORA/DLsite-Classification-Manager

### [Chinese_Convert](https://github.com/DennySORA/Chinese_Convert)

Batch conversion between simplified and traditional Chinese across many files and types.

★ 14 github.com/DennySORA/Chinese_Convert

### [Ops-Tools](https://github.com/DennySORA/Ops-Tools)

DevOps CLI toolbox: Terraform / Terragrunt helpers, AI tools, MCP server, security scanner and clean-code automation.

Rust ★ 9 github.com/DennySORA/Ops-Tools

### [Image-Tools](https://github.com/DennySORA/Image-Tools)

Interactive batch tool for removing image backgrounds, with green-screen support and multiple removal options.

Python ★ 1 github.com/DennySORA/Image-Tools

### [Auto-Video-Organize](https://github.com/DennySORA/Auto-Video-Organize)

Blazing fast CLI for automating video organization: batch HEVC encoding, file deduplication, contact sheets and intelligent sorting.

Rust github.com/DennySORA/Auto-Video-Organize

### [httpulse](https://github.com/DennySORA/httpulse)

Real-time HTTP latency & network quality monitoring with an interactive TUI — DNS, TLS, TTFB, RTT, jitter and more.

Rust github.com/DennySORA/httpulse

## Community

### 硬核 AI 交流社 — Facebook Group Admin

Admin of a Facebook group for AI paper exchange and discussion.

[facebook.com/groups/915613384421068](https://www.facebook.com/groups/915613384421068)

### AI Paper Daily — paper.dennysora.me

- Collects papers daily from arXiv (11 categories + keyword queries), Hugging Face Daily Papers, and AI blogs.

- LLM-scored and ranked; selected papers translated to Traditional Chinese.

- Daily / weekly / monthly reports published automatically via GitHub Pages.

[paper.dennysora.me](https://paper.dennysora.me)

## Tech Note

[Boring Cryptography, Fun Encryption!](https://ithelp.ithome.com.tw/users/20130205/ironman/3517)
ithelp.ithome.com.tw

[WebRTC Introduction](https://docs.google.com/presentation/d/1nrHkMwLe7SLEI3aPvYRaDyRPn18H2lghtUKnmVrkoWU)
Google Slides
