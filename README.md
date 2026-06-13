# Critical Business Communication Platform

A comprehensive communication platform built for critical business school students and instructors, featuring real-time messaging, knowledge wiki, and collaborative document editing.

## Features

### 💬 Real-time Messaging
- Direct and group conversations
- One-on-one messaging between students and instructors
- Message history and conversation management
- User-friendly chat interface

### 📚 Wiki System
- Create and manage knowledge base articles
- Search functionality for easy discovery
- Version control for all wiki pages
- Markdown-based content editing
- Collaborative knowledge sharing

### ✍️ Collaborative Documents
- Create and edit documents in real-time
- Add collaborators to documents
- Track document ownership and collaboration
- Rich text editing capabilities
- Document versioning

### 📧 Newsletter
- Public subscribe / unsubscribe with one-click unsubscribe links
- Instructor dashboard to compose, edit, and manage newsletter issues
- Send to all active subscribers with per-recipient delivery tracking
- Pluggable mailer (logs to console by default; swap in a real provider)
- Subscriber management with search and status filtering

### 👥 User Management
- Student and Instructor roles
- Secure authentication with JWT
- User profiles and bios
- Role-based access control

## Tech Stack

### Frontend
- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Form Handling:** React Hook Form

### Backend
- **Runtime:** Node.js
- **Framework:** Next.js API Routes
- **Database:** SQLite (with Prisma)
- **Authentication:** JWT
- **Security:** bcryptjs

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd criticalbusinessschool
```

2. Install dependencies
```bash
npm install
```

3. Set up the database
```bash
npx prisma migrate dev --name init
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── conversations/  # Messaging endpoints
│   │   ├── documents/      # Document management endpoints
│   │   └── wiki/           # Wiki endpoints
│   ├── dashboard/          # Dashboard pages
│   │   ├── messages/       # Messaging UI
│   │   ├── wiki/           # Wiki UI
│   │   ├── documents/      # Document editing UI
│   │   └── profile/        # User profile page
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── globals.css         # Global styles
├── lib/                    # Utility functions
│   ├── prisma.ts          # Prisma client singleton
│   └── auth.ts            # Authentication utilities
├── prisma/                # Database schema
│   └── schema.prisma      # Data models
├── public/                # Static files
└── package.json           # Dependencies
```

## Database Schema

### Models
- **User:** Authentication and profile information
- **Conversation:** Group and direct conversations
- **ConversationUser:** Conversation membership
- **Message:** Chat messages
- **WikiPage:** Wiki articles
- **WikiPageVersion:** Wiki page version history
- **Document:** Collaborative documents
- **DocumentCollaborator:** Document collaboration relationships
- **NewsletterSubscriber:** Newsletter subscriber with unsubscribe token
- **Newsletter:** Newsletter issue (draft or sent)
- **NewsletterDelivery:** Per-subscriber delivery status for a newsletter

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Conversations
- `GET /api/conversations` - Get all conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/[id]/messages` - Get messages
- `POST /api/conversations/[id]/messages` - Send message

### Wiki
- `GET /api/wiki` - Get all wiki pages
- `POST /api/wiki` - Create wiki page
- `GET /api/wiki/[slug]` - Get wiki page
- `PUT /api/wiki/[slug]` - Update wiki page

### Documents
- `GET /api/documents` - Get all documents
- `POST /api/documents` - Create document
- `GET /api/documents/[id]` - Get document
- `PUT /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Delete document

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe an email (public)
- `GET|POST /api/newsletter/unsubscribe` - Unsubscribe via token (public)
- `GET /api/newsletter/subscribers` - List subscribers (instructor)
- `GET /api/newsletter` - List newsletters (instructor)
- `POST /api/newsletter` - Create a draft newsletter (instructor)
- `GET /api/newsletter/[id]` - Get a newsletter with delivery stats (instructor)
- `PUT /api/newsletter/[id]` - Edit a draft newsletter (instructor)
- `DELETE /api/newsletter/[id]` - Delete a newsletter (instructor)
- `POST /api/newsletter/[id]/send` - Send to all active subscribers (instructor)

Public pages live at `/newsletter/subscribe` and `/newsletter/unsubscribe`.
Real email delivery can be enabled by implementing a transport in `lib/mailer.ts`.

## Development

### Run Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
npm start
```

### Database Management

Prisma Studio (GUI for database)
```bash
npx prisma studio
```

## Security Considerations

1. **JWT Authentication:** Uses secure JWT tokens with httpOnly cookies
2. **Password Hashing:** bcryptjs for secure password storage
3. **Authorization:** Role-based access control for resources
4. **CORS:** Configured for production security
5. **Environment Variables:** Sensitive data stored in .env.local

## Future Enhancements

- Real-time messaging with WebSocket integration
- Advanced document collaboration with operational transformation
- User notifications system
- File upload capabilities
- Markdown preview in wiki
- Advanced search with filters
- User activity tracking
- Admin dashboard
- Email notifications

## Contributing

1. Create a feature branch
2. Make your changes
3. Commit with clear messages
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please open an issue on the repository.
