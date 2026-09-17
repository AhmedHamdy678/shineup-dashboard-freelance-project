# 🚀 ShineUp Operations Dashboard

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=react%20query&logoColor=white)

A robust, enterprise-level web dashboard built to streamline operations for system administrators and service providers. This platform manages on-demand bookings, financial transactions, and provider profiles with real-time responsiveness.

## 📺 Project Showcase

* **Demo Video:** [▶️ Watch the Full Walkthrough on YouTube/Loom](YOUR_VIDEO_LINK_HERE)
* **Live Staging Environment:** [🌐 Visit Live Project](YOUR_DEV_LINK_HERE) 
  *(Note: For security and client confidentiality, the live environment is restricted by authentication. Please refer to the demo video for an inside look).*

### 📸 Sneak Peek
![Provider Bookings Overview](YOUR_GIF_LINK_HERE.gif)
*(Add a 5-second GIF here showing the bookings filtering or smart timer in action)*

## ✨ Key Technical Highlights

* **Proactive State Synchronization (Smart Timer):** Architected a resource-efficient background timer using Native JS APIs and TanStack Query. It auto-invalidates and transitions "Pending" bookings to "Expired" in perfectly synchronized real-time without relying on heavy server polling.
* **Advanced Data Grids & Filtering:** Implemented complex, multi-state filtering (e.g., Pending Provider Acceptance, Expired, Completed) ensuring UI consistency with strict backend Enum contracts.
* **Secure Architecture:** Strictly separated environments, properly managing sensitive client credentials and API URLs through abstracted environment variables (`.env`).
* **Team Collaboration & GitFlow:** Developed within a multi-developer team utilizing professional Git branching strategies, Pull Request reviews, and CI/CD deployment pipelines.

## 🛠️ Tech Stack

* **Core:** React.js, Vite
* **State Management & Data Fetching:** TanStack Query (React Query)
* **Styling:** Tailwind CSS / Custom UI Components
* **Version Control:** Git & GitHub

## 💻 Getting Started (Local Development)

If you'd like to run a local instance using mock data:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/AhmedHamdy678/shineup-dashboard-freelance-project.git](https://github.com/AhmedHamdy678/shineup-dashboard-freelance-project.git)