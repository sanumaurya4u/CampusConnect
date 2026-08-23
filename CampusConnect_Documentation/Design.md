# Campus Connect — Design System

## 1. Design Direction

Campus Connect should feel:

- Modern
- Friendly
- Professional
- Student-focused
- Clean
- Trustworthy
- Energetic without being noisy

The interface should feel like a **modern campus platform**, not an academic ERP.

---

## 2. Theme

### Primary Theme

**Light-first design**

The MVP should primarily use a clean light interface.

### Optional Dark Mode

Dark mode can be added later after the light theme is stable.

Do not build two completely different visual systems.

---

## 3. Color System

Use a small, consistent palette.

### Primary

**Indigo / Blue**

Purpose:

- Primary buttons
- Links
- Active states
- Brand elements

Suggested:

```text
Primary: #4F46E5
Primary Dark: #3730A3
```

### Secondary

**Cyan / Teal**

Purpose:

- Highlights
- Informational accents
- Selected categories

Suggested:

```text
Secondary: #06B6D4
```

### Success

```text
#16A34A
```

### Warning

```text
#D97706
```

### Error

```text
#DC2626
```

### Neutral

Use neutral gray tones for:

- Backgrounds
- Borders
- Secondary text
- Cards

Do not use many unrelated colors.

---

## 4. Typography

Use a modern sans-serif font.

### Recommended

**Inter**

Fallback:

```text
system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

### Typography hierarchy

```text
Page Title
32–40px
Bold

Section Heading
24–30px
Semibold

Card Heading
18–20px
Semibold

Body
14–16px
Regular

Secondary Text
13–14px
Regular
```

Avoid excessive font sizes.

---

## 5. Layout

### Desktop

Use a centered responsive container.

Recommended maximum width:

```text
1200–1280px
```

### Student navigation

Prefer:

```text
Logo
Explore
Clubs
Events
Projects
Opportunities
----------------
Notifications
Profile
```

### Organizer navigation

```text
Dashboard
Members
Events
Announcements
Projects
Collaborations
Analytics
Settings
```

### Admin navigation

```text
Dashboard
Students
Clubs
Events
Organizers
Reports
Settings
```

---

## 6. Cards

Cards should be used for:

- Clubs
- Events
- Projects
- Opportunities
- Achievements

Cards should contain:

- Clear title.
- Short description.
- Relevant metadata.
- One primary action.

Avoid filling cards with too much information.

---

## 7. Club Card

Example structure:

```text
[Club Logo]

AI Club

AI • Data Science • Analytics

Seminars · Workshops · Discussions

150+ Members

[View Club]
```

---

## 8. Event Card

```text
[Date]

AI Workshop

Tomorrow · 4:00 PM
Seminar Hall

AI Club

128 Registered

[Register]
```

---

## 9. Buttons

Use clear hierarchy.

### Primary

For the main action:

```text
Join Club
Register
Create Event
Apply
```

### Secondary

For supporting actions:

```text
Follow
View Details
Cancel
```

### Destructive

Only for actions such as:

```text
Delete
Remove
Reject
```

Never use destructive styling for normal actions.

---

## 10. Forms

Forms should:

- Have clear labels.
- Show validation errors near fields.
- Explain required information.
- Disable submission while processing.
- Show success feedback.
- Preserve user-entered data after recoverable errors.

---

## 11. Responsive Design

The application must work on:

- Desktop.
- Laptop.
- Tablet.
- Mobile.

Students are likely to access Campus Connect primarily from phones, so mobile usability is important.

Avoid desktop-only tables where possible.

On mobile:

- Convert tables to cards when appropriate.
- Use bottom navigation or compact navigation if needed.
- Keep primary actions easy to reach.

---

## 12. Accessibility

The UI should include:

- Semantic HTML.
- Keyboard navigation.
- Visible focus states.
- Accessible labels.
- Sufficient color contrast.
- Meaningful button text.
- Alt text for meaningful images.

Do not communicate important information through color alone.

---

## 13. Animation

Use subtle animation only.

Good:

- Button hover.
- Card hover.
- Page transitions.
- Loading skeletons.
- Toast notifications.

Avoid:

- Excessive motion.
- Large parallax effects.
- Distracting background animations.
- Animations that slow navigation.

---

## 14. Visual Principles

### One primary action per screen.

### Keep information scannable.

### Use whitespace.

### Prefer meaningful icons.

### Keep components consistent.

### Avoid visual clutter.

### Make the student's next action obvious.

---

## 15. Brand Personality

Campus Connect should communicate:

> **"There is something for you on campus."**

The design should encourage discovery and participation without feeling like a social-media clone.

---

## 16. Future Design Extensions

Possible future additions:

- Dark mode.
- PWA installation.
- Campus map.
- QR-based event check-in.
- Personalized recommendation dashboard.
- Rich student activity passport.

These should be added only after the core design system is stable.
