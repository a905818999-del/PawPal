# DeskPet M2A 人工 QA 记录 - 2026-05-10

## 当前结论

本轮记录用于承接 `.omx/plans/deskpet-m2a-manual-qa-closure-2026-05-10.md`。

当前状态：`Internal QA not closed, next repair/approval targets listed`。

原因：

- 自动化 gate 已覆盖 M2A 打包、资源 allowlist、设置持久化、代表性图片加载、底部坐姿、睡眠返回和 M1 安全边界。
- 人工视觉验收仍未完整关闭，尤其是 Rourou likeness、nearest-row 状态语义、SmartScreen/AV、多显示器/DPI 和授权/来源。
- 本记录不会把自动化通过写成人工视觉通过。

公开发布状态：不能声明 public release ready。

## 测试环境记录

| 项目 | 记录 |
| --- | --- |
| 日期 | 2026-05-10 |
| 记录来源 | Ralph 执行收口计划，结合当前仓库证据和已有人工反馈 |
| OS / 设备 | 未完整记录；需要最终人工 QA 补充 |
| 显示器环境 | 当前记录只确认“无多显示器环境”这一人工反馈，未覆盖多显示器/DPI |
| 包版本 | `0.1.0-m2a` |
| 主要包文件 | `dist\DeskPet 0.1.0-m2a.exe`、`dist\DeskPet-0.1.0-m2a-win.zip` |
| 自动化证据 | `docs/test-verifier-report.md`、`pnpm smoke:m2a` |
| 视觉产物 | `output/program_preview/semantic_asset_review/semantic_fix_frames_after.png`、`output/program_preview/motion_review/motion_fix_frames_after.png`、`output/program_preview/manual_qa_repair_2026-05-10/break_prompt_running_after.png` |

## 01-22 人工 QA 结果

| ID | 当前结果 | 本轮处理 | 当前状态 |
| --- | --- | --- | --- |
| 01 | 正常 | 保留通过候选，最终回归抽测。 | 通过候选 |
| 02 | 正常 | 保留通过候选，最终回归抽测。 | 通过候选 |
| 03 | 2026-05-12 人工复测通过 | 已修复可疑代码路径：已有设置窗口会先 `restore()` / `show()`，再 `focus()`；人工重复打开复测已通过。 | 通过 |
| 04 | 正常 | 保留通过候选，最终回归抽测。 | 通过候选 |
| 05 | 正常 | 保留通过候选，最终回归抽测。 | 通过候选 |
| 06 | 正常 | 保留通过候选，最终回归抽测。 | 通过候选 |
| 07 | 2026-05-12 复测：点击有跳跃动画，但是人没有跳跃 | 记录为后续讨论项：当前 `happy.webp` 有跳跃反馈，但人物本体动作语义不够匹配。 | 待讨论/待修 |
| 08 | 拖动正常 | 普通拖动保留通过候选；底部坐姿由 `pnpm smoke:m2a` 覆盖路径。 | 通过候选 |
| 09 | 2026-05-12 复测：播放了坐的素材，但是坐的素材不好看 | 记录为视觉质量问题：`sitting.webp` 路径可触发，但素材观感不通过。 | 待修 |
| 10 | 正常 | 保留通过候选，最终回归抽测。 | 通过候选 |
| 11 | 未测，等待手动触发 | `pnpm smoke:m2a` 已覆盖 shortened sleep path；仍需人工确认实际观感。 | 自动化覆盖路径，人工待确认 |
| 12 | 2026-05-12 复测：专注动画不流畅 | 记录为动作流畅度问题：`focusGuard.webp` 仍需后续调整。 | 待修 |
| 13 | 正常 | 保留通过候选，最终回归抽测。 | 通过候选 |
| 14 | 未测，等待手动触发 | break prompt/running/done 有修复产物和部分自动化路径；仍需人工逐态确认。 | 待人工确认 |
| 15 | 未测，等待手动触发 | hydration prompt/drinking/done 有修复产物和部分自动化路径；仍需人工逐态确认。 | 待人工确认 |
| 16 | 未测，等待手动触发 | focus/sleep/reminder 相关状态需一次短会话看完并记录。 | 待人工确认 |
| 17 | 正常 | 保留通过候选，最终回归抽测。 | 通过候选 |
| 18 | 无多显示器环境 | 记录为环境未覆盖，不写通过。 | 环境未覆盖 |
| 19 | 正常 | 保留通过候选，最终回归抽测。 | 通过候选 |
| 20 | 未测 | SmartScreen/AV 依赖目标环境，当前不写通过。 | 环境未覆盖 |
| 21 | 未测 | Rourou draft/runtime pack 来源与 likeness 未 public-release-cleared。 | 发布阻塞 |
| 22 | 多数动画未看到，不能通过 | 07、09、11、12、14、15、16 未完全人工关闭前，不写通过。 | 未关闭 |

## 2026-05-12 人工 QA 增量反馈

- ID 03：通过。设置窗口重复召回问题在本轮人工复测中未复现。
- ID 07：未通过/待讨论。点击时有跳跃动画，但人物本体没有跳跃，后续需要讨论 `happy` 动作语义是否重做。
- ID 09：未通过。底部坐姿路径会播放坐的素材，但当前坐姿素材不好看。
- ID 12：未通过。专注动画不流畅。
- 其余 ID：本轮未测，保持原状态。

## 自动化已覆盖内容

来自 `docs/test-verifier-report.md` 的当前证据：

- `pnpm typecheck` 通过。
- `node --check scripts\smoke-m1.mjs` 通过。
- `pnpm dist:win` 通过，产出 portable 和 zip。
- `pnpm smoke:m2a` 通过。
- renderer 已加载 `idle`、`sitting`、`sleeping`、`focusGuard`、`breakPrompt`、`hydrationPrompt`，尺寸为 `256x256`。
- zip 和 `win-unpacked` 均只包含 13 个 `main_pixel_avatar` runtime WebP，排除了 raw、cleaned、notes、manifest、focusAlert、manualFocus、touch、walk 等非 M2A 运行输入。
- bottom drag、manual focus override、drag-away idle、shortened sleep、settings restart persistence 均有自动化路径证据。

## 本轮 Ralph 执行结果

本轮已完成：

- 新增本人工 QA 记录。
- 修复 ID 03 的可疑路径：复用已存在设置窗口时，先恢复最小化窗口，显示隐藏窗口，再聚焦。
- 更新 `docs/test-risk-log.md`，新增 RISK-014 记录设置窗口召回风险。
- 更新 `specs/deskpet-phase1.md`，记录设置窗口隐藏/最小化时的恢复路径和手工复测要求。
- 更新 `docs/test-verifier-report.md`，补充本轮验证输出。

本轮实际命令结果：

```text
pnpm typecheck
=> passed

node --check scripts\smoke-m1.mjs
=> passed

pnpm dist:win
=> passed
=> dist\DeskPet 0.1.0-m2a.exe: 100979678 bytes
=> dist\DeskPet-0.1.0-m2a-win.zip: 151082429 bytes

pnpm smoke:m2a
=> passed
=> unpacked app: 210890752 bytes
=> portable: 100979678 bytes
=> zip: 151082429 bytes
=> zip audit: 157 entries, 1 executable entry, no elevate.exe
=> M2A smoke passed
```

## 快速人工复测路径

| 状态 | 快速路径 | 需要人工判断 |
| --- | --- | --- |
| `happy` | 点击宠物或 `window.pawpal.triggerDemo("happy")` | 是否顺滑回到 `idle`，是否有明显跳变 |
| `sitting` | 拖到工作区底部边缘 | 是否像自然休息/坐姿，是否有轻微动态 |
| `sleeping` | 缩短 `DESKPET_IDLE_SLEEP_DELAY_MS` / `DESKPET_IDLE_SLEEP_DURATION_MS` 后等待 | 是否读得出睡眠，返回 `idle` 是否自然 |
| `focusGuard` | `window.pawpal.startFocus()` | 不看气泡时是否能读成专注 |
| `focusDone` | UI 结束专注或 `window.pawpal.stopFocus()` | 是否读成完成/取消反馈 |
| `breakPrompt` | `window.pawpal.triggerDemo("break")` | 气泡是否遮挡，提示状态是否太忙 |
| `breakRunning` | 从 break prompt 触发 `break:done` | 跑动方向和节奏是否自然 |
| `breakDone` | 触发 `break-run:done` 或等待休息跑动完成 | 完成姿势是否清楚，是否回到 `idle` |
| `hydrationPrompt` | `window.pawpal.triggerDemo("hydration")` | 气泡是否遮挡，提示状态是否太忙 |
| `drinking` | 从 hydration prompt 触发 `hydration:done` | 喝水动作是否不过快、不过大 |
| `hydrationDone` | hydration done 后等待完成状态 | 完成姿势是否清楚，是否回到 `idle` 或专注状态 |
| `sad` | 从 break prompt 触发 `break:mute` | sad 状态是否清楚且停留时间合适 |

## 仍未关闭的风险

- RISK-005：PawPal placeholder 资产公开发布风险仍打开。
- RISK-006：M2A Rourou runtime pack 不能被误写成 public-release-cleared。
- RISK-007：tray 行为仍需要 Windows 人工观察。
- RISK-008：多显示器/DPI 仍未覆盖。
- RISK-010：视觉质量和 nearest-row 语义仍需要人工批准。
- RISK-011：SmartScreen/AV 仍依赖目标环境。

## 本轮完成条件

本轮只能在以下情况下改为 `Internal QA pass, public release still blocked`：

- ID 07、09、12 人工复测通过或已完成后续修复并复测。
- ID 11、14、15、16 已实际观察并记录结果。
- ID 20、21 有环境/来源记录。
- ID 22 给出最终人工结论。
- 最后一次代码或素材改动后，`pnpm typecheck`、`node --check scripts\smoke-m1.mjs`、`pnpm dist:win`、`pnpm smoke:m2a` 通过。

当前仍是 `Internal QA not closed, next repair/approval targets listed`。
