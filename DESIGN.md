---
name: RAGE
description: >
  Dark-first, brutalist-display nightlife marketing system for a college
  events and ticketing app. Black canvases, oversized uppercase headlines,
  a single mint-green signature accent, and scroll-driven storytelling
  with a hero phone mockup as the recurring narrative device.

colors:
  brand:
    green:        "#4BFA94"   # signature accent — CTAs, eyebrows, gradient ends, glows, selection
    green-soft:   "#A7F3D0"   # gradient secondary (emerald-200 family)
    green-deep:   "#34D399"   # gradient tertiary (emerald-300 family)
    yellow:       "#F2EF1D"   # secondary accent — sparingly on tags & inverted CTAs
    blue:         "#0000FE"   # tertiary accent — ambient glows only

  background:
    canvas:       "#030303"   # body — near-black, never pure 0,0,0
    surface:      "#000000"   # full-bleed sections, hero
    surface-2:    "#0A0A0A"   # phone screen interiors, deep panels
    surface-3:    "#141414"   # cards on top of surface-2
    surface-soft: "#18181B"   # zinc-950 — subtle band between sections
    surface-tint: "rgba(255,255,255,0.02)"   # raised cards, glassy panels
    surface-hover:"rgba(255,255,255,0.04)"

  text:
    primary:      "#FFFFFF"
    high:         "#FAFAFA"   # zinc-50 default body
    mid:          "#A1A1AA"   # zinc-400 — body copy on dark
    low:          "#71717A"   # zinc-500 — captions, meta
    faint:        "#52525B"   # zinc-600 — disabled, footnotes
    dim:          "#3F3F46"   # zinc-700 — divider hints
    inverse:      "#000000"   # text on light/green pills

  border:
    hairline:     "rgba(255,255,255,0.04)"   # near-invisible section seams
    subtle:       "rgba(255,255,255,0.06)"
    default:      "rgba(255,255,255,0.08)"
    soft:         "rgba(255,255,255,0.14)"
    strong:       "rgba(255,255,255,0.18)"
    focus:        "rgba(75,250,148,0.40)"

  state:
    selection-bg: "#4BFA94"
    selection-fg: "#030303"
    success:      "#4BFA94"
    danger:       "#F87171"

typography:
  family:
    display: "Inter, Helvetica, Arial, sans-serif"   # variable Inter, weights 400–900
    body:    "Inter, Helvetica, Arial, sans-serif"
    mono:    "ui-monospace, SFMono-Regular, Menlo, monospace"

  weight:
    regular:  400
    medium:   500
    semibold: 600
    bold:     700
    heavy:    800
    black:    900

  tracking:
    display:  "-0.04em"   # display headlines (-tightest)
    headline: "-0.03em"   # section heads
    tight:    "-0.02em"
    body:     "0"
    eyebrow:  "0.24em"    # uppercase micro-labels
    button:   "0.16em"    # uppercase pills
    nav:      "0.18em"

  leading:
    display:  0.88        # display headlines pack tight
    headline: 0.92
    snug:     1.25
    body:     1.6
    relaxed:  1.65

  scale:
    micro:    "9px"       # ultra-tight uppercase markers
    eyebrow:  "11px"      # GREEN/UPPER eyebrows + button labels
    caption:  "12px"
    small:    "14px"
    body:     "15px"
    body-lg:  "16px"
    h6:       "20px"
    h5:       "24px"
    h4:       "30px"
    h3:       "36px"
    h2:       "48px"
    h1:       "60px"
    display:  "72px"
    display-xl: "96px"    # marketing hero (clamp-driven, may go higher)

  styles:
    eyebrow:
      size: "11px"
      weight: 700
      transform: uppercase
      tracking: "0.24em"
      color: brand.green
    display-hero:
      weight: 900
      transform: uppercase
      tracking: "-0.04em"
      leading: 0.88
      gradient-on-second-line: true
    section-head:
      weight: 900
      transform: uppercase
      tracking: "-0.04em"
      leading: 0.92
    body:
      weight: 400
      tracking: "0"
      leading: 1.65
      color: text.mid
    button-label:
      size: "11px"
      weight: 700
      transform: uppercase
      tracking: "0.16em"

spacing:
  unit: "4px"             # everything snaps to a 4px grid
  scale:
    "0":   "0"
    "1":   "4px"
    "2":   "8px"
    "3":   "12px"
    "4":   "16px"
    "5":   "20px"
    "6":   "24px"
    "7":   "28px"
    "8":   "32px"
    "10":  "40px"
    "12":  "48px"
    "14":  "56px"
    "16":  "64px"
    "20":  "80px"
    "24":  "96px"
    "28":  "112px"
    "32":  "128px"

  layout:
    container-max:    "1400px"
    container-x-sm:   "16px"
    container-x-md:   "24px"
    section-y-mobile: "80px"
    section-y-md:     "112px"
    section-y-lg:     "128px"
    inter-element:    "12px–24px"
    after-eyebrow:    "16px"
    after-headline:   "20px"
    cta-row-gap:      "12px"

radius:
  none:      "0"
  xs:        "4px"
  sm:        "8px"
  md:        "12px"
  lg:        "14px"
  xl:        "16px"
  "2xl":     "20px"
  "3xl":     "24px"
  pill:      "9999px"
  phone-frame: "54px"   # iPhone-style outer
  phone-screen:"48px"   # iPhone-style inner

shadow:
  none:      "none"
  sm:        "0 1px 2px rgba(0,0,0,0.4)"
  md:        "0 8px 24px -8px rgba(0,0,0,0.5)"
  lg:        "0 20px 50px -30px rgba(0,0,0,0.75)"
  xl:        "0 40px 120px -20px rgba(0,0,0,0.85)"
  card-inset: "inset 0 1px 0 rgba(255,255,255,0.06)"
  pill-white: "0 14px 40px -16px rgba(255,255,255,0.35)"
  pill-green-glow: "0 0 30px -6px rgba(75,250,148,0.55)"
  cta-glow-pulse: "0 0 32px -8px rgba(75,250,148,0.45)" # idle → "0 0 48px -4px rgba(75,250,148,0.7)" peak
  phone-stack: >
    inset 0 0 0 1px rgba(255,255,255,0.10),
    inset 0 1.5px 0 rgba(255,255,255,0.06),
    inset 0 -1px 0 rgba(0,0,0,0.6),
    0 1px 0 rgba(255,255,255,0.04),
    0 40px 120px -20px rgba(0,0,0,0.85),
    0 20px 60px -10px rgba(0,0,0,0.55),
    0 0 90px -20px rgba(75,250,148,0.20)

elevation:
  0-flat:        "no shadow — flush surface"
  1-card:        shadow.card-inset
  2-floating:    shadow.md
  3-modal:       shadow.lg
  4-hero:        shadow.xl
  5-device:      shadow.phone-stack

glow:
  ambient-section: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(75,250,148,0.06), transparent 70%)"
  ambient-phone:   "radial-gradient(circle, rgba(75,250,148,0.25), transparent 60%) blur(40-50px)"
  ambient-blue:    "radial-gradient at corner, rgba(0,0,254,0.06), transparent — blur(100–140px)"

motion:
  easing:
    standard:    "cubic-bezier(0.25, 0.46, 0.45, 0.94)"   # primary "authEase" — confident soft-land
    ease-out:    "cubic-bezier(0, 0, 0.2, 1)"
    ease-in-out: "cubic-bezier(0.4, 0, 0.2, 1)"
    spring-card: "spring, stiffness 380–400, damping 26–28"

  duration:
    micro:       "150ms"   # hover state changes
    short:       "300ms"
    base:        "450ms"   # default in/out
    medium:      "550ms"   # section reveals
    long:        "700ms"   # phone showcase entrance
    ambient:     "1400ms"  # scroll hint pulse
    hero-zoom:   "22s"     # background hero ken-burns
    cta-glow:    "2.8s"    # CTA glow heartbeat
    marquee:     "32–38s"  # logo/school marquee row

  stagger:
    children:    "50–80ms"
    delay-start: "50–60ms"

  patterns:
    fade-up:        "opacity 0→1, y 12–24px → 0"
    fade-up-card:   "opacity 0→1, y 14–20px → 0, ease standard"
    pop-in:         "opacity 0→1, scale 0.92→1"
    scroll-scene:   "page-level scrollY mapped via useTransform — phone scales/translates and screens crossfade across a 320vh section"
    parallax-tilt:  "rotateX ±2–4°, rotateY ±3–8°, rotateZ ±4–6° around perspective 1400–1500px"
    cta-glow-pulse: "box-shadow oscillation between 32px/45% and 48px/70% green over 2.8s"

  reduced-motion: "respect prefers-reduced-motion — disable scroll-scene transforms and infinite loops, keep opacity-only fades"

iconography:
  family:        "lucide-react, 1.5–2.5 stroke"
  size-default:  "14–16px in pills, 18–24px in tiles"
  treatment:     "monoline, current-color, inline with label"

components:
  pill-cta-primary:
    bg: brand.green
    fg: text.inverse
    height: "48px"
    padding-x: "28–32px"
    radius: pill
    label: typography.styles.button-label
    shadow: shadow.pill-green-glow
    hover: "lighten to emerald-300"
  pill-cta-light:
    bg: text.primary
    fg: text.inverse
    height: "48px"
    radius: pill
    shadow: shadow.pill-white
  pill-cta-ghost:
    bg: transparent
    border: border.strong
    fg: text.primary
    height: "48px"
    radius: pill
    hover: "border → rgba(255,255,255,0.40)"
  card-glass:
    bg: surface-tint
    border: border.default
    radius: radius."2xl"
    inset: shadow.card-inset
    hover: "border → rgba(75,250,148,0.35), translateY(-2 to -4px)"
  eyebrow:
    color: brand.green
    label: typography.styles.eyebrow
  headline-2line:
    line-1: "white, all caps"
    line-2: "linear-gradient(90deg, brand.green, emerald-200/300) clipped to text"
  device-mockup:
    width: "320px"
    height: "660px"
    frame-color: "#0B0B0D"
    frame-thickness: "6px"
    radius-outer: radius.phone-frame
    radius-inner: radius.phone-screen
    notch: "dynamic island, 116×32, with camera+sensor lenses"
    home-indicator: "rgba(255,255,255,0.95) bar, 120×5, soft white glow"
    side-buttons: "raised metallic pills (mute, volume up/down, power)"
    shadow: shadow.phone-stack
  marquee-row:
    direction: "horizontal infinite"
    speed: motion.duration.marquee
    item-style:
      typography: "uppercase, weight 900, tracking-tightest"
      color: text.dim
      size: "24–32px"

layout:
  grid:        "12-col implicit; major sections use 1.2fr / 0.8fr or 1fr / 1fr splits"
  alignment:   "left-anchored content, single 1400px max-width container"
  rhythm:      "section → ambient glow at top → eyebrow → headline → body → CTA row → device or rail"
  page-arc:    "scroll-driven hero (320vh) → marquee CTA → social proof → trending events rail → how-it-works split → host product narrative → app showcase (3-phone fan) → footer"

content-voice:
  tone:        "Direct, blunt, students-talking-to-students. No agency filler."
  pattern:     "Two-clause headlines: a noun phrase, then a counterpoint. e.g. 'Crowd in. Friction out.'"
  copy-rules:
    - "Lead with what the user does, then what they get."
    - "Numbers and metrics over adjectives."
    - "Avoid corporate softeners ('seamless', 'leverage', 'powerful')."
    - "Honest about scope: 'static mock, not a live event' shipped in marketing copy."

accessibility:
  color-mode:        "dark-only (color-scheme: dark)"
  contrast-targets:  "≥4.5:1 for body, ≥3:1 for large display; mid-zinc body text is intentional"
  motion:            "respects prefers-reduced-motion: disable scroll-scenes, marquees pause, infinite glows freeze"
  selection:         "green selection on dark — high-visibility brand moment"
  focus-visible:     "outline ring at border.focus"
---

# RAGE — design language

## What this product feels like

RAGE is the after-hours feed for college nightlife: parties, shows, raves,
mixers — gated by a `.edu` address and ticketed through a phone you already
have in your hand. The visual system has to do two things at once: feel like
a club flyer at 1 AM, and feel like a piece of software you trust your card
on. Every choice trades politeness for confidence.

The page is **black-first**. The body is `#030303`, not pure black — that
single notch off zero keeps the surface from looking like an unrendered
canvas and gives shadows something to sit against. Sections alternate
between this near-black and `zinc-950`, separated by the faintest possible
hairline (`rgba(255,255,255,0.06)`). The seams are almost invisible on
purpose — the eye reads the page as one continuous dark room rather than a
stack of cards.

## The signature green

`#4BFA94` is the only color the brand will spend. It does the work of an
entire palette: it's the eyebrow above every section, the gradient on the
second line of every two-line headline, the primary CTA, the glow under
that CTA, the active tab indicator inside the phone mockup, and the text
selection color. Yellow `#F2EF1D` and electric blue `#0000FE` exist in the
palette but only ever appear inside device mock content or as ambient
background blooms — they never carry brand meaning at the page level.

When the green appears in headlines it's almost always as a gradient ramp
into a paler emerald (`emerald-200`/`emerald-300`), creating a soft fall-off
that feels lit-from-within rather than painted-on. Pure flat green is
reserved for surfaces where it acts as a button or status pill.

## Typography is the loudest element

The brand wordmark is the typography. Display headlines are **Inter at
weight 900, uppercase, with `-0.04em` letter-spacing and `0.88` line
height** — packed so tight that words physically touch. This is doing the
work of a logo. Section heads follow the same rule, just one notch
softer (`-0.03em`, `0.92` leading).

Two structural conventions repeat across every section:

1. **The two-line gradient headline.** First line in flat white, second
   line in a left-to-right green gradient. The break is hard, not soft —
   it should read like a quote and a punchline.
2. **The green eyebrow.** Every major block opens with an 11px,
   bold-uppercase, `0.24em`-tracked label in the signature green. It tells
   you which "track" of the story you're in (Discover · .edu verified ·
   Door flow · For hosts · From organizers · Live now). Eyebrows are the
   product's table of contents.

Body copy sits at 15–16px in `zinc-400`, `1.65` leading. It's deliberately
muted so it doesn't compete with the headline — the eye should land on the
headline first, every time.

## The phone is the hero

Every major narrative section has a hardware mockup at its center. The
device is drawn — not photographed — at 320×660 with a 6px black bezel,
visible raised metallic side buttons (mute, volume up, volume down, power),
a dynamic-island cutout containing a tiny tinted camera lens with a
specular highlight, a bright white home indicator at the bottom, and a
multi-layer shadow stack that ends with a faint green halo. The frame is
deliberately thin to keep attention on the screen content rather than the
chrome.

The phone moves on **scroll**, not on click. The hero section is `320vh`
tall and uses page-level `scrollY` to drive a normalized 0→1 progress that
feeds:

- **Three crossfading screens inside the device** (event feed → .edu
  verify → QR ticket).
- **Scale, translateY, rotateX/Y/Z** on the device itself — gentle
  perspective tilt (~3–8°), small lift, slight in-plane rotation.
- **Three crossfading text scenes** anchored around the device.
- **Internal screen animations** — feed cards stagger in, the .edu badge
  scales up, the QR code pops.

The intent is **cinema, not interactivity**: the user scrolls, the camera
moves, the story tells itself.

## Atmosphere and depth

Every dark section opens with a single faint **radial green glow at the
top center** (`radius 60% 60% at 50% 0%`, alpha `0.05`–`0.10`, no blur
filter — just a soft gradient). This is the page's only non-functional
ornament. It does three things: it tells you a new section has begun, it
gives the headline a halo to read against, and it carries the brand
green through pages where green wouldn't otherwise appear.

A secondary blue ambient glow (`#0000FE` at `0.06` alpha, `100–140px`
blur) appears in deep hero sections, always offset to a corner. It's
warm-cool contrast — the green pulls forward, the blue pushes back.

Around the device mockups a tighter, brighter green halo
(`rgba(75,250,148,0.25)`, `40–50px` blur, `520×520`) tracks with the
phone's scroll-driven motion. This is the only "live" lighting in the
system.

## Motion language

One easing curve does almost all the work: **`cubic-bezier(0.25, 0.46,
0.45, 0.94)`** — a confident soft-land. It's used for fade-ups, scene
reveals, hover lifts, and CTA presses. The exception is card hovers,
which use a tight spring (`stiffness 380–400, damping 26–28`) to feel
physical rather than animated.

Three motion patterns repeat:

1. **Fade-up on enter** — content arrives `12–24px` low and fades up over
   `~450ms` as it enters viewport. Always with `viewport={{ once: true,
   margin: "-40px to -80px" }}` so it fires slightly early and never
   re-triggers.
2. **Stagger inside groups** — `50–80ms` between siblings, `50–60ms`
   leading delay. Used for tile grids and feed card lists inside
   mockups.
3. **Scroll-scene** — page-level `scrollY` mapped through `useTransform`
   to drive multi-property animation across a tall sticky container.
   Always paired with a `useLayoutEffect` that measures the section's
   `offsetTop`/`offsetHeight` so the bounds stay correct on resize.

Two infinite loops exist and are intentional: a horizontal **school name
marquee** (`32–38s` per cycle, two rows in opposite directions) and a
**CTA box-shadow pulse** (`2.8s`, oscillating between dim and bright
green glow). Both halt under `prefers-reduced-motion`.

## CTAs and pills

Three button variants cover everything:

- **Primary** — flat `#4BFA94`, black label, 48px tall, full pill, with the
  green glow shadow underneath. Used for the most-wanted action on a
  section ("Get the app", "Verify your .edu", "Find your school").
- **Light** — flat white, black label, same shape and size, with a softer
  white drop-shadow. Used for hosts-side actions ("Create event") where
  the green would compete with adjacent eyebrows.
- **Ghost** — transparent with `rgba(255,255,255,0.18)` border, white
  label, same shape. Always paired as the secondary next to a primary.

Labels are always **11px, weight 700, uppercase, `0.16em` tracking** —
the same micro-label rhythm as the eyebrow, just tighter. Buttons and
labels visually rhyme.

## Cards and surfaces

Cards live on `rgba(255,255,255,0.02)` with a `rgba(255,255,255,0.08)`
border and a 1px white-on-top inset highlight. Radius is `16px` (the
"2xl" stop) for general cards, smaller (10–14px) inside the phone
mockup. On hover, the border eases toward green
(`rgba(75,250,148,0.35)`) and the card lifts `2–4px`. There's no
background fill change on hover — the green border carries the entire
interaction signal.

## What this system avoids

- **Skeuomorphism.** No rounded gradients masquerading as buttons, no
  embossed text, no fake textures. The phone mockup is the one
  exception, and it's intentional — the device should feel real
  because the product *is* a phone app.
- **Multiple accent colors at the page level.** Green carries every
  brand moment. Yellow and blue exist only inside content (event tags,
  ambient glows).
- **Soft pastels.** Backgrounds are black; text is white or a precise
  step on the zinc scale. There is no "off-white" or "warm gray"
  anywhere on the surface.
- **Decorative illustration.** The only ornaments are the radial glows
  and the device mockups. No spot illustrations, no patterns, no
  decorative dividers.
- **Title case.** Display copy is uppercase. Sentence case appears only
  in body copy, form fields, and the inside-device UI.

## How a new screen should look

A page in this system reads:

1. A **black surface** with the faintest hairline at the top.
2. A **green eyebrow** that names the track you're in.
3. A **two-line uppercase headline**, white on top, green-gradient
   second line.
4. A **single muted-zinc paragraph** of body copy, capped at ~30em.
5. A **CTA row** — primary green pill, optional ghost secondary.
6. A **hero element** — device mockup, content rail, or testimonial
   carousel — sitting under a soft top-anchored radial green glow.

If a new section can be built from those six slots, in that order,
without inventing a new color or a new typography weight, it belongs.
If it can't, the section probably needs to be reconsidered before a
new design token is added.
