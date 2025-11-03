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

  // CLEAN Multi-Page Component - NO DESCRIPTIONS - FIXED STRUCTURE
  const MultiPageAssetSection = ({ section, basePath }) => {
    const pagesPerView = section.pagesPerView || 2;
    const assetGroups = [];
    
    for (let i = 0; i < section.assets.length; i += pagesPerView) {
      assetGroups.push(section.assets.slice(i, i + pagesPerView));
    }
    
    return (
      <>
        {/* Section Header ONLY */}
        <div className="a4-page">
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
        </div>
        
        {/* Assets ONLY - NO HEADERS */}
        {assetGroups.map((assetGroup, groupIndex) => (
          <div key={groupIndex} className="a4-page">
            <div className="multi-page-section">
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
          </div>
        ))}
      </>
    );
  };

  // CLEAN Professional Grid Component - NO DESCRIPTIONS - FIXED STRUCTURE
  const ProfessionalAssetGrid = ({ section, basePath, assetsPerPage = 6 }) => {
    const assetGroups = [];
    const isSocialMedia = section.title.includes('Social Media');
    const isSocialContent = section.title.includes('Creative Content');
    const isSpecialGrid = isSocialMedia || isSocialContent;
    
    // FORCE 2x2 grid for social media and content creation (4 per page)
    const actualAssetsPerPage = isSpecialGrid ? 4 : assetsPerPage;
    
    for (let i = 0; i < section.assets.length; i += actualAssetsPerPage) {
      assetGroups.push(section.assets.slice(i, i + actualAssetsPerPage));
    }
    
    return (
      <>
        {/* Section Header ONLY */}
        <div className="a4-page">
          <div className="professional-section-page">
            <div className="section-header-professional">
              <h2 className="section-title-professional">{section.title}</h2>
              <div className="section-stats-professional">
                <span className="asset-count-professional">{section.assets.length} assets</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Assets ONLY - NO HEADERS */}
        {assetGroups.map((assetGroup, groupIndex) => (
          <div key={groupIndex} className="a4-page">          <div className={`professional-assets-page ${isSpecialGrid ? 'rigid-2x2-grid-page' : ''}`}
            style={isSpecialGrid ? {
              width: '100%',
              height: '100%',
              maxWidth: '190mm',
              maxHeight: '277mm',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0',
              margin: '0',
              boxSizing: 'border-box',
              overflow: 'hidden'
            } : {}}
          >
            <div className={`professional-assets-grid ${isSpecialGrid ? 'rigid-2x2-layout' : ''}`}
              style={isSpecialGrid ? {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gap: '15mm',
                width: '100%',
                maxWidth: '180mm',
                height: '100%',
                maxHeight: '240mm',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10mm',
                margin: '0',
                boxSizing: 'border-box'
              } : {}}
            >
              {assetGroup.map((asset, index) => (
                <div key={index} className="professional-asset-item"
                  style={isSpecialGrid ? {
                    maxWidth: '80mm',
                    width: '80mm',
                    height: '100mm',
                    margin: '0 auto',
                    border: '2px solid #c9aaff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(201, 170, 255, 0.4)',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '8px',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  } : {}}
                >
                  <div className="professional-asset-image-container"
                    style={{
                      background: 'linear-gradient(135deg, rgba(18, 6, 39, 0.8) 0%, rgba(45, 27, 105, 0.8) 100%)',
                      border: isSpecialGrid ? '2px solid #c9aaff' : '4px solid #c9aaff',
                      padding: isSpecialGrid ? '8px' : '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: isSpecialGrid ? '70mm' : '240px',
                      width: '100%',
                      maxWidth: isSpecialGrid ? '76mm' : '240px',
                      borderRadius: isSpecialGrid ? '6px' : '12px',
                      boxShadow: isSpecialGrid ? '0 2px 8px rgba(201, 170, 255, 0.3)' : '0 6px 20px rgba(201, 170, 255, 0.3), inset 0 2px 8px rgba(227, 123, 237, 0.2), 0 0 15px rgba(201, 170, 255, 0.15)',
                      margin: isSpecialGrid ? '0' : '0 auto',
                      boxSizing: 'border-box'
                    }}
                  >
                      <img 
                        src={`${basePath}/${section.path}/${asset.file}`.replace(/\\/g, '/')}
                        alt={asset.name}
                        className="professional-asset-image"                      style={{
                        border: isSpecialGrid ? '1px solid #e37bed' : '2px solid #e37bed',
                        background: 'rgba(255, 255, 255, 0.08)',
                        maxWidth: 'calc(100% - 4px)',
                        maxHeight: 'calc(100% - 4px)',
                        objectFit: 'contain',
                        borderRadius: isSpecialGrid ? '4px' : '8px',
                        boxShadow: isSpecialGrid ? '0 2px 6px rgba(227, 123, 237, 0.3)' : '0 4px 15px rgba(227, 123, 237, 0.3), 0 2px 8px rgba(201, 170, 255, 0.2), inset 0 1px 4px rgba(255, 255, 255, 0.1)',
                        padding: isSpecialGrid ? '4px' : '8px',
                        transition: 'all 0.4s ease',
                        width: 'auto',
                        height: 'auto'
                      }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="image-error-placeholder" style={{display: 'none'}}>
                        Image not available: {asset.file}
                      </div>
                    </div>                  <div className="professional-asset-info" style={isSpecialGrid ? { marginTop: '8px', padding: '6px' } : {}}>
                    <h4 className="professional-asset-title" style={isSpecialGrid ? { fontSize: '0.8rem', lineHeight: '1.1' } : {}}>{asset.name}</h4>
                  </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="enfrasys-report-container">
      <style jsx>{`
        .enfrasys-report-container {
          max-width: 210mm;
          width: 210mm;
          margin: 0 auto;
          padding: 0;
          background: linear-gradient(135deg, #120627 0%, #1a0b3d 50%, #2d1b69 100%);
          color: white;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          min-height: 100vh;
        }
        
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          max-height: 297mm;
          padding: 10mm;
          margin: 0;
          box-sizing: border-box;
          page-break-after: always;
          break-after: page;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          background: linear-gradient(135deg, #120627 0%, #1a0b3d 50%, #2d1b69 100%);
          overflow: hidden;
        }
        
        .report-cover {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 0;
          margin: 0;
          background: linear-gradient(135deg, rgba(201, 170, 255, 0.1) 0%, rgba(227, 123, 237, 0.1) 100%);
          border-radius: 25px;
          border: 1px solid rgba(201, 170, 255, 0.2);
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
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
          min-height: 35vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 40px 30px 40px;
          background: linear-gradient(135deg, rgba(201, 170, 255, 0.1) 0%, rgba(227, 123, 237, 0.1) 100%);
          border-radius: 25px;
          margin-bottom: 30px;
          margin-top: 60px;
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
          margin-top: 80px;
          padding-top: 40px;
        }
        
        .multi-page-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 35px;
          padding: 50px 0 30px 0;
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
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          box-sizing: border-box;
        }
        
        .multi-page-image {
          max-width: calc(100% - 20px);
          max-height: calc(100% - 20px);
          object-fit: contain;
          object-position: center;
          transition: transform 0.3s ease;
          width: auto;
          height: auto;
          display: block;
          border-radius: 4px;
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
          min-height: 60vh;
        }
        
        .rigid-2x2-grid-page {
          width: 100% !important;
          height: 100% !important;
          max-width: 190mm !important;
          max-height: 277mm !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          padding: 0 !important;
          margin: 0 !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        }
        
        .rigid-2x2-layout {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          grid-template-rows: 1fr 1fr !important;
          gap: 15mm !important;
          width: 100% !important;
          max-width: 180mm !important;
          height: 100% !important;
          max-height: 240mm !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 10mm !important;
          margin: 0 !important;
          box-sizing: border-box !important;
        }
        
        .rigid-2x2-grid-page .professional-asset-item {
          max-width: 80mm !important;
          width: 80mm !important;
          height: 100mm !important;
          margin: 0 auto !important;
          border: 2px solid #c9aaff !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(201, 170, 255, 0.4) !important;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          padding: 8px !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        }
        
        .social-media-page {
          page-break-after: always;
          min-height: 100vh;
          height: 100vh;
          max-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 0;
          margin: 0;
          box-sizing: border-box;
        }
        
        .social-media-grid {
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 20px !important;
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
          max-width: 180mm !important;
          height: auto !important;
          min-height: auto !important;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }
        
        .special-grid-page {
          page-break-after: always !important;
          min-height: 100vh !important;
          height: 100vh !important;
          max-height: 100vh !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          padding: 60px !important;
          margin: 0 !important;
          box-sizing: border-box !important;
          background: linear-gradient(135deg, #0a0515 0%, #1a0b3d 50%, #2d1b69 100%) !important;
        }
        
        .special-grid-layout {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          grid-template-rows: 1fr 1fr !important;
          gap: 60px !important;
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
          max-width: 800px !important;
          height: 600px !important;
          min-height: 600px !important;
          align-items: center !important;
          justify-content: center !important;
          box-sizing: border-box !important;
        }
        
        .professional-asset-item {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.4s ease;
          border: 1px solid rgba(201, 170, 255, 0.2);
          width: 100%;
          max-width: 240px;
          margin: 0 auto;
          box-sizing: border-box;
        }
        
        .special-grid-page .professional-asset-item {
          max-width: 350px !important;
          width: 350px !important;
          height: 280px !important;
          margin: 0 auto !important;
          border: 3px solid #c9aaff !important;
          border-radius: 20px !important;
          box-shadow: 0 15px 40px rgba(201, 170, 255, 0.6) !important;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%) !important;
        }
        
        .professional-asset-item:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 45px rgba(201, 170, 255, 0.4);
          border-color: rgba(227, 123, 237, 0.6);
        }
        
        .professional-asset-item:hover .professional-asset-image-container {
          border-color: #e37bed !important;
          box-shadow: 
            0 15px 40px rgba(227, 123, 237, 0.6),
            inset 0 4px 20px rgba(201, 170, 255, 0.4),
            0 0 35px rgba(227, 123, 237, 0.3) !important;
          transform: scale(1.02);
        }
        
        .professional-asset-item:hover .professional-asset-image {
          transform: scale(1.05) !important;
          border-color: #ff6b9d !important;
          box-shadow: 
            0 12px 35px rgba(255, 107, 157, 0.5),
            0 6px 20px rgba(227, 123, 237, 0.6),
            inset 0 3px 12px rgba(255, 255, 255, 0.2) !important;
        }
        
        .professional-asset-image-container {
          /* Styles applied inline for better control */
        }
        
        .professional-asset-image {
          /* Styles applied inline for better control */
        }
        
        .professional-asset-info {
          padding: 15px;
          text-align: center;
        }
        
        .professional-asset-title {
          font-size: 0.95rem;
          color: white;
          margin: 0;
          font-weight: 600;
          letter-spacing: 0.2px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          line-height: 1.3;
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
        
        .summary-content {
          padding: 60px 40px;
          min-height: 70vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
          margin-bottom: 60px;
          width: 100%;
          max-width: 800px;
        }
        
        .summary-item {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          border-radius: 15px;
          padding: 30px;
          text-align: center;
          border: 1px solid rgba(201, 170, 255, 0.2);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        }
        
        .summary-category {
          font-size: 1.4rem;
          background: linear-gradient(135deg, #c9aaff 0%, #e37bed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 15px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        
        .summary-count {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          font-weight: 500;
        }
        
        .summary-footer {
          text-align: center;
          width: 100%;
        }
        
        .summary-total {
          font-size: 2.2rem;
          background: linear-gradient(135deg, #c9aaff 0%, #e37bed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 20px;
          font-weight: 800;
          letter-spacing: 1px;
        }
        
        .summary-date {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
          font-weight: 400;
        }
        
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .enfrasys-report-container {
            max-width: 210mm !important;
            width: 210mm !important;
            padding: 10mm !important;
            background: linear-gradient(135deg, #120627 0%, #1a0b3d 50%, #2d1b69 100%) !important;
            color: white !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
          }
          
          .report-cover {
            min-height: 80vh !important;
            background: linear-gradient(135deg, rgba(201, 170, 255, 0.1) 0%, rgba(227, 123, 237, 0.1) 100%) !important;
            color: white !important;
            border: 1px solid rgba(201, 170, 255, 0.2) !important;
            page-break-after: always !important;
          }
          
          .cover-title {
            background: linear-gradient(135deg, #c9aaff 0%, #e37bed 100%) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
          }
          
          .professional-section-page {
            background: linear-gradient(135deg, rgba(201, 170, 255, 0.1) 0%, rgba(227, 123, 237, 0.1) 100%) !important;
            border: 1px solid rgba(201, 170, 255, 0.2) !important;
            color: white !important;
            page-break-after: always !important;
          }
          
          .section-title-professional {
            background: linear-gradient(135deg, #c9aaff 0%, #e37bed 100%) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
          }
          
          .section-stats-professional {
            background: linear-gradient(135deg, #c9aaff 0%, #e37bed 100%) !important;
            color: white !important;
          }
          
          .multi-page-item,
          .professional-asset-item {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
            border: 1px solid rgba(201, 170, 255, 0.2) !important;
            color: white !important;
            break-inside: avoid !important;
          }
          
          .multi-page-title,
          .professional-asset-title {
            color: white !important;
          }
          
          .multi-page-image-container {
            height: 350px !important;
            padding: 10px !important;
            background: linear-gradient(135deg, rgba(18, 6, 39, 0.3) 0%, rgba(45, 27, 105, 0.3) 100%) !important;
          }
          
          .multi-page-image,
          .professional-asset-image {
            max-width: calc(100% - 20px) !important;
            max-height: calc(100% - 20px) !important;
            object-fit: contain !important;
            object-position: center !important;
            width: auto !important;
            height: auto !important;
            border-radius: 8px !important;
          }
          
          .professional-asset-image-container {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 60mm !important;
            width: 100% !important;
            max-width: 60mm !important;
            padding: 4mm !important;
            background: linear-gradient(135deg, rgba(18, 6, 39, 0.8) 0%, rgba(45, 27, 105, 0.8) 100%) !important;
            border: 1mm solid #c9aaff !important;
            border-radius: 3mm !important;
            box-shadow: 0 2mm 6mm rgba(201, 170, 255, 0.3), inset 0 1mm 3mm rgba(227, 123, 237, 0.2), 0 0 4mm rgba(201, 170, 255, 0.15) !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
          }
          
          .special-grid-page .professional-asset-image-container {
            height: 70mm !important;
            max-width: 70mm !important;
            padding: 5mm !important;
          }
          
          .professional-asset-image {
            border: 0.5mm solid #e37bed !important;
            background: rgba(255, 255, 255, 0.08) !important;
            border-radius: 2mm !important;
            box-shadow: 0 1mm 4mm rgba(227, 123, 237, 0.3), 0 0.5mm 2mm rgba(201, 170, 255, 0.2), inset 0 0.5mm 1mm rgba(255, 255, 255, 0.1) !important;
            padding: 2mm !important;
            max-width: calc(100% - 2mm) !important;
            max-height: calc(100% - 2mm) !important;
            object-fit: contain !important;
            object-position: center !important;
            width: auto !important;
            height: auto !important;
          }
          
          .professional-asset-item {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
            border: 0.5mm solid rgba(201, 170, 255, 0.2) !important;
            color: white !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-bottom: 0 !important;
            border-radius: 3mm !important;
            width: 100% !important;
            max-width: 60mm !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          
          .special-grid-page .professional-asset-item {
            max-width: 70mm !important;
            width: 100% !important;
            height: auto !important;
          }
          
          .professional-asset-info {
            padding: 3mm !important;
            text-align: center !important;
          }
          
          .professional-asset-title {
            font-size: 3mm !important;
            color: white !important;
            margin: 0 !important;
            font-weight: 600 !important;
            letter-spacing: 0.1mm !important;
            line-height: 1.2 !important;
          }
          
          .professional-assets-page {
            page-break-after: always !important;
            break-after: page !important;
            min-height: 90vh !important;
          }
          
          .social-media-page {
            page-break-after: always !important;
            break-after: page !important;
            min-height: 100vh !important;
            height: 100vh !important;
            max-height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            padding: 0 !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          
          .social-media-grid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 15mm !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 180mm !important;
            height: auto !important;
            min-height: auto !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
          }
          
          .special-grid-page {
            page-break-after: always !important;
            break-after: page !important;
            min-height: 100vh !important;
            height: 100vh !important;
            max-height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            padding: 15mm !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            background: linear-gradient(135deg, #0a0515 0%, #1a0b3d 50%, #2d1b69 100%) !important;
          }
          
          .special-grid-layout {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: 1fr 1fr !important;
            gap: 20mm !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 170mm !important;
            height: 200mm !important;
            min-height: 200mm !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          
          .special-grid-page .professional-asset-item {
            max-width: 80mm !important;
            width: 80mm !important;
            height: 70mm !important;
            margin: 0 auto !important;
            border: 2mm solid #c9aaff !important;
            border-radius: 5mm !important;
            box-shadow: 0 4mm 12mm rgba(201, 170, 255, 0.6) !important;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%) !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
          }
          
          .special-grid-page .professional-asset-image-container {
            height: 50mm !important;
            max-width: 75mm !important;
            width: 75mm !important;
            padding: 3mm !important;
            border: 2mm solid #c9aaff !important;
            border-radius: 4mm !important;
            box-shadow: 0 3mm 10mm rgba(201, 170, 255, 0.5), inset 0 2mm 6mm rgba(227, 123, 237, 0.3), 0 0 8mm rgba(201, 170, 255, 0.2) !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
          }
          
          .special-grid-page .professional-asset-image {
            border: 1mm solid #e37bed !important;
            background: rgba(255, 255, 255, 0.08) !important;
            border-radius: 3mm !important;
            box-shadow: 0 2mm 8mm rgba(227, 123, 237, 0.4), 0 1mm 4mm rgba(201, 170, 255, 0.3), inset 0 1mm 3mm rgba(255, 255, 255, 0.1) !important;
            padding: 2mm !important;
            max-width: calc(100% - 3mm) !important;
            max-height: calc(100% - 3mm) !important;
            object-fit: contain !important;
            object-position: center !important;
            width: auto !important;
            height: auto !important;
          }
          
          .special-grid-page .professional-asset-info {
            padding: 2mm !important;
            text-align: center !important;
            height: 15mm !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          .special-grid-page .professional-asset-title {
            font-size: 4mm !important;
            color: white !important;
            margin: 0 !important;
            font-weight: 700 !important;
            letter-spacing: 0.2mm !important;
            line-height: 1.2 !important;
            text-align: center !important;
          }
          
          .rigid-2x2-grid-page {
            page-break-after: always !important;
            break-after: page !important;
            min-height: 100vh !important;
            height: 100vh !important;
            max-height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            padding: 15mm !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          
          .rigid-2x2-layout {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: 1fr 1fr !important;
            gap: 20mm !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 170mm !important;
            height: 200mm !important;
            min-height: 200mm !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          
          .rigid-2x2-grid-page .professional-asset-item {
            max-width: 80mm !important;
            width: 80mm !important;
            height: 70mm !important;
            margin: 0 auto !important;
            border: 2mm solid #c9aaff !important;
            border-radius: 5mm !important;
            box-shadow: 0 4mm 12mm rgba(201, 170, 255, 0.6) !important;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%) !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
          }
          
          .rigid-2x2-grid-page .professional-asset-image-container {
            height: 50mm !important;
            max-width: 75mm !important;
            width: 75mm !important;
            padding: 3mm !important;
            border: 2mm solid #c9aaff !important;
            border-radius: 4mm !important;
            box-shadow: 0 3mm 10mm rgba(201, 170, 255, 0.5), inset 0 2mm 6mm rgba(227, 123, 237, 0.3), 0 0 8mm rgba(201, 170, 255, 0.2) !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
          }
          
          .rigid-2x2-grid-page .professional-asset-image {
            border: 1mm solid #e37bed !important;
            background: rgba(255, 255, 255, 0.08) !important;
            border-radius: 3mm !important;
            box-shadow: 0 2mm 8mm rgba(227, 123, 237, 0.4), 0 1mm 4mm rgba(201, 170, 255, 0.3), inset 0 1mm 3mm rgba(255, 255, 255, 0.1) !important;
            padding: 2mm !important;
            max-width: calc(100% - 3mm) !important;
            max-height: calc(100% - 3mm) !important;
            object-fit: contain !important;
            object-position: center !important;
            width: auto !important;
            height: auto !important;
          }
          
          .rigid-2x2-grid-page .professional-asset-info {
            padding: 2mm !important;
            text-align: center !important;
            height: 15mm !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          .rigid-2x2-grid-page .professional-asset-title {
            font-size: 4mm !important;
            color: white !important;
            margin: 0 !important;
            font-weight: 700 !important;
            letter-spacing: 0.2mm !important;
            line-height: 1.2 !important;
            text-align: center !important;
          }
          
          .professional-assets-grid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            min-height: 60vh !important;
          }
          
          .professional-asset-item {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-bottom: 0 !important;
          }
          
          .multi-page-section {
            page-break-after: always !important;
            margin-top: 20mm !important;
            padding-top: 10mm !important;
          }
          
          .multi-page-grid {
            padding: 12mm 0 8mm 0 !important;
          }
          
          .page-break-before {
            page-break-before: always !important;
          }
          
          .summary-content {
            padding: 15mm !important;
            min-height: 80vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            page-break-after: always !important;
          }
          
          .summary-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10mm !important;
            margin-bottom: 15mm !important;
            width: 100% !important;
            max-width: 170mm !important;
          }
          
          .summary-item {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
            border-radius: 4mm !important;
            padding: 8mm !important;
            text-align: center !important;
            border: 0.5mm solid rgba(201, 170, 255, 0.2) !important;
            box-shadow: 0 2mm 6mm rgba(0, 0, 0, 0.1) !important;
            break-inside: avoid !important;
          }
          
          .summary-category {
            background: linear-gradient(135deg, #c9aaff 0%, #e37bed 100%) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
            font-size: 4mm !important;
            margin-bottom: 4mm !important;
            font-weight: 700 !important;
          }
          
          .summary-count {
            color: rgba(255, 255, 255, 0.8) !important;
            font-size: 3.5mm !important;
            margin: 0 !important;
            font-weight: 500 !important;
          }
          
          .summary-footer {
            text-align: center !important;
            width: 100% !important;
          }
          
          .summary-total {
            background: linear-gradient(135deg, #c9aaff 0%, #e37bed 100%) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
            font-size: 6mm !important;
            margin-bottom: 5mm !important;
            font-weight: 800 !important;
          }
          
          .summary-date {
            color: rgba(255, 255, 255, 0.6) !important;
            font-size: 3.5mm !important;
            margin: 0 !important;
            font-weight: 400 !important;
          }
          
          @page {
            margin: 10mm;
            size: A4 portrait;
            width: 210mm;
            height: 297mm;
          }
          
          .a4-page {
            width: 210mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            padding: 10mm !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            break-after: page !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            align-items: center !important;
            background: linear-gradient(135deg, #120627 0%, #1a0b3d 50%, #2d1b69 100%) !important;
            overflow: hidden !important;
          }
        }
      `}</style>

      {/* Cover Page */}
      <div className="a4-page">
        <div className="report-cover">
          <h1 className="cover-title">{reportData.reportTitle}</h1>
          <h2 className="cover-subtitle">{reportData.month}</h2>
          <p className="cover-date">Generated: {reportData.generatedDate}</p>
        </div>
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

      {/* Gap Page Between Branding and Content Creation */}
      <div className="a4-page">
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #120627 0%, #1a0b3d 50%, #2d1b69 100%)'
        }}>
          <div style={{
            textAlign: 'center',
            opacity: 0.3
          }}>
            <h3 style={{
              fontSize: '2rem',
              color: 'rgba(201, 170, 255, 0.5)',
              fontWeight: 300,
              letterSpacing: '2px'
            }}>
              —————————
            </h3>
          </div>
        </div>
      </div>

      {/* Content Creation */}
      <ProfessionalAssetGrid 
        section={reportData.sections.contentCreation} 
        basePath={reportData.basePath} 
        assetsPerPage={4} 
      />

      {/* Gap Page Between Content Creation and Social Media Posts */}
      <div className="a4-page">
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #120627 0%, #1a0b3d 50%, #2d1b69 100%)'
        }}>
          <div style={{
            textAlign: 'center',
            opacity: 0.3
          }}>
            <h3 style={{
              fontSize: '2rem',
              color: 'rgba(201, 170, 255, 0.5)',
              fontWeight: 300,
              letterSpacing: '2px'
            }}>
              —————————
            </h3>
          </div>
        </div>
      </div>

      {/* Social Media Posts */}
      <ProfessionalAssetGrid 
        section={reportData.sections.socialMediaPosts} 
        basePath={reportData.basePath} 
        assetsPerPage={4} 
      />

      {/* Summary Page */}
      <div className="a4-page">
        <div className="professional-section-page">
          <div className="section-header-professional">
            <h2 className="section-title-professional">Project Summary</h2>
            <div className="section-stats-professional">
              <span className="asset-count-professional">Deliverables Overview</span>
            </div>
          </div>
        </div>
      </div>
        
      <div className="a4-page">
        <div className="summary-content">
          <div className="summary-grid">
            <div className="summary-item">
              <h3 className="summary-category">Digital E-Brochure Collection</h3>
              <p className="summary-count">14 pages</p>
            </div>
            <div className="summary-item">
              <h3 className="summary-category">Corporate Profile</h3>
              <p className="summary-count">14 pages</p>
            </div>
            <div className="summary-item">
              <h3 className="summary-category">Premium Template Collection</h3>
              <p className="summary-count">18 designs</p>
            </div>
            <div className="summary-item">
              <h3 className="summary-category">Specialized Brand Assets</h3>
              <p className="summary-count">3 assets</p>
            </div>
            <div className="summary-item">
              <h3 className="summary-category">Creative Content Portfolio</h3>
              <p className="summary-count">7 designs</p>
            </div>
            <div className="summary-item">
              <h3 className="summary-category">Social Media Campaign</h3>
              <p className="summary-count">14 posts</p>
            </div>
          </div>
          
          <div className="summary-footer">
            <h3 className="summary-total">Total Deliverables: 70 Assets</h3>
            <p className="summary-date">Report Generated: {reportData.generatedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnfrasysJune2025Report;
