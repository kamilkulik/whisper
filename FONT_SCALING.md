# Responsive Font Scaling System

This project uses a responsive font scaling system based on rem units that automatically adjusts font sizes across different screen sizes.

## How it works

The system scales the base font size (`html` element) based on screen width:

- **Mobile Portrait** (< 600px): 1rem = 7px (43.75% of 16px)
- **Tablet Portrait** (600px - 899px): 1rem = 8px (50% of 16px)
- **Tablet Landscape** (900px - 1199px): 1rem = 9px (56.25% of 16px)
- **Desktop** (1200px+): 1rem = 12px (75% of 16px)

## Usage

### Using the predefined classes

Simply add the appropriate class to your elements:

```jsx
// Headings
<h1 className="text-h1">Main Heading</h1>
<h2 className="text-h2">Sub Heading</h2>
<h3 className="text-h3">Section Heading</h3>

// Body text
<p className="text-body">Regular paragraph text</p>
<p className="text-body-large">Larger body text</p>
<p className="text-body-small">Smaller body text</p>

// Interactive elements
<button className="text-button">Click me</button>
<input className="text-input" placeholder="Enter text" />
<label className="text-label">Form label</label>

// Form elements
<label className="text-form-label">Form Label</label>
<span className="text-form-error">Error message</span>
<span className="text-form-help">Help text</span>

// Navigation
<nav className="text-nav">Navigation item</nav>

// Links
<a className="text-link">Click here</a>
```

### Using rem units directly

You can also use rem units directly in your Tailwind classes:

```jsx
// These will scale automatically with the responsive system
<div className="text-[2.4rem]">24px on desktop, scales down on mobile</div>
<div className="text-[1.8rem]">18px on desktop, scales down on mobile</div>
<div className="text-[1.2rem]">12px on desktop, scales down on mobile</div>
```

### Available classes

#### Headings

- `.text-h1` - 3.6rem (36px on desktop)
- `.text-h2` - 3rem (30px on desktop)
- `.text-h3` - 2.4rem (24px on desktop)
- `.text-h4` - 2rem (20px on desktop)
- `.text-h5` - 1.8rem (18px on desktop)
- `.text-h6` - 1.6rem (16px on desktop)

#### Body Text

- `.text-body` - 1.6rem (16px on desktop)
- `.text-body-large` - 1.8rem (18px on desktop)
- `.text-body-small` - 1.4rem (14px on desktop)
- `.text-caption` - 1.2rem (12px on desktop)

#### Interactive Elements

- `.text-button` - 1.6rem (16px on desktop)
- `.text-input` - 1.6rem (16px on desktop)
- `.text-label` - 1.4rem (14px on desktop)
- `.text-nav` - 1.6rem (16px on desktop)
- `.text-link` - 1.6rem (16px on desktop)

#### Form Elements

- `.text-form-label` - 1.4rem (14px on desktop)
- `.text-form-error` - 1.2rem (12px on desktop)
- `.text-form-help` - 1.2rem (12px on desktop)

## Benefits

1. **Automatic scaling** - Fonts automatically adjust to screen size
2. **Consistent ratios** - All text maintains proportional relationships
3. **Easy maintenance** - Change one value to scale everything
4. **Accessibility** - Respects user's browser font size preferences
5. **Performance** - No JavaScript required, pure CSS solution

## Example

```jsx
function MyComponent() {
  return (
    <div>
      <h1 className="text-h1">Welcome to our app</h1>
      <p className="text-body">
        This text will automatically scale from 16px on desktop down to 7px on
        mobile, maintaining readability.
      </p>
      <button className="text-button bg-blue-500 text-white px-4 py-2 rounded">
        Get Started
      </button>
    </div>
  );
}
```

The text will automatically scale across all devices while maintaining proper proportions and readability.
