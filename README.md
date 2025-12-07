# 🚌 Khulna Travels - Complete Bus Booking System

## Full React Project - Production Ready

---

## ✨ Features

### ✅ Complete Pages:
1. **Home Page** - Shohoz exact design with animations
2. **Bus List Page** - Available buses display
3. **Seat Selection Page** - Interactive seat booking
4. **Payment Page** - Multiple payment methods

### ✅ Home Page Features:
- 🎬 Hero section with 6 animations (Plane, Train, Building, Ferris Wheel, Sun, Hills)
- 🔍 Advanced search (One Way / Round Way)
- 📍 39 locations dropdown (From/To)
- 🔄 Location swap button
- 📅 Date pickers
- 📊 Recent searches section
- 💼 About section (3 feature boxes)
- ❓ FAQ section (5 accordion items)

### ✅ 39 Locations Included:
```
Kuakata, Alipur, Mohipur, Hajipur, Pakhimara, Kolapara, Amtoli, 
Sakaria, Potuakhali, Pagla, Senanibas, Bakergonj, Rupatoli, 
Barishal, Monihar, Jessore, Rupadia, Basundia, Noapara, Fultola,
Afilgat, Garrison, Shiromony, Fulbari, Daulatpur, Notun Rasta,
Abu Naser, Royel Mor, Sonadanga, Zero Point, Jabusa, Kudirbottola,
Katakhali, Bagerhat, Pirojpur, Rajapur, Jhalokathi, Notullabad, Khulna
```

---

## 🎨 Design

- **Primary Color:** `#2cb67d` (Green)
- **Secondary:** `#03256c` (Blue)  
- **Accent:** `#ff4757` (Red/Orange)
- **Style:** Exact Shohoz replica
- **Responsive:** Mobile, Tablet, Desktop

---

## 🚀 Installation

### Prerequisites:
- Node.js v14+ installed
- npm or yarn

### Steps:

```bash
# 1. Extract project
cd Khulna-Travels-Complete

# 2. Install dependencies
npm install

# 3. Start development server
npm start

# 4. Open browser
http://localhost:3000
```

---

## 📁 Project Structure

```
Khulna-Travels-Complete/
├── package.json
├── README.md
├── public/
│   └── index.html
└── src/
    ├── index.js
    ├── index.css
    ├── App.js
    ├── App.css
    ├── pages/
    │   ├── HomePage.js ✨ (Main page with animations)
    │   ├── HomePage.css
    │   ├── BusListPage.js
    │   ├── BusListPage.css
    │   ├── SeatSelectionPage.js
    │   ├── SeatSelectionPage.css
    │   ├── PaymentPage.js
    │   └── PaymentPage.css
    └── components/
        └── (empty - ready for your components)
```

---

## 🎬 Animations

### Hero Section:
```javascript
✈️ Plane - Floating animation (8s infinite loop)
🏢 Building - Scale pulse (6s infinite loop)
🎡 Ferris Wheel - 360° rotation (20s infinite loop)
☀️ Sun - Pulsing glow (8s infinite loop)
🚂 Train - Horizontal movement (10s infinite loop)
🌄 Hills - Static background decoration
```

### Interactive:
- Card hover effects (translateY + shadow)
- Button transforms
- Swap button rotation (180°)
- Dropdown fade-in
- FAQ accordion expand/collapse

---

## 📱 Pages Overview

### 1. Home Page (`/`)
**Features:**
- Animated hero section
- Trip type selector (One Way/Round Way)
- Location dropdowns (39 cities)
- Date pickers
- Recent searches display
- About section (Khulna Travels content)
- FAQ accordion (5 items)
- Green color theme throughout

**Sections:**
1. Header (Logo, Menu, Login button)
2. Hero (Animations + Search form)
3. Recent Searches
4. About (2 columns)
5. FAQ (Green background, accordion)
6. Footer

### 2. Bus List Page (`/buses`)
- Available buses grid
- Date selector tabs
- Bus cards with timing
- Continue to seat selection
- Green theme (#2cb67d)

### 3. Seat Selection (`/seats/:busId`)
- Visual bus layout
- 40 seats display
- Available/Booked/Selected states
- Real-time price calculation
- Booking summary sidebar
- Green selected seats

### 4. Payment (`/payment`)
- Payment method selector (Card, bKash, Nagad, Rocket)
- Passenger information form
- Order summary
- Complete payment button
- Green theme

---

## 🎨 Customization

### Change Colors:
```css
/* src/index.css */
:root {
  --primary-color: #2cb67d;  /* Change this */
  --secondary-color: #03256c;  /* Change this */
  --accent-color: #ff4757;  /* Change this */
}
```

### Add/Remove Locations:
```javascript
// src/pages/HomePage.js (line 10)
const locations = [
  'Your City 1',
  'Your City 2',
  // ... add more
];
```

### Modify FAQs:
```javascript
// src/pages/HomePage.js (line 50)
const faqItems = [
  {
    question: 'Your question?',
    answer: 'Your answer'
  },
  // ... add more
];
```

---

## 🔧 Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (not recommended)
npm run eject
```

---

## 🌐 Deployment

### Build Production:
```bash
npm run build
```

### Deploy to:
- **Vercel** (Free) - Recommended
- **Netlify** (Free)
- **DigitalOcean** (৳20,000/year)
- **HostMight** (৳20,000/year)

### Quick Deploy to Vercel:
```bash
npm install -g vercel
vercel
```

---

## 📊 Performance

- ⚡ Fast loading (React optimized)
- 🎨 Smooth animations (CSS3)
- 📱 Fully responsive
- ♿ Accessible
- 🔍 SEO friendly

---

## 🔐 Backend Integration (Future)

Ready for integration with:
- Node.js + Express API
- PostgreSQL database
- Redis caching
- Payment gateways (bKash, SSLCommerz)
- JWT authentication

---

## 🆘 Troubleshooting

### Port already in use:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm start
```

### Module not found:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build errors:
```bash
# Clear build cache
npm cache clean --force
npm run build
```

---

## 📝 To-Do List

### Phase 1 (Current): ✅ Complete
- [x] Home page with animations
- [x] Search functionality
- [x] Location dropdowns
- [x] Recent searches
- [x] About section
- [x] FAQ section
- [x] Bus list page
- [x] Seat selection
- [x] Payment page

### Phase 2 (Backend):
- [ ] User authentication
- [ ] Real bus data API
- [ ] Booking system
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] SMS alerts

### Phase 3 (Advanced):
- [ ] User dashboard
- [ ] Booking history
- [ ] Admin panel
- [ ] Analytics
- [ ] Mobile app

---

## 🎯 Key Features Summary

✅ Shohoz exact design
✅ 39 location dropdown
✅ Full animations (6 types)
✅ One Way / Round Way toggle
✅ Recent searches
✅ FAQ accordion
✅ Responsive design
✅ 4 complete pages
✅ Green color theme (#2cb67d)
✅ Production ready

---

## 📞 Support

For issues or questions:
- Check this README
- Review code comments
- Check browser console for errors

---

## 🎊 Credits

- **Design:** Inspired by Shohoz
- **Content:** Khulna Travels
- **Framework:** React.js 18
- **Routing:** React Router DOM v6

---

## 📄 License

This project is open source for educational purposes.

---

**© 2025 Khulna Travels | Complete React Project** 🚀

**Ready to deploy! Just run `npm install` and `npm start`!**
