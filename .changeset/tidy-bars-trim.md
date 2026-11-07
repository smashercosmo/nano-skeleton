---
"nano-skeleton": patch
---

fix: trim text bars to the cap height for a bare or auto-detected `inline`

- Since 0.8.0, only an explicit `inline="lines-bg-per-line"` got bars trimmed to the cap height. Text detected automatically, a bare `inline` attribute or an unknown value got taller bars that nearly touched across lines, although they all mean `lines-bg-per-line`
