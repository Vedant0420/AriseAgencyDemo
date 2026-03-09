# Arise Agency - Demo Showcase

This is a **demo version** of a Next.js portfolio and booking platform for agencies. All content is placeholder/generic demo data for showcase purposes.

## ⚠️ Important Notes

- **No Personal Data**: This project contains NO real personal information, client data, or actual business credentials
- **Demo Firebase Config**: Uses dummy Firebase credentials (safe to commit to GitHub)
- **Generic Content**: All copy, testimonials, and case studies are placeholder text
- **Functional Demo**: The UI is fully interactive and demonstrates the complete feature set

## Features

- **Responsive Design**: Mobile-first, fully responsive layout
- **Service Showcase**: Display services/offerings with details and CTA
- **Portfolio Section**: Showcase projects with media and descriptions
- **Booking System**: Interactive calendar-based appointment scheduling
- **Admin Panel**: Email-based authentication system
- **Real-time Content Updates**: Firebase Firestore integration for dynamic content
- **Contact Forms**: Fully validated booking and contact forms
- **SEO Optimized**: Next.js best practices for search engine optimization

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Deployment**: Vercel-ready

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# The .env.local file includes demo Firebase configuration
# For production, replace with your actual Firebase credentials

# Run development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── page.tsx              # Home page
├── services/page.tsx     # Services/offerings
├── portfolio/page.tsx    # Project showcase
├── about/page.tsx        # About/company info
├── booking/page.tsx      # Booking system
├── admin/page.tsx        # Admin dashboard
├── components/           # Reusable components
│   ├── Nav.tsx
│   ├── Footer.tsx
│   └── OptimizedImage.tsx
└── layout.tsx            # Root layout

lib/
├── firebase.ts           # Firebase configuration
├── validation.ts         # Form validation
└── security.ts          # Security utilities
```

## Customization Guide

To use this as a template for your own project:

1. **Replace Demo Content**: Update pages with your actual copy, services, and projects
2. **Firebase Setup**: Create your own Firebase project and update credentials in `.env.local`
3. **Images**: Replace demo images with your own portfolio items
4. **Branding**: Customize colors, fonts, and brand identity
5. **Admin Setup**: Configure admin authentication with your email

## Deployment

This project is configured for deployment on Vercel:

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repository directly to Vercel for automatic deployments.

## Security Notes

- The `.env.local` file contains demo credentials only
- In production, ensure real API keys are NEVER committed to version control
- Use environment variables or secrets management for sensitive data
- Review `firestore.rules` for database security configuration

## License

This is a demo/showcase project. Customize and use as needed for your own projects.
