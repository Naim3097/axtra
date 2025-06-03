'use client';

import React, { useState } from 'react';

const MonthlyDigitalMarketingReport = () => {
  const [expandedSections, setExpandedSections] = useState({
    edm: true,
    newsletter: true,
    socialMedia: true,
    overview: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Report data structure mapping to the actual assets
  const reportData = {
    reportTitle: "Enfrasys Digital Marketing Report",
    month: "April 2025",
    generatedDate: new Date().toLocaleDateString(),
    basePath: "/Enfrasys Reporting/APRIL 2025-20250603T075648Z-1-001/APRIL 2025",
    
    sections: {
      edm: {
        title: "Email Marketing - Microsoft Security Campaign",
        description: "Security awareness webinar email marketing materials",
        assets: [          {
            name: "Campaign Banner",
            file: "BANNER-01.svg",
            type: "image",
            description: "Main banner for email campaign"
          },
          {
            name: "Security Awareness Webinar PDF",
            file: "EDM WEBINAR SECURITY AWARENESS.pdf",
            type: "pdf",
            description: "Primary webinar invitation document"
          },
          {
            name: "Security Awareness Webinar (Version 2)",
            file: "EDM WEBINAR SECURITY AWARENESS 2.pdf",
            type: "pdf",
            description: "Updated version of webinar invitation"
          },
          {
            name: "Email Creative - Version 1",
            file: "EDM WEBINAR SECURITY AWARENESS JPEG-01.jpg",
            type: "image",
            description: "Email template design version 1"
          },
          {
            name: "Email Creative - Version 2",
            file: "EDM WEBINAR SECURITY AWARENESS JPEG-01 2-01.jpg",
            type: "image",
            description: "Email template design version 2"
          }
        ]
      },
      
      newsletter: {
        title: "Newsletter Campaign Series",
        description: "Multiple newsletter versions and iterations",
        assets: [
          {
            name: "Newsletter 2",
            file: "NEWSLETTER 2.pdf",
            type: "pdf",
            description: "Main newsletter edition"
          },
          {
            name: "Newsletter 2 (Amended)",
            file: "NEWSLETTER 2 AMENDED.pdf",
            type: "pdf",
            description: "Revised version with updates"
          },
          {
            name: "Newsletter 3 Final",
            file: "NEWSLETTER FINAL 3.pdf",
            type: "pdf",
            description: "Final version of newsletter 3"
          },
          {
            name: "Newsletter 4 Final",
            file: "NEWSLETTER FINAL 4.pdf",
            type: "pdf",
            description: "Final version of newsletter 4"
          },
          {
            name: "Newsletter 3",
            file: "NESLETTER 3.pdf",
            type: "pdf",
            description: "Newsletter edition 3"
          },
          {
            name: "Newsletter 4",
            file: "NESLETTER 4.pdf",
            type: "pdf",
            description: "Newsletter edition 4"
          },
          {
            name: "Newsletter 5",
            file: "NESLETTER 5.pdf",
            type: "pdf",
            description: "Newsletter edition 5"
          }
        ]
      },
      
      socialMedia: {
        title: "Social Media Creative Assets",
        description: "Various artboards and social media designs",
        assets: [
          {
            name: "Main Artboard",
            file: "Artboard 1.jpg",
            type: "image",
            description: "Primary social media template"
          },
          {
            name: "Artboard Variation 1",
            file: "Artboard 1 (1).jpg",
            type: "image",
            description: "Alternative artboard design"
          },
          {
            name: "Artboard Copy",
            file: "Artboard 1 copy.jpg",
            type: "image",
            description: "Artboard template copy"
          },
          {
            name: "Artboard Copy 2",
            file: "Artboard 1 copy 2.jpg",
            type: "image",
            description: "Second artboard copy variation"
          },
          {
            name: "Creative Series C1",
            file: "C1.jpg",
            type: "image",
            description: "Creative series - Design 1"
          },
          {
            name: "Creative Series C1 (Alt)",
            file: "C1 a.jpg",
            type: "image",
            description: "Creative series - Design 1 alternative"
          },
          {
            name: "Creative Series C2",
            file: "C2.jpg",
            type: "image",
            description: "Creative series - Design 2"
          },
          {
            name: "Creative Series C3",
            file: "C3.jpg",
            type: "image",
            description: "Creative series - Design 3"
          },
          {
            name: "Creative Series C4",
            file: "C4.jpg",
            type: "image",
            description: "Creative series - Design 4"
          },
          {
            name: "Creative Series C5",
            file: "C5.jpg",
            type: "image",
            description: "Creative series - Design 5"
          },
          {
            name: "Creative Series C7",
            file: "C7.jpg",
            type: "image",
            description: "Creative series - Design 7"
          },
          {
            name: "Creative Series C7 (Alt)",
            file: "C7 a.jpg",
            type: "image",
            description: "Creative series - Design 7 alternative"
          },
          {
            name: "Creative Series C8",
            file: "C8.jpg",
            type: "image",
            description: "Creative series - Design 8"
          },
          {
            name: "Creative Series C8 (New)",
            file: "C8 new.jpg",
            type: "image",
            description: "Creative series - Design 8 updated version"
          },
          {
            name: "Creative Series C9",
            file: "C9.jpg",
            type: "image",
            description: "Creative series - Design 9"
          }
        ]
      }
    }
  };
  const getSummaryStats = () => {
    const stats = {
      totalAssets: 0,
      imageAssets: 0,
      pdfAssets: 0,
      campaigns: Object.keys(reportData.sections).length
    };

    Object.values(reportData.sections).forEach(section => {
      stats.totalAssets += section.assets.length;
      section.assets.forEach(asset => {
        if (asset.type === 'image') stats.imageAssets++;
        if (asset.type === 'pdf') stats.pdfAssets++;
      });
    });

    return stats;
  };


  const stats = getSummaryStats();
  const AssetCard = ({ asset, basePath, sectionPath }) => {
    const fullPath = `${basePath}/${sectionPath}/${asset.file}`;
    const [isExpanded, setIsExpanded] = useState(false);
    const [showViewer, setShowViewer] = useState(false);
  

    const getFileExtension = (filename) => {
      return filename.split('.').pop().toLowerCase();
    };    const isImageFile = (filename) => {
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
      return imageExtensions.includes(getFileExtension(filename));
    };

    const isPDFFile = (filename) => {
      return getFileExtension(filename) === 'pdf';
    };

    const isVideoFile = (filename) => {
      const videoExtensions = ['mov', 'mp4', 'avi', 'webm', 'mkv'];
      return videoExtensions.includes(getFileExtension(filename));
    };    const renderFilePreview = () => {
      if (!showViewer) return null;

      const fileUrl = fullPath.replace(/\\/g, '/');

      if (isImageFile(asset.file)) {        return (
          <div className="mt-3 border border-[#c9aaff]/30 rounded-lg overflow-hidden bg-black/20 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-[#c9aaff]/20 to-[#e37bed]/20 backdrop-blur-md p-2 text-xs text-white/80 flex items-center gap-2 border-b border-white/10">
              <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-lg"></span>
              Image Viewer - {getFileExtension(asset.file).toUpperCase()} format
            </div>
            <img 
              src={fileUrl} 
              alt={asset.name}
              className="w-full h-auto max-h-64 object-contain bg-black/40"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="hidden p-4 text-center text-white/70 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-t border-amber-400/30">
              <div className="text-amber-300 mb-2">⚠️</div>
              <p className="font-medium">Image not found or cannot be displayed</p>
              <p className="text-xs mt-1 text-white/50">Path: {fileUrl}</p>
              <p className="text-xs mt-1 text-[#c9aaff]">
                Try placing the actual image file in the public directory
              </p>
            </div>
          </div>
        );
      }

      if (isPDFFile(asset.file)) {        return (
          <div className="mt-3 border border-[#c9aaff]/30 rounded-lg overflow-hidden bg-black/20 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-blue-500/20 to-[#c9aaff]/20 backdrop-blur-md p-2 text-xs text-white/80 flex items-center gap-2 border-b border-white/10">
              <span className="w-2 h-2 bg-blue-400 rounded-full shadow-lg"></span>
              PDF Viewer - Click to open in new tab if not displaying
            </div>
            <iframe
              src={fileUrl}
              className="w-full h-64 bg-black/40"
              title={asset.name}
            />
            <div className="p-2 bg-gradient-to-r from-[#c9aaff]/10 to-[#e37bed]/10 backdrop-blur-sm text-xs text-white/70 border-t border-white/10 flex justify-between">
              <span>PDF Document</span>
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#c9aaff] hover:text-[#e37bed] transition-colors duration-300"
              >
                Open in New Tab →
              </a>
            </div>
          </div>
        );
      }

      if (isVideoFile(asset.file)) {        return (
          <div className="mt-3 border border-[#c9aaff]/30 rounded-lg overflow-hidden bg-black/20 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-red-500/20 to-[#e37bed]/20 backdrop-blur-md p-2 text-xs text-white/80 flex items-center gap-2 border-b border-white/10">
              <span className="w-2 h-2 bg-red-400 rounded-full shadow-lg"></span>
              Video Player - {getFileExtension(asset.file).toUpperCase()} format
            </div>
            <video 
              controls 
              className="w-full h-auto max-h-64 bg-black"
              preload="metadata"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            >
              <source src={fileUrl} />
              Your browser does not support the video tag.
            </video>
            <div className="hidden p-4 text-center text-white/70 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-t border-amber-400/30">
              <div className="text-amber-300 mb-2">⚠️</div>
              <p className="font-medium">Video not found or cannot be played</p>
              <p className="text-xs mt-1 text-white/50">Path: {fileUrl}</p>
            </div>
          </div>
        );
      }      // Generic file viewer for other types
      return (
        <div className="mt-3 border border-[#c9aaff]/30 rounded-lg p-4 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm">
          <div className="text-center text-white/80">
            <div className="text-3xl mb-2">📄</div>
            <p className="font-medium">{asset.file}</p>
            <p className="text-sm text-white/60 mt-1">
              {getFileExtension(asset.file).toUpperCase()} File
            </p>
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-[#c9aaff] to-[#e37bed] text-white text-sm rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:translate-y-[-1px]"
            >
              Open in New Tab
            </a>
          </div>
        </div>
      );
    };
      return (
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl border border-white/10 shadow-[0_8px_32px_rgba(201,170,255,0.2)] p-4 hover:shadow-[0_12px_40px_rgba(227,123,237,0.3)] hover:border-[#c9aaff]/30 transition-all duration-300 transform hover:scale-[1.02]">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">{asset.name}</h4>
            <p className="text-sm text-white/70 mb-2">{asset.description}</p>
          </div>          <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${
            asset.type === 'image' 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
              : asset.type === 'pdf'
              ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
              : asset.type === 'video'
              ? 'bg-red-500/20 text-red-300 border-red-400/30'
              : 'bg-purple-500/20 text-purple-300 border-purple-400/30'
          }`}>
            {asset.type.toUpperCase()}
          </span>        </div>
        
        <div className="flex gap-2 mb-3">
          <button 
            onClick={() => setShowViewer(!showViewer)}
            className="w-full bg-gradient-to-r from-[#c9aaff] to-[#e37bed] text-white px-3 py-2 rounded-lg text-sm hover:opacity-90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:translate-y-[-1px]"
          >
            {showViewer ? 'Hide Preview' : 'View Asset'}
          </button>
        </div>

        {renderFilePreview()}
      </div>
    );
  };
  const SectionHeader = ({ section, title, isExpanded, onToggle }) => (
    <button
      onClick={() => onToggle(section)}
      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg border border-[#c9aaff]/20 hover:border-[#e37bed]/30 transition-all duration-300 rounded-lg mb-4 shadow-[0_4px_16px_rgba(201,170,255,0.2)] hover:shadow-[0_8px_24px_rgba(227,123,237,0.3)] transform hover:scale-[1.02]"
    >
      <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#c9aaff] to-[#e37bed]">{title}</h3>
      {isExpanded ? (
        <span className="h-5 w-5 text-[#c9aaff]">▼</span>
      ) : (
        <span className="h-5 w-5 text-[#e37bed]">▶</span>
      )}
    </button>
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">        {/* Header */}
        <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg rounded-xl border border-[#c9aaff]/20 shadow-[0_8px_32px_rgba(201,170,255,0.3)] p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c9aaff] to-[#e37bed]">
                {reportData.reportTitle}
              </h1>
              <p className="text-xl text-white/80 mt-1">{reportData.month}</p>
              <p className="text-sm text-white/60 mt-2">Generated on {reportData.generatedDate}</p>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-br from-[#c9aaff]/20 to-[#e37bed]/20 backdrop-blur-md rounded-lg p-4 border border-[#c9aaff]/30">
                <h3 className="text-sm font-medium text-[#c9aaff] mb-2">Report Summary</h3>
                <div className="space-y-1 text-sm text-white/80">
                  <div>{stats.totalAssets} Total Assets</div>
                  <div>{stats.imageAssets} Images</div>
                  <div>{stats.pdfAssets} Documents</div>
                  <div>{stats.campaigns} Campaigns</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* File Display Notice */}
          <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-[#c9aaff]/10 backdrop-blur-sm rounded-lg border border-emerald-400/30">
            <div className="flex items-start gap-3">
              <div className="text-emerald-400 text-lg">✅</div>
              <div>
                <h4 className="font-semibold text-emerald-300 mb-1">File Display Functionality Active</h4>
                <p className="text-sm text-white/70">
                  Click "View Asset" on any card below to preview images, PDFs, videos, and other file types directly in the browser.
                  Files are loaded from the mapped Enfrasys folder structure.
                </p>
                <div className="mt-2 text-xs text-white/60 flex gap-4">
                  <span>🖼️ Images: SVG, PNG, JPEG</span>
                  <span>📄 Documents: PDF</span>
                  <span>🎥 Videos: MOV, MP4</span>
                  <span>📁 Other: Generic file viewer</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="mb-8">
          <SectionHeader 
            section="overview"
            title="Campaign Overview"
            isExpanded={expandedSections.overview}
            onToggle={toggleSection}
          />
            {expandedSections.overview && (
            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg rounded-xl border border-white/10 shadow-lg p-6 mb-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-[#c9aaff]/20 to-blue-500/20 backdrop-blur-sm p-4 rounded-lg border border-[#c9aaff]/30 hover:scale-105 transition-transform duration-300">
                  <h4 className="font-semibold text-[#c9aaff] mb-2">Email Marketing</h4>
                  <p className="text-sm text-white/70">Microsoft Security webinar campaign with multiple creative versions and documentation.</p>
                  <div className="mt-3 text-xs text-white/60">
                    {reportData.sections.edm.assets.length} assets
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-500/20 to-[#c9aaff]/20 backdrop-blur-sm p-4 rounded-lg border border-emerald-400/30 hover:scale-105 transition-transform duration-300">
                  <h4 className="font-semibold text-emerald-300 mb-2">Newsletter Series</h4>
                  <p className="text-sm text-white/70">Comprehensive newsletter campaign with multiple versions and final editions.</p>
                  <div className="mt-3 text-xs text-white/60">
                    {reportData.sections.newsletter.assets.length} assets
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-[#e37bed]/20 to-purple-500/20 backdrop-blur-sm p-4 rounded-lg border border-[#e37bed]/30 hover:scale-105 transition-transform duration-300">
                  <h4 className="font-semibold text-[#e37bed] mb-2">Social Media</h4>
                  <p className="text-sm text-white/70">Extensive creative series with artboards and social media templates.</p>
                  <div className="mt-3 text-xs text-white/60">
                    {reportData.sections.socialMedia.assets.length} assets
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* EDM Section */}
        <div className="mb-8">
          <SectionHeader 
            section="edm"
            title="Email Marketing - Microsoft Security Campaign"
            isExpanded={expandedSections.edm}
            onToggle={toggleSection}
          />
            {expandedSections.edm && (
            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg rounded-xl border border-white/10 shadow-lg p-6 mb-6">
              <p className="text-white/80 mb-6">{reportData.sections.edm.description}</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportData.sections.edm.assets.map((asset, index) => (
                  <AssetCard 
                    key={index} 
                    asset={asset} 
                    basePath={reportData.basePath}
                    sectionPath="EDM MICROSOFT SECURITY"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Newsletter Section */}
        <div className="mb-8">
          <SectionHeader 
            section="newsletter"
            title="Newsletter Campaign Series"
            isExpanded={expandedSections.newsletter}
            onToggle={toggleSection}
          />
            {expandedSections.newsletter && (
            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg rounded-xl border border-white/10 shadow-lg p-6 mb-6">
              <p className="text-white/80 mb-6">{reportData.sections.newsletter.description}</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportData.sections.newsletter.assets.map((asset, index) => (
                  <AssetCard 
                    key={index} 
                    asset={asset} 
                    basePath={reportData.basePath}
                    sectionPath="NEWSLETTER 2"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Social Media Section */}
        <div className="mb-8">
          <SectionHeader 
            section="socialMedia"
            title="Social Media Creative Assets"
            isExpanded={expandedSections.socialMedia}
            onToggle={toggleSection}
          />
            {expandedSections.socialMedia && (
            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg rounded-xl border border-white/10 shadow-lg p-6 mb-6">
              <p className="text-white/80 mb-6">{reportData.sections.socialMedia.description}</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {reportData.sections.socialMedia.assets.map((asset, index) => (
                  <AssetCard 
                    key={index} 
                    asset={asset} 
                    basePath={reportData.basePath}
                    sectionPath="SOCIAL MEDIA"
                  />
                ))}
              </div>
            </div>
          )}
        </div>        {/* Footer */}
        <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg rounded-xl border border-white/10 shadow-lg p-6 text-center">
          <p className="text-white/80">
            This report contains {stats.totalAssets} assets across {stats.campaigns} campaign categories.
          </p>
          <p className="text-sm text-white/60 mt-2">
            Asset paths are relative to: <code className="bg-black/30 border border-[#c9aaff]/20 px-2 py-1 rounded text-[#c9aaff]">{reportData.basePath}</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyDigitalMarketingReport;
