import React from 'react';

const AxtraHeaderBackground = ({ 
  clientName = '',
  notifications = 0,
  viewMode = 'grid',
  setViewMode,
  children
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/10 backdrop-blur-md border-b border-white/10 shadow-lg px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Logo with added animation on hover */}
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#c9aaff] to-[#e37bed] hover:scale-105 transition-transform cursor-default">
            AxtraSpace
          </h1>
          {clientName && (
            <div className="flex items-center">
              <span className="text-sm py-1 px-2 rounded-full bg-white/10 text-white/80">
                {clientName}
              </span>
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
                Active
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-white/20 transition-all hover:shadow-glow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifications > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {notifications}
                </span>
              )}
            </button>
          </div>
          
          <div className="bg-white/10 h-8 w-px mx-1"></div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Optional slot for additional content */}
      {children}
    </header>
  );
};

export default AxtraHeaderBackground;
