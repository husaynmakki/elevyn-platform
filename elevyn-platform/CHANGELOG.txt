# Elevyn — Full Project Changelog

Everything built and changed across this project, in order.

---

## 1. Elevyn Wellness Elevated — website (initial build)
- Single-page site for the 80,000 sq ft Dearborn, MI health club
- Sections: hero, Train (weight room, track, kickboxing), Recover (sauna, steam, pool, hot tub, cold plunge, locker rooms), Women's Only (reformer Pilates), Posing Room, Fuel Bar & IV/Peptide Clinic
- Visual direction iterated twice: black/gold industrial gym look → black, rose gold & oak "Zara/Equinox" editorial look (final)
- Roman numeral "XI" branding element added, then removed at request

## 2. Booking system added
- Working reservation flow (date/time/duration/resource selection) for: Facility Tour, Racquetball, Tennis, Pickleball, Personal Training, Reformer Pilates
- Bookings saved to a "My Bookings" page (browser local storage)
- Kids Club added as an amenity with its own drop-in booking flow

## 3. Multi-page version (1st pass)
- Site split into dedicated pages per section/amenity, with shared nav/footer
- Custom SVG illustrations created for each section (no photography yet)

## 4. Consolidated to single page
- All pages merged back into one scrolling site with in-page anchor navigation, per request
- Merch/Shop added as a section with a working cart (add to bag, size selection, checkout mock)

## 5. Real brand assets integrated
- Uploaded logo (serif "ELEVYN — Wellness Elevated" wordmark) and real facility photos/renderings brought in, replacing the SVG illustrations
- Typography switched to Bodoni Moda to match the real logo's serif style
- Dedicated Shop page rebuilt using real merch product photography (tees, polo, cap, duffel, drinkware)

## 6. Fully self-contained single file
- All images converted to embedded base64 so the entire site (including Shop) ships as one HTML file with no external dependencies

## 7. Elevyn Studios — apparel sub-brand (new)
- Separate site built for the apparel line, styled after Alo Yoga, YoungLA, and Lululemon
- Four product lines: Cotton, Wool, Performance, Streetwear (18 SKUs total)
- Trending-color story section grounded in current activewear color research (Mocha Mousse, Sage, Cherry, Cobalt, Vanilla Cream, Charcoal)
- Working cart system independent from the Wellness site

## 8. Brand Strategy & Growth Plan (Word doc)
- Positioning vs. Alo, YoungLA, Lululemon
- Trend-adaptability framework (Quarterly Trend Council, 70/30 core-vs-trend SKU split)
- Full product line specs and pricing
- Marketing channel strategy
- Four-phase growth roadmap (local launch → DTC growth → wholesale/retail → national scale)
- Continuous design-improvement process

## 9. Elevyn Command Center — admin platform (new)
Built as a working front-end prototype covering:
- **Dashboard** — live KPIs and charts
- **Lead Management** — table + drag/drop pipeline, filters, add/edit, simulated lead-sourcing sweep
- **Sales Rep Workspace** — per-rep queues, conversion leaderboard
- **Marketing** — SMS/email campaign composer, audience segments, send history
- **SEO Strategy** — keyword tracker across both sites
- **Memberships** — member records with real generated Code128 barcodes, scan simulator
- **Billing & Payments** — recurring/one-time schedules across every booking type, payment collection
- **Analytics** — per-site, per-section traffic/conversion breakdowns

## 10. Supplier research
- Shortlist of cheap blank-apparel, activewear, merino wool, and streetwear manufacturers/embroiderers for the Cotton, Wool, Performance, and Streetwear lines

## 11. Business detail pass — both sites + Command Center
- Real hours (M–F 4:30am–12am, Sat–Sun 6am–9pm) and address (2727 S Gulley Rd, Dearborn, MI 48124) added throughout
- Court counts corrected: 2 racquetball, 4 tennis, 2 pickleball (copy + booking widgets)
- Recover section updated: Infrared Saunas, indoor lap pool with bromine (not chlorine), added Red Light Therapy and Copper Plumbing as new amenities
- "Backed by science" positioning added to Train and Recover copy
- Elevyn Studios: worldwide shipping messaging added; Trend Report copy updated to reflect the line as ever-expanding/fully configurable and informed by both competitor and internal sales data
- **Command Center: Reviews & Feedback module added** — our ratings vs. 3 competitor benchmarks per section, an experience-factors table (down to lighting/scent-level detail and its correlation to return visits), recent review themes feed

## 12. Multi-page rebuild + Command Center expansion (most recent)
- Both websites converted back to real multi-page navigation (separate URLs per page, not anchors):
  - **Elevyn Wellness**: 17 pages (Home, Train, Recover, Women's, Studio, Kids Club, Posing Room, Fuel & Clinic, Book hub, 7 dedicated booking pages, My Bookings)
  - **Elevyn Studios**: 7 pages (Home, Cotton, Wool, Performance, Streetwear, Shop All, Our Story)
- Shop button on the Wellness site fixed to link directly to the Studios site's Shop page
- **Command Center: Site Configuration** — replaced the old basic editor with full forms: address & hours, court counts, product pricing table (all 18 SKUs), homepage hero content with live preview — no code required
- **Command Center: Media Library** — upload photos/videos, tag by site, filter, delete
- **Command Center: Social Media** — connect/disconnect Instagram, Facebook, TikTok, X, Threads; composer to post across connected platforms with optional media + scheduling; post history log

---

## What's real vs. simulated, throughout

**Fully real and working:** all page navigation, booking flows (stored locally), cart/checkout UI, Command Center CRUD (leads, members, invoices, campaigns logged, config saves), barcode generation, media uploads (session-based).

**Simulated / needs a real backend to go live:** actual SMS/email delivery (needs Twilio/SendGrid), actual payment processing (needs Stripe + PCI compliance), actual lead sourcing from ad platforms/forms, actual social media publishing (needs each platform's API), persistent cloud media storage, and a publishing pipeline to push Command Center edits onto the live sites.
