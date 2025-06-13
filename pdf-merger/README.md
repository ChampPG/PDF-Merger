# PDF Merger

A modern, user-friendly web application for merging multiple PDF files into a single document. Built with React, real-time previews, and customizable merge options.

## ✨ Features

- **📁 Multiple File Upload**: Upload multiple PDF files at once
- **🔄 Drag & Drop Reordering**: Intuitively reorder PDFs using drag-and-drop
- **👀 Real-time Previews**: See previews of all uploaded PDFs
- **📄 Blank Page Insertion**: Option to add blank pages between each PDF
- **📝 Custom Filename**: Set a custom name for the merged output file
- **🔒 Privacy-Focused**: All processing happens in your browser - no files uploaded to servers

## 🚀 Quick Start

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pdf-merger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to use the application or `http://localhost:3100` if using docker

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📖 How to Use

1. **Upload PDFs**: Click the upload area or drag and drop PDF files
2. **Configure Options** (optional):
   - Toggle "Add blank page between each PDF" if you want separators
   - Enter a custom filename (defaults to "merged.pdf")
3. **Reorder Files**: Drag and drop the PDF items to arrange them in your desired order
4. **Preview**: View previews of your PDFs on the right side
5. **Merge**: Click "Merge PDFs" to download your combined document

## 🛠️ Technology Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **PDF Processing**: pdf-lib
- **Drag & Drop**: @dnd-kit
- **Development**: ESLint, PostCSS

## 📁 Project Structure

```
pdf-merger/
├── src/
│   ├── components/
│   │   ├── PDFMerger.jsx      # Main application component
│   │   └── SortablePDFItem.jsx # Individual PDF item component
│   ├── App.jsx                # Root application component
│   ├── main.jsx              # Application entry point
│   └── index.css             # Global styles
├── public/                   # Static assets
├── package.json             # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🐳 Docker Support

The project includes a Dockerfile for containerized deployment:

```bash
# Build the Docker image
docker build -t pdf-merger .

# Run the container
docker run -p 3000:3000 pdf-merger
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Known Issues

- Large PDF files may take longer to process
- Some complex PDF layouts might not render perfectly in previews
- Browser compatibility: Works best in modern browsers (Chrome, Firefox, Safari, Edge)


## 📞 Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.