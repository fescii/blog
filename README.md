# Femar Blog

A premium personal blog built with Hugo, featuring custom theming based on the hugo-coder theme with direct theme ownership (no theme system dependencies).

## Features

- **Custom Design System**: CSS custom properties with semantic tokens for theming
- **Multiple Themes**: Midnight Hearth and other structural themes
- **Responsive Design**: Mobile-first approach with custom fonts (Inter, Plus Jakarta Sans, JetBrains Mono, Work Sans)
- **Section Pages**: About, Posts, Projects, Contact sections
- **Tag System**: Post filtering and categorization
- **Performance Optimized**: Minified CSS/JS, font preloading
- **No Theme Dependencies**: Direct ownership of all theme code for full customization

## Project Structure

```
.
├── archetypes/      # Content templates
├── assets/          # SCSS, JavaScript, fonts
│   ├── js/         # Custom and theme JavaScript
│   └── scss/       # Theme and custom SCSS
├── content/         # Blog content
│   ├── about/      # About section
│   ├── contact/    # Contact section
│   ├── posts/      # Blog posts
│   └── projects/   # Projects section
├── data/           # Custom data files
├── i18n/           # Internationalization
├── layouts/        # HTML templates (standalone)
│   ├── about/      # About page templates
│   ├── contact/    # Contact page templates
│   ├── posts/      # Post page templates
│   ├── projects/   # Projects page templates
│   └── partials/   # Reusable components
├── static/         # Static assets
├── hugo.toml       # Site configuration
└── README.md       # This file
```

## Getting Started

### Prerequisites

- Hugo (v0.131.0 or later)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/fescii/blog.git
cd blog
```

2. Build the site:
```bash
hugo
```

3. Serve locally (optional):
```bash
hugo server -D
```

The built site will be in the `public/` directory.

## Customization

### Adding New Posts

Create a new post in the `content/posts/` directory:

```bash
hugo new posts/my-new-post.md
```

### Modifying Styles

Edit the custom SCSS files in `assets/scss/`:
- `custom.scss` - Your custom styles
- `_tokens.scss` - Design tokens and CSS variables

### Configuration

Edit `hugo.toml` to change:
- Site title and description
- Menu items
- Theme settings
- Social links
- Analytics configuration

## Deployment

The site can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

Simply build the site with `hugo` and deploy the `public/` directory.

## Theme Information

This blog uses a customized version of the hugo-coder theme with direct ownership. All theme files are in the project's `layouts/` and `assets/` directories, allowing for complete customization without theme system dependencies.

## License

This project uses the hugo-coder theme (Apache 2.0 License) with custom modifications.

## Author

Fredrick Femar - [femar.blog](https://femar.blog)
