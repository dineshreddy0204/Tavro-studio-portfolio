# TAVRO® STUDIO — Official Agency Website, Admin Portal & API

> **"We Build Digital Experiences That Move Businesses Forward."**  
> Strategic Web Design & Development · E-commerce & Digital Innovation · Transforming Vision into Business Impact · Built on Trust. Driven by Excellence.

---

## 1. Brand Identity & Official Profiles

- **Brand:** TAVRO® Studio
- **Positioning:** Premium International Digital Agency
- **Email:** [dineshreddy02a@gmail.com](mailto:dineshreddy02a@gmail.com)
- **WhatsApp:** [+91 6301422287](https://wa.me/916301422287)
- **Instagram:** [instagram.com/tavrostudio.in](https://www.instagram.com/tavrostudio.in/)
- **LinkedIn:** [linkedin.com/in/dinesh-reddy-pallem](https://www.linkedin.com/in/dinesh-reddy-pallem)
- **GitHub:** [github.com/dineshreddy0204](https://github.com/dineshreddy0204)

---

## 2. Core Experience Architecture

1. **Synthetic Preloader:** Architectural brand lockup matching the official logo (`TAVRO STUDIO` in bold display with `Premium Digital Agency` in italic serif and gold divider line), real-time progress indicator, and choice to enter with synthesized studio audio or silent mode.
2. **Kinetic 3D Hero Experience:** Generative ambient particle & wave visualizer combined with a 3D perspective realm of agency principles that responds dynamically to scroll velocity and pointer parallax.
3. **Selected Work Showcase:** Cinematic showcases with 3D depth recede, dual high-resolution mockups (macOS Desktop Browser frame with live UI + Mobile device frame with quick-add bag), client metadata, delivered services, technologies, and live preview links.
   - **Featured Flagship:** [Dazzlinglooks](https://www.dazzlinglooks.in/) (`https://www.dazzlinglooks.in/`) — *Premium Beauty E-commerce Flagship*.
4. **Our Studio:** Narrative agency manifesto with word-by-word scroll illumination, commercial proof pillars, and an infinite technology marquee. Headline: *"Built for Brands. Driven by Business."*
5. **Capabilities & Services:** All 8 core agency capabilities:
   - 01 — Strategic Website Design & Development
   - 02 — E-commerce Development
   - 03 — UI/UX Design
   - 04 — Business Websites
   - 05 — Landing Page Development
   - 06 — Web Application Development
   - 07 — Website Maintenance
   - 08 — Custom Digital Solutions
6. **Our Process:** Four-stage animated methodology:
   - 01 — Discover
   - 02 — Strategize
   - 03 — Design & Develop
   - 04 — Launch & Optimize
7. **The Portal:** Perspective tunnel transition leading directly into project inquiry.
8. **Inquiry Protocol & Contact:** High-conversion form with real-time validation, WhatsApp number input, server-side persistence (`/api/inquiries`), direct WhatsApp dispatch (`https://wa.me/916301422287`), and email client integration (`dineshreddy02a@gmail.com`).
9. **Executive Admin Control Portal (`/admin`):** Secure dashboard protected by master password  to manage client inquiries, portfolio projects, and agency services with zero external dependencies.

---

## 3. Running Locally

The project includes a native Node.js production server with zero npm dependencies:

```bash
# Navigate to the main project directory
cd Tavro-Studio-Portfolio

# Start the server (default port 8000)
node server.js
```

- Public Website: [http://localhost:8000/](http://localhost:8000/)
- Admin Control Portal: [http://localhost:8000/admin](http://localhost:8000/admin) 

---

## 4. Hostinger Production Deployment

Detailed step-by-step instructions for deploying to Hostinger (hPanel Node.js selector or VPS) and connecting `tavrostudio.in` are documented in:
👉 [`HOSTINGER_DEPLOYMENT.md`](file:///c:/Users/Dines/OneDrive/Desktop/freefall-portfolio-code/Tavro-Studio-Portfolio/HOSTINGER_DEPLOYMENT.md)

---

## 5. Directory Structure

```text
Tavro-Studio-Portfolio/
├── admin.html               # Executive Admin Portal
├── favicon.ico              # Multi-resolution favicon
├── HOSTINGER_DEPLOYMENT.md  # Hostinger setup & DNS documentation
├── index.html               # Main public website
├── README.md                # Project architecture & guide
├── server.js                # Zero-dependency Node.js server & REST API
├── css/
│   ├── admin.css            # Luxury dark admin stylesheet
│   └── style.css            # Agency website design system
├── data/
│   ├── inquiries.json       # Inbound client leads store
│   ├── projects.json        # Portfolio projects store
│   └── services.json        # Agency capabilities store
└── js/
    ├── admin.js             # Admin authentication & CRUD client
    └── main.js              # Kinetic 3D engine, Lenis, Audio, Forms
```
