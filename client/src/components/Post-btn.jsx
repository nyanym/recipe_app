import React from 'react';
import { FaPlus } from 'react-icons/fa6';

function PostButton({ onClick, isCollapsed }) {
  return (
    <button 
      onClick={onClick}
      title="Create Post"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isCollapsed ? '0' : '0.5rem',
        backgroundColor: '#0070f3',
        color: '#ffffff',
        border: 'none',
        borderRadius: '50px', /* Pill shape when open, circle when collapsed */
        padding: isCollapsed ? '0.75rem' : '0.5rem 1rem',
        width: isCollapsed ? '44px' : 'auto',
        height: isCollapsed ? '44px' : 'auto',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <FaPlus size={18} />
      {/* Hide text when collapsed */}
      {!isCollapsed && <span>Create Post</span>}
    </button>
  );
}

export default PostButton;