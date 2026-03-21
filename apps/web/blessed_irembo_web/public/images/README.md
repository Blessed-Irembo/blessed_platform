# Image Assets

This directory contains image assets for the Blessed Irembo web application.

## Required Images

### Hero Section
- **Filename**: `hero-pharmacist.jpg`
- **Recommended Size**: 1200x1000px
- **Description**: Professional image of a pharmacist working with medication or consulting
- **Usage**: Main hero section on the home page

### Pharmacy Owners Section
- **Filename**: `pharmacy-owner.jpg`
- **Recommended Size**: 1200x1000px
- **Description**: Image showing pharmacy owner or medical professional with laptop/technology
- **Usage**: "For Pharmacy Owners" section on the home page

## Image Guidelines

### Format
- Use JPEG for photographs
- Use WebP for better compression (Next.js will optimize automatically)
- Use PNG for images requiring transparency

### Optimization
- Compress images before uploading
- Target file size: < 500KB for web performance
- Next.js Image component handles automatic optimization

### Aspect Ratio
- Hero images: 6:5 ratio (landscape)
- Maintain consistent aspect ratios across similar sections

### Content Guidelines
- Use high-quality, professional images
- Ensure images represent Rwanda and local context where possible
- Verify you have proper licenses/rights for all images
- Avoid generic stock photos that don't relate to healthcare

## Current Assets

- **Logo**: Available at `/public/logo.svg` (vector graphic)

## Adding New Images

1. Place images in this directory (`/public/images/`)
2. Use descriptive filenames (lowercase, hyphen-separated)
3. Update this README with new image documentation
4. Reference in components using `/images/filename.jpg`

Example usage in components:
```tsx
<Image
  src="/images/hero-pharmacist.jpg"
  alt="Pharmacist at work"
  fill
  className="object-cover"
/>
```
