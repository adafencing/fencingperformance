export const CES_TEXT = (
  <div className="space-y-3">
    <p>
      <b>Composite Efficiency Score (CES)</b> is a summary number that tells how
      effectively a fencer is fencing right now. It’s like a “fencing GPA” —
      not perfect, but it gives a quick sense of whether the performance is
      strong, average, or weak.
    </p>

    <p>
      <b>The traffic light system:</b>
      <br />
      Green (≥ 70) → fencing is efficient and competition-ready.
      <br />
      Yellow (50–69) → fencing is inconsistent, needs sharpening.
      <br />
      Red (&lt; 50) → fencing is inefficient, signals technical/tactical
      breakdown or fatigue.
    </p>

    <p>
      <b>How to read it in practice:</b>
      <br />
      • A fencer in Green during sparring is likely ready to carry efficiency
      into tournaments.
      <br />
      • Yellow means they look sharp in parts but can’t sustain it — plan more
      scenario-based drills.
      <br />
      • Red is a flag: overload from training, taper not set, or off-track
      tactics/technique.
    </p>
  </div>
);

export const SE_TEXT = (
  <div className="space-y-3">
    <p>
      <b>Season Efficiency (SE)</b> answers: “How well did a fencer turn all
      their fencing work during the season into actual wins?” It’s not only
      about wins, but also whether training workload (bouts, lessons, touches)
      was balanced and meaningful.
    </p>

    <p>
      <b>Ranges:</b>
      <br />
      High (≥70) → successful results + balanced workload.
      <br />
      Medium (50–69) → some success, but inconsistent or unbalanced.
      <br />
      Low (&lt;50) → not enough wins or weak season structure.
    </p>

    <p>
      <b>Examples:</b>
      <br />
      Athlete A: 60% victories, 200 bouts, 40 lessons, 1000 touches → SE ≈72
      (Green) → consistent training and good results.
      <br />
      Athlete B: 60% victories, but only 40 bouts, 5 lessons, 200 touches → SE
      ≈45 (Red) → same win rate, but unsustainable workload.
    </p>

    <p>
      SE is the season-long “efficiency score” showing not just wins, but
      whether they came on top of a solid, balanced training base.
    </p>
  </div>
);

export const TSE_TEXT = (
  <div className="space-y-3">
    <p>
      <b>Time-segment Efficiency (TSE)</b> checks efficiency in three chapters
      of a bout:
      <br />• Early (first third) → fresh, trying plans.
      <br />• Mid (middle third) → adjustments and tactics.
      <br />• Late (final third) → fatigue, pressure, score stress.
    </p>

    <p>
      <b>Why it matters:</b>
      <br />• Detect fatigue if efficiency drops late.
      <br />• Detect focus issues if tactical discipline fades under pressure.
      <br />• See if a fencer starts too cautiously but finishes strong.
    </p>

    <p>
      <b>Training guidance:</b>
      <br />• If EC drops late → add conditioning and late-bout scenarios.
      <br />• If EC rises late → work on assertive starts.
      <br />• If steady → shows robust control and consistency.
    </p>

    <p>
      TSE highlights whether a fencer fades late, starts too slowly, or
      maintains consistency across the whole bout.
    </p>
  </div>
);
