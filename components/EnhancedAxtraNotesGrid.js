// Custom styling for AxtraNotesGrid
import React from 'react';
import AxtraNotesGrid from '@/components/AxtraNotesGrid';

// This component wraps the AxtraNotesGrid component to apply custom styling
const EnhancedAxtraNotesGrid = ({ contentItems, loading, handleContentView, formatTimeAgo }) => {
  // If we're still loading content or there's no content, render the original grid
  if (loading || !contentItems || contentItems.length === 0) {
    return (
      <AxtraNotesGrid 
        contentItems={contentItems}
        loading={loading}
        handleContentView={handleContentView}
        formatTimeAgo={formatTimeAgo}
      />
    );
  }    // We'll use Tailwind's responsive classes instead of JS-based styles
    return (
    <div className="enhanced-grid relative w-full">
      <style jsx>{`
        /* Social media card styling */
        .enhanced-grid :global(.card-hover) {
          background: linear-gradient(145deg, rgba(30,27,45,0.8) 0%, rgba(20,18,35,0.95) 100%);
          border: 1px solid rgba(168, 152, 255, 0.15);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          transform: translateZ(0);
          transition: all 0.3s ease;
        }
        
        .enhanced-grid :global(.card-hover:hover) {
          border-color: rgba(168, 152, 255, 0.3);
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.3), 0 0 15px rgba(168, 152, 255, 0.2);
        }
          /* Customize status badges for a more social media look */
        .enhanced-grid :global(.inline-flex.items-center.rounded-full) {
          border-radius: 12px;
          padding: 0.25rem 0.6rem;
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
          /* Fix for status indicators to prevent double bar appearance */
        .enhanced-grid :global(.inline-flex.items-center.rounded-full) {
          background-clip: padding-box;
          border: none;
          box-shadow: none;
        }
        
        /* Ensure proper alignment and spacing for status indicators */
        .enhanced-grid :global(.flex-col.gap-1) {
          align-items: flex-start;
        }

        /* Add custom styling for status indicator text for better visibility */
        .enhanced-grid :global(.inline-flex.items-center.rounded-full .text-xs) {
          font-weight: 600;
          letter-spacing: 0.2px;
        }
        
        /* Add more space below cards */
        .enhanced-grid :global(.grid-cols-1) {
          row-gap: 1.5rem;
        }
          /* Smoother gradient for headers */
        .enhanced-grid :global(.bg-gradient-to-r) {
          background: linear-gradient(135deg, #a898ff 0%, #da70d6 100%);
        }
        
        /* Better contrast for content type headers */
        .enhanced-grid :global(h3) {
          color: white;
          font-weight: 500;
          text-shadow: 0px 1px 2px rgba(0,0,0,0.3);
          letter-spacing: 0.2px;
        }
        
        /* Content preview styling */
        .enhanced-grid :global(.aspect-video) {
          border-radius: 8px;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        /* Better buttons styling */
        .enhanced-grid :global(button) {
          transition: all 0.2s ease-out;
        }
        
        /* Custom styling for the purple gradient status indicators */
        .enhanced-grid :global(.bg-purple-100),
        .enhanced-grid :global(.purple-gradient) {
          background: linear-gradient(135deg, #a898ff 0%, #da70d6 100%) !important;
          border: none !important;
          color: white !important;
          box-shadow: 0 2px 8px rgba(168, 152, 255, 0.3);
        }
        
        /* Ensure proper text contrast on purple indicators */
        .enhanced-grid :global(.bg-purple-100 *),
        .enhanced-grid :global(.purple-gradient *) {
          color: white !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        
        .enhanced-grid :global(button:hover) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        }
        
        /* Timeline styling */
        .enhanced-grid :global(.pl-7) {
          border-left: 1px solid rgba(168, 152, 255, 0.2);
          margin-left: 4px;
        }
        
        /* Give it a more unified feel */
        .enhanced-grid :global(.grid-cols-1 > div) {
          margin-bottom: 1.5rem;
        }
        
        /* Loading state enhancement */
        .enhanced-grid :global(.animate-pulse) {
          animation-duration: 2s;
        }
      `}</style>
      
      <AxtraNotesGrid 
        contentItems={contentItems}
        loading={loading}
        handleContentView={handleContentView}
        formatTimeAgo={formatTimeAgo}
      />
    </div>
  );
};

export default EnhancedAxtraNotesGrid;
