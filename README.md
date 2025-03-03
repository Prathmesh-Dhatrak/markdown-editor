# Markdown Editor

A modern browser-based markdown editor with real-time preview, file management, and dark mode support.

![Markdown Editor Screenshot](https://placehold.co/600x400/3b82f6/white?text=Markdown+Editor)

## Features

- 📝 Live markdown editing with syntax highlighting
- 👁️ Side-by-side preview with proper markdown rendering
- 📁 File system organization with folders and files
- 🌓 Dark/light mode toggle
- 💾 Automatic saving with IndexedDB
- 📤 Import/export functionality
- 📱 Responsive design

## Technology Stack

- **React** - UI building
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **CodeMirror 6** - Text editor
- **React Markdown** - Markdown rendering
- **IndexedDB** - Local storage
- **Vite** - Build tool

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/markdown-editor.git
cd markdown-editor
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Creating Documents

- Click the folder icon in the Explorer pane to create a new folder
- Click the file icon to create a new markdown file
- Files are automatically saved as you type

### Editing

- Select any file from the Explorer pane to start editing
- Use the toolbar buttons to add markdown formatting
- The preview pane shows how your document will look when rendered

### Import/Export

- Use the export button to download all your folders and files as a JSON file
- Use the import button to restore previously exported content

## Development

### Folder Structure

```
markdown-editor/
├── public/             # Static assets
├── src/
│   ├── components/     # React components
│   │   ├── common/     # Shared components
│   │   ├── editor/     # Markdown editor components
│   │   ├── explorer/   # File explorer components
│   │   ├── modals/     # Modal dialogs
│   │   └── preview/    # Markdown preview components
│   ├── contexts/       # React context providers
│   ├── lib/            # Utility functions
│   │   ├── db/         # IndexedDB operations
│   │   └── export-import/ # Import/export functionality
│   ├── styles/         # Global and component-specific styles
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Entry point
├── index.html          # HTML template
└── package.json        # Project dependencies
```

### Building for Production

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [CodeMirror](https://codemirror.net/) for the excellent text editor
- [React Markdown](https://remarkjs.github.io/react-markdown/) for markdown rendering
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons