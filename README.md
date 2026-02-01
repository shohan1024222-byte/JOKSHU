# JOKSU Voting System
## জগন্নাথ বিশ্ববিদ্যালয় কেন্দ্রীয় ছাত্র সংসদ নির্বাচন ২০২৬

A mobile voting application for JOKSU (Jagannath University Kendrio Chhatra Sangsad) elections built with React Native and Expo.

## 🎯 Features

- **Student Authentication**: Secure login with Student ID and password
- **Candidate Browsing**: View all candidates with their symbols, departments, and manifestos
- **Position-wise Voting**: Vote for candidates in 10 different positions
- **Real-time Results**: Track election progress and results
- **Admin Panel**: Manage election state, view detailed analytics, and reset data

## 📱 Screenshots

The app includes:
- Login Screen with JNU branding
- Home Dashboard with quick actions
- Voting interface with position navigation
- Candidates list with detailed profiles
- Results view with live statistics
- Admin panel for election management

## 🗳️ Election Positions

1. **VP** - সহ-সভাপতি (Vice President)
2. **GS** - সাধারণ সম্পাদক (General Secretary)
3. **AGS** - সহ-সাধারণ সম্পাদক (Assistant General Secretary)
4. **OS** - সাংগঠনিক সম্পাদক (Organizing Secretary)
5. **PS** - প্রচার সম্পাদক (Publicity Secretary)
6. **SS** - সমাজসেবা সম্পাদক (Social Service Secretary)
7. **CS** - সাংস্কৃতিক সম্পাদক (Cultural Secretary)
8. **SPS** - ক্রীড়া সম্পাদক (Sports Secretary)
9. **IS** - আন্তর্জাতিক সম্পাদক (International Secretary)
10. **LS** - গ্রন্থাগার সম্পাদক (Library Secretary)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Expo Go app on your mobile device

### Installation

1. Clone the repository or navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Scan the QR code with Expo Go (Android) or Camera app (iOS)

## 🔑 Demo Credentials

### Student Login:
- **Student ID**: `2022331001`
- **Password**: `123456`

### Admin Login:
- **Student ID**: `admin`
- **Password**: `admin123`

## 🛠️ Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **React Navigation** - Navigation library
- **AsyncStorage** - Local data persistence
- **Context API** - State management

## 📁 Project Structure

```
joksu-voting-app/
├── App.tsx                 # Main entry point
├── src/
│   ├── context/           # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── VotingContext.tsx
│   ├── data/              # Mock data
│   │   └── mockData.ts
│   ├── navigation/        # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   ├── screens/           # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── VotingScreen.tsx
│   │   ├── CandidatesScreen.tsx
│   │   ├── ResultsScreen.tsx
│   │   └── AdminScreen.tsx
│   └── types/             # TypeScript definitions
│       └── index.ts
├── assets/                # Images and icons
├── package.json
└── app.json
```

## 🎨 Design

The app uses the official colors of Jagannath University:
- **Primary Green**: `#1a472a`
- **Gold Accent**: `#ffd700`

## 📝 Notes

- This is a demo application with mock data
- Replace placeholder assets in the `/assets` folder with actual images
- For production, implement proper authentication with a backend server
- Vote data is stored locally using AsyncStorage

## 🏫 About JOKSU

JOKSU (জকসু) - Jagannath University Kendrio Chhatra Sangsad is the central student union of Jagannath University, Dhaka, Bangladesh. This app is designed to facilitate digital voting for student union elections.

---

**Jagannath University, Dhaka-1100, Bangladesh**

জয় জগন্নাথ! 🎓
