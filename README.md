# Mini Notion Clone

A full-stack web application that replicates core Notion functionality, built with Express.js (backend) and Vue.js (frontend). Features include block-based editing, drag & drop, real-time collaboration, and JWT authentication with HTTP-only cookies.

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js** - Server framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication with HTTP-Only cookies
- **Socket.IO** - Real-time communication
- **bcryptjs** - Password hashing

### Frontend
- **Vue.js 3** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Pinia** - State management
- **Vue Router** - Routing
- **TipTap** - Rich text editor
- **Socket.IO Client** - Real-time features
- **vuedraggable** - Drag & drop functionality

## 🚀 Features

### ✅ Implemented Features

1. **Authentication System**
   - User registration and login
   - JWT tokens stored in HTTP-Only cookies
   - Secure logout functionality
   - Authentication middleware

2. **Notes Management**
   - Create, read, update, delete notes
   - User-specific note access
   - Note title editing with autosave

3. **Block-Based Editor**
   - **Text Blocks**: Rich text editing with TipTap
   - **Checklist Blocks**: Interactive task lists
   - **Image Blocks**: URL-based image embedding
   - **Code Blocks**: Syntax highlighting for multiple languages
   - Drag & drop reordering of blocks
   - Block type conversion
   - Block duplication and deletion

4. **Real-time Collaboration**
   - WebSocket-based real-time updates
   - Live cursor indicators
   - Conflict-free editing
   - User presence indicators

5. **Autosave Functionality**
   - Automatic content saving
   - Debounced API calls
   - Background sync indicators

### 🔄 Database Schema

```
Users
├── id (UUID, Primary Key)
├── email (String, Unique)
├── password (String, Hashed)
├── created_at (DateTime)
└── updated_at (DateTime)

Notes
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key → Users.id)
├── title (String)
├── created_at (DateTime)
└── updated_at (DateTime)

Blocks
├── id (UUID, Primary Key)
├── note_id (UUID, Foreign Key → Notes.id)
├── parent_id (UUID, Foreign Key → Blocks.id, Nullable)
├── type (Enum: TEXT, CHECKLIST, IMAGE, CODE)
├── content (String, Nullable)
├── order_index (Integer)
├── created_at (DateTime)
└── updated_at (DateTime)
```

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/mini_notion_clone"
   JWT_SECRET="your-super-secret-jwt-key"
   NODE_ENV="development"
   PORT=3000
   FRONTEND_URL="http://localhost:5173"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev --name init
   
   # (Optional) Seed database
   npx prisma db seed
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update `.env`:
   ```env
   VITE_API_URL="http://localhost:3000"
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
mini-notion-clone/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Route handlers
│   │   ├── middleware/           # Auth & validation middleware
│   │   ├── routes/               # API routes
│   │   ├── services/             # Socket.IO service
│   │   ├── types/                # TypeScript types
│   │   ├── utils/                # Utility functions
│   │   ├── app.ts                # Express app setup
│   │   └── index.ts              # Server entry point
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/           # Vue components
    │   │   ├── notes/            # Note-related components
    │   │   │   ├── blocks/       # Block type components
    │   │   │   ├── BlockEditor.vue
    │   │   │   └── CreateNoteModal.vue
    │   │   └── ui/               # UI components
    │   ├── stores/               # Pinia stores
    │   ├── views/                # Page components
    │   ├── composables/          # Vue composables
    │   ├── types/                # TypeScript types
    │   └── router/               # Vue Router setup
    └── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Notes
- `GET /api/notes` - Get user's notes
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Blocks
- `POST /api/notes/:noteId/blocks` - Create block
- `PUT /api/notes/:noteId/blocks/:blockId` - Update block
- `DELETE /api/notes/:noteId/blocks/:blockId` - Delete block
- `PUT /api/notes/:noteId/blocks/reorder` - Reorder blocks
- `PUT /api/notes/:noteId/blocks/bulk-update` - Bulk update blocks

## 🔄 WebSocket Events

### Client to Server
- `join-note` - Join a note room
- `leave-note` - Leave a note room
- `block-update` - Update block content
- `blocks-reorder` - Reorder blocks

### Server to Client
- `block-updated` - Block content updated
- `blocks-reordered` - Blocks reordered
- `user-joined` - User joined note
- `user-left` - User left note
- `active-users` - Current active users

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm run test
```

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Set environment variables
3. Build the application:
   ```bash
   npm run build
   ```
4. Start production server:
   ```bash
   npm start
   ```

### Frontend Deployment
1. Build for production:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your hosting service

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **HTTP-Only Cookies**: XSS protection
- **Password Hashing**: bcrypt for secure password storage
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Server-side validation with express-validator
- **Authorization Middleware**: Route protection

## 🎯 Future Enhancements

- [ ] File upload support for images
- [ ] Page templates
- [ ] Advanced text formatting
- [ ] Collaborative commenting
- [ ] Version history
- [ ] Export functionality (PDF, Markdown)
- [ ] Mobile app (React Native)
- [ ] Offline support with PWA

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

Built with ❤️ for the Fullstack Express & Vue.js Assessment Test

---

## 🔧 Development Notes

### Key Implementation Details

1. **Authentication Flow**
   - Uses HTTP-Only cookies for secure token storage
   - JWT tokens expire after 24 hours
   - Automatic auth checking on app load

2. **Real-time Updates**
   - Socket.IO for bidirectional communication
   - Event-driven architecture for live updates
   - Conflict resolution for simultaneous editing

3. **Block System**
   - Hierarchical block structure with parent-child relationships
   - Order-based sorting with drag & drop
   - Type-specific rendering and editing

4. **State Management**
   - Pinia stores for client-side state
   - Optimistic updates with error rollback
   - Automatic persistence of auth state

5. **Performance Optimizations**
   - Debounced autosave (1-second delay)
   - Lazy loading of components
   - Efficient WebSocket event handling

Remember to update your environment variables and database credentials before running the application!
