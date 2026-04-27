# Technical Specification: OmniParse AI Command Center v7.0
## Knowledge Synthesis & Document Intelligence Studio — Nordic WOW Pantone Edition

---

### 1. Executive Summary

The **OmniParse AI Command Center v7.0** represents a paradigm shift in how users, organizations, and regulatory bodies process, synthesize, and interact with massive volumes of unstructured document data. Evolving from the foundational FDA 510(k) Review Studio v6.0 and the original document-to-markdown conversion pipelines, v7.0 is a highly flexible, production-grade intelligence layer. It seamlessly ingests local folders or user-uploaded documents (across EPUB, PDF, DOCX, Facebook JSON, TXT, and Markdown formats), transforms them into a unified Markdown Master State, and leverages an advanced Multi-Agent LLM pipeline to synthesize comprehensive cross-document summaries ranging from 3,000 to 4,000 words.

Driven by the "Nordic WOW" design philosophy with deep Pantone palette integration, the platform is not merely a utility—it is a visual and cognitive workspace. It empowers users to define the output language (Traditional Chinese by default, or English) and interact indefinitely with the generated artifacts through prompt chaining and six newly introduced "WOW AI Magics."

This technical specification details the architecture, component hierarchy, agentic workflow, and advanced features required to build, secure, and scale the OmniParse AI Command Center v7.0.

---

### 2. Core Capabilities & Feature Requirements

The architecture must support the following explicit user requirements and legacy system integrations:

#### 2.1 Unified Ingestion Engine (Directory & Multi-Upload)
- **Local Directory Binding:** Users can provide an absolute or relative directory path. The system will recursively scan, identify, and queue supported file types.
- **Multi-Document Upload:** Users can drag-and-drop or select multiple documents (`.txt`, `.md`, `.pdf`, `.epub`, `.docx`, `.json`) via a unified interface.
- **Dynamic Batch Sizing:** The user retains full control over how many documents to process within a session, including adding or removing files from the active processing queue before execution.

#### 2.2 Native Internationalization & Output Routing
- **Language Selection:** The system supports deep output localization, defaulting to **Traditional Chinese (zh-TW)** with **English (en-US)** as a secondary toggle.
- **Agentic Translation:** The LLM does not merely translate; it performs localization, ensuring tone, formatting, and technical nomenclature align perfectly with the target terminology (e.g., Taiwanese tech taxonomy vs. Western tech terminology).

#### 2.3 Legacy Conversion Integration (`skill.md` emulation)
- The platform incorporates the original conversion logic as preprocessing steps:
   - **Environment Checks:** Validation of `pandoc` and `pymupdf`.
   - **EPUB/DOCX Pipeline:** Utilizing standard Pandoc extraction with `raw/books/assets` routing.
   - **PDF Pipeline:** Utilizing `fitz` (PyMuPDF) to reconstruct structure via TOC extraction, bounding box text extraction, and pagination cleanup.
   - **Facebook JSON:** Decoding `latin1` and parsing activity logs into Markdown chronologies.

#### 2.4 Comprehensive Multi-Document Synthesis
- **The Artifact:** After individual markdown conversions, the system employs an Agent to synthesize a comprehensive, global summary (bounded between 3,000 and 4,000 words).
- **Cross-Referencing:** The summary acts as a definitive compendium, intelligently grouping insights, timelines, and technical data across all uploaded documents into a unified narrative.

#### 2.5 Infinite Prompting Loop & AI Magics
- Users do not hit a dead-end once the summary is created. They can continuously prompt the system based on the live context of the summary.
- Users can trigger 6 specific "WOW AI Magic" features to transmute, analyze, or visualize the data dynamically.

---

### 3. Design Philosophy: The Nordic WOW Aesthetic

The design transcends standard enterprise software by prioritizing functional minimalism, high contrast, and tactile responsiveness, ensuring cognitive ease during heavy document reviews.

#### 3.1 Dynamic Pantone Integration
Instead of standard hex codes, the UI strictly enforces Pantone-inspired CSS variable injections (`--accent`, `--bg`, `--card`, `--text`) managed via Tailwind's `@theme` customization.
- **Classic Blue (19-4052):** Used for primary structure, stable navigation elements, and trustworthy visual anchors. Represents security and analytical focus.
- **Illuminating (13-0647):** Utilized for active processing states, warnings, and to highlight critical insights extracted from documents.
- **Viva Magenta (18-1750):** The primary trigger color for "WOW AI Magics." Used sparingly but with high intensity to denote revolutionary actions or AI modifications.
- **Cool Gray 11 C:** Used for secondary text, background demarcations, and disabled states to maintain the Nordic minimalist vibe without washing out contrast.

#### 3.2 Typography & Structural Spacing
- **Primary Face:** *Inter* (Sans-serif) for all UI controls, buttons, and summary text. Its legibility is paramount when reading 4,000-word documents.
- **Data & Log Face:** *JetBrains Mono* for the Temporal Log Stream, JSON outputs, metadata tables, and system diagnostics.
- **Spacing:** A strict 4px/8px modular grid. Cards utilize 24px padding (`p-6`), while active data streams use dense 12px padding. This rhythmic hierarchy prevents visual fatigue.

---

### 4. Technical Architecture & Stack

#### 4.1 Frontend Architecture
- **Framework:** React 19 (Hooks, Functional Components, Concurrent Mode rendering).
- **Styling:** Tailwind CSS 4.0 integrated directly with Vite.
- **Animations:** `motion/react` (Framer Motion) for fluid UI transitions, layout snapping, and real-time state morphing. 
- **Icons:** `lucide-react` for consistent, lightweight vector graphics matching the Nordic theme.
- **Markdown Rendering:** `react-markdown` with `remark-gfm` to process tables, lists, and strict formatting rules from the LLM.

#### 4.2 Backend & Edge Processing
- **Server Environment:** Node.js (Express) with Vite integration (Middleware mode) to handle heavy file operations and CLI bridging.
- **File System Abstraction:** A secure API layer intercepts folder paths, reading files directly from the host machine using Node's `fs/promises` module. 
- **Security Constraint:** For security, local directory scanning is strictly bounded to paths explicitly allowed by the user.

#### 4.3 AI & Agentic Layer
- **Orchestration:** `@google/genai` (Gemini SDK).
- **Model Routing:** Heavy lifting and 4,000-word synthesis triggers `gemini-1.5-pro-preview` for high context-window reliability. Fast, iterative UI prompts trigger `gemini-1.5-flash-preview` to maintain near-zero latency.
- **Tool Calling:** Agents have access to local file read tools, translation functions, and semantic search via Function Calling.

---

### 5. Component Deep Dive: The Dashboard

#### 5.1 Pulse Metrics (Interactive Performance Array)
A high-visibility grid representing the "Vital Signs" of the document processing pipeline.
- **Metrics Tracked:** Document Count, Parsing Accuracy Delta, Token Consumption Rate, and Overall Synthesis Cohesion.
- **Animation Strategy:** Uses staggered `motion.div` entry. Values update with spring physics as the LLM streams tokens. Colors shift seamlessly between Pantone Classic Blue (stable) to Illuminating (processing).

#### 5.2 Temporal Log Stream (Active Heatmap & Black Box)
Replaces the standard terminal output with a sophisticated event chronology.
- **Heatmap Generation:** Displays log density across the processing timeline. High concentration of logs (e.g., during PDF OCR or JSON parsing) creates a taller, more saturated visual bar.
- **Black Box Auditing:** All Pandoc operations, Python PyMuPDF scripts, and LLM context injections output standard logs here, stamped with milliseconds and color-coded tags.

#### 5.3 Unified Command Center
The central workspace where the 4,000-word Markdown synthesis lives.
- **Split-View Architecture:** Left panel details source documents, right panel streams the generated summary.
- **Optimization Flux Chart:** A live area chart rendering how efficiently the Gemini model is utilizing the context window.
- **Infinite Prompt Bar:** A sticky footer input allowing the user to continuously chat with or refine the visible summary artifact.

---

### 6. Data Flow & Agentic Pipeline Logic

The system utilizes a 7-step pipeline integrating the legacy conversion scripts with the new LLM Agent workflow.

#### Step 0: Environment Verification
- Node.js backend executes `pandoc --version` and `python3 -c "import fitz"`.
- If missing, the Temporal Log Stream flashes Viva Magenta, providing the user with copy-paste installation commands (`brew install pandoc`, `pip3 install pymupdf`).

#### Step 1: Input Aggregation & Type Routing
- System determines if the input is a continuous stream of uploaded files or a local directory path.
- Resolves inputs into a unified queue. Detects Facebook JSON structures if a `your_facebook_activity` folder exists.
- Emits a summary of detected topologies to the UI for user confirmation.

#### Step 2: Extraction & Normalization
- Using the legacy script methods:
    - **PDF:** Triggers Python PyMuPDF background task to extract Text, TOC, and metadata.
    - **EPUB/DOCX:** Triggers Pandoc conversions with media-extraction rules.
- Output: Every file is converted into `raw/workspace/{filename}_raw.md`.

#### Step 3: Frontmatter & Format Sanitation
- The Node.js backend standardizes line spacings, corrects CJK-English kerning (pangu whitespace), removes raw HTML tags, and pre-pends valid YAML frontmatter (Title, Origin, Type) to each file.
- Code blocks are detected and fenced appropriately via heuristic scanning.

#### Step 4: Language Projection & Context Marshalling
- The Agent compiles all normalized markdown documents into the Gemini Context Window.
- System reads user language preference (Traditional Chinese or English).
- Translates metadata and tags accordingly, preparing the prompt for the comprehensive summary.

#### Step 5: Master Synthesis Generation
- Prompt instruction forces the creation of a 3000~4000 word macro-summary.
- Output streams directly into the Command Center via Server-Sent Events (SSE) or WebSocket proxy.
- Renders live in the `react-markdown` container.

#### Step 6: Infinite Prompting State
- Pipeline shifts to "Ready" state. The comprehensive summary is locked into context. 
- The user can now utilize the Text Bar or trigger the AI Magics.

---

### 7. The 6 "WOW AI Magics" Features

To ensure the platform exceeds standard utility and delivers moments of genuine delight and advanced capability, six interconnected "WOW" features have been embedded into the interface.

#### 7.1 Magic 1: Semantic Resonance Mapping
- **Concept:** Instead of just reading the summary, the user clicks the "Resonate" button. The system scans the massive text and generates an interactive 3D WebGL (or D3.js) node graph showing thematic overlaps between the originally uploaded documents.
- **Value:** Instantly reveals hidden connections (e.g., how a Facebook post from 2021 relates to a manual PDF updated in 2023).

#### 7.2 Magic 2: Contextual Hallucination Shield
- **Concept:** A toggleable security layer. When activated, the AI cross-references every factual claim in the 4,000-word summary against the raw source chunks.
- **Visuals:** Verified claims glow softly in Pantone Classic Blue. Unverified or extrapolated claims highlight in Pantone Illuminating, allowing the user to click and trace exactly which document generated the statistic.

#### 7.3 Magic 3: Dynamic Knowledge Distillation (Density Slider)
- **Concept:** A tactile slider in the UI labeled "Knowledge Density" (options: ELI5 -> Executive -> Deep Technical).
- **Execution:** Moving the slider triggers a rapid background API call to `gemini-1.5-flash`, instantly re-writing the current viewport's text to match the requested complexity without changing the underlying comprehensive data.

#### 7.4 Magic 4: Chronological Insight Threading
- **Concept:** Perfect for disparate documents. The user invokes "Timeline Threading."
- **Execution:** The Agent parses all dates, timestamps, and temporal references across the summary and source documents, extracting them into a standalone, interactive horizontal timeline timeline that users can scrub through.

#### 7.5 Magic 5: Persona Morphing
- **Concept:** The user can instantly change the "Voice" of the summary via predefined or custom personas. 
- **Execution:** Want the 4,000-word document written in the style of a strict regulatory auditor? A casual blogger? A theoretical physicist? The AI applies a structural tone-shift constraint mapping perfectly to Traditional Chinese vernacular idioms or precise English terminology.

#### 7.6 Magic 6: Actionable Directive Extraction
- **Concept:** The "Extract Tasks" wand. 
- **Execution:** With one click, the system scours the 4,000 words to find implied tasks, warnings, obligations, or next steps. It automatically generates a Kanban board (To Do, In Progress, Done) at the bottom of the artifact based purely on semantic implication.

---

### 8. Internationalization (I18n) Architecture

True internationalization goes beyond key-value dictionary replacement.
- **Core Dictionary:** UI elements are isolated in `locales/zh-TW.json` and `locales/en-US.json`.
- **System Prompting:** When Traditional Chinese is selected, the meta-prompt explicitly enforces:
   - "Use precise Taiwanese technological terminology (e.g., 螢幕 instead of 屏幕, 伺服器 instead of 服务器)."
   - "Ensure appropriate punctuation (full-width commas and periods)."
   - "Follow Pangu spacing rules (insert space between English and Chinese characters) during output."
- **Fallback Chains:** If a specific Facebook JSON artifact contains un-translatable strings, the system retains the original string wrapped in bold tags to avoid data loss.

---

### 9. Edge Cases, Failure Modes, and Resiliency

To maintain production-grade reliability, the system addresses multiple edge cases:
1. **Context Window Overflow:** If the user uploads 50 massive PDFs exceeding 1-2 million tokens, the system implements a Map-Reduce agentic strategy. It summarizes each sub-document first, then synthesizes the sub-summaries.
2. **Corrupted EPUB/PDF Files:** The PyMuPDF and Pandoc wrappers are encased in `try/catch` blocks. If a file fails, a specific error is routed to the Temporal Log Stream, the file is marked "Skipped," and the pipeline continues uninterrupted.
3. **Network Latency & SSE Disconnects:** LLM streaming can halt due to network. The frontend maintains a cursor of the last received token. On disconnect, it transparently re-establishes the connection and resumes the prompt from the exact interruption point.
4. **Encoding Nightmares (Facebook JSON):** Latin1/UTF-8 double-encoding bugs are sanitized via a pre-processing Python buffer stream before hitting the frontend or LLM, guaranteeing zero corrupted characters.

---

### 10. Security & Privacy Considerations
- **Sandboxed Execution:** Pandoc and Python operations triggered by the Node boundary operate in a restricted child process environment with no network access other than required internal IPC.
- **Stateless Agent State:** Processed documents and the resulting 4,000-word summary remain entirely within memory or local sandbox. They are not transmitted permanently to any model training pipeline.
- **Key Management:** Gemini API keys are injected via secure `.env` variables and never exposed to the client-side bundle. API requests are proxied strictly through the Express server.

---

### 11. Conclusion

The OmniParse AI Command Center v7.0 bridges the gap between raw data chaos and refined knowledge synthesis. By marrying legacy deterministic parsing techniques with highly stochastic, intelligent agent capabilities—wrapped in a meticulously crafted Nordic WOW design—it creates an unparalleled environment for large-scale information processing, interaction, and understanding in multiple languages.

---
---

### 20 Comprehensive Follow-Up Questions for Further Exploration

1. How will the system manage local file system access permissions when implemented natively on macOS versus Windows environments?
2. If the user uploads a document with heavily embedded OCR imagery rather than digital text, do we need to trigger an optical recognition sub-routine before Step 2?
3. How exactly should the Map-Reduce summarization strategy be chunked (by word count, by chapter, by document) to avoid losing critical nuance when approaching token limits?
4. Can you elaborate on the mathematical physics backing the spring animation in `motion/react` for the Pulse Metrics to ensure it feels "organic"?
5. In the Contextual Hallucination Shield (Magic 2), what similarity threshold or exact matching algorithm is used to determine if a claim is "verified"?
6. How does the system handle "mixed-language" source documents when the target language is enforced as Traditional Chinese? Does it translate the English parts and leave the existing Chinese parts alone?
7. Regarding the Dynamic Knowledge Distillation (Magic 3) slider, does the system re-fetch the entire response from the API, or does it utilize client-side caching of different state densities?
8. Are the Pantone CSS variables strictly enforced, or can organizations inject their own primary/secondary Pantone palettes through a configuration JSON?
9. When handling massive Facebook JSON data, how do we partition the timeline so the Temporal Log Stream doesn't cause a DOM memory leak with millions of list items?
10. Does the Chronological Insight Threading (Magic 4) resolve conflicting date formats (e.g., MM/DD/YYYY vs DD/MM/YYYY) natively, or does it require an LLM pass to normalize?
11. What specific mitigation strategies are in place to prevent prompt injection attacks if a malicious payload is hidden within an uploaded PDF?
12. If a user interrupts the 4,000-word generation halfway, does the system preserve the partial artifact, or does it discard and require a complete regeneration?
13. How does the pipeline visually differentiate between a "system error" (e.g., Python not installed) and a "processing warning" (e.g., PDF pagination unreadable) in the Temporal Heatmap?
14. Under the "Actionable Directive Extraction" (Magic 6), how do we sync changes back if the user checks off a Kanban task? Does it rewrite the markdown state?
15. What exact formatting rules govern the translation of technical code snippets when outputting the final summary? Are comments translated?
16. How does the application maintain state across browser reloads? Is the "Master State" stored in IndexedDB or purely in volatile RAM?
17. In terms of CI/CD, how do we unit test the non-deterministic nature of the Agent's output to ensure the 3,000-4,000 word bound is consistently respected?
18. For the Semantic Resonance Mapping (Magic 1), what vector database or embedding model is utilized locally to calculate the geometry of the 3D graph?
19. Does the "Infinite Prompting Loop" maintain a sliding window of chat history, or does it only pass the master artifact and the immediate user query to the Gemini model to save tokens?
20. Will there be support for exporting the final Command Center state, including all interactive Magic views, into a static, distributable HTML or PDF report?
