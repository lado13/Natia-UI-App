# 📺 NatiaUIApp

NatiaUIApp is an Angular 17 project designed to provide a modern and dynamic UI for managing and displaying live data such as TV channels, satellites, and real-time updates via SignalR.

---

## 🚀 Features
- ✅ Built with **Angular 17 (Standalone Components)**
- ✅ **Service-based architecture** for clean separation of logic
- ✅ **SignalR real-time updates** (e.g., live channel status refresh without page reload)
- ✅ **Responsive UI** with Angular & Bootstrap
- ✅ **Error & Warning indicators** for live satellite/channel data
- ✅ **Reusable components** for scalability

---

## 🖼️ Screenshots

### Web View
![Screenshot](/src/screenshots/Screenshot1.png)


![Screenshot](/src/screenshots/Screenshot2.png)

*(Add your actual screenshots in a `/screenshots` folder inside the project)*

---

## 🛠️ Tech Stack
- **Frontend:** Angular 17, RxJS
- **Backend (SignalR source):** .NET Core (assumed)
- **Styling:** Bootstrap / SCSS
- **Real-time:** SignalR integration

---

## 📂 Project Structure
```bash
src/app/
 ├── components/       # Reusable UI components
 ├── services/         # SignalR + API services
 ├── models/           # TypeScript interfaces & models
 ├── pages/            # Main feature pages
 ├── app.config.ts     # Angular configuration
 └── app.component.ts  # Root component
