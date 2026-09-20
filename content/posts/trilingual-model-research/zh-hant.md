## 重點研究與開發

進行中的研究

### 從零訓練的三語語言模型

中／英／日三語 · Decoder-only Transformer · SentencePiece · FP8 部署研究

從零開始訓練的中、英、日三語 decoder-only 語言模型。這個專案用來實際研究完整的語言模型 stack：Tokenizer、Transformer 架構、Pre-training、Post-training、量化以及高效率推論。

```text
$ model.inspect
# 實驗架構快照
類型           decoder-only 稠密 Transformer
語言           中／英／日

隱藏維度        1280
注意力頭        16
KV 頭          16

位置編碼        RoPE + NoPE（混合配置）
激活函數        SwiGLU + GEGLU（實驗性混合）
正規化          RMSNorm
分詞器          SentencePiece Unigram
```

注意力機制研究

- MHA／GQA／MQA 取捨

- 實驗性 latent-attention 設計

- KV cache 的影響

- 記憶體／吞吐量取捨

```text
# 歷史實驗快照
# 數值為某一次實驗 run 的紀錄，
# 並非最新模型 checkpoint
步數            1,597
tokens          418,541,760
驗證            4.6082 loss
困惑度          100.31
吞吐量          4,021 tokens/sec
梯度範數        0.93
```

部署研究

```text
BF16 訓練
      │
      ↓
     PTQ
      │
      ↓
 FP8 推論
      │
 ┌────┴──────────┐
 ↓               ↓
vLLM       TensorRT-LLM
```

E4M3 · PTQ · KV precision
TensorRT-LLM · vLLM
VRAM 最佳化
吞吐量最佳化

研究概念

### 自適應成長式 Transformer

研究 Transformer 是否可以不固定深度與模型大小，而是根據訓練與輸入逐步調整可用參數與計算路徑。研究方向包含模型增長、結構化 pruning、sequence-level layer routing、variable computational depth，以及避免路由 loop 的約束機制。

```text
傳統式
L1 → L2 → L3 → L4 → L5 → OUT

自適應路由（概念）
        ┌─────────┐
        ↓         │
L1 → L3 → L1 → L6 → OUT
     │
     └────→ L5 ─────→
```

研究問題

- 路由該如何選擇？

- 如何防止迴圈？

- 計算量該如何計入代價？

- 容量該如何安全增長？

- 何時該修剪層？

模型增長

```text
小模型
    ↓
容量擴張
    ↓
持續訓練
    ↓
更大的模型
```

研究目標：逐步成長至數十億參數規模。

開發中

### 日語發音與韻律評估

超越轉錄正確度，評估日語口說品質：發音正確性、音素／拍正確度、音調重音、語調、流暢度與節奏。

```text
麥克風／音訊
        │
        ↓
 語音編碼器
        │
        ↓
強制／學習對齊
        │
        ├───────────────┐
        ↓               ↓
音素／拍正確度        F0／音高
                      輪廓
        │               │
        └───────┬───────┘
                ↓
        流暢度／節奏
                │
                ↓
          評分模型
                │
                ↓
        學習者回饋
```

規劃中的技術堆疊

- 前端：Nuxt 4 + Tailwind CSS 4

- 後端：Python · 儲存：SQLite

- ML：PyTorch／語音模型

## 正在探索

LLM 架構

高效率注意力
自適應計算
動態深度
參數增長
結構化修剪

高效率推論

FP8 · MXFP8 · NVFP4
KV cache 最佳化
TensorRT-LLM
服務效率

可解釋性

稀疏自動編碼器
激活分析
電路
激活修補

後訓練

偏好最佳化
DPO · GRPO
PPO／TRPO 系列
獎勵設計

Speech AI

日語音素／拍評估
音調重音
韻律建模
流暢度評估
