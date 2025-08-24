# Mini Notion Clone

A full-stack collaborative note-taking application that replicates core Notion functionality, built with Express.js (backend) and Vue.js (frontend). Features include block-based editing, drag & drop, real-time collaboration, note sharing, JWT authentication with HTTP-only cookies, and production-ready builds.

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js** - Server framework
- **TypeScript** - Type safety and development experience
- **Prisma** - Modern database ORM with migrations
- **PostgreSQL** - Robust relational database
- **JWT** - Secure authentication with HTTP-Only cookies
- **Socket.IO** - Real-time bidirectional communication
- **bcryptjs** - Secure password hashing
- **express-validator** - Request validation middleware
- **CORS** - Cross-origin resource sharing configuration

### Frontend
- **Vue.js 3** - Progressive frontend framework with Composition API
- **TypeScript** - Type safety and enhanced developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - Modern state management for Vue
- **Vue Router** - Official routing solution
- **TipTap** - Headless rich text editor with extensions
- **Socket.IO Client** - Real-time collaboration features
- **vuedraggable** - Drag & drop functionality for blocks
- **Vite** - Fast build tool and development server

## 🚀 Features

### ✅ Implemented Features

1. **Authentication System**
   - User registration and login with email validation
   - JWT tokens stored in HTTP-Only cookies for security
   - Secure logout functionality
   - Protected routes with authentication middleware
   - User session persistence across browser sessions

2. **Notes Management**
   - Create, read, update, delete notes with full CRUD operations
   - User-specific note access with ownership validation
   - Note title editing with real-time autosave
   - Note listing with creation timestamps
   - Soft delete protection for accidental data loss

3. **Block-Based Editor**
   - **Text Blocks**: Rich text editing with TipTap editor and formatting options
   - **Checklist Blocks**: Interactive task lists with checkbox functionality
   - **Code Blocks**: Syntax highlighting for 20+ programming languages
   - Drag & drop reordering of blocks with visual feedback
   - Block type conversion between different formats
   - Block duplication and deletion with undo support
   - Nested block structure with parent-child relationships
   - Bulk operations for performance optimization

4. **Real-time Collaboration**
   - WebSocket-based real-time updates using Socket.IO
   - Live cursor indicators showing collaborator positions
   - Conflict-free editing with operational transformation
   - User presence indicators with active user lists
   - Real-time block creation, updates, and deletions
   - Synchronized block reordering across all clients

5. **Note Sharing & Collaboration**
   - **Private Collaboration**: Invite users by email with permission levels
   - **Permission System**: View, Comment, and Edit access levels
   - **Public Sharing**: Generate public links for anonymous access
   - **Collaborator Management**: Add and remove collaborators dynamically
   - **My Collaborations**: View all notes shared with you
   - **Public Note Access**: Access shared notes without authentication

6. **Autosave & Performance**
   - Automatic content saving with intelligent debouncing
   - Background sync with visual indicators
   - Optimistic updates for immediate feedback
   - Error handling with rollback capabilities
   - Efficient API batching for bulk operations

7. **Production Ready**
   - **Frontend Build**: Optimized Vite production build (550KB bundle, gzipped ~180KB)
   - **Backend Build**: Compiled TypeScript for Node.js production
   - **CORS Configuration**: Multi-origin support for development and production
   - **Environment Management**: Separate configs for dev/prod environments
   - **Performance Optimization**: Minified assets and tree-shaking

### 🔄 Database Schema

```
Users
├── id (UUID, Primary Key)
├── email (String, Unique)
├── password (String, Hashed with bcrypt)
├── created_at (DateTime)
└── updated_at (DateTime)

Notes
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key → Users.id)
├── title (String)
├── is_public (Boolean, Default: false)
├── public_id (UUID, Nullable, Unique)
├── created_at (DateTime)
└── updated_at (DateTime)

Blocks
├── id (UUID, Primary Key)
├── note_id (UUID, Foreign Key → Notes.id)
├── parent_id (UUID, Foreign Key → Blocks.id, Nullable)
├── type (Enum: TEXT, CHECKLIST, CODE)
├── content (Text, Nullable, Rich HTML content)
├── order_index (Integer, For drag & drop ordering)
├── created_at (DateTime)
└── updated_at (DateTime)

Collaborations
├── id (UUID, Primary Key)
├── note_id (UUID, Foreign Key → Notes.id)
├── user_id (UUID, Foreign Key → Users.id)
├── permission (Enum: VIEW, COMMENT, EDIT)
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
   
   # (Optional) View data with Prisma Studio
   npx prisma studio
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:3000`

6. **Production Build** (Optional)
   ```bash
   # Build for production
   npm run build
   
   # Start production server
   npm start
   ```
   Production backend will run on `http://localhost:3000`

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

5. **Production Build** (Optional)
   ```bash
   # Build for production
   npm run build
   
   # Preview production build
   npm run preview
   ```
   Production preview will run on `http://localhost:4173`

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
- `POST /api/auth/register` - User registration with email validation
- `POST /api/auth/login` - User login with JWT cookie
- `POST /api/auth/logout` - User logout and cookie clearing
- `GET /api/auth/me` - Get current authenticated user

### Notes Management
- `GET /api/notes` - Get user's notes and shared notes
- `POST /api/notes` - Create new note with title
- `GET /api/notes/:id` - Get specific note with blocks and collaborators
- `PUT /api/notes/:id` - Update note title and metadata
- `DELETE /api/notes/:id` - Delete note and all associated blocks

### Content Blocks
- `POST /api/notes/:noteId/blocks` - Create new block (TEXT, CHECKLIST, CODE)
- `PUT /api/notes/:noteId/blocks/:blockId` - Update block content
- `DELETE /api/notes/:noteId/blocks/:blockId` - Delete block
- `PUT /api/notes/:noteId/blocks/reorder` - Reorder blocks via drag & drop
- `PUT /api/notes/:noteId/blocks/bulk-update` - Bulk update multiple blocks

### Collaboration & Sharing
- `POST /api/notes/:noteId/collaborators` - Add collaborator by email
- `DELETE /api/notes/:noteId/collaborators/:userId` - Remove collaborator
- `PATCH /api/notes/:noteId/public` - Toggle public sharing status
- `GET /api/my-collaborations` - Get notes shared with current user
- `GET /api/public/:publicId` - Access public note without authentication

## 🔄 WebSocket Events

### Client to Server
- `join-note` - Join a note room for real-time collaboration
- `leave-note` - Leave a note room
- `block-update` - Real-time block content updates
- `blocks-reorder` - Real-time block reordering
- `cursor-position` - Share cursor position with collaborators

### Server to Client
- `block-updated` - Broadcast block content changes to all collaborators
- `blocks-reordered` - Broadcast block reordering to all collaborators
- `user-joined` - Notify when a user joins the note
- `user-left` - Notify when a user leaves the note
- `active-users` - Current list of active collaborators
- `cursor-moved` - Broadcast cursor movements between users
- `collaboration-updated` - Notify permission changes

## 🧪 Testing & Documentation

### API Testing
- **Postman Collection**: Complete API documentation with examples
  - Import from: `backend/postman/Mini-Notion-Clone.postman_collection.json`
  - Includes all endpoints with sample requests and responses
  - Pre-configured environment variables for easy testing

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

### Development Tools
- **Prisma Studio**: Visual database browser at `http://localhost:5555`
- **API Documentation**: Comprehensive Postman collection
- **TypeScript**: Full type safety across frontend and backend
- **ESLint**: Code quality and consistency checking

## 🚀 Deployment

### Backend Deployment
1. **Environment Setup**
   ```bash
   # Production environment variables
   DATABASE_URL="your-production-database-url"
   JWT_SECRET="your-production-jwt-secret"
   NODE_ENV="production"
   PORT=3000
   FRONTEND_URL="https://your-frontend-domain.com"
   ```

2. **Build and Deploy**
   ```bash
   # Install dependencies
   npm ci --only=production
   
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate deploy
   
   # Build the application
   npm run build
   
   # Start production server
   npm start
   ```

### Frontend Deployment
1. **Environment Setup**
   ```bash
   # Production environment variables
   VITE_API_URL="https://your-backend-domain.com"
   ```

2. **Build and Deploy**
   ```bash
   # Install dependencies
   npm ci
   
   # Build for production (creates optimized dist/ folder)
   npm run build
   
   # Deploy the dist/ folder to your hosting service
   # (Netlify, Vercel, AWS S3, etc.)
   ```

### Production Features
- **Optimized Builds**: Minified and tree-shaken bundles
- **CORS Configuration**: Multi-origin support for different environments
- **Security Headers**: HTTP-Only cookies and secure authentication
- **Database Migrations**: Production-ready Prisma migrations
- **Error Handling**: Comprehensive error logging and user feedback

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication with expiration
- **HTTP-Only Cookies**: XSS protection for token storage
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Validation**: Server-side validation with express-validator
- **Authorization Middleware**: Route protection and permission checking
- **SQL Injection Prevention**: Prisma ORM provides automatic protection
- **Rate Limiting**: Prevention of brute force attacks (recommended for production)
- **Environment Variables**: Sensitive data protection with .env files

## 🎯 Future Enhancements

### Planned Features
- [ ] **File Upload Support**: Image and document attachments with cloud storage
- [ ] **Page Templates**: Pre-built templates for common note types
- [ ] **Advanced Text Formatting**: Tables, math equations, and embeds
- [ ] **Collaborative Commenting**: Thread-based discussions on blocks
- [ ] **Version History**: Track changes and restore previous versions
- [ ] **Export Functionality**: PDF, Markdown, and HTML export options
- [ ] **Mobile App**: React Native or Flutter mobile application
- [ ] **Offline Support**: PWA with offline editing capabilities

### Technical Improvements
- [ ] **Performance**: Implement virtual scrolling for large notes
- [ ] **Search**: Full-text search across all notes and content
- [ ] **Notifications**: Real-time notifications for collaboration events
- [ ] **API Rate Limiting**: Enhanced security with request throttling
- [ ] **Caching**: Redis integration for session and data caching
- [ ] **Analytics**: Usage tracking and performance monitoring
- [ ] **Internationalization**: Multi-language support
- [ ] **Dark Mode**: Theme switching with user preferences

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
   - Uses HTTP-Only cookies for secure token storage preventing XSS attacks
   - JWT tokens expire after 24 hours with automatic refresh capability
   - Middleware validates tokens on every protected route request
   - Automatic auth checking on app load with persistent sessions

2. **Real-time Collaboration Architecture**
   - Socket.IO rooms for note-specific communication channels
   - Event-driven architecture for live updates with conflict resolution
   - Operational transformation for simultaneous editing support
   - User presence tracking with real-time cursor positions
   - Efficient event batching to prevent overwhelming the server

3. **Block System Design**
   - Hierarchical block structure supporting nested content
   - Order-based sorting with fractional indexing for drag & drop
   - Type-specific rendering with pluggable block components
   - Rich HTML content storage with sanitization
   - Bulk operations API for performance optimization

4. **State Management Strategy**
   - Pinia stores for centralized client-side state management
   - Optimistic updates with automatic error rollback
   - Automatic persistence of authentication state
   - Real-time synchronization between multiple browser tabs
   - Efficient caching of frequently accessed data

5. **Performance Optimizations**
   - Debounced autosave with 1-second delay to reduce API calls
   - Lazy loading of components and code splitting
   - Efficient WebSocket event handling with event coalescing
   - Production builds with tree-shaking and minification
   - CORS optimization for multi-origin deployment scenarios

6. **Database Design Patterns**
   - UUID primary keys for better distributed system compatibility
   - Soft delete patterns for data recovery capabilities
   - Indexed foreign keys for optimal query performance
   - Migration-based schema evolution with Prisma
   - Connection pooling for production scalability

### Development Environment
- **Hot Module Replacement**: Instant updates during development
- **TypeScript Integration**: Full type safety across the entire stack
- **ESLint Configuration**: Consistent code style and error prevention
- **Environment Variables**: Separate configs for development and production
- **Database Tools**: Prisma Studio for visual data management

Remember to update your environment variables and database credentials before running the application!
