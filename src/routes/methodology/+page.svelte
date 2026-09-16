<svelte:head>
  <title>Methodology — MetalBench</title>
  <meta name="description" content="MetalBench grading, provenance, memory-fit, and comparison policies." />
</svelte:head>

<section class="page-head">
  <p class="eyebrow">METHOD / V1</p>
  <h1>Receipts before rankings.</h1>
  <p class="lede">The rules are deliberately boring: deterministic grading, visible configurations, and no winner when the inputs don’t match.</p>
</section>

<section class="section prose">
  <h2>Grading</h2>
  <p>Benchmark tasks use exact matching, substring checks, JSON parsing, or another declared deterministic rule. An LLM does not judge the answer.</p>

  <h2>Role-specific cohorts</h2>
  <p>A general task score, a companion conversation, and a spoken voice answer different questions. MetalBench keeps them separate instead of pretending there is one universal intelligence number.</p>
  <h3>Companion behavior</h3>
  <p>A companion cohort checks grounded awareness, honest uncertainty, correction, conversational register, reference tracking, language routing, and kind accountability. Raw transcripts are reviewed privately; a text-only simulation is not scored as visual recognition.</p>
  <h3>Speech</h3>
  <p>Voice is measured as the full reply-to-playback chain: canonical reply, private translation when needed, synthesis, and first playable external-output audio. Latency, audio validity, pronunciation, identity stability, and listening fit are reported separately. A listener’s casting choice is not presented as a universal model winner.</p>

  <h2>Provenance levels</h2>
  <dl class="record">
    <div><dt>Documented local</dt><dd>Transcribed from dated local notes. Useful, but not independently reproducible without the raw artifact.</dd></div>
    <div><dt>Artifact-backed local</dt><dd>Includes a sanitized JSON artifact, SHA-256 digest, and harness commit.</dd></div>
    <div><dt>Published external</dt><dd>Links to an HTTPS publisher source. Never determines a local winner recommendation.</dd></div>
  </dl>

  <h2>Comparison policy</h2>
  <p>Hardware, benchmark version, task-set hash, and concurrency must match. Runtime, quant, context, and reasoning differences remain visible warnings.</p>

  <h2>Memory-fit rule</h2>
  <p>Total weights must fit within available memory with room for runtime overhead, KV cache, the operating system, and co-resident services. “The model file fits” is not the same as “the workload fits safely.”</p>

  <h2>Privacy claim</h2>
  <p>Artifacts and the final build pass an automated scanner plus manual review. This lowers risk; it is not an absolute guarantee that no sensitive detail can ever escape.</p>
</section>
