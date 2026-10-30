import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import { reserveCredit, refundCredit } from "@/lib/credits";
import { llmComplete } from "@/lib/llm";
import { toErrorMessage } from "@/lib/gemini";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { compileDeck } from "@/deck/compile.js";
import { THEME_LIST } from "@/deck/themes";

// ── Deck engine (primary path) ──────────────────────────────────────
//
//   Prompt → Gemini → Deck JSON → compileDeck() → Standalone HTML
//
// The compiled slides enter the exact same localStorage → Monaco →
// Preview → Export → Save pipeline as before; downstream cannot tell
// the engines apart.

// TODO(deck): move the component/theme documentation in this prompt
// alongside the components and themes themselves (e.g. a promptDoc field),
// so the docs the model sees can never drift from the code that renders.
// function buildDeckPrompt(userPrompt) {
//   return `Convert this request into an AIRDeck presentation: [${userPrompt}]

// Return a single JSON object in EXACTLY this format:
// {
//   "version": 1,
//   "theme": "netflix",
//   "slides": [
//     { "component": "hero", "props": { "title": "...", "subtitle": "..." } }
//   ]
// }

// Rules:
// 1. Return ONLY the JSON object. NO explanations, NO markdown, NO backticks.
// 2. "version" must be 1 and "theme" must be "netflix" — these are the only supported values.
// 3. The only available component is "hero": a full-screen title slide.
//    Props: "title" (required, short and punchy) and "subtitle" (optional, one supporting sentence).
// 4. Cover the topic as a sequence of hero slides: an opening slide, then one per major section or key point.
// 5. Use between 1 and 10 slides.
// 6. All prop values must be plain text strings — no HTML, no markup.`;
// }
THEME_LIST.forEach((theme) => {
  console.log(theme.id, theme.ai);
});
const themeDocumentation = THEME_LIST.map(theme => {
  return `
- ${theme.id}

${theme.ai.summary}

Best For:
${theme.ai.bestFor.map(item => `• ${item}`).join("\n")}

Avoid:
${theme.ai.avoidFor.map(item => `• ${item}`).join("\n")}
`;
}).join("\n");

const allowedThemes = THEME_LIST
  .map(theme => theme.id)
  .join("\n");

function buildDeckPrompt(userPrompt) {
  
return `Convert this request into an AIRDeck presentation:

${userPrompt}

Return a single JSON object in EXACTLY this format:

{
  "version": 1,
  "theme": "...",
  "slides": [
    {
      "component": "...",
      "props": { }
    }
  ]
}

Rules:

1. Return ONLY the JSON object.
2. Do NOT use markdown.
3. Do NOT use code fences.
4. "version" must be 1.
5. "theme" must be one of the supported AIRDeck themes.
Available Themes

${themeDocumentation}

The "theme" field MUST be EXACTLY one of:

${allowedThemes}

Theme Selection Rules:
1. Select the theme BEFORE generating any slides.
2. Use exactly ONE theme for the entire presentation.
3. Never mix multiple themes.
4. Choose the theme whose "Best For" section most closely matches the user's request.
5. If multiple themes are suitable, choose the more specialized theme rather than the general-purpose theme.
6. Never invent a theme.
7. The "theme" field must exactly match one of the supported theme IDs.
8. Choose the theme based on the presentation's primary purpose, not the presence of individual keywords.If a business presentation happens to involve AI, finance, healthcare, or another domain, prioritize the business theme unless the presentation is primarily educational or technical.

6. Use between 1 and 15 slides.
7. Generate exactly the number of slides requested by the user. If no number is requested, choose an appropriate number based on the topic.
8. Every slide must use the single most appropriate AIRDeck component. A presentation may freely mix Hero, Comparison, and Timeline slides.
9. Use ONLY the documented AIRDeck components.
10. Use ONLY the documented props for each component.
11. Every required prop must be present and correctly named.
12. Do NOT invent new components.
13. Do NOT invent new props.
14. Do NOT rename props.
15. Do NOT omit required props.
16. The AIRDeck compiler validates the output and rejects unknown themes, components, props, or invalid JSON.

Available Components

1. Hero

Use for:
- Opening slide
- Section divider
- Closing slide

Props:
title: string (required)
subtitle: string (optional)

2. Comparison

Use for:
- Pros vs Cons
- Before vs After
- Product Comparison

Props:
title: string
leftTitle: string
rightTitle: string
leftPoints: string[]
rightPoints: string[]

3. Timeline

Use for:
- History
- Roadmap
- Evolution

Props:
title: string

items:
- year: string
- title: string
- description: string

4. Dashboard

Purpose:
Display key metrics, KPIs, business statistics, analytics, financial summaries, benchmark results, or numerical highlights.

Use Dashboard whenever information is primarily numerical rather than descriptive.

Props:
- title (required)
- cards (required)

Each card is an object:

{
  "label": "...",
  "value": "..."
}

Example:

{
  "component": "dashboard",
  "props": {
    "title": "Company Performance",
    "cards": [
      {
        "label": "Revenue",
        "value": "$2.4M"
      },
      {
        "label": "Users",
        "value": "48K"
      },
      {
        "label": "Growth",
        "value": "+32%"
      },
      {
        "label": "Retention",
        "value": "91%"
      }
    ]
  }
}

5. Quote

Purpose:
Highlight an important quotation, principle, insight, famous saying, or memorable statement.

Use Quote whenever a slide should emphasize one powerful idea rather than explain multiple concepts.

Props:
- quote (required)
- author (optional)

Example:

{
  "component": "quote",
  "props": {
    "quote": "Programs must be written for people to read, and only incidentally for machines to execute.",
    "author": "Harold Abelson"
  }
}

6. Code

Purpose:
Display programming code, SQL queries, JSON, XML, YAML, shell commands, configuration files or algorithms.

Use Code whenever understanding source code is more important than describing it with text.

Props:
- title (required)
- language (required)
- code (required)

Example:

{
  "component": "code",
  "props": {
    "title": "Binary Search",
    "language": "java",
    "code": "public int binarySearch(...) { ... }"
  }
}

7. Steps

Purpose:
Present a workflow, process, lifecycle, pipeline, methodology or ordered sequence of actions.

Use Steps whenever information is best understood as a step-by-step progression rather than a timeline.

Props:
- title (required)
- steps (required array of strings)

Example:

{
  "component": "steps",
  "props": {
    "title": "Machine Learning Pipeline",
    "steps": [
      "Collect Data",
      "Clean Data",
      "Train Model",
      "Evaluate",
      "Deploy"
    ]
  }
}

8. Table

Purpose:
Present structured information in rows and columns.

Use Table whenever comparisons, datasets, pricing,
benchmarks or statistics are easier to understand in tabular form.

Props:
- title (required)
- headers (required array of strings)
- rows (required array of arrays)

Example:

{
  "component": "table",
  "props": {
    "title": "Model Comparison",
    "headers": [
      "Model",
      "Accuracy",
      "Speed"
    ],
    "rows": [
      ["Random Forest", "96%", "Fast"],
      ["SVM", "94%", "Medium"],
      ["Neural Network", "98%", "Slow"]
    ]
  }
}

9. Callout

Purpose:
Highlight an important insight, statistic, warning,
tip, key takeaway or fact.

Use Callout whenever one message deserves the
user's complete attention.

Props:
- title (required)
- body (required)
- icon (optional)

Example:

{
  "component":"callout",
  "props":{
      "title":"Did You Know?",
      "body":"Nearly 90% of the world's data has been created within the last few years.",
      "icon":"..."
  }
}

10. Image

Purpose:
Display a single image, diagram, chart, screenshot, illustration or photograph with an optional title and caption.

Use Image whenever visual content communicates information better than text.

Props:
- title (optional)
- image (required)
- caption (optional)

Example:

{
  "component": "image",
  "props": {
    "title": "CNN Architecture",
    "image": "https://example.com/cnn.png",
    "caption": "Typical convolutional neural network."
  }
}


Component Selection Rules

1. Prefer specialized components over Hero whenever possible.
2. Use Hero only for opening slides, section dividers, and closing slides.
3. Do not create multiple consecutive Hero slides unless starting a new section.
4. Use Dashboard whenever the slide is primarily numerical.
5. Use Timeline only for chronological information.
6. Use Comparison only when comparing two or more alternatives.
7. Use Table for structured tabular data.
8. Use Steps for workflows and ordered processes.
9. Use Quote when emphasizing a single memorable statement.
10. Use Image whenever visual content communicates better than text.
11. Every slide should use the component that best matches its primary purpose.

Keep titles concise.

Subtitles should be one supporting sentence.

Comparison points should be short bullet items.

Do not generate HTML.

Do not generate CSS.

Only generate valid AIRDeck Deck Source JSON.`;
}




// Models sometimes wrap output in markdown fences despite instructions.
function extractJson(text) {
  let out = text.trim();
  const fenced = out.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenced) out = fenced[1].trim();

  // Tolerate stray prose around the object.
  const start = out.indexOf("{");
  const end = out.lastIndexOf("}");
  if (start > 0 && end > start) out = out.slice(start, end + 1);

  return out;
}

// ── Legacy HTML generator ───────────────────────────────────────────
// Kept as an internal, currently-unreachable function until the deck
// engine migration is complete, then deleted. Not wired to any flag.
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
async function generateLegacyHtml(userPrompt, apiKey) {
  const updatedPrompt = `Convert this prompt into HTML slide pages: [${userPrompt}].

Rules:
1. Return output ONLY as a JSON array.
2. Each array element must contain one full HTML file.
3. Each HTML file must start with: <!DOCTYPE html>
4. NO explanations.
5. NO markdown.
6. NO backticks.
7. NO text outside the JSON array.
8. DO NOT include Tailwind CDN.
9. USE ONLY CSS ON EACH PAGE
10. Design every slide on a fixed 1920x1080 canvas: the root container must be exactly width:1920px, height:1080px with overflow:hidden, and all layout/font sizes based on that canvas.
11. ALL content must fit fully inside the 1920x1080 canvas with at least 80px from every edge. Budget vertical space: title + margins + content combined must never exceed 1080px. Prefer smaller fonts over overflow.
12. NEVER use white-space: nowrap on sentence-length text. If you use a typewriter/typing effect, the full line must fit the canvas width at its font size.
13. Do not position content partially outside its container (e.g. large negative margins or offsets that push elements past the canvas edge).

Return EXACTLY this format:
[
  "<!DOCTYPE html> ... </html>",
  "<!DOCTYPE html> ... </html>"
]
`;

  const { text, blockReason } = await llmComplete(updatedPrompt, { apiKey });
  if (!text) return { ok: false, blockReason };

  let pages;
  try {
    pages = JSON.parse(text);
  } catch {
    return { ok: false, raw: text };
  }
  if (!Array.isArray(pages) || pages.length === 0) {
    return { ok: false, raw: text };
  }
  return { ok: true, pages };
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: "Sign in to generate presentations." }, { status: 401 });
    }

    // Credits already meter platform-key usage; this also bounds BYOK calls.
    const rl = rateLimit(`generate:${session.user.email}`, { limit: 10 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSeconds);

    const { prompt } = await req.json();
    if (typeof prompt !== "string" || !prompt.trim()) {
      return Response.json({ error: "Prompt is required." }, { status: 400 });
    }

    await dbConnect();

    // BYOK: with the user's own Gemini key, no credits are touched.
    const userKey = req.headers.get("x-gemini-key")?.trim() || "";
    const usingByok = Boolean(userKey);

    let user;
    if (usingByok) {
      user = await User.findOne({ email: session.user.email }).select("_id");
      if (!user) {
        return Response.json({ error: "User not found." }, { status: 404 });
      }
    } else {
      user = await reserveCredit(session.user.email);
      if (!user) {
        const exists = await User.exists({ email: session.user.email });
        if (!exists) {
          return Response.json({ error: "User not found." }, { status: 404 });
        }
        return Response.json(
          { error: "You're out of credits. Each generation costs 1 credit." },
          { status: 402 }
        );
      }
    }

    const refund = () => (usingByok ? null : refundCredit(user._id));

    // TEMPORARY migration logging — remove/reduce after Phase 2 stabilizes.
    console.log("[deck-engine] generating deck source", {
      promptLength: prompt.trim().length,
      byok: usingByok,
    });

    // let text, blockReason;
    // try {
    //   ({ text, blockReason } = await llmComplete(buildDeckPrompt(prompt), {
    //     apiKey: userKey || undefined,
    //   }));
    // } catch (err) {
    //   await refund();
    //   throw err;
    // }

    //added for time mesure
    const fullPrompt = buildDeckPrompt(prompt);

console.log("[deck-engine] prompt stats", {
  userPromptChars: prompt.trim().length,
  fullPromptChars: fullPrompt.length,
});

console.time("[deck-engine] gemini");

let text, blockReason;
try {
  ({ text, blockReason } = await llmComplete(fullPrompt, {
    apiKey: userKey || undefined,
  }));
} catch (err) {
  await refund();
  throw err;
} finally {
  console.timeEnd("[deck-engine] gemini");
}
//edited for time mesure

    if (!text) {
      await refund();
      console.log("[deck-engine] model returned no text", { blocked: Boolean(blockReason) });
      if (blockReason) {
        return Response.json(
          { error: "Your prompt was blocked by content safety filters. Please rephrase it. Your credit was not used." },
          { status: 400 }
        );
      }
      return Response.json(
        { error: "The model returned no slides. Your credit was not used." },
        { status: 502 }
      );
    }

    let source;
    try {
      source = JSON.parse(extractJson(text));
    } catch {
      await refund();
      console.log("[deck-engine] deck JSON parse failed", { rawLength: text.length });
      return Response.json(
        {
          error: "The model returned invalid deck JSON. Your credit was not used.",
          raw: text,
        },
        { status: 502 }
      );
    }

    // Input normalization (not fallback): tolerate a missing version field.
    if (source && typeof source === "object" && !Array.isArray(source) && source.version === undefined) {
      source.version = 1;
    }


    console.time("[deck-engine] compile");
    const compiled = compileDeck(source);
    console.timeEnd("[deck-engine] compile");
    if (!compiled.valid) {
      await refund();
      console.log("[deck-engine] deck validation/compile failed", { errors: compiled.errors });
      return Response.json(
        {
          error: `The model returned an invalid deck: ${compiled.errors.join("; ")}. Your credit was not used.`,
          errors: compiled.errors,
          raw: text,
        },
        { status: 502 }
      );
    }

    console.log("[deck-engine] compiled deck", {
      slides: compiled.slides.length,
      theme: source.theme,
    });

    return Response.json({
      result: compiled.slides,
      source,
      credit: usingByok ? null : user.credit,
      byok: usingByok,
    });
  } catch (error) {
  console.error("FULL ERROR:");
  console.error(error);
  console.error(error?.stack);

  return Response.json(
    {
      error: error?.message,
      stack: process.env.NODE_ENV === "development"
        ? error?.stack
        : undefined,
    },
    { status: 500 }
  );
}
}
