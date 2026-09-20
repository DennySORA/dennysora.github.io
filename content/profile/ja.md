## スキル

AI・LLM 開発

Transformer アーキテクチャ
量子化（FP8 · INT4 · W/A/KV）
vLLM · TensorRT-LLM
ポストトレーニング（SFT · DPO · GRPO）
解釈可能性（SAE · SVD）

プログラミング言語

Go (Gin)
Python (FastAPI · Asyncio)
Rust

クラウド＆インフラ

AWS
Kubernetes (EKS)
Helm
Terraform

データとメッセージング

Apache Kafka
PostgreSQL
Redis

DevOps とオブザーバビリティ

GitHub Actions
GitLab CI
OpenTelemetry
Prometheus
Grafana
Loki
Tempo

Web と API

Vue.js (Nuxt 4)
Tailwind CSS 4
RESTful API

## 経歴

### v4.0.0 日本語留学 東京日本語学校（長沼スクール） 2026.04 – 現在 在学中

学習

- 東京で日本語を集中的に学習中。

### v3.0.0 シニアクラウドエンジニア トレンドマイクロ Trend Micro 2022.07 – 2026.04

オーケストレーション

### Companion-Orchestrator Agent Center

- Google ADK 上にエージェントオーケストレーションプラットフォームを設計・リリース。明確なアプリケーションアーキテクチャとモジュール境界を実現。

- Agent-to-Agent（A2A）通信を実装し、リモートエージェントを連携。

- ツール呼び出し・状態追跡・リトライ・エラー処理を備えた LLM エージェントを構築。

- シナリオテストとプロンプト／ツールのデバッグ用 Web Playground を提供。フロントエンドは AI 支援ワークフローで独立開発。

- CopilotKit アダプターを作成し、多段階の LangGraph フローを構成。

- DB 駆動の設定による動的エージェントローディングを実現し、ゼロダウンタイムでリリース。

- ADK ↔ AGUI Middleware（Python 3.13+）を開発。SSE ストリーミングと Human-in-the-Loop ワークフローを提供し、オーケストレーターと統合。

- A2A → ADK → LangGraph → CopilotKit のエンドツーエンドパイプラインを実現し、他チームに組織横断で採用。

→ [ADK-AGUI Middleware (GitHub)](https://github.com/trendmicro/adk-agui-middleware)

プラットフォーム

### プラットフォーム開発と API 管理

- プラグインベースの API プラットフォームを構築。コアを変更せずに統合機能をリリース可能にし、ライフサイクルフック・認証・レート制限を提供。

- バックプレッシャーとリトライ制御を備えた、設定可能なログルーティングの Collector Manager を開発。

- GitHub ベースの同期による宣言的ワークフローを実現する Mini-Companion システムを構築。

- PII マスキングとポリシーベースのリクエストフィルタリングを強制する Companion Proxy を実装。

インフラ

### クラウドインフラ最適化

- EKS ノードグループを再設計：監視を ARM ノードへ移行してコスト削減、CPU／メモリ最適化専用プールを導入。

- Stream Lake 環境の Kubernetes 互換性不具合を解消。

- モジュラー Helm チャートを作成し、サービス間のデプロイを標準化。

- CNI IP 枯渇とルーティング問題を修正し、マルチテナントクラスタを安定化。

AI とセキュリティ

### AI 統合とデータセキュリティ

- AWS Comprehend の PII パイプラインを構築し、検出品質を維持しながらコストを約 99% 削減。

- Amazon Bedrock 統合とポリシー強制を備えた AI Proxy Adapter を作成。

- MITRE 準拠のナレッジグラフ構築のため Kafka → Neptune パイプラインを開発。

- 監査性とテナント分離を備えたきめ細かな AI アクセス制御を実装。

リーダーシップ

### テクニカルリーダーシップ

- CEO の NVIDIA プレゼンテーション向けにエグゼクティブレベルの AI デモを制作。

- AI ツールとベストプラクティスの社内ワークショップを主導。

- Employee of the Quarter（四半期最優秀社員）に選出。

- 再利用可能なプラットフォームコンポーネントを通じて部門横断のイネーブルメントを推進。

### v2.0.0 バックエンドエンジニア KKStream 2021.06 – 2022.07

DevOps

### DevOps とインフラ

- GitLab CI/CD パイプラインを最適化し、デプロイ時間を 40% 短縮。

- Helm を使用して Kubernetes クラスタをデプロイ。

- Terraform で Infrastructure as Code を実装。

- Kops で Kubernetes クラスタを運用。

アーキテクチャ

### システムアーキテクチャと開発

- Kafka ベースのコンシューマーサービスアーキテクチャを設計。

- Docker Compose 開発環境を構築。

- 複数のバックエンドサービスとデータベースを統合。

- Golang で低遅延ストリーミングサーバーを開発。

調査

### 調査と実装

- WebRTC Mesh／SFU 技術を評価。

- Pydantic を導入し、堅牢なデータバリデーションを実現。

- モノリシックなプロジェクトを保守性向上のためリファクタリング。

- CI/CD パイプラインへのテスト統合を実装。

### v1.0.0 バックエンドエンジニア （インターン） 天堂遊戲有限公司 2019.01 – 2019.07

API

### API 開発と最適化

- Golang PProf で RESTful API を最適化。

- API 応答時間を 30% 短縮。

- モジュール性向上のためコードベースをリファクタリング。

調査

### 調査と評価

- Apache Spark によるデータ処理を実装。

- GraphQL API の可能性をデモンストレーション。

- 導入候補の新技術を評価。

## 学歴

東京日本語学校（長沼スクール）

2026.04 – 現在 · 日本留学

台北科技大学 National Taipei University of Technology

2016 – 2020 · 電子工学

## 技術的深さ

### LLM アーキテクチャ

コア

- Transformer アーキテクチャ

- decoder-only 言語モデル

アテンション

- MHA · GQA · MQA

- latent-attention の亜種

位置エンコーディング

- RoPE · NoPE

- ハイブリッドな位置設計

フィードフォワード

- SwiGLU · GEGLU

正規化

- RMSNorm

残差設計

- 標準的な残差パス

- 実験的な attention-residual の亜種

トークナイザー

- SentencePiece · Unigram

### 学習とポストトレーニング

事前学習

- トークン／データパイプライン

- 最適化

- 学習率スケジューリング

- チェックポイント

- 検証 loss／パープレキシティ

- スループット監視

ポストトレーニング・実装済み

- SFT · DPO · GRPO

学習・比較済み

- PPO · TRPO · DAPO

### 推論と量子化

精度

- FP16 · BF16 · FP8 · INT8 · INT4

量子化の概念

- W／A／KV 精度

- PTQ · E4M3

- W8A16KV8 型の構成

ランタイム／サービング

- vLLM · TensorRT-LLM · Ollama

パフォーマンス

- KV cache

- バッチング

- コンテキスト長

- VRAM 見積もり

- スループット／tokens per second

探究中

- MXFP8 · NVFP4

### モデル解釈可能性

学習中

- スパースオートエンコーダ（SAE）

- SVD

- アクティベーション分析

- アクティベーションパッチング

- 回路レベルの解釈の概念

### エージェンティック AI

本番運用

- Google ADK

- Agent-to-Agent（A2A）

- LangGraph · CopilotKit

- AG-UI 統合

- ツール実行

- 状態管理

- Human-in-the-Loop

- ストリーミング（SSE）

- リトライとエラー処理

- 動的エージェント設定

### バックエンドと分散システム

言語

- Go · Python · Rust

バックエンド

- REST · FastAPI · Gin · Asyncio

分散システム

- Kafka · Redis · PostgreSQL

- イベント駆動システム

- 非同期処理

設計

- モジュラーアーキテクチャ

- プラグインアーキテクチャ

- マイクロサービス

- 低遅延システム

### クラウドとプラットフォーム

インフラ

- AWS · Kubernetes / EKS

- Terraform · Helm

CI/CD

- GitHub Actions · GitLab CI

オブザーバビリティ

- OpenTelemetry · Prometheus · Grafana · Loki · Tempo

本番経験

- EKS ノードグループ設計

- ARM 移行

- CPU／メモリ最適化プール

- CNI トラブルシューティング

- マルチテナントクラスタの安定化

- 再利用可能な Helm モジュール

### セキュリティ

- PII 保護・マスキング

- ポリシー強制

- テナント分離

- アクセス制御

- 監査性

- セキュリティアーキテクチャ

## エンジニアリングの外側

日本語

現在、東京の東京日本語学校（長沼スクール）で日本語を勉強中。

ピアノ

長期的な趣味としてピアノを練習中。現在は初見演奏、和声、スムーズな読譜に注力。

スクーバダイビング

日本の特徴的なダイビングポイントに興味。特に沈船、大型海洋生物、その場所ならではの水中環境が好き。

## オープンソースプロジェクト

### [dgxtop](https://github.com/DennySORA/dgxtop)

NVIDIA DGX 向けの高性能インタラクティブシステムモニター。GPU・CPU・メモリ・ディスク・ネットワークを美しい TUI で表示。

Rust ★ 69 github.com/DennySORA/dgxtop

### [DLsite-Classification-Manager](https://github.com/DennySORA/DLsite-Classification-Manager)

高性能な非同期 DLsite 作品の分類・管理ツール。モダンな Web インターフェース、自動メタデータクローリング、インテリジェント検索を搭載。

Python ★ 36 github.com/DennySORA/DLsite-Classification-Manager

### [Chinese_Convert](https://github.com/DennySORA/Chinese_Convert)

複数ファイル・複数タイプの中国語を簡体字と繁体字の間で一括変換。

★ 14 github.com/DennySORA/Chinese_Convert

### [Ops-Tools](https://github.com/DennySORA/Ops-Tools)

DevOps CLI ツールボックス：Terraform／Terragrunt ヘルパー、AI ツール、MCP サーバー、セキュリティスキャナー、クリーンコード自動化。

Rust ★ 9 github.com/DennySORA/Ops-Tools

### [Image-Tools](https://github.com/DennySORA/Image-Tools)

画像の背景を除去するインタラクティブなバッチツール。グリーンスクリーン対応、複数の除去オプションを搭載。

Python ★ 1 github.com/DennySORA/Image-Tools

### [Auto-Video-Organize](https://github.com/DennySORA/Auto-Video-Organize)

動画整理を自動化する高速 CLI：バッチ HEVC エンコード、ファイル重複排除、コンタクトシート生成、インテリジェントなソート。

Rust github.com/DennySORA/Auto-Video-Organize

### [httpulse](https://github.com/DennySORA/httpulse)

リアルタイム HTTP レイテンシとネットワーク品質を監視するインタラクティブ TUI。DNS、TLS、TTFB、RTT、ジッターなどを追跡。

Rust github.com/DennySORA/httpulse

## コミュニティ

### 硬核 AI 交流社 — Facebook グループ管理者

AI 論文の交流と議論を行う Facebook グループの管理者。

[facebook.com/groups/915613384421068](https://www.facebook.com/groups/915613384421068)

### AI 論文デイリー — paper.dennysora.me

- arXiv（11 カテゴリ＋キーワード検索）、Hugging Face Daily Papers、AI ブログから論文を毎日収集。

- LLM でスコアリング・ランキングし、注目論文を台湾繁体中国語に翻訳。

- 日次／週次／月次レポートを GitHub Pages に自動公開。

[paper.dennysora.me](https://paper.dennysora.me)

## 技術ノート

[退屈な暗号学、面白い暗号化！](https://ithelp.ithome.com.tw/users/20130205/ironman/3517)
ithelp.ithome.com.tw

[WebRTC 入門](https://docs.google.com/presentation/d/1nrHkMwLe7SLEI3aPvYRaDyRPn18H2lghtUKnmVrkoWU)
Google Slides
