import React, { useState } from 'react';
import { Lead } from '../types';
import { ExternalLink, Star, Mail, Phone, Globe, MessageSquare, Instagram, Linkedin, Zap } from 'lucide-react';
import { SERVICE_OFFERS } from '../constants';

interface LeadTableProps {
  leads: Lead[];
  onGeneratePitch: (lead: Lead) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({ leads, onGeneratePitch }) => {
  const [filter, setFilter] = useState('');

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(filter.toLowerCase()) ||
    lead.address.toLowerCase().includes(filter.toLowerCase())
  );

  const getServiceLabel = (id?: string) => {
    const service = SERVICE_OFFERS.find(s => s.id === id);
    return service ? service.title : 'General Pitch';
  };

  const getServiceColor = (id?: string) => {
    // Return a simplified color class for the badge with dark mode support
    if (id === 'build') return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
    if (id === 'care') return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
    if (id === 'check') return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <p className="text-slate-500 dark:text-slate-400">No leads found yet. Start a search above.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="font-semibold text-slate-800 dark:text-white">Results ({filteredLeads.length})</h3>
        <input
          type="text"
          placeholder="Filter results..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-64 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4">Business Name</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Links</th>
              <th className="px-6 py-4 text-right">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLeads.map((lead, index) => (
              <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">{lead.name}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate max-w-[200px]">{lead.address}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    {lead.phone && lead.phone !== 'N/A' && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300" title="Phone">
                        <Phone size={12} /> <span>{lead.phone}</span>
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400" title="Email">
                        <Mail size={12} /> <span>{lead.email}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-amber-500 font-medium">
                    <span className="text-slate-700 dark:text-slate-200">{lead.rating > 0 ? lead.rating : 'N/A'}</span>
                    <Star size={14} fill={lead.rating > 0 ? "currentColor" : "none"} />
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1">({lead.reviewCount})</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                      {lead.website ? (
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors" title="Website">
                          <Globe size={14} />
                        </a>
                      ) : (
                        <span className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-full cursor-not-allowed" title="No Website">
                          <Globe size={14} />
                        </span>
                      )}
                      
                      {lead.instagram ? (
                        <a href={lead.instagram} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors" title="Instagram">
                          <Instagram size={14} />
                        </a>
                      ) : (
                        <span className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-full cursor-not-allowed" title="No Instagram">
                           <Instagram size={14} />
                        </span>
                      )}

                      {lead.linkedin ? (
                        <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors" title="LinkedIn">
                          <Linkedin size={14} />
                        </a>
                      ) : (
                         <span className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-full cursor-not-allowed" title="No LinkedIn">
                           <Linkedin size={14} />
                         </span>
                      )}
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getServiceColor(lead.recommendedServiceId)}`}>
                      <Zap size={10} />
                      {getServiceLabel(lead.recommendedServiceId)}
                    </span>
                    <button
                      onClick={() => onGeneratePitch(lead)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <MessageSquare size={14} /> Generate Pitch
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};