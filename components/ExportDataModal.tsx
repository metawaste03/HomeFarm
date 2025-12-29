
import React, { useState } from 'react';
import { Batch } from './BatchManagementScreen';

interface ExportDataModalProps {
  onClose: () => void;
  initialBatch: Batch | null;
  initialDateRange: string;
}

const ExportDataModal: React.FC<ExportDataModalProps> = ({ onClose, initialBatch, initialDateRange }) => {
  const [selectedBatch, setSelectedBatch] = useState(initialBatch?.id.toString() || '');
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [format, setFormat] = useState<'PDF' | 'CSV'>('PDF');
  const [dataToInclude, setDataToInclude] = useState({ production: true, sales: true, expenses: true, summary: true });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDataToInclude(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    console.log("Generating report with settings:", { selectedBatch, dateRange, format, dataToInclude });
    setTimeout(() => {
      setIsGenerating(false);
      alert('Report generated! (Download would start here)');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-popover rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 text-center text-text-primary">Export Farm Data</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">1. Select Batch & Date Range</label>
              <div className="grid grid-cols-2 gap-3">
                <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="w-full p-3 border border-border rounded-lg bg-muted text-text-primary">
                  {initialBatch && <option value={initialBatch.id}>{initialBatch.name}</option>}
                  <option value="all">All-Time Summary</option>
                </select>
                <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="w-full p-3 border border-border rounded-lg bg-muted text-text-primary">
                   <option>Last 7 Days</option>
                   <option>Last 30 Days</option>
                   <option>Last Quarter</option>
                   <option>Entire Batch</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">2. Choose Format</label>
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setFormat('PDF')} className={`p-4 border-2 rounded-lg font-bold text-center ${format === 'PDF' ? 'border-primary text-primary bg-green-50 dark:bg-green-900/20' : 'border-border text-text-secondary bg-card'}`}>PDF Report</button>
                 <button onClick={() => setFormat('CSV')} className={`p-4 border-2 rounded-lg font-bold text-center ${format === 'CSV' ? 'border-primary text-primary bg-green-50 dark:bg-green-900/20' : 'border-border text-text-secondary bg-card'}`}>CSV Data</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">3. Select Data to Include</label>
              <div className="space-y-2 bg-muted p-4 rounded-lg">
                <Checkbox name="production" label="Production & Mortality Logs" checked={dataToInclude.production} onChange={handleCheckboxChange} />
                <Checkbox name="sales" label="Income & Sales Ledger" checked={dataToInclude.sales} onChange={handleCheckboxChange} />
                <Checkbox name="expenses" label="Expense Records" checked={dataToInclude.expenses} onChange={handleCheckboxChange} />
                <Checkbox name="summary" label="Final Batch Summary Report" checked={dataToInclude.summary} onChange={handleCheckboxChange} />
              </div>
            </div>

            <div className="pt-4">
              <button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl text-lg flex items-center justify-center gap-2 hover:bg-primary-600 active:bg-primary-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600">
                {isGenerating ? 'Generating...' : 'GENERATE & DOWNLOAD'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Checkbox = ({ name, label, checked, onChange }: { name: string, label: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <label className="flex items-center space-x-3 cursor-pointer">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary bg-card dark:bg-muted" />
    <span className="text-text-primary">{label}</span>
  </label>
);

export default ExportDataModal;