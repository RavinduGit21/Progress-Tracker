# Progress Tracker

A modern, responsive web application for tracking progress across multiple tasks and time periods. Built with vanilla HTML, CSS, and JavaScript, this tool provides an intuitive grid-based interface for managing and visualizing your progress.

## Features

### 🎓 **Multi-Semester Management**
- **Dynamic Semester Boards**: Add custom semesters (e.g. Semester 5) or delete them safely with built-in empty state protection locks.
- **Archive Semesters (Task 2)**: Fling older semesters into an archive 📦 to hide them from the active menu, keeping the main dropdown clear while preserving all ticks and study records safely. Unarchive 📤 anytime!
- **Consistent Sizing System**: Subject and Day columns use standardized fixed dimensions across all semesters, ensuring perfect layout alignment when zooming or switching views.

### 🎯 **Core Grid Functionality**
- **Interactive Grid**: Click any cell to toggle progress checks (✔)
- **Dynamic Rows & Columns**: Add or remove rows (subjects) and columns (study days) instantly.
- **Inline Editing**: Double-click any row or column header to rename them with ease.
- **Reset Function**: Clear all progress checks inside the active semester with a single click.

### ⏰ **Dynamic Countdowns & Settings**
- **Per-Semester Settings**: Configure custom exam target dates and countdown titles separately for every semester tracker in the settings panel.
- **Smart Countdown Banner**: The header banner dynamically aggregates countdowns for all configured semesters in real-time.
- **Visibility Toggle**: Hide/show countdown timers in the header banner on a per-semester basis—ideal for hiding completed semesters (e.g., negative day counts) without losing settings.
- **Live Digital Clock**: Real-time high-fidelity digital clock in the header toolbar.

### 🎨 **Responsive UI & Sizing**
- **Modern Aesthetics**: curating a sleek, dark glassmorphic design system using harmony-driven color schemes and micro-interactions.
- **Auto-Fit Viewport**: The grid automatically scales using CSS transform properties to fit perfectly inside your screen layout with zero horizontal overflow at default zoom.
- **Premium Zoom Controls**: Fully custom zoom out (−), zoom in (+), and zoom reset buttons featuring a dynamic real-time percentage scale indicator (e.g., `45%`, `100%`, `125%`).
- **Sticky Headers**: Subject columns and Day headers stay locked in position during scrolling for easy navigation.

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

**Settings:**
- Click the gear icon (⚙️) to open the settings modal
- Customize the text and date for both countdown timers
- Changes are saved automatically to your browser

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save edit | Enter |
| Cancel edit | Escape |
| Select all text | Ctrl+A (when editing) |

## 🔒 Privacy & Local-First Storage (GitHub Safe)

This application is architected as a **local-first** client-side application:
- **Zero Cloud Sync / Zero Database Server**: Your study schedules, checkboxes, custom semester lists, renamed rows/columns, and countdown configurations never leave your machine.
- **100% GitHub Clean & Private**: When you push your code to GitHub or when someone else clones your repository, **none of your personal study data is committed or shared**.
- **Fresh Startup for Others**: A new user cloning the repository and opening the `index.html` file will see a completely fresh, un-ticked default template, as their browser's local storage is empty.
- **How It Works (Storage Details)**:
  - All data is saved inside your browser's local sandbox under the key `progress-tracker-v1` (with automatic backward-compatible migration from legacy keys).
  - Stored data is kept in a clean, structured JSON format.
  - Autosaves instantly on every check, edit, delete, or setting modification.

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
