# Progress Tracker

A modern, responsive web application for tracking progress across multiple tasks and time periods. Built with vanilla HTML, CSS, and JavaScript, this tool provides an intuitive grid-based interface for managing and visualizing your progress.

## Features

### 🎯 **Core Functionality**
- **Interactive Grid**: Click any cell to toggle progress checks (✔)
- **Dynamic Rows & Columns**: Add/remove rows and columns on the fly
- **Inline Editing**: Double-click row or column headers to rename them
- **Auto-save**: All data is automatically saved to browser localStorage
- **Reset Function**: Clear all progress checks with one click

### 🎨 **User Interface**
- **Modern Design**: Clean, dark theme with professional styling
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Zoom Controls**: Adjust table zoom level (25% - 200%)
- **Auto-fit**: Table automatically scales to fit your viewport
- **Sticky Headers**: Row and column headers remain visible while scrolling

### ⚡ **Smart Features**
- **Intelligent Naming**: New columns automatically follow "Day X" pattern
- **Quick Actions**: Add rows/columns directly from the table
- **Delete Controls**: Remove rows/columns with dedicated delete buttons
- **Keyboard Support**: Press Enter to save edits, Escape to cancel

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies or installation required

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Progress-Tracker.git
   cd Progress-Tracker
   ```

2. **Open the application**
   - Simply open `index.html` in your web browser
   - Or serve it using a local web server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve .
     
     # Using PHP
     php -S localhost:8000
     ```

3. **Start tracking!**
   - The app loads with sample data to get you started
   - Customize rows and columns to match your needs

## Usage

### Basic Operations

**Adding Content:**
- Click "+ Row" button or the "+ Row" pill in any row to add a new row
- Click "+ Column" button or the "+ Col" pill in the header to add a new column
- New columns automatically follow the "Day X" naming pattern

**Editing Content:**
- Double-click any row or column header to edit its name
- Press Enter to save changes or Escape to cancel

**Tracking Progress:**
- Click any cell to toggle a progress check (✔)
- Checked cells are highlighted in red
- All progress is automatically saved

**Managing Data:**
- Use the "Reset" button to clear all progress checks
- Click the "✖" button next to any row/column to delete it
- Use zoom controls to adjust the table size

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save edit | Enter |
| Cancel edit | Escape |
| Select all text | Ctrl+A (when editing) |

## Data Storage

The application uses browser localStorage to persist your data:
- **Storage Key**: `progress-tracker-v1`
- **Data Format**: JSON object with `rows`, `cols`, and `checks` properties
- **Auto-save**: Changes are saved immediately
- **Local Only**: Data stays in your browser (not synced to cloud)

## File Structure

```
Progress-Tracker/
├── index.html          # Main HTML structure
├── script.js           # Application logic and functionality
├── styles.css          # Styling and responsive design
└── README.md           # This documentation
```

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Customization

### Styling
The application uses CSS custom properties for easy theming. Key variables in `styles.css`:
- `--bg`: Background color
- `--panel`: Panel background
- `--text`: Text color
- `--accent`: Accent color (check marks)
- `--muted`: Muted text color

### Default Data
Modify the `createDefaultState()` function in `script.js` to change the initial rows and columns.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with vanilla web technologies for maximum compatibility
- Uses Inter font from Google Fonts
- Designed with accessibility in mind (ARIA labels, keyboard navigation)

---

**Tip**: This app is perfect for tracking daily habits, project milestones, study progress, or any task that benefits from a visual grid-based tracking system!
