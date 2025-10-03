import React from 'react';
import { Shield, Eye, MessageSquare } from 'lucide-react';

const SecurityNotice: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-blue-800">Safe Social & Learning Environment</h3>
      </div>
      <div className="space-y-2 text-sm text-blue-700">
        {/* <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span>Content is monitored for student safety</span>
        </div> */}
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Please use kind and respectful language</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityNotice;