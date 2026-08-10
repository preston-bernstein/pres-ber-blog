# Markup Audit Log — Group C

Every bold, italic, and inline-code span reviewed across the 4 assigned files. No bold or italic spans exist in any of the 4 files (confirmed via regex sweep excluding fenced code blocks), so there are no lines to log for those categories beyond this note. All inline-code spans below are literal technical identifiers and were kept unchanged.

- clamav-clean-scan-doesnt-mean-safe.md:25 | code | kept | file extension literal (`.exe`)
- clamav-clean-scan-doesnt-mean-safe.md:25 | code | kept | file extension literal (`.scr`)
- clamav-clean-scan-doesnt-mean-safe.md:25 | code | kept | file extension literal (`.bat`)
- clamav-clean-scan-doesnt-mean-safe.md:29 | code | kept | ClamAV config flag name (`DetectPUA`)
- clamav-clean-scan-doesnt-mean-safe.md:29 | code | kept | config filename (`clamd.conf`)
- clamav-clean-scan-doesnt-mean-safe.md:33 | code | kept | tool/package name (`clamav-unofficial-sigs`)
- clamav-clean-scan-doesnt-mean-safe.md:37 | code | kept | file extension literal (`.yar`)
- clamav-clean-scan-doesnt-mean-safe.md:45 | code | kept | CLI tool name (`diec`)
- tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md:29 | code | kept | env var name (`MAX_ASYNC_LLM`)
- tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md:29 | code | kept | env var name (`MAX_PARALLEL_INSERT`)
- tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md:29 | code | kept | config filename (`env.example`)
- tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md:29 | code | kept | env var expression (`MAX_ASYNC_LLM / 3`)
- tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md:29 | code | kept | env var name (`EMBEDDING_FUNC_MAX_ASYNC`)
- tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md:29 | code | kept | env var name (`EMBEDDING_BATCH_NUM`)
- tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md:31 | code | kept | literal config value set (env var assignments)
- tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md:35 | code | kept | env var assignment (`MAX_ASYNC_LLM=8`)
- tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md:37 | code | kept | env var name (`MAX_ASYNC_LLM`)
- tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md:41 | code | kept | env var name (`EMBEDDING_BATCH_NUM`)
- tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md:47 | code | kept | config key name (`rpm`)
- tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md:47 | code | kept | config key name (`tpm`)
- tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md:47 | code | kept | config key name (`model_list`)
- tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md:47 | code | kept | config key name (`max_parallel_requests`)
- tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md:47 | code | kept | config key name (`retry_policy`)
- tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md:47 | code | kept | config key name (`RateLimitErrorRetries`)
- tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md:53 | code | kept | config filename (`env.example`)
- performance-optimizations-using-top-level-await.md:49 | code | kept | JS keyword identifier (`await`), prose reference outside the pre-approved code fences
- performance-optimizations-using-top-level-await.md:72 | code | kept | JS keyword identifier (`await`), first occurrence, prose reference
- performance-optimizations-using-top-level-await.md:72 | code | kept | JS keyword identifier (`await`), second occurrence, prose reference

## Bold spans
None found in any of the 4 files (deciding-what-fits-resale-clothing-monitor.md, clamav-clean-scan-doesnt-mean-safe.md, tuning-lightrag-ingestion-concurrency-against-gemini-rate-limits.md, performance-optimizations-using-top-level-await.md).

## Italic spans
None found in any of the 4 files. (Underscore-delimited env var names like `MAX_ASYNC_LLM` were checked and confirmed to be code identifiers, not markdown italics — markdown italics require word-boundary underscores, and these are mid-word/all-caps identifiers used only inside backtick code spans.)

## deciding-what-fits-resale-clothing-monitor.md
No bold, italic, or inline-code spans present in this file at all.
