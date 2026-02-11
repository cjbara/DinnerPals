# DinnerPals — Product Document

## Overview

**DinnerPals** is a web application for coordinating potluck-style dinners among friends and communities. It solves the classic potluck problem: *"Everyone showed up with mashed potatoes."*

The platform gives a dinner host a shareable link to collect RSVPs and coordinate who is bringing what. Guests can see the full menu board in real time, claim items by category, and tag dietary restrictions — ensuring the meal is balanced, diverse, and well-organized.

DinnerPals is lightweight by design. No accounts required. No app to download. Just a link, a phone number, and a dinner to plan.

---

## Problem

Coordinating a potluck dinner today relies on a patchwork of group texts, spreadsheets, and word-of-mouth. This leads to:

- **Duplicate dishes** — Three people bring mac and cheese, no one brings a salad.
- **Category gaps** — Plenty of sides, no main dish, no drinks.
- **No single source of truth** — Info is scattered across iMessages, Slack threads, and people's heads.
- **Guest list confusion** — The host doesn't have a clear picture of who's actually coming.
- **Coordination tax on the host** — The host spends more time managing logistics than enjoying the event.

---

## Target User

**Day-one user:** A social organizer (20s–40s) planning a dinner, watch party, or gathering for 6–20+ people. They're the person in the friend group who says, *"I'll host — everyone bring something."*

**Day-one scenario:** Planning a Super Bowl watch party. The host needs to coordinate appetizers, a main dish, desserts, and drinks across 8–15 guests, some of whom don't know each other.

**Key traits:**
- Comfortable sharing a link via text/group chat
- Doesn't want to wrestle with a spreadsheet
- Wants guests to self-organize as much as possible

---

## Solution

A simple, shareable web page for each dinner that acts as a **live coordination board**:

- The **host** creates the dinner, sets the details, and optionally defines a wishlist of what's needed.
- **Guests** visit the link, RSVP, and sign up to bring specific items.
- **Everyone** can see the full guest list and menu in real time.

---

## Core Concepts

### Dinner

A single event. Every dinner has:

| Field        | Required | Description                                         |
| ------------ | -------- | --------------------------------------------------- |
| Name/Title   | Yes      | e.g., "Super Bowl LX Watch Party"                   |
| Date & Time  | Yes      | When the dinner is happening                         |
| Location     | Yes      | Address or description of where                      |
| Description  | No       | Theme, notes, instructions (e.g., "BYOB encouraged") |

A dinner has exactly **one Host** and **zero or more Guests**.

### Host

The person who creates the dinner. They:

- Provide the dinner name, date/time, and location
- Receive a **shareable link** for the dinner
- Can optionally define a **category wishlist** (see below)
- Can invite guests (and guests can also invite others)
- Can see all guest phone numbers for coordination purposes
- Can also sign up to bring items (they're a participant too)
- Can edit dinner details after creation

### Guest

Anyone who visits the dinner link. They:

- **RSVP** to confirm attendance (phone number captured at this step)
- Optionally **sign up to bring one or more items**
- Can **modify or remove** their sign-ups at any time
- Can see all other guests' **names** (but NOT phone numbers)
- Can share the dinner link to invite others

### Items (Dishes / Contributions)

An item is something a guest (or host) signs up to bring. Each item has:

| Field                | Required | Description                                                    |
| -------------------- | -------- | -------------------------------------------------------------- |
| Name                 | Yes      | e.g., "Buffalo Chicken Dip"                                    |
| Category             | Yes      | Selected from available categories (see below)                 |
| Description          | No       | Additional details (e.g., "Grandma's recipe, serves 8")       |
| Dietary Tags         | No       | Zero or more tags (see dietary tags list)                      |
| Brought By           | Auto     | The guest who signed up (linked to their name)                 |

### Categories

Items are organized into categories. There is a **default set** of categories:

1. **Appetizers**
2. **Entrées / Mains**
3. **Sides**
4. **Desserts**
5. **Drinks**

The host can **add custom categories** (e.g., "Paper Plates & Napkins," "Decorations," "Snacks," "Dips").

### Category Wishlist (Optional)

The host can optionally define a wishlist for the dinner — specifying how many items are ideally needed in each category. For example:

- Appetizers: 2
- Entrées: 1
- Desserts: 2
- Drinks: 3

**This is a suggestion, not a hard cap.** Guests can always sign up to bring items in any category regardless of the wishlist count.

When a category's wishlist count is met (e.g., 2 of 2 appetizers filled), a **green checkmark ✅** appears next to that category to signal it's covered. Unfilled categories show progress (e.g., "1 of 2").

If no wishlist is defined, the dinner is fully open — guests sign up for whatever they want.

### Dietary Restriction Tags

Items can be tagged with dietary information so guests can see at a glance what's safe for them. Tags include (but are not limited to):

- Dairy-Free
- Gluten-Free
- Nut-Free
- Vegan
- Vegetarian
- Contains Alcohol

These are **tags on items**, not on guests. (A guest doesn't declare "I'm gluten-free" — instead, the person bringing a dish tags it as "Gluten-Free" so others know.)

---

## User Flows

### Flow 1: Host Creates a Dinner

1. Host visits DinnerPals homepage
2. Host clicks **"Create a Dinner"**
3. Host enters:
   - Their name
   - Their phone number
   - Dinner name
   - Date & time
   - Location
   - (Optional) Description / theme
4. Host is taken to the **Dinner Page**
5. Host receives a **shareable link** (copy to clipboard / share button)
6. (Optional) Host defines **category wishlist** — picks categories and sets desired count for each
7. (Optional) Host signs up to bring items themselves

### Flow 2: Guest Joins via Link

1. Guest receives the dinner link (via text, group chat, social media, etc.)
2. Guest opens the link and sees the **Dinner Page** — dinner details, current guest list, and current menu board
3. Guest clicks **"RSVP"**
4. Guest enters:
   - Their name
   - Their phone number
5. Guest is now on the guest list and can see the full dinner coordination board
6. (Optional) Guest signs up to bring one or more items
7. Guest can share the link to invite others

### Flow 3: Guest Signs Up to Bring an Item

1. Guest (already RSVP'd) clicks **"Add Item"** (or similar CTA)
2. Guest enters:
   - Item name (e.g., "Guacamole")
   - Category (select from available categories — apps, entrée, dessert, drinks, or any custom ones)
   - (Optional) Description
   - (Optional) Dietary tags
3. Item appears on the menu board under the appropriate category, attributed to the guest
4. If the item fulfills a wishlist slot, the wishlist progress updates (and shows ✅ when full)

### Flow 4: Guest Modifies or Removes an Item

1. Guest views their signed-up items on the dinner page
2. Guest can **edit** item details (name, description, category, dietary tags)
3. Guest can **remove** an item (freeing up the wishlist slot if applicable)

### Flow 5: Host Edits Dinner Details

1. Host can edit dinner name, date/time, location, and description after creation
2. Host can add/remove/modify category wishlist items at any time
3. Changes are reflected immediately for all guests viewing the page

---

## Pages & Views

### 1. Landing Page (`/`)

- Hero section: "Plan your potluck. No spreadsheet required."
- Single CTA: **"Create a Dinner"**
- Brief explanation of how it works (3 steps: Create → Share → Coordinate)

### 2. Create Dinner Page (`/create`)

- Form: Name, phone number, dinner title, date/time, location, description
- On submit → redirects to the Dinner Page

### 3. Dinner Page (`/dinner/:id`)

This is the core page of the app. It shows:

**Header Section:**
- Dinner name, date/time, location, description
- Share button (copy link to clipboard)

**Guest List Section:**
- List of RSVP'd guests (names only)
- RSVP button for new guests (opens a modal or inline form for name + phone)
- Guest count (e.g., "8 guests")

**Menu Board Section:**
- Items grouped by category
- Each category shows:
  - Category name
  - Wishlist progress if applicable (e.g., "2 / 2 ✅" or "1 / 3")
  - List of items in that category, each showing:
    - Item name
    - Description (if provided)
    - Dietary tags (as small badges/chips)
    - Brought by (guest name)
- "Add Item" button
- Empty categories from the wishlist are visible (encouraging guests to fill gaps)

**For the host:** Additional controls to edit dinner details and manage the wishlist.

**For the guest viewing their own items:** Edit / Remove buttons on their items.

---

## Access & Identity

| Concept              | Detail                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Authentication       | **None.** No accounts, no passwords, no OAuth.                                              |
| Identity             | A guest is identified by **name + phone number**, entered at RSVP time.                     |
| Returning access     | A guest who has already RSVP'd can return to the page. Identification handled via browser session/cookie or a simple phone number re-entry ("Welcome back, Cory"). |
| Host identification  | The host is the person who created the dinner. Identified by their session/cookie.           |
| Privacy              | Guests can see other guests' **names only**. Phone numbers are visible **only to the host**. |

### Note on Session Management

Since there are no accounts, returning users need a lightweight way to be recognized. Options (implementation decision):

- **Cookie/local storage:** Store a session token in the browser. If the guest returns on the same device/browser, they're recognized automatically.
- **Phone number verification:** Guest enters their phone number to "log back in." No SMS code needed for V1 — just a lookup. (Accepts the risk that someone could impersonate by entering another's phone number. Acceptable for a low-stakes dinner coordination app.)

---

## Technical Architecture

### Stack

| Layer    | Technology                                         |
| -------- | -------------------------------------------------- |
| Frontend | Web app (framework TBD — React/Next.js recommended)|
| Backend  | **Supabase** (PostgreSQL + Auth + Realtime + API)  |
| Hosting  | TBD (Vercel, Netlify, etc.)                        |

### Supabase Data Model

#### `dinners` table

| Column        | Type        | Notes                                    |
| ------------- | ----------- | ---------------------------------------- |
| id            | uuid (PK)   | Auto-generated                           |
| title         | text        | Dinner name                              |
| description   | text        | Optional                                 |
| date_time     | timestamptz | When the dinner is                       |
| location      | text        | Address or location description          |
| host_name     | text        | Host's display name                      |
| host_phone    | text        | Host's phone number                      |
| share_code    | text        | Unique, URL-friendly code for the link   |
| created_at    | timestamptz | Auto-generated                           |

#### `categories` table

| Column       | Type        | Notes                                     |
| ------------ | ----------- | ----------------------------------------- |
| id           | uuid (PK)   | Auto-generated                            |
| dinner_id    | uuid (FK)   | References `dinners.id`                   |
| name         | text        | Category name (e.g., "Appetizers")        |
| desired_count| integer     | Wishlist count (nullable — null = no cap) |
| sort_order   | integer     | Display order                             |

#### `guests` table

| Column     | Type        | Notes                                      |
| ---------- | ----------- | ------------------------------------------ |
| id         | uuid (PK)   | Auto-generated                             |
| dinner_id  | uuid (FK)   | References `dinners.id`                    |
| name       | text        | Guest's display name                       |
| phone      | text        | Guest's phone number                       |
| is_host    | boolean     | Whether this guest is the host             |
| rsvp_at    | timestamptz | When they RSVP'd                           |
| session_token | text     | For returning user identification          |

#### `items` table

| Column       | Type        | Notes                                     |
| ------------ | ----------- | ----------------------------------------- |
| id           | uuid (PK)   | Auto-generated                            |
| dinner_id    | uuid (FK)   | References `dinners.id`                   |
| guest_id     | uuid (FK)   | References `guests.id`                    |
| category_id  | uuid (FK)   | References `categories.id`                |
| name         | text        | Item name (e.g., "Guacamole")             |
| description  | text        | Optional details                          |
| created_at   | timestamptz | Auto-generated                            |

#### `item_dietary_tags` table

| Column   | Type       | Notes                                      |
| -------- | ---------- | ------------------------------------------ |
| id       | uuid (PK)  | Auto-generated                             |
| item_id  | uuid (FK)  | References `items.id`                      |
| tag      | text       | e.g., "gluten-free", "vegan", "dairy-free" |

### Supabase Realtime

Use Supabase Realtime subscriptions on the `guests`, `items`, and `categories` tables so the Dinner Page updates **live** — when a guest RSVPs or signs up to bring an item, everyone viewing the page sees it instantly without refreshing.

### URL Structure

- `/` — Landing page
- `/create` — Create a new dinner
- `/dinner/:shareCode` — The dinner coordination page (the shareable link)

---

## V1 Scope Summary

### In Scope (Build Now)

- [x] Host creates a dinner with name, date/time, location, description
- [x] Shareable link generated for each dinner
- [x] Guests RSVP with name + phone number
- [x] Guest list visible to all (names only; host sees phone numbers)
- [x] Default food categories (Appetizers, Entrées, Sides, Desserts, Drinks)
- [x] Host can add custom categories
- [x] Host can define category wishlist (desired count per category)
- [x] Wishlist progress indicator with ✅ when fulfilled
- [x] Guests sign up to bring items (name, category, optional description, optional dietary tags)
- [x] Guests can edit or remove their own items
- [x] Host can edit dinner details and wishlist after creation
- [x] Real-time updates (Supabase Realtime)
- [x] Mobile-responsive web design
- [x] No account required

### Out of Scope (V2+)

- [ ] Post-dinner reflections / conversation notes
- [ ] Shared money fund / expense splitting
- [ ] Friend connections and dinner history
- [ ] SMS/text notifications and reminders
- [ ] User accounts and profiles
- [ ] Recurring / series dinners
- [ ] Guest dietary preference profiles

---

## Design Principles

1. **Zero friction for guests.** A guest should go from receiving a link to RSVP'd in under 30 seconds. No downloads, no sign-ups, no passwords.

2. **The dinner page is the product.** Everything happens on one page. It's the guest list, the menu board, and the coordination hub.

3. **Hosts set the table, guests fill it.** The wishlist is a suggestion, not a mandate. The app encourages coordination without creating rules.

4. **Real-time is expected.** If Sarah signs up to bring wine, everyone should see it immediately. No refreshing.

5. **Mobile-first.** Most guests will open the link on their phone from a text message.

---

## Open Questions / Implementation Decisions

1. **Returning user flow:** Cookie-based session vs. phone number re-entry. Recommend starting with cookie/local storage for simplicity, with phone re-entry as a fallback.

2. **Host editing permissions:** Should the host be able to remove a guest or their items? (Suggest yes, but low priority for V1.)

3. **Duplicate item warning:** Should the app warn if two people sign up to bring the same item name? (e.g., two people both type "Chips and Salsa"). Nice-to-have.

4. **Category ordering:** Should categories have a fixed display order (Apps → Mains → Sides → Desserts → Drinks) or let the host reorder?

5. **Share mechanism:** Copy-to-clipboard is sufficient, but should we also support a native share sheet (Web Share API) on mobile?
