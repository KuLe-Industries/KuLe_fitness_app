# KuLe Fitness 🏋️

A production-ready, web-based dynamic workout tracking application built with React, TypeScript, and modern web technologies.

## Features

- 📋 **Workout Plans**: Create, edit, duplicate, and manage custom workout plans
- 💪 **Active Sessions**: Guided workout sessions with timers and progress tracking
- 📊 **Progress Analytics**: Visualize your fitness journey with charts and metrics
- 📝 **Workout History**: Track and review past sessions
- 📚 **Exercise Library**: Searchable database of exercises with custom additions
- 📅 **Calendar View**: Schedule and visualize workouts on a calendar
- 🔄 **Offline-First**: Full PWA support, works completely offline
- 📱 **Responsive**: Mobile-first design that works on all devices
- 🎨 **Dark Mode**: System-aware theme switching

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Headless UI
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Routing**: React Router
- **Charts**: Chart.js via react-chartjs-2
- **Storage**: localForage (IndexedDB wrapper)
- **PWA**: Workbox service worker
- **Testing**: Vitest + Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/KuLe_fitness_app.git
cd KuLe_fitness_app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Button, Dialog, Input, etc.)
│   ├── charts/         # Chart components
│   ├── session/        # Session-specific components (Timer)
│   └── Layout.tsx       # Main layout component
├── domain/             # Domain logic and types
│   ├── types.ts        # TypeScript type definitions
│   ├── repositories.ts # Repository interfaces
│   └── repositories/   # Repository implementations
├── pages/              # Page components
│   ├── SignIn.tsx
│   ├── Home.tsx
│   ├── Plans/          # Workout plans management
│   ├── Session/         # Active workout session
│   ├── Progress/        # Analytics and progress
│   ├── History/         # Workout history
│   └── Settings.tsx
├── services/           # Business logic services
│   ├── auth.ts         # Authentication adapter
│   ├── timer.ts        # Timer service
│   └── seed.ts         # Seed data
├── stores/             # Zustand stores
│   ├── authStore.ts
│   └── sessionStore.ts
└── utils/              # Utility functions
    ├── cn.ts           # Class name utility
    └── export.ts       # Data export/import
```

## Features in Detail

### Authentication
- Guest mode (default, no backend required)
- Stub implementations for Google, Email, and Facebook (can be extended with Firebase)
- `AuthAdapter` interface for easy integration with real auth providers

### Workout Plans
- Create custom workout plans with exercises
- Set targets (sets, reps, rest time, load)
- Duplicate and modify existing plans
- Schedule workouts on specific days
- Calendar view for scheduled sessions
- Favorite routines
- Pre-built templates

### Active Sessions
- Guided workout interface
- Set-by-set completion tracking
- Full and partial set completion
- Rest timers with audio notifications
- Progress visualization
- Session notes
- Auto-save to prevent data loss

### Progress & Analytics
- Weight progression charts
- Session frequency tracking
- Volume calculations
- Weekly adherence metrics
- Date range filtering
- Export/import functionality

### Data Management
- All data stored locally (IndexedDB via localForage)
- JSON export/import for backup
- Factory reset option
- Data persists across sessions

## Deployment

### GitHub Pages

1. Push your code to GitHub
2. The GitHub Actions workflow will automatically:
   - Run linting and tests on every push
   - Build the application
   - Deploy to GitHub Pages on pushes to `main` branch

3. Enable GitHub Pages in your repository settings:
   - Go to Settings > Pages
   - Select "GitHub Actions" as the source

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting provider:
   - Netlify: Drag and drop the `dist` folder
   - Vercel: Connect your GitHub repo
   - GitHub Pages: Use the provided GitHub Actions workflow

### Environment Variables

For GitHub Pages deployment, the build is automatically configured with the correct base path. For other deployments, you may need to adjust the `base` path in `vite.config.ts`.

## PWA Installation

The app is a Progressive Web App (PWA) and can be installed on devices:

- **Desktop**: Look for the install prompt in your browser
- **Mobile**: Use "Add to Home Screen" from your browser menu

Once installed, the app works completely offline.

### PWA Icons

To complete PWA setup, you'll need to add icon files:
- `public/pwa-192x192.png` (192x192 pixels)
- `public/pwa-512x512.png` (512x512 pixels)
- `public/apple-touch-icon.png` (180x180 pixels)

You can generate these using any image editor or online tool. The icons should represent the KuLe Fitness branding.

## Extending the Application

### Adding Authentication

To add real authentication (e.g., Firebase):

1. Install Firebase SDK:
```bash
npm install firebase
```

2. Create a new auth adapter implementing the `AuthAdapter` interface:
```typescript
// src/services/auth/firebase.ts
import { AuthAdapter } from '../auth';

export class FirebaseAuthAdapter implements AuthAdapter {
  // Implement methods
}
```

3. Update `src/services/auth.ts` to use the new adapter based on environment variables.

### Adding New Features

- Follow the existing patterns for components, stores, and services
- Use TypeScript for type safety
- Follow the repository pattern for data access
- Add tests for new functionality

## Testing

Run tests with:
```bash
npm run test
```

Tests are written with Vitest and Testing Library. The test suite includes:
- Repository unit tests
- Timer utility tests
- Component render tests

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with modern web technologies
- Designed for offline-first usage
- Inspired by the need for a simple, effective workout tracker

## Support

For issues and questions, please open an issue on GitHub.

---

**KuLe Fitness** - Track your fitness journey, one workout at a time! 💪

