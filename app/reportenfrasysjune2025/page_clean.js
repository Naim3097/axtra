'use client';

import React from 'react';

const EnfrasysJune2025Report = () => {
  // Report data structure - TITLES ONLY
  const reportData = {
    reportTitle: "Enfrasys Digital Marketing Report",
    month: "June 2025",
    generatedDate: new Date().toLocaleDateString(),
    basePath: "/Enfrasys Reporting/JUNE 2025-20250703T120000Z-001/JUNE 2025",
    
    sections: {
      eBrochure: {
        title: "Digital E-Brochure Collection",
        category: "branding",
        multiPage: true,
        pagesPerView: 2,
        totalPages: 14,
        pageBreak: false,
        path: "BRANDING COLLATERALS",
        assets: Array.from({ length: 14 }, (_, i) => ({
          name: `E-Brochure • Page ${i + 1}`,
          file: `BRANDING - C3 - E BROCHURE_Page_${String(i + 1).padStart(2, '0')}.png`,
          type: "image",
          priority: 1,
          pageNumber: i + 1
        }))
      },
      
      companyProfile: {
        title: "Corporate Profile • Updated Brand Identity",
        category: "branding",
        multiPage: true,
        pagesPerView: 2,
        totalPages: 14,
        pageBreak: true,
        path: "BRANDING COLLATERALS",
        assets: Array.from({ length: 14 }, (_, i) => ({
          name: `Corporate Profile • Page ${i + 1}`,
          file: `BRANDING - COMPANY PROFILE CHANGE COLOR_Page_${String(i + 1).padStart(2, '0')}.png`,
          type: "image",
          priority: 1,
          pageNumber: i + 1
        }))
      },
      
      templateUpdates: {
        title: "Premium Template Collection • Updated Edition",
        category: "branding",
        multiPage: true,
        pagesPerView: 2,
        totalPages: 18,
        pageBreak: true,
        path: "BRANDING COLLATERALS",
        assets: Array.from({ length: 18 }, (_, i) => ({
          name: `Premium Template • Design ${i + 1}`,
          file: `TEMPLATE UPDATED CHANGE COLOR_page-${String(i + 1).padStart(4, '0')}.jpg`,
          type: "image",
          priority: 1,
          pageNumber: i + 1
        }))
      },
      
      additionalBranding: {
        title: "Specialized Brand Assets",
        category: "branding",
        multiPage: false,
        pageBreak: true,
        path: "BRANDING COLLATERALS",
        assets: [
          {
            name: "CDO Backdrop Design",
            file: "BACKDROP CDO CONVEX-03.jpg",
            type: "image",
            priority: 1
          },
          {
            name: "Corporate Apparel Design",
            file: "BRANDING - C4 - SHIRT DESIGN.jpg",
            type: "image",
            priority: 1
          },
          {
            name: "Email Signature Template",
            file: "BRANDING - EMAIL SIGNATURE CHANGE COLOR-03.jpg",
            type: "image",
            priority: 1
          }
        ]
      },
      
      contentCreation: {
        title: "Creative Content Portfolio",
        category: "content",
        multiPage: false,
        pageBreak: true,
        path: "CONTENT CREATION",
        assets: [
          {
            name: "Social Content • Design C1",
            file: "SOCIAL MEDIA - C1.jpg",
            type: "image",
            priority: 1
          },
          {
            name: "Social Content • Design C2",
            file: "SOCIAL MEDIA - C2.jpg",
            type: "image",
            priority: 1
          },
          {
            name: "Social Content • Design C6",
            file: "SOCIAL MEDIA - C6.jpg",
            type: "image",
            priority: 1
          },
          {
            name: "Social Content • Design C7",
            file: "SOCIAL MEDIA - C7.jpg",
            type: "image",
            priority: 1
          },
          {
            name: "Social Content • Design C8",
            file: "SOCIAL MEDIA - C8.jpg",
            type: "image",
            priority: 1
          },
          {
            name: "Social Content • Design C9",
            file: "SOCIAL MEDIA - C9.jpg",
            type: "image",
            priority: 1
          },
          {
            name: "Social Content • Design C10",
            file: "SOCIAL MEDIA - C10.jpg",
            type: "image",
            priority: 1
          }
        ]
      },
      
      socialMediaPosts: {
        title: "Social Media Campaign Collection",
        category: "social",
        multiPage: false,
        pageBreak: true,
        path: "SOCIAL MEDIA POST",
        assets: Array.from({ length: 14 }, (_, i) => ({
          name: `Social Media Post • Design ${i + 1}`,
          file: `SOCIAL MEDIA POST ${i + 1}.jpg`,
          type: "image",
          priority: 1
        }))
      }
    }
  };

  // CLEAN Multi-Page Component - NO DESCRIPTIONS
  const MultiPageAssetSection = ({ section, basePath }) => {
    const pagesPerView = section.pagesPerView || 2;
    const assetGroups = [];
    
    for (let i = 0; i < section.assets.length; i += pagesPerView) {
      assetGroups.push(section.assets.slice(i, i + pagesPerView));
    }
    
    return (
      <div className={section.pageBreak ? 'page-break-before' : ''}>
        {/* Section Header ONLY */}
        <div className="professional-section-page">
          <div className="section-header-professional">
            <h2 className="section-title-professional">{section.title}</h2>
            <div className="section-stats-professional">
              <span className="asset-count-professional">
                {section.assets.length} pages • {assetGroups.length} report pages
              </span>
            </div>
          </div>
        </div>
        
        {/* Assets ONLY - NO HEADERS */}
        {assetGroups.map((assetGroup, groupIndex) => (
          <div key={groupIndex} className="multi-page-section page-break-before">
            <div className="multi-page-grid">
              {assetGroup.map((asset, index) => (
                <div key={index} className="multi-page-item">
                  <div className="multi-page-image-container">
                    <img 
                      src={`${basePath}/${section.path}/${asset.file}`.replace(/\\/g, '/')}
                      alt={asset.name}
                      className="multi-page-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="image-error-placeholder" style={{display: 'none'}}>
                      Image not available: {asset.file}
                    </div>
                  </div>
                  <div className="multi-page-info">
                    <h4 className="multi-page-title">{asset.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // CLEAN Professional Grid Component - NO DESCRIPTIONS
  const ProfessionalAssetGrid = ({ section, basePath, assetsPerPage = 6 }) => {
    const assetGroups = [];
    
    for (let i = 0; i < section.assets.length; i += assetsPerPage) {
      assetGroups.push(section.assets.slice(i, i + assetsPerPage));
    }
    
    return (
      <div className={section.pageBreak ? 'page-break-before' : ''}>
        {/* Section Header ONLY */}
        <div className="professional-section-page">
          <div className="section-header-professional">
            <h2 className="section-title-professional">{section.title}</h2>
            <div className="section-stats-professional">
              <span className="asset-count-professional">{section.assets.length} assets</span>
            </div>
          </div>
        </div>
        
        {/* Assets ONLY - NO HEADERS */}
        {assetGroups.map((assetGroup, groupIndex) => (
          <div key={groupIndex} className="professional-assets-page page-break-before">
            <div className="professional-assets-grid">
              {assetGroup.map((asset, index) => (
                <div key={index} className="professional-asset-item">
                  <div className="professional-asset-image-container">
                    <img 
                      src={`${basePath}/${section.path}/${asset.file}`.replace(/\\/g, '/')}
                      alt={asset.name}
                      className="professional-asset-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="image-error-placeholder" style={{display: 'none'}}>
                      Image not available: {asset.file}
                    </div>
                  </div>
                  <div className="professional-asset-info">
                    <h4 className="professional-asset-title">{asset.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="enfrasys-report-container">
      <style jsx>{`
        .enfrasys-report-container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 20mm;
          background: linear-gradient(135deg, #120627 0%, #1a0b3d 50%, #2d1b69 100%);
          color: white;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          min-height: 100vh;
        }
        
        .report-cover {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 80px 40px;
          background: linear-gradient(135deg, rgba(201, 170, 255, 0.1) 0%, rgba(227, 123, 237, 0.1) 100%);
          border-radius: 25px;
          margin-bottom: 50px;
          border: 1px solid rgba(201, 170, 255, 0.2);
          position: relative;
          overflow: hidden;
        }
        
        .cover-title {
          font-size: 4rem;
          background: linear-gradient(135deg, #c9aaff 0%, #e37bed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 30px;
          font-weight: 800;
          letter-spacing: -2px;
          line-height: 1.1;
        }
        
        .cover-subtitle {
          font-size: 1.8rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 20px;
          font-weight: 400;
        }
        
        .cover-date {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 300;
        }
        
        .professional-section-page {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 40px;
          background: linear-gradient(135deg, rgba(201, 170, 255, 0.1) 0%, rgba(227, 123, 237, 0.1) 100%);
          border-radius: 25px;
          margin-bottom: 50px;
          border: 1px solid rgba(201, 170, 255, 0.2);
          position: relative;
          overflow: hidden;
        }
        
        .section-header-professional {
          max-width: 700px;
          position: relative;
          z-index: 1;
        }
        
        .section-title-professional {
          font-size: 3.2rem;
          background: linear-gradient(135deg, #c9aaff 0%, #e37bed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 25px;
          font-weight: 800;
          letter-spacing: -1px;
          line-height: 1.2;
        }
        
        .section-stats-professional {
          padding: 18px 35px;
          background: linear-gradient(135deg, #c9aaff 0%, #e37bed 100%);
          color: white;
          border-radius: 50px;
          display: inline-block;
          box-shadow: 0 10px 30px rgba(201, 170, 255, 0.3);
        }
        
        .asset-count-professional {
          font-size: 1.2rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .multi-page-section {
          margin-bottom: 50px;
        }
        
        .multi-page-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 35px;
          padding: 30px 0;
        }
        
        .multi-page-item {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          transition: all 0.4s ease;
          border: 1px solid rgba(201, 170, 255, 0.2);
        }
        
        .multi-page-item:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(201, 170, 255, 0.3);
          border-color: rgba(227, 123, 237, 0.4);
        }
        
        .multi-page-image-container {
          width: 100%;
          height: 350px;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, rgba(18, 6, 39, 0.3) 0%, rgba(45, 27, 105, 0.3) 100%);
        }
        
        .multi-page-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }
        
        .multi-page-item:hover .multi-page-image {
          transform: scale(1.02);
        }
        
        .multi-page-info {
          padding: 20px 25px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
        }
        
        .multi-page-title {
          font-size: 1.3rem;
          color: white;
          margin: 0;
          font-weight: 600;
          letter-spacing: 0.3px;
          position: relative;
          padding: 15px 0;
          text-align: center;
        }
        
        .multi-page-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 2px;
          background: linear-gradient(135deg, #c9aaff 0%, #e37bed 100%);
          border-radius: 2px;
        }
        
        .professional-assets-page {
          margin-bottom: 50px;
        }
        
        .professional-assets-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          padding: 30px 0;
        }
        
        .professional-asset-item {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
          transition: all 0.4s ease;
          border: 1px solid rgba(201, 170, 255, 0.2);
        }
        
        .professional-asset-item:hover {
          transform: translateY(-6px);
          box-shadow: 0 15px 35px rgba(201, 170, 255, 0.25);
          border-color: rgba(227, 123, 237, 0.4);
        }
        
        .professional-asset-image-container {
          width: 100%;
          height: 220px;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, rgba(18, 6, 39, 0.2) 0%, rgba(45, 27, 105, 0.2) 100%);
        }
        
        .professional-asset-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }
        
        .professional-asset-item:hover .professional-asset-image {
          transform: scale(1.05);
        }
        
        .professional-asset-info {
          padding: 20px;
          text-align: center;
        }
        
        .professional-asset-title {
          font-size: 1.1rem;
          color: white;
          margin: 0;
          font-weight: 600;
          letter-spacing: 0.3px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .professional-asset-title::before {
          content: '◆';
          color: #c9aaff;
          font-size: 0.7rem;
          opacity: 0.8;
        }
        
        .image-error-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: linear-gradient(135deg, rgba(201, 170, 255, 0.1) 0%, rgba(227, 123, 237, 0.1) 100%);
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          text-align: center;
          padding: 20px;
          border: 2px dashed rgba(201, 170, 255, 0.3);
        }
        
        .page-break-before {
          page-break-before: always;
        }
        
        @media print {
          .enfrasys-report-container {
            background: white !important;
            color: #333 !important;
          }
          
          .report-cover {
            background: linear-gradient(135deg, #4c1d95 0%, #2d1b69 100%) !important;
            color: white !important;
          }
          
          .cover-title,
          .section-title-professional {
            color: #4c1d95 !important;
            -webkit-text-fill-color: #4c1d95 !important;
          }
          
          .multi-page-item,
          .professional-asset-item {
            background: #f8f9fa !important;
            border: 1px solid #e9ecef !important;
            color: #333 !important;
          }
          
          .multi-page-title,
          .professional-asset-title {
            color: #333 !important;
          }
        }
      `}</style>

      {/* Cover Page */}
      <div className="report-cover">
        <h1 className="cover-title">{reportData.reportTitle}</h1>
        <h2 className="cover-subtitle">{reportData.month}</h2>
        <p className="cover-date">Generated: {reportData.generatedDate}</p>
      </div>

      {/* E-Brochure Section */}
      <MultiPageAssetSection 
        section={reportData.sections.eBrochure} 
        basePath={reportData.basePath} 
      />

      {/* Company Profile Section */}
      <MultiPageAssetSection 
        section={reportData.sections.companyProfile} 
        basePath={reportData.basePath} 
      />

      {/* Template Updates Section */}
      <MultiPageAssetSection 
        section={reportData.sections.templateUpdates} 
        basePath={reportData.basePath} 
      />

      {/* Additional Branding */}
      <ProfessionalAssetGrid 
        section={reportData.sections.additionalBranding} 
        basePath={reportData.basePath} 
        assetsPerPage={6} 
      />

      {/* Content Creation */}
      <ProfessionalAssetGrid 
        section={reportData.sections.contentCreation} 
        basePath={reportData.basePath} 
        assetsPerPage={6} 
      />

      {/* Social Media Posts */}
      <ProfessionalAssetGrid 
        section={reportData.sections.socialMediaPosts} 
        basePath={reportData.basePath} 
        assetsPerPage={6} 
      />
    </div>
  );
};

export default EnfrasysJune2025Report;
