He
# 🧠 Cyber Tip App

**Cyber Tip App** is a modern web application that delivers **daily cybersecurity tips** powered by **AI**.  
It helps users stay informed about digital safety by providing a new tip each day and allowing them to search for more tips by entering specific keywords.  
Built with **React (Vite)** and **Supabase Authentication**, it ensures a secure and seamless experience for every user.

---

## 🚀 Features

- 🔐 **User Authentication:** Powered by Supabase for secure sign-up and login.  
- 💡 **Daily Cyber Tips:** Automatically fetches a new cybersecurity tip each day.  
- 🔍 **AI Keyword Search:** Get personalized, AI-generated tips by entering a keyword.  
- ⚡ **Modern Frontend:** Built with React and Vite for high performance.  
- 🧩 **Clean UI:** Simple and responsive interface built with CSS.

---

## 🛠️ Tech Stack

| Category | Technology |
|-----------|-------------|
| **Frontend** | React + Vite |
| **Authentication** | Supabase |
| **Backend / API** | AI Tip Generator API (FastAPI or Node) |
| **Styling** | Custom CSS |
| **Deployment** | Vercel / Netlify / Render |

---

## 📁 Project Structure

```
cyber-tip-frontend/
├── src/
│   ├── Components/
│   │   ├── Authentication.jsx   # Handles user login/signup
│   │   ├── Cyberapp.jsx         # Main dashboard displaying tips
│   ├── Contexts/
│   │   └── AuthContext.jsx      # Authentication state management
│   ├── supabaseClient.js        # Supabase client configuration
│   ├── App.jsx                  # App entry point with routing
│   └── main.jsx
├── .env                         # Environment variables (ignored by Git)
├── .env.example                 # Example env configuration
├── package.json
└── vite.config.js
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/KudzaiNicholasTivatye/cybertipapp.git
cd cyber-tip-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory with the following:
```bash
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_API_URL=http://localhost:8000/api
```

*(Never commit your real `.env` file — it should stay private.)*

---

### 4. Run the development server
```bash
npm run dev
```

Open your browser at:
```
http://localhost:5173/
```

---

## 🔒 Authentication Flow

1. User signs up or logs in via Supabase.  
2. A secure session is created and stored.  
3. Only authenticated users can access the dashboard (`Cyberapp.jsx`).  
4. The app fetches daily and keyword-based tips via API calls.

---

## 🧠 AI-Powered Tips

The app uses an **AI-driven API** to provide educational, cybersecurity-related advice.  
- Daily tips are fetched automatically.  
- Users can enter a **keyword** (e.g., “phishing”, “password”, “encryption”) to receive extra guidance.

---

## 🚀 Deployment

You can deploy this project on:
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [Render](https://render.com/)

Remember to add your environment variables in the deployment settings.

---

## 🧩 Future Improvements

- 🌙 Dark Mode  
- 📱 Fully responsive mobile design  
- 🧾 User tip history and bookmarking  
- 🔔 Push notifications for daily tips  

---

## 👨‍💻 Author

**Kudzai Nicholas**  
📧 kudziet221@gmail.com  
💼 Passionate about Cybersecurity and AI-powered education.

---

## 🛡️ License

This project is licensed under the **MIT License**.  
Feel free to use and modify it for learning or development purposes.


