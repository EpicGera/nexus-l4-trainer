# Graph Report - C:\Users\JDB\Documents\nexus-l4-__-trainer (3)\src  (2026-06-23)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 765 nodes · 1655 edges · 52 communities (45 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]

## God Nodes (most connected - your core abstractions)
1. `AbyssEngine` - 42 edges
2. `parseJsonToDatabase()` - 16 edges
3. `Database` - 16 edges
4. `resolveOrInfer()` - 12 edges
5. `computeAthleteStats()` - 12 edges
6. `loadSessions()` - 11 edges
7. `SessionTotals` - 11 edges
8. `DayVariation` - 11 edges
9. `AthleteState` - 11 edges
10. `TXT` - 10 edges

## Surprising Connections (you probably didn't know these)
- `VolumeProgressionSection()` --calls--> `getMonthlyVolumeStats()`  [INFERRED]
  components/analytics/VolumeProgressionSection.tsx → lib/exportService.ts
- `TrainingAnalysis()` --calls--> `getActiveChapterId()`  [EXTRACTED]
  components/TrainingAnalysis.tsx → lib/chapterStore.ts
- `CoachChatProps` --references--> `AthleteState`  [EXTRACTED]
  components/CoachChat.tsx → types/workout.ts
- `DebriefWizardProps` --references--> `DayVariation`  [EXTRACTED]
  components/DebriefWizard.tsx → types/workout.ts
- `TelemetryBoardProps` --references--> `DayWorkout`  [EXTRACTED]
  components/TelemetryBoard.tsx → types/workout.ts

## Import Cycles
- None detected.

## Communities (52 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (46): FatigueAndIntensitySectionProps, SetRecord, RpeProgressionSectionProps, PHASE_NAMES, VolumeProgressionSectionProps, WeeklyRpeSectionProps, ChapterCreator(), INTENTION_ES (+38 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (43): ActiveDayHeader(), ActiveDayHeaderProps, ChapterSwitcher(), applyAthleteData(), archiveActive(), AthleteDataBlob, ChapterMeta, ChaptersIndex (+35 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (31): CloudSyncPanelProps, WORKOUT_DATABASE, applyInspirationMap(), blockInspirationId(), blocksForPrompt(), forEachBlock(), heuristicInspirationMap(), BrandKey (+23 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (30): BLOCK_FALLBACK, BLOCK_NUM, Bucket, bucketForBlock(), bucketOf(), buildItem(), cleanName(), DAY_INDEX (+22 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (18): SubstitutionCard(), TightGroupingCard(), CARDIO_MACHINES, CardioMachine, convertDistance(), DISTANCE_RATIO, distanceToBikeCal(), GYM_SUBSTITUTIONS (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (17): GameCharacter, carveHCorridor(), carveVCorridor(), circleHitsWall(), DungeonFloor, generateFloor(), isWalkable(), Room (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.21
Nodes (18): getExercise(), classifyEnergySystem(), dominantModality(), effectiveLoadKg(), EnergySystem, exerciseForSet(), modalMapCoverage(), MonotonyStrain (+10 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (19): ALIAS_INDEX, CARDIO_WORDS, CATALOG_BY_ID, classifyMovement(), guessModality(), guessPattern(), guessSkills(), guessWorkModel() (+11 more)

### Community 9 - "Community 9"
Cohesion: 0.18
Nodes (17): VolumeProgressionSection(), buildTelemetryCSV(), collectTelemetryRows(), emitToast(), getMonthlyVolumeStats(), handleExportDayJPG(), handleExportDayMarkdown(), handleExportGoogleSheets() (+9 more)

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (13): metconBlock(), prog(), db, ch2, CatalogEntry, deleteProgram(), entryToDatabase(), listPrograms() (+5 more)

### Community 11 - "Community 11"
Cohesion: 0.16
Nodes (11): DEFAULT_ATHLETE, FULLVIEW_XL_COLS, svgIcons, handleBatchPDFExport(), handleMonthTextExport(), googleProvider, backfillLocalLogsFromDatabase(), getDefaultProgram() (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.16
Nodes (14): BrandInspirationAccordion(), BrandInspirationAccordionProps, INSPIRED_EMOJI, INSPIRED_TEXT, NavigationHeaderProps, BlockBrand, brandByKey(), BRANDS (+6 more)

### Community 13 - "Community 13"
Cohesion: 0.23
Nodes (16): CloudSyncPanel(), AiProvider, effectiveProvider(), getClaudeKey(), getGeminiKey(), getProvider(), read(), setClaudeKey() (+8 more)

### Community 14 - "Community 14"
Cohesion: 0.14
Nodes (13): formatWeight(), RANK_THRESHOLDS, WarriorScreen(), WarriorScreenProps, AbyssGame(), AbyssGameProps, BestRecord, fmtTime() (+5 more)

### Community 15 - "Community 15"
Cohesion: 0.13
Nodes (15): CATALOG, Benchmark, BenchmarkType, ExerciseSource, LoadType, MetconFormat, MODALITIES, MovementScaling (+7 more)

### Community 16 - "Community 16"
Cohesion: 0.24
Nodes (11): MASTER_ACHIEVEMENTS, estimateOneRepMaxesFromLogs(), fmt(), getOneRepMaxes(), getWorkingMax(), MAIN_LIFTS, parseWmPct(), resolveWmRange() (+3 more)

### Community 17 - "Community 17"
Cohesion: 0.13
Nodes (22): computeAthleteStats(), ExercisePR, pushAthleteStats(), safeFieldKey(), BlockIntention, buildChapterPrompt(), DAY_NAMES, evaluateAthlete() (+14 more)

### Community 18 - "Community 18"
Cohesion: 0.23
Nodes (11): buildCharacter(), collectLoggedMovements(), rankFor(), RANKS, detectSkills(), pickLoadout(), SKILL_CATALOG, SkillArchetype (+3 more)

### Community 19 - "Community 19"
Cohesion: 0.17
Nodes (13): ENERGY_PURE, programCoverage(), SpectrumCoverage, TD_ALL, prog, AccessoriesBlock, BlockTimeDomain, EnergySystem (+5 more)

### Community 20 - "Community 20"
Cohesion: 0.14
Nodes (8): DraftSet, InputMode, mmssToSec(), Station, toNum(), setBodyweightKg(), bridgeLegacyLogs(), MetconResult

### Community 21 - "Community 21"
Cohesion: 0.18
Nodes (14): HeroPortrait(), Build, BUILDS, drawHead(), drawHero(), drawWeapon(), Head, HERO_DESIGNS (+6 more)

### Community 23 - "Community 23"
Cohesion: 0.18
Nodes (10): CanonicalBlock, CanonicalDay, CanonicalProgram, CanonicalVariation, CanonicalWeek, fromCanonicalProgram(), LANE_ORDER, flexible (+2 more)

### Community 24 - "Community 24"
Cohesion: 0.22
Nodes (12): auth, handleFirestoreError(), OperationType, getLocalTimestamp(), getLocalTimestamps(), initializeSyncEngine(), isSyncableKey(), pushAllLocalToCloud() (+4 more)

### Community 25 - "Community 25"
Cohesion: 0.28
Nodes (7): ExerciseLog, ExerciseLogger(), ExerciseLoggerProps, getBiomechanicalTips(), getSuggestedRpe(), isBodyweightOnly(), isCardio()

### Community 26 - "Community 26"
Cohesion: 0.24
Nodes (6): BossWindow, buildRunContext(), describeNextBoss(), getBossWindow(), RNG, seedFromString()

### Community 27 - "Community 27"
Cohesion: 0.18
Nodes (8): CoachChatProps, Message, PRESETS, PushNotification, EnrichmentToggleProps, ProfileModalProps, TelemetryBoardProps, AthleteState

### Community 28 - "Community 28"
Cohesion: 0.24
Nodes (9): WorkoutBlockCard(), WorkoutBlockCardProps, ENERGY_META, GEAR_LABEL, INTENTION_META, TIMEDOMAIN_LABEL, TIMEDOMAIN_META, BlockIntention (+1 more)

### Community 29 - "Community 29"
Cohesion: 0.17
Nodes (11): MODALITY_ES, PATTERN_ES, SKILL_ES, TD_ES, TIME_DOMAINS, TrainingAnalysis(), AthleteEvaluation, GeneralSkill (+3 more)

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (9): BOSS_TINT, drawBoss(), drawBrute(), drawEnemy(), drawMinion(), ENEMY_TINTS, EnemyPose, EnemyTint (+1 more)

### Community 31 - "Community 31"
Cohesion: 0.40
Nodes (6): deleteSessionForDay(), getSessionForDay(), loadSessions(), recordManualLog(), saveSession(), saveSessions()

### Community 32 - "Community 32"
Cohesion: 0.25
Nodes (7): BLOCK_COLORS, DebriefWizard(), emptyData(), MetconType, StepData, StepKind, WizardStep

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (5): WorkoutHistoryControlProps, getCleanExerciseName(), getExerciseHistory(), HistorySession, StoredSet

### Community 34 - "Community 34"
Cohesion: 0.31
Nodes (4): WorkoutTimerProps, parseProtocol(), TimerSetupForm(), TimerSetupFormProps

### Community 35 - "Community 35"
Cohesion: 0.32
Nodes (5): DebriefWizardProps, SessionWizardProps, ShareCardOverlayProps, DayVariation, DayWorkout

### Community 36 - "Community 36"
Cohesion: 0.25
Nodes (6): HistoryItem, historyTableContainerVariants, HistoryTableProps, historyTableRowVariants, LogSet, ACCENT_COLORS_MAP

### Community 37 - "Community 37"
Cohesion: 0.29
Nodes (6): firebaseConfig, FirestoreErrorInfo, getAccessToken(), googleSignIn(), initAuth(), requestSheetsAccess()

### Community 38 - "Community 38"
Cohesion: 0.33
Nodes (4): AnalyzedExercise, containerVariants, itemVariants, LogItem

### Community 39 - "Community 39"
Cohesion: 0.40
Nodes (3): RpeAnalyticsPanelProps, HelpNote(), HelpNoteProps

### Community 40 - "Community 40"
Cohesion: 0.40
Nodes (6): cleanBlock(), deriveBlockMeta(), deriveEnergySystem(), parseCapMin(), schemeDurationMin(), toTimeDomain()

### Community 41 - "Community 41"
Cohesion: 0.50
Nodes (3): ExportCustomizationPanel(), ExportCustomizationPanelProps, segBtnClass()

## Knowledge Gaps
- **167 isolated node(s):** `AchievementNotificationProps`, `LogItem`, `AnalyzedExercise`, `containerVariants`, `itemVariants` (+162 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AbyssEngine` connect `Community 3` to `Community 26`, `Community 21`, `Community 14`, `Community 6`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `computeAthleteStats()` connect `Community 17` to `Community 14`, `Community 31`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `Database` connect `Community 2` to `Community 0`, `Community 1`, `Community 4`, `Community 10`, `Community 11`, `Community 13`, `Community 17`, `Community 19`, `Community 23`, `Community 29`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `AchievementNotificationProps`, `LogItem`, `AnalyzedExercise` to the rest of the system?**
  _167 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.0523532522474881 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09869375907111756 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0975609756097561 - nodes in this community are weakly interconnected._