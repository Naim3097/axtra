# Axtra Monthly Report Generation Guide

## Overview
This guide covers both the current April 2025 report implementation and the new enhanced A4 PDF-printable report format with Axtra branding.

## Current Implementation (April 2025 Report)

### Folder Structure
```
/Enfrasys Reporting/
└── APRIL 2025-20250603T075648Z-1-001/
    └── APRIL 2025/
        ├── EDM MICROSOFT SECURITY/
        ├── NEWSLETTER 2/
        └── SOCIAL MEDIA/
```

### Current Features
- Interactive expandable/collapsible sections
- Asset preview on click ("View Asset" buttons)
- File type detection (images, PDFs, videos)
- Responsive grid layout
- Statistics dashboard
- Dark theme with purple gradient branding

### Technical Implementation
- Page location: `/app/reportenfrasysapril2025/page.js`
- Base path mapping to physical folders
- Asset card components with preview functionality
- Section-based organization

## New Enhanced A4 PDF-Printable Format

### Key Requirements

#### 1. A4 Size PDF Professional Report Format
- **Page Dimensions**: 210mm × 297mm (8.27" × 11.69")
- **CSS Print Styles**: Dedicated `@media print` rules
- **Page Breaks**: Clean breaks between sections using `page-break-before` and `page-break-after`
- **Margins**: Professional 20mm margins on all sides
- **Font Sizes**: Print-optimized typography (12pt-16pt body text)

#### 2. Full Content Display
- **No Interactive Elements**: Remove expandable sections, all content visible
- **No Scroll Areas**: All assets displayed in full within page constraints
- **No "View Asset" Buttons**: Assets embedded directly in report
- **Complete Visibility**: Every asset and section shown by default

#### 3. Flexible Asset Categories
- **Dynamic Section Generation**: Support any asset category structure
- **Configurable Asset Types**: Images, PDFs, documents, videos, etc.
- **Custom Category Titles**: Client-specific naming conventions
- **Scalable Organization**: Handle varying numbers of categories per month

#### 4. Multi-Page Asset Cramping Strategy
- **PDF Pages**: Show 2-4 pages per report page in grid format
- **Image Galleries**: Group 4-6 images per page section
- **Document Previews**: Thumbnail view with key details
- **Smart Grouping**: Combine similar assets efficiently

#### 5. Axtra Aesthetic Design
- **Primary Colors**: 
  - Purple: `#c9aaff` (primary brand)
  - Pink: `#e37bed` (secondary brand)
  - Dark: `#120627` (background)
- **Typography**: Clean, professional sans-serif
- **Gradients**: Subtle brand gradients for headers
- **Layout**: Clean, spacious, professional presentation

## Enhanced Implementation Structure

### File Organization
```
/app/report[client][month][year]/
├── page.js                 # Main report component
├── components/
│   ├── ReportHeader.js     # A4-optimized header
│   ├── AssetSection.js     # Full-display asset sections
│   ├── AssetGrid.js        # Cramped asset layouts
│   └── PrintStyles.js      # A4 print CSS
└── data/
    └── reportData.js       # Asset and metadata configuration
```

### CSS Print Optimization
```css
@media print {
  @page {
    size: A4;
    margin: 20mm;
  }
  
  .page-break-before { page-break-before: always; }
  .page-break-after { page-break-after: always; }
  .no-page-break { page-break-inside: avoid; }
}
```

## Asset Cramping Strategies

### 1. PDF Documents (Multi-page)
- **Layout**: 2×2 grid for 4-page documents
- **Preview**: First page thumbnail + page count indicator
- **Spacing**: 5mm between pages, 10mm between documents

### 2. Image Galleries
- **Social Media**: 3×2 grid (6 images per section)
- **Campaign Assets**: 2×3 grid (6 images per section)
- **Responsive Sizing**: Auto-fit within A4 constraints

### 3. Newsletter Series
- **Horizontal Layout**: 3 newsletters per row
- **Compact View**: Title + thumbnail + key details
- **Version Grouping**: Main version + amendments together

### 4. Mixed Content Sections
- **Priority Layout**: Larger items first, smaller items fill spaces
- **Smart Wrapping**: Automatic flow to next page when needed
- **Category Separation**: Clear visual boundaries between types

## Report Data Structure

### Enhanced Configuration Schema
```javascript
const reportData = {
  // Report Metadata
  client: "Client Name",
  month: "Month YYYY",
  reportTitle: "Client Monthly Digital Marketing Report",
  generatedDate: new Date().toLocaleDateString(),
  basePath: "/Client Reporting/MONTH YYYY/",
  
  // Print Configuration
  printConfig: {
    pageSize: "A4",
    orientation: "portrait",
    margins: "20mm",
    scale: 0.8
  },
  
  // Dynamic Sections
  sections: {
    sectionKey: {
      title: "Section Display Title",
      description: "Section description",
      category: "campaign_type", // edm, social, newsletter, etc.
      cramping: "grid-4", // grid-2, grid-4, grid-6, list
      pageBreak: true, // Force page break before section
      assets: [
        {
          name: "Asset Name",
          file: "filename.ext",
          type: "image|pdf|video|document",
          description: "Asset description",
          priority: 1, // Layout priority (1=highest)
          pages: 1, // For multi-page documents
          size: "large|medium|small" // Display size hint
        }
      ]
    }
  },
  
  // Summary Statistics
  summary: {
    totalAssets: 0,
    assetsByType: {},
    campaignCount: 0,
    deliveryDate: "YYYY-MM-DD"
  }
};
```

## Component Architecture

### 1. Main Report Component
```javascript
// /app/report[client][month][year]/page.js
'use client';

import React from 'react';
import ReportHeader from './components/ReportHeader';
import AssetSection from './components/AssetSection';
import PrintStyles from './components/PrintStyles';
import { reportData } from './data/reportData';

const MonthlyReport = () => {
  return (
    <>
      <PrintStyles />
      <div className="report-container a4-format">
        <ReportHeader data={reportData} />
        
        {Object.entries(reportData.sections).map(([key, section]) => (
          <AssetSection
            key={key}
            section={section}
            basePath={reportData.basePath}
            cramping={section.cramping}
            pageBreak={section.pageBreak}
          />
        ))}
        
        <div className="report-footer page-break-before">
          {/* Summary and branding */}
        </div>
      </div>
    </>
  );
};
```

### 2. Asset Section Component
```javascript
// Components handle full display with appropriate cramping
const AssetSection = ({ section, basePath, cramping, pageBreak }) => {
  const crampingClass = `asset-${cramping}`; // asset-grid-4, asset-grid-6, etc.
  
  return (
    <section className={`asset-section ${pageBreak ? 'page-break-before' : ''}`}>
      <div className="section-header">
        <h2>{section.title}</h2>
        <p>{section.description}</p>
      </div>
      
      <div className={`asset-container ${crampingClass}`}>
        {section.assets.map((asset, index) => (
          <AssetCard
            key={index}
            asset={asset}
            basePath={basePath}
            sectionPath={section.path}
            displayMode="full" // Always full display, no interactions
          />
        ))}
      </div>
    </section>
  );
};
```

## Implementation Steps

### Phase 1: Enhanced Component Creation
1. Create base A4 report template
2. Implement print-optimized CSS
3. Build asset cramping system
4. Add Axtra branding elements

### Phase 2: Asset Management
1. Create flexible data schema
2. Implement automatic asset detection
3. Build cramping algorithms
4. Add multi-page PDF handling

### Phase 3: Print Optimization
1. Fine-tune A4 dimensions
2. Optimize page breaks
3. Test print scaling
4. Ensure no content cutoff

### Phase 4: Template System
1. Create reusable monthly template
2. Build data configuration system
3. Add asset path automation
4. Implement client customization

## Usage Workflow

### For New Monthly Report
1. **Create Folder Structure**: Follow naming convention
2. **Organize Assets**: Place in categorized folders
3. **Configure Data**: Update reportData.js with asset information
4. **Generate Page**: Create new report route
5. **Test Print**: Verify A4 formatting and content visibility
6. **Deploy**: Make available to client

### Print Instructions for Users
1. **Right-click** on report page
2. **Select "Print"** from context menu
3. **Choose settings**:
   - Paper size: A4
   - Orientation: Portrait
   - Margins: Default (20mm)
   - Scale: 100%
4. **Print or Save as PDF**

## Quality Assurance Checklist

### A4 Format Compliance
- [ ] Content fits within A4 dimensions
- [ ] No horizontal scrolling needed
- [ ] Clean page breaks between major sections
- [ ] Professional margins maintained

### Content Display
- [ ] All assets visible without interaction
- [ ] No expandable/collapsible elements
- [ ] No "view more" or preview buttons
- [ ] Complete asset information displayed

### Print Quality
- [ ] Text remains readable when printed
- [ ] Images maintain quality and proportion
- [ ] Colors print appropriately (or B&W friendly)
- [ ] No content cut off at page edges

### Axtra Branding
- [ ] Purple/pink color scheme consistent
- [ ] Typography matches brand guidelines
- [ ] Professional layout and spacing
- [ ] Company branding elements included

## Future Enhancements

### Potential Additions
- **Multi-client templates**: Customizable branding per client
- **Automated asset scanning**: Auto-populate from folder structure
- **Print preview mode**: Show exactly how it will print
- **Export options**: Direct PDF generation
- **Performance metrics**: Include campaign performance data
- **Responsive print**: Different layouts for different page sizes

---

*This guide serves as the foundation for implementing professional, printable monthly reports that maintain Axtra's brand identity while providing comprehensive asset documentation for clients.*
