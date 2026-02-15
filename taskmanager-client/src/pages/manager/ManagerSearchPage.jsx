import { useState, useEffect } from 'react';
import { Search, Users, Building2, ChevronRight, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import Badge from '../../components/common/Badge';
import { managerApi } from '../../api/managerApi';
import toast from 'react-hot-toast';

const ManagerSearchPage = () => {
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedManager, setSelectedManager] = useState(null);

  const fetchManagers = async (query = '') => {
    try {
      setIsLoading(true);
      const response = await managerApi.search(query);
      setManagers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch managers:', error);
      toast.error('Failed to load managers');
      setManagers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchManagers(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Manager Directory</h1>
        <p className="text-sm text-slate-500 mt-1">Search and browse managers and team leads</p>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by name, department, or role..."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            </div>
          ) : managers.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-400">
              No managers found matching your search
            </div>
          ) : (
            managers.map((manager) => (
              <Card
                key={manager.id}
                className={`cursor-pointer transition-all hover:shadow-md ${selectedManager?.id === manager.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
              >
                <button
                  className="w-full text-left cursor-pointer"
                  onClick={() => setSelectedManager(manager)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                        {manager.name?.split(' ').map((n) => n[0]).join('') || '??'}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">{manager.name}</h3>
                        <p className="text-xs text-slate-400">{manager.department}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={manager.role === 'Manager' || manager.role === 'Admin' ? 'primary' : 'info'}>
                            {manager.role}
                          </Badge>
                          <span className="text-xs text-slate-400">{manager.teamSize} members</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </button>
              </Card>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div>
          {selectedManager ? (
            <Card>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white mx-auto">
                  {selectedManager.name?.split(' ').map((n) => n[0]).join('') || '??'}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mt-3">{selectedManager.name}</h3>
                <Badge variant="primary">{selectedManager.role}</Badge>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{selectedManager.email}</span>
                </div>
                {selectedManager.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">{selectedManager.phone}</span>
                  </div>
                )}
                {selectedManager.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">{selectedManager.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{selectedManager.department}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{selectedManager.teamSize} team members</span>
                </div>

                {selectedManager.teams && selectedManager.teams.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Teams</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedManager.teams.map((t) => (
                        <Badge key={t} variant="secondary">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedManager.reportsTo && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Reports To</p>
                    <p className="text-sm text-slate-600">{selectedManager.reportsTo}</p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <div className="p-8 text-center">
                <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Select a manager to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerSearchPage;
